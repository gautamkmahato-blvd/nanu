// components/email-actions/save-to-category.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '../ui/ToastProvider';
import { FolderOpen, Check } from 'lucide-react';

type Category = { id: string; name: string; parentId: string | null; color: string; emailCount: number };
type CategoryNode = Category & { children: CategoryNode[] };
type Props = { emailId: string; onSaved?: () => void };

function buildTree(categories: Category[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];
  for (const cat of categories) map.set(cat.id, { ...cat, children: [] });
  for (const cat of categories) {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) map.get(cat.parentId)!.children.push(node);
    else roots.push(node);
  }
  return roots;
}

export default function SaveToCategory({ emailId, onSaved }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/categories');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCategories(data.categories);
      const assigned = new Set<string>();
      for (const cat of data.categories as Category[]) {
        try {
          const r = await fetch(`/api/v1/categories/${cat.id}/emails`);
          if (r.ok) { const d = await r.json(); if (d.emails.some((e: { id: string }) => e.id === emailId)) assigned.add(cat.id); }
        } catch {}
      }
      setAssignedIds(assigned);
    } catch { setMessage({ text: 'Failed to load categories', type: 'error' }); }
    finally { setLoading(false); }
  }, [emailId]);

  const handleOpen = useCallback(() => { setIsOpen(true); setMessage(null); loadCategories(); }, [loadCategories]);

  const toggleAssignment = useCallback(async (categoryId: string, categoryName: string, isAssigned: boolean) => {
    setSaving(categoryId); setMessage(null);
    try {
      if (isAssigned) {
        const res = await fetch(`/api/v1/categories/${categoryId}/emails?emailId=${emailId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed');
        setAssignedIds((prev) => { const next = new Set(prev); next.delete(categoryId); return next; });
        setMessage({ text: `Removed from "${categoryName}"`, type: 'success' });
        showToast(`Removed from "${categoryName}"`, 'info');
      } else {
        const res = await fetch(`/api/v1/categories/${categoryId}/emails`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emailId }) });
        if (!res.ok) throw new Error('Failed');
        setAssignedIds((prev) => new Set(prev).add(categoryId));
        setMessage({ text: `Saved to "${categoryName}"`, type: 'success' });
        showToast(`Saved to "${categoryName}"`, 'info');
      }
      onSaved?.();
    } catch { setMessage({ text: 'Action failed', type: 'error' }); showToast('Failed to update category', 'error'); }
    finally { setSaving(null); }
  }, [emailId, onSaved, showToast]);

  const tree = buildTree(categories);
  const assignedCount = assignedIds.size;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger — matches TopBtn style */}
      <button
        onClick={(e) => { e.stopPropagation(); isOpen ? setIsOpen(false) : handleOpen(); }}
        title="Save to category"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-mail-subtle hover:text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer border-none bg-transparent text-xs"
      >
        <FolderOpen size={15} />
        <span>Save{assignedCount > 0 ? ` (${assignedCount})` : ''}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div onClick={(e) => e.stopPropagation()}
          className="absolute top-full left-0 mt-1.5 bg-mail-surface border border-mail-border rounded-xl p-1.5 z-40 min-w-[220px] max-h-[360px] overflow-y-auto shadow-2xl">

          <div className="text-[10px] font-semibold uppercase tracking-widest text-mail-subtle px-2 py-1.5">
            Save to category
          </div>

          {loading && <div className="px-2 py-3 text-mail-subtle text-xs text-center">Loading...</div>}

          {!loading && categories.length === 0 && (
            <div className="px-2 py-3 text-mail-subtle text-xs text-center">No categories yet.</div>
          )}

          {!loading && tree.map((node) => (
            <CategoryOption key={node.id} node={node} depth={0} assignedIds={assignedIds} savingId={saving} onToggle={toggleAssignment} />
          ))}

          {message && (
            <div className={`px-2 py-1.5 text-[11px] border-t border-mail-border mt-1 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.type === 'success' ? <Check size={11} className="inline mr-1" /> : '✗ '}{message.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CategoryOption({ node, depth, assignedIds, savingId, onToggle }: {
  node: CategoryNode; depth: number; assignedIds: Set<string>; savingId: string | null;
  onToggle: (id: string, name: string, isAssigned: boolean) => void;
}) {
  const isAssigned = assignedIds.has(node.id);
  const isSaving = savingId === node.id;

  return (
    <>
      <button
        onClick={() => onToggle(node.id, node.name, isAssigned)}
        disabled={isSaving}
        className="flex items-center gap-2 w-full py-1.5 px-2 rounded-lg text-xs text-mail-muted hover:bg-mail-hover hover:text-mail-text transition-colors cursor-pointer border-none bg-transparent text-left disabled:opacity-50 disabled:cursor-default"
        style={{ paddingLeft: 8 + depth * 14, background: isAssigned ? `${node.color}10` : undefined }}
      >
        {/* Checkbox */}
        <span className="w-4 h-4 rounded flex items-center justify-center text-[10px] text-white shrink-0"
          style={{ border: isAssigned ? `2px solid ${node.color}` : '2px solid var(--mail-border)', background: isAssigned ? node.color : 'transparent' }}>
          {isAssigned && <Check size={10} strokeWidth={3} />}
        </span>

        {/* Color dot + name */}
        <span className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ background: node.color }} />
        <span className="flex-1 truncate">{node.name}</span>
      </button>

      {node.children.map((child) => (
        <CategoryOption key={child.id} node={child} depth={depth + 1} assignedIds={assignedIds} savingId={savingId} onToggle={onToggle} />
      ))}
    </>
  );
}