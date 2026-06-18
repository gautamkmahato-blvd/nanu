// app/categories/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastProvider, useToast } from '../_components/ui/ToastProvider';
import ConfirmModal from '../_components/ui/ConfirmModal';
import {
  FolderOpen, Plus, ChevronDown, ChevronRight, Trash2, X,
  Mail, Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Category = {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  createdAt: string;
  emailCount: number;
};

type CategoryEmail = {
  id: string;
  threadId: string;
  subject: string | null;
  fromEmail: string;
  fromName: string | null;
  receivedAt: string;
  summary: string | null;
  primaryTag: string | null;
  sentiment: string | null;
  relationshipType: string | null;
  status: string;
};

type CategoryNode = Category & { children: CategoryNode[] };

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const COLORS = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#f59e0b', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
];

const SENTIMENT_EMOJI: Record<string, string> = {
  positive: '🟢', neutral: '🟡', negative: '🔴',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function displayName(name: string | null, email: string): string {
  if (name) return name;
  const at = email.indexOf('@');
  return at > 0 ? email.slice(0, at) : email;
}

function relativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function capitalize(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildTree(categories: Category[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] });
  }

  for (const cat of categories) {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CategoriesPage() {
  return (
    <ToastProvider>
      <CategoriesContent />
    </ToastProvider>
  );
}

function CategoriesContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [emails, setEmails] = useState<CategoryEmail[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/categories');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCategories(data.categories);
    } catch {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoadingCategories(false);
    }
  }, [showToast]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  // Load emails for selected category
  const loadEmails = useCallback(async (categoryId: string) => {
    setLoadingEmails(true);
    try {
      const res = await fetch(`/api/v1/categories/${categoryId}/emails`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setEmails(data.emails);
    } catch {
      showToast('Failed to load emails', 'error');
    } finally {
      setLoadingEmails(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedId) loadEmails(selectedId);
    else setEmails([]);
  }, [selectedId, loadEmails]);

  // Create category
  const createCategory = useCallback(async (name: string, parentId: string | null, color: string) => {
    try {
      const res = await fetch('/api/v1/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId, color }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Failed');
      }
      showToast(`Created "${name}"`, 'success');
      loadCategories();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed', 'error');
    }
  }, [showToast, loadCategories]);

  // Delete category
  const deleteCategory = useCallback(async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/v1/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      showToast(`Deleted "${name}"`, 'info');
      if (selectedId === id) { setSelectedId(null); setEmails([]); }
      loadCategories();
    } catch {
      showToast('Failed to delete category', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }, [showToast, selectedId, loadCategories]);

  // Remove email from category
  const removeEmail = useCallback(async (emailId: string) => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/v1/categories/${selectedId}/emails?emailId=${emailId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed');
      setEmails((prev) => prev.filter((e) => e.id !== emailId));
      showToast('Email removed from category', 'info');
      loadCategories();
    } catch {
      showToast('Failed to remove email', 'error');
    }
  }, [selectedId, showToast, loadCategories]);

  const tree = buildTree(categories);
  const selectedCat = categories.find((c) => c.id === selectedId);

  return (
    <div className="bg-mail-bg h-screen flex text-mail-text font-sans">
      {/* ── Sidebar ── */}
      <div className="w-[280px] border-r border-mail-border flex flex-col shrink-0">
        {/* Sidebar header */}
        <div className="px-4 pt-5 pb-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FolderOpen size={16} className="text-mail-accent" />
            <h1 className="text-[15px] font-semibold m-0">Categories</h1>
          </div>
          <button
            onClick={() => { setCreateParentId(null); setShowCreateModal(true); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-mail-border bg-transparent text-mail-muted text-[11px] cursor-pointer hover:bg-mail-hover transition-colors"
          >
            <Plus size={11} /> New
          </button>
        </div>

        {/* Category tree */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loadingCategories && (
            <div className="flex items-center justify-center py-8 text-mail-subtle text-xs gap-2">
              <Loader2 size={13} className="animate-spin" /> Loading...
            </div>
          )}

          {!loadingCategories && tree.length === 0 && (
            <div className="py-8 text-center text-mail-subtle/40 text-xs">
              No categories yet
            </div>
          )}

          {tree.map((cat) => (
            <TreeNode
              key={cat.id}
              category={cat}
              depth={0}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAddChild={(parentId) => { setCreateParentId(parentId); setShowCreateModal(true); }}
              onDelete={(id, name) => setDeleteTarget({ id, name })}
            />
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content header */}
        <div className="px-6 py-5 border-b border-mail-border shrink-0">
          {selectedCat ? (
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: selectedCat.color }} />
              <h2 className="text-lg font-semibold m-0">{selectedCat.name}</h2>
              <span className="text-xs text-mail-subtle font-mono">{emails.length} email{emails.length !== 1 ? 's' : ''}</span>
            </div>
          ) : (
            <h2 className="text-lg font-semibold m-0 text-mail-subtle">Select a category</h2>
          )}
        </div>

        {/* Email list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* No selection */}
          {!selectedId && (
            <div className="py-16 text-center flex flex-col items-center gap-2">
              <FolderOpen size={32} strokeWidth={1} className="text-mail-subtle opacity-20" />
              <div className="text-[13px] text-mail-subtle">Choose a category from the sidebar to view its emails</div>
            </div>
          )}

          {/* Loading */}
          {selectedId && loadingEmails && (
            <div className="py-12 text-center flex flex-col items-center gap-2 text-mail-subtle text-xs">
              <Loader2 size={18} className="animate-spin" />
              Loading emails...
            </div>
          )}

          {/* Empty */}
          {selectedId && !loadingEmails && emails.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center gap-2">
              <Mail size={28} strokeWidth={1} className="text-mail-subtle opacity-20" />
              <div className="text-[13px] text-mail-subtle">No emails in this category yet</div>
              <div className="text-[11px] text-mail-subtle/60">Assign emails from the email detail page</div>
            </div>
          )}

          {/* Email rows */}
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => router.push(`/ai-email-details/${email.id}`)}
              className="px-4 py-3 rounded-lg bg-mail-surface border border-mail-border mb-2 flex items-start gap-3 cursor-pointer hover:border-mail-border-hover transition-colors group"
            >
              {/* Email content */}
              <div className="flex-1 min-w-0">
                {/* Top line: sender + badges */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[13px] font-medium text-mail-text">
                    {displayName(email.fromName, email.fromEmail)}
                  </span>
                  {email.sentiment && (
                    <span className="text-[10px]">{SENTIMENT_EMOJI[email.sentiment] ?? ''}</span>
                  )}
                  {email.relationshipType && email.relationshipType !== 'other' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-mail-hover text-mail-subtle">
                      {capitalize(email.relationshipType)}
                    </span>
                  )}
                  {email.primaryTag && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-mail-hover text-mail-subtle/70">
                      {email.primaryTag}
                    </span>
                  )}
                </div>

                {/* Subject */}
                <div className="text-[13px] text-mail-muted truncate">
                  {email.subject || '(no subject)'}
                </div>

                {/* Summary */}
                {email.summary && (
                  <div className="text-[12px] text-mail-subtle truncate mt-0.5">
                    {email.summary}
                  </div>
                )}
              </div>

              {/* Right side: time + remove */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-mail-subtle font-mono">
                  {relativeTime(email.receivedAt)}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeEmail(email.id); }}
                  title="Remove from category"
                  className="w-6 h-6 rounded flex items-center justify-center text-mail-subtle/50 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Create category modal ── */}
      {showCreateModal && (
        <CreateCategoryModal
          parentId={createParentId}
          parentName={createParentId ? categories.find((c) => c.id === createParentId)?.name ?? null : null}
          onClose={() => setShowCreateModal(false)}
          onCreate={createCategory}
        />
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={true}
          title="Delete Category"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This will also delete all subcategories and remove all email assignments. This action cannot be undone.`}
          confirmLabel="Delete"
          confirmColor="#ef4444"
          onConfirm={() => deleteCategory(deleteTarget.id, deleteTarget.name)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tree Node (recursive)
// ---------------------------------------------------------------------------

function TreeNode({
  category,
  depth,
  selectedId,
  onSelect,
  onAddChild,
  onDelete,
}: {
  category: CategoryNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isSelected = selectedId === category.id;
  const hasChildren = category.children.length > 0;

  return (
    <div>
      <div
        onClick={() => onSelect(category.id)}
        className={`flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-pointer transition-colors mb-0.5 group ${
          isSelected ? 'bg-mail-accent-soft' : 'hover:bg-mail-hover'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {/* Expand toggle */}
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="w-3.5 text-mail-subtle hover:text-mail-muted transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center justify-center"
          >
            {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </button>
        ) : (
          <span className="w-3.5" />
        )}

        {/* Color dot */}
        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: category.color }} />

        {/* Name */}
        <span className={`text-[13px] flex-1 truncate ${isSelected ? 'text-mail-text font-medium' : 'text-mail-muted'}`}>
          {category.name}
        </span>

        {/* Email count */}
        {category.emailCount > 0 && (
          <span className="text-[10px] text-mail-subtle font-mono">{category.emailCount}</span>
        )}

        {/* Add child — visible on hover */}
        <button
          onClick={(e) => { e.stopPropagation(); onAddChild(category.id); }}
          title="Add subcategory"
          className="opacity-0 group-hover:opacity-100 bg-transparent border-none text-mail-subtle/40 hover:text-mail-muted cursor-pointer p-0 transition-all"
        >
          <Plus size={11} />
        </button>

        {/* Delete — visible on hover */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(category.id, category.name); }}
          title="Delete category"
          className="opacity-0 group-hover:opacity-100 bg-transparent border-none text-mail-subtle/40 hover:text-red-400 cursor-pointer p-0 transition-all"
        >
          <Trash2 size={10} />
        </button>
      </div>

      {/* Children */}
      {expanded && hasChildren && category.children.map((child) => (
        <TreeNode
          key={child.id}
          category={child}
          depth={depth + 1}
          selectedId={selectedId}
          onSelect={onSelect}
          onAddChild={onAddChild}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create Category Modal
// ---------------------------------------------------------------------------

function CreateCategoryModal({
  parentId,
  parentName,
  onClose,
  onCreate,
}: {
  parentId: string | null;
  parentName: string | null;
  onClose: () => void;
  onCreate: (name: string, parentId: string | null, color: string) => void;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed, parentId, color);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/60 z-[90]" />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[91] bg-mail-surface border border-mail-border rounded-xl p-6 w-[380px] shadow-2xl">
        <h3 className="text-[15px] font-semibold text-mail-text m-0 mb-1">
          {parentId ? 'Create Subcategory' : 'Create Category'}
        </h3>
        {parentName && (
          <p className="text-[12px] text-mail-subtle m-0 mb-4">Inside: {parentName}</p>
        )}

        {/* Name input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          placeholder="Category name..."
          autoFocus
          className="w-full px-3 py-2.5 rounded-lg border border-mail-border bg-mail-bg text-mail-text text-sm outline-none mb-3.5 focus:border-mail-accent transition-colors"
        />

        {/* Color picker */}
        <div className="mb-5">
          <div className="text-[12px] text-mail-subtle mb-2">Color</div>
          <div className="flex gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className="w-6 h-6 rounded-md cursor-pointer p-0 transition-all"
                style={{
                  background: c.value,
                  border: color === c.value ? '2px solid #fafafa' : '2px solid transparent',
                  transform: color === c.value ? 'scale(1.15)' : 'scale(1)',
                }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-mail-border bg-transparent text-mail-muted text-[13px] cursor-pointer hover:bg-mail-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-4 py-2 rounded-lg border-none text-[13px] font-medium transition-all"
            style={{
              background: name.trim() ? color : 'var(--mail-border)',
              color: name.trim() ? '#fff' : 'var(--mail-subtle)',
              cursor: name.trim() ? 'pointer' : 'default',
              opacity: name.trim() ? 1 : 0.6,
            }}
          >
            Create
          </button>
        </div>
      </div>
    </>
  );
}