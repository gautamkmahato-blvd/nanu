// app/mails/v1/assets/page.tsx
// Assets page — shows files and documents from emails.
// Links are stored in DB for RAG search but hidden from the UI.
// Images show a live preview thumbnail via the proxy endpoint.
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, Image, FileSpreadsheet, Presentation, Archive, Film, Music,
  Code2, File, Search, Grid3X3, List, Loader2,
  ChevronLeft, ChevronRight, Filter, X, Paperclip,
  RefreshCw, Eye,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MimeCategory = 'pdf' | 'image' | 'document' | 'spreadsheet' | 'presentation' | 'archive' | 'video' | 'audio' | 'code' | 'other';

type Asset = {
  id: string;
  emailId: string;
  assetType: 'attachment' | 'link' | 'inline_image';
  filename: string | null;
  url: string | null;
  mimeType: string | null;
  size: number | null;
  domain: string | null;
  fromEmail: string;
  fromName: string | null;
  subject: string | null;
  receivedAt: string;
  mimeCategory: MimeCategory;
};

type FilterOptions = {
  senders: { email: string; name: string | null; count: number }[];
  domains: { domain: string; count: number }[];
  mimeCategories: { category: string; count: number }[];
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  pdf: { icon: FileText, label: 'PDF', color: '#ef4444' },
  image: { icon: Image, label: 'Images', color: '#3b82f6' },
  document: { icon: FileText, label: 'Docs', color: '#6366f1' },
  spreadsheet: { icon: FileSpreadsheet, label: 'Sheets', color: '#22c55e' },
  presentation: { icon: Presentation, label: 'Slides', color: '#f59e0b' },
  archive: { icon: Archive, label: 'Archives', color: '#8b5cf6' },
  video: { icon: Film, label: 'Videos', color: '#ec4899' },
  audio: { icon: Music, label: 'Audio', color: '#06b6d4' },
  code: { icon: Code2, label: 'Code', color: '#a3e635' },
  other: { icon: File, label: 'Other', color: '#6b7280' },
};

// Categories to show as filter pills (in order)
const FILTER_CATEGORIES = ['pdf', 'image', 'document', 'spreadsheet', 'presentation', 'archive', 'video', 'audio', 'code', 'other'];

const PAGE_SIZE = 48;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSize(bytes: number | null): string {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function displayName(name: string | null, email: string): string {
  if (name) return name;
  const at = email.indexOf('@');
  return at > 0 ? email.slice(0, at) : email;
}

function isImageAsset(asset: Asset): boolean {
  return asset.mimeCategory === 'image' || asset.assetType === 'inline_image';
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AssetsPage() {
  const router = useRouter();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [backfilling, setBackfilling] = useState(false);
  const [error, setError] = useState('');

  // View + filters state
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSender, setActiveSender] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch assets — always exclude links from UI, only show attachments
  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(page * PAGE_SIZE));
      // Exclude links — only show file attachments and inline images
      params.set('type', 'attachment');
      if (search) params.set('q', search);
      if (activeCategory) params.set('category', activeCategory);
      if (activeSender) params.set('from', activeSender);

      const res = await fetch(`/api/v1/assets?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load assets');
      const data = await res.json();

      setAssets(data.assets ?? []);
      setTotal(data.total ?? 0);
      if (data.filters) setFilters(data.filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [page, search, activeCategory, activeSender]);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  // Search debounce
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(0); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Backfill
  const handleBackfill = async () => {
    setBackfilling(true);
    try {
      const res = await fetch('/api/v1/assets', { method: 'POST' });
      if (!res.ok) throw new Error('Backfill failed');
      loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backfill failed');
    } finally {
      setBackfilling(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveCategory(null);
    setActiveSender(null);
    setSearchInput('');
    setSearch('');
    setPage(0);
  };

  const hasActiveFilters = activeCategory || activeSender || search;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Build category pill data from server filter options (only non-link categories)
  const categoryPills = FILTER_CATEGORIES
    .map((cat) => {
      const serverCat = filters?.mimeCategories.find((m) => m.category === cat);
      return serverCat ? { key: cat, count: serverCat.count } : null;
    })
    .filter((c): c is { key: string; count: number } => c !== null && c.count > 0);

  return (
    <div className="bg-mail-bg h-full overflow-y-auto text-mail-text font-sans">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-mail-border">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Paperclip size={18} className="text-mail-accent" />
              <h1 className="text-lg font-semibold m-0">Assets</h1>
              {total > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-mail-accent-soft text-mail-accent">
                  {total} files
                </span>
              )}
            </div>
            <p className="text-xs text-mail-subtle mt-1 m-0">Files and documents from your emails</p>
          </div>
          <button
            onClick={handleBackfill}
            disabled={backfilling}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-xs cursor-pointer hover:bg-mail-hover transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={backfilling ? 'animate-spin' : ''} />
            {backfilling ? 'Extracting...' : 'Extract Assets'}
          </button>
        </div>

        {/* Category pills */}
        {categoryPills.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => { setActiveCategory(null); setPage(0); }}
              className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                !activeCategory ? 'bg-mail-accent text-white' : 'bg-mail-surface text-mail-muted hover:bg-mail-hover border border-mail-border'
              }`}
            >
              All
            </button>
            {categoryPills.map(({ key, count }) => {
              const conf = CATEGORY_CONFIG[key] ?? CATEGORY_CONFIG.other;
              const Icon = conf.icon;
              const isActive = activeCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => { setActiveCategory(isActive ? null : key); setPage(0); }}
                  className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    isActive ? 'text-white' : 'bg-mail-surface text-mail-muted hover:bg-mail-hover border border-mail-border'
                  }`}
                  style={isActive ? { background: conf.color } : undefined}
                >
                  <Icon size={10} /> {conf.label} <span className="opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Toolbar: Search + View toggle + Filters */}
      <div className="px-6 py-3 flex items-center gap-3 border-b border-mail-border">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mail-subtle" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by filename, subject, sender..."
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-mail-border bg-mail-surface text-mail-text text-xs outline-none focus:border-mail-accent transition-colors placeholder:text-mail-subtle"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors ${
            showFilters || hasActiveFilters
              ? 'border-mail-accent text-mail-accent bg-mail-accent-soft'
              : 'border-mail-border text-mail-muted hover:bg-mail-hover'
          }`}
        >
          <Filter size={12} /> Filters
          {hasActiveFilters && (
            <button onClick={(e) => { e.stopPropagation(); clearFilters(); }} className="ml-1 cursor-pointer">
              <X size={10} />
            </button>
          )}
        </button>

        {/* View toggle */}
        <div className="flex items-center border border-mail-border rounded-lg overflow-hidden">
          <button
            onClick={() => setView('grid')}
            className={`p-2 cursor-pointer transition-colors ${view === 'grid' ? 'bg-mail-accent text-white' : 'text-mail-muted hover:bg-mail-hover'}`}
          >
            <Grid3X3 size={13} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 cursor-pointer transition-colors ${view === 'list' ? 'bg-mail-accent text-white' : 'text-mail-muted hover:bg-mail-hover'}`}
          >
            <List size={13} />
          </button>
        </div>
      </div>

      {/* Expanded filters panel */}
      {showFilters && filters && (
        <div className="px-6 py-3 border-b border-mail-border flex flex-wrap gap-4 text-xs">
          {/* Sender filter */}
          {filters.senders.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-mail-subtle mb-1.5">Sender</div>
              <select
                value={activeSender ?? ''}
                onChange={(e) => { setActiveSender(e.target.value || null); setPage(0); }}
                className="px-2 py-1.5 rounded-md border border-mail-border bg-mail-surface text-mail-text text-xs outline-none cursor-pointer"
              >
                <option value="">All senders</option>
                {filters.senders.map((s) => (
                  <option key={s.email} value={s.email}>
                    {displayName(s.name, s.email)} ({s.count})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-4">
        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 text-[13px] mb-4">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-mail-accent" />
            <div className="text-sm text-mail-subtle">Loading assets...</div>
          </div>
        )}

        {/* Empty state */}
        {!loading && assets.length === 0 && (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <Paperclip size={36} strokeWidth={1} className="text-mail-subtle opacity-30" />
            <div className="text-base font-medium text-mail-text">
              {hasActiveFilters ? 'No files match your filters' : 'No files found'}
            </div>
            <div className="text-[13px] text-mail-subtle">
              {hasActiveFilters
                ? 'Try adjusting your filters or search query'
                : 'Click "Extract Assets" to scan your synced emails for files and documents'}
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 px-4 py-2 rounded-lg border border-mail-border text-mail-muted text-xs hover:bg-mail-hover transition-colors cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Grid view */}
        {!loading && assets.length > 0 && view === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {assets.map((asset) => (
              <AssetGridCard key={asset.id} asset={asset} router={router} />
            ))}
          </div>
        )}

        {/* List view */}
        {!loading && assets.length > 0 && view === 'list' && (
          <div className="space-y-1">
            {assets.map((asset) => (
              <AssetListRow key={asset.id} asset={asset} router={router} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-mail-border">
            <span className="text-[11px] text-mail-subtle">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-md border border-mail-border text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[11px] text-mail-subtle font-mono">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-md border border-mail-border text-mail-muted hover:bg-mail-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid Card — with image preview for image assets
// ---------------------------------------------------------------------------

function AssetGridCard({ asset, router }: { asset: Asset; router: ReturnType<typeof useRouter> }) {
  const conf = CATEGORY_CONFIG[asset.mimeCategory] ?? CATEGORY_CONFIG.other;
  const Icon = conf.icon;
  const name = asset.filename || 'Untitled';
  const showPreview = isImageAsset(asset);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => router.push(`/mails/v1/ai-email-details/${asset.emailId}`)}
      className="rounded-lg border border-mail-border bg-mail-surface overflow-hidden cursor-pointer hover:border-mail-accent/40 transition-colors group"
    >
      {/* Preview area */}
      <div className="h-[120px] flex items-center justify-center bg-mail-bg relative overflow-hidden">
        {showPreview && !imgError ? (
          <img
            src={`/api/v1/assets/preview/${asset.id}`}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ background: `${conf.color}15` }}
          >
            <Icon size={22} style={{ color: conf.color }} />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Eye size={16} className="text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="text-[12px] font-medium text-mail-text truncate mb-1" title={name}>
          {name}
        </div>
        <div className="text-[10px] text-mail-subtle truncate">
          {displayName(asset.fromName, asset.fromEmail)}
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-mail-subtle">{formatDate(asset.receivedAt)}</span>
          {asset.size != null && (
            <span className="text-[9px] text-mail-subtle font-mono">{formatSize(asset.size)}</span>
          )}
        </div>

        {/* Type badge */}
        <div className="mt-2">
          <span
            className="text-[9px] font-medium px-1.5 py-0.5 rounded"
            style={{ background: `${conf.color}15`, color: conf.color }}
          >
            {conf.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// List Row — with small image thumbnail for images
// ---------------------------------------------------------------------------

function AssetListRow({ asset, router }: { asset: Asset; router: ReturnType<typeof useRouter> }) {
  const conf = CATEGORY_CONFIG[asset.mimeCategory] ?? CATEGORY_CONFIG.other;
  const Icon = conf.icon;
  const name = asset.filename || 'Untitled';
  const showPreview = isImageAsset(asset);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => router.push(`/mails/v1/ai-email-details/${asset.emailId}`)}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-mail-hover transition-colors group"
    >
      {/* Thumbnail / Icon */}
      {showPreview && !imgError ? (
        <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 bg-mail-bg">
          <img
            src={`/api/v1/assets/preview/${asset.id}`}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
          style={{ background: `${conf.color}15` }}
        >
          <Icon size={15} style={{ color: conf.color }} />
        </div>
      )}

      {/* Name + subject */}
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-mail-text truncate">{name}</div>
        <div className="text-[11px] text-mail-subtle truncate">
          {asset.subject || displayName(asset.fromName, asset.fromEmail)}
        </div>
      </div>

      {/* Type badge */}
      <span
        className="text-[9px] font-medium px-1.5 py-0.5 rounded shrink-0 hidden sm:block"
        style={{ background: `${conf.color}15`, color: conf.color }}
      >
        {conf.label}
      </span>

      {/* Sender */}
      <div className="text-[11px] text-mail-subtle truncate max-w-[120px] hidden md:block">
        {displayName(asset.fromName, asset.fromEmail)}
      </div>

      {/* Size */}
      <div className="text-[10px] text-mail-subtle font-mono w-[60px] text-right hidden sm:block">
        {asset.size ? formatSize(asset.size) : '—'}
      </div>

      {/* Date */}
      <div className="text-[10px] text-mail-subtle w-[80px] text-right shrink-0">
        {formatDate(asset.receivedAt)}
      </div>
    </div>
  );
}