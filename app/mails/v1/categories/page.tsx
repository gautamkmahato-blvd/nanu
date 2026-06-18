// app/categories/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastProvider, useToast } from '../_components/ui/ToastProvider';
import ConfirmModal from '../_components/ui/ConfirmModal';

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

// Build tree structure from flat list
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
      loadCategories(); // refresh counts
    } catch {
      showToast('Failed to remove email', 'error');
    }
  }, [selectedId, showToast, loadCategories]);

  const tree = buildTree(categories);
  const selectedCat = categories.find((c) => c.id === selectedId);

  return (
    <div style={{ background: '#09090b', height: '100vh', display: 'flex', color: '#fafafa', fontFamily: '-apple-system, system-ui, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 280, borderRight: '1px solid #18181b', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>📁 Categories</h1>
          <button
            onClick={() => { setCreateParentId(null); setShowCreateModal(true); }}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #27272a',
              background: 'transparent',
              color: '#a1a1aa',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            + New
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px' }}>
          {tree.length === 0 && (
            <div style={{ padding: '24px 8px', textAlign: 'center', color: '#27272a', fontSize: 12 }}>
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

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #18181b', flexShrink: 0 }}>
          {selectedCat ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: selectedCat.color }} />
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{selectedCat.name}</h2>
              <span style={{ fontSize: 12, color: '#52525b', fontFamily: 'monospace' }}>
                {emails.length} emails
              </span>
            </div>
          ) : (
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#52525b' }}>
              Select a category
            </h2>
          )}
        </div>

        {/* Email list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {!selectedId && (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#27272a', fontSize: 13 }}>
              Choose a category from the sidebar to view its emails
            </div>
          )}

          {selectedId && loadingEmails && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#52525b', fontSize: 13 }}>
              Loading...
            </div>
          )}

          {selectedId && !loadingEmails && emails.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#27272a', fontSize: 13 }}>
              No emails in this category yet. Assign emails from the email detail page.
            </div>
          )}

          {emails.map((email) => (
            <div
              key={email.id}
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                background: '#18181b',
                border: '1px solid #27272a',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                cursor: 'pointer',
                transition: 'border-color 150ms',
              }}
              onClick={() => router.push(`/ai-email-details/${email.id}`)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3f3f46'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#27272a'; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {displayName(email.fromName, email.fromEmail)}
                  </span>
                  {email.sentiment && <span style={{ fontSize: 10 }}>{SENTIMENT_EMOJI[email.sentiment] ?? ''}</span>}
                  {email.relationshipType && email.relationshipType !== 'other' && (
                    <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 6, background: '#27272a', color: '#71717a' }}>
                      {capitalize(email.relationshipType)}
                    </span>
                  )}
                  {email.primaryTag && (
                    <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 6, background: '#27272a', color: '#52525b' }}>
                      {email.primaryTag}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#d4d4d8', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {email.subject || '(no subject)'}
                </div>
                {email.summary && (
                  <div style={{ fontSize: 12, color: '#52525b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {email.summary}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: '#52525b', fontFamily: 'monospace' }}>
                  {relativeTime(email.receivedAt)}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeEmail(email.id); }}
                  title="Remove from category"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    border: 'none',
                    background: 'transparent',
                    color: '#52525b',
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#52525b'; }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create category modal */}
      {showCreateModal && (
        <CreateCategoryModal
          parentId={createParentId}
          parentName={createParentId ? categories.find((c) => c.id === createParentId)?.name ?? null : null}
          onClose={() => setShowCreateModal(false)}
          onCreate={createCategory}
        />
      )}

      {/* Delete confirmation modal */}
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
// Tree node (recursive)
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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 8px',
          paddingLeft: 8 + depth * 16,
          borderRadius: 6,
          background: isSelected ? `${category.color}15` : 'transparent',
          cursor: 'pointer',
          transition: 'background 100ms',
          marginBottom: 2,
        }}
        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#18181b'; }}
        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
      >
        {/* Expand toggle */}
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', fontSize: 10, padding: 0, width: 14, textAlign: 'center' }}
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span style={{ width: 14 }} />
        )}

        {/* Color dot */}
        <span style={{ width: 8, height: 8, borderRadius: 2, background: category.color, flexShrink: 0 }} />

        {/* Name */}
        <span style={{ fontSize: 13, color: isSelected ? '#fafafa' : '#a1a1aa', fontWeight: isSelected ? 500 : 400, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {category.name}
        </span>

        {/* Count */}
        {category.emailCount > 0 && (
          <span style={{ fontSize: 10, color: '#52525b', fontFamily: 'monospace' }}>
            {category.emailCount}
          </span>
        )}

        {/* Actions (visible on hover via CSS would be nice, but inline for simplicity) */}
        <button
          onClick={(e) => { e.stopPropagation(); onAddChild(category.id); }}
          title="Add subcategory"
          style={{ background: 'none', border: 'none', color: '#27272a', cursor: 'pointer', fontSize: 12, padding: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#a1a1aa'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#27272a'; }}
        >
          +
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(category.id, category.name); }}
          title="Delete category"
          style={{ background: 'none', border: 'none', color: '#27272a', cursor: 'pointer', fontSize: 12, padding: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#27272a'; }}
        >
          ×
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
// Create category modal
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
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90 }} />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 91,
        background: '#18181b',
        border: '1px solid #27272a',
        borderRadius: 14,
        padding: 24,
        width: 380,
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px', color: '#fafafa' }}>
          {parentId ? 'Create Subcategory' : 'Create Category'}
        </h3>
        {parentName && (
          <p style={{ fontSize: 12, color: '#52525b', margin: '0 0 16px' }}>
            Inside: {parentName}
          </p>
        )}

        {/* Name input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          placeholder="Category name..."
          autoFocus
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #27272a',
            background: '#09090b',
            color: '#fafafa',
            fontSize: 14,
            outline: 'none',
            marginBottom: 14,
            boxSizing: 'border-box',
          }}
        />

        {/* Color picker */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#52525b', marginBottom: 8 }}>Color</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: color === c.value ? '2px solid #fafafa' : '2px solid transparent',
                  background: c.value,
                  cursor: 'pointer',
                  padding: 0,
                }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #27272a', background: 'transparent', color: '#a1a1aa', fontSize: 13, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: name.trim() ? color : '#27272a',
              color: name.trim() ? '#fff' : '#52525b',
              fontSize: 13,
              fontWeight: 500,
              cursor: name.trim() ? 'pointer' : 'default',
            }}
          >
            Create
          </button>
        </div>
      </div>
    </>
  );
}
