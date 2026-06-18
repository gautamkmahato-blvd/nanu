// app/mails/v1/prep/page.tsx
'use client';

import { useState } from 'react';
import { Loader2, Play, RefreshCw } from 'lucide-react';

export default function PrepTestPage() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState<number | null>(null);

  async function runPipeline() {
    setLoading(true);
    setError('');
    setResponse('');
    setDuration(null);
    const start = Date.now();

    try {
      const res = await fetch('/api/v1/calendar/meeting-prep?hours=48&limit=10');
      const data = await res.json();
      setDuration(Date.now() - start);

      if (!res.ok) {
        setError(`HTTP ${res.status}: ${data.error ?? 'Unknown error'}`);
        setResponse(JSON.stringify(data, null, 2));
        return;
      }

      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setDuration(Date.now() - start);
      setError(err instanceof Error ? err.message : 'Fetch failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-mail-bg h-full flex flex-col text-mail-text font-sans p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-lg font-semibold m-0">Meeting Prep — Pipeline Test</h1>
          <p className="text-xs text-mail-subtle mt-1 m-0">Raw JSON output from /api/v1/calendar/meeting-prep</p>
        </div>
        <div className="flex items-center gap-3">
          {duration !== null && (
            <span className="text-xs text-mail-subtle font-mono">{(duration / 1000).toFixed(1)}s</span>
          )}
          <button onClick={runPipeline} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-none bg-mail-accent hover:bg-mail-accent-hover text-white text-sm font-medium cursor-pointer transition-colors disabled:opacity-60">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Running...</> : <><Play size={14} /> Run Pipeline</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] mb-3 shrink-0">
          {error}
        </div>
      )}

      <textarea
        value={response}
        readOnly
        placeholder="Click 'Run Pipeline' to test. Raw JSON response will appear here."
        className="flex-1 w-full px-4 py-3 rounded-xl border border-mail-border bg-mail-surface text-mail-muted text-[12px] font-mono leading-relaxed resize-none outline-none"
      />
    </div>
  );
}