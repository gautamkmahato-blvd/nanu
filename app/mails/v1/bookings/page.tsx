// app/mails/v1/bookings/page.tsx
// Admin view — see all bookings, filter by status.
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Loader2, Calendar, Clock, User, Mail, Video, ExternalLink,
  CheckCircle, XCircle, RefreshCw, Filter,
  BookOpenIcon,
  BookPlusIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type Booking = {
  id: string; guestName: string; guestEmail: string; notes: string;
  date: string; startTime: string; endTime: string; durationMinutes: number;
  timezone: string; googleEventId: string | null; meetLink: string | null;
  status: string; createdAt: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  confirmed: { label: 'Confirmed', color: '#22c55e', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: '#ef4444', icon: XCircle },
};

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const res = await fetch(`/api/v1/booking/bookings${params}`);
      const data = await res.json();
      setBookings(data.bookings ?? []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const confirmed = bookings.filter((b) => b.status === 'confirmed');
  const upcoming = confirmed.filter((b) => new Date(b.date + 'T' + b.endTime) > new Date());
  const past = confirmed.filter((b) => new Date(b.date + 'T' + b.endTime) <= new Date());

  return (
    <div className="bg-mail-bg h-full overflow-y-auto text-mail-text font-sans">
      <div className="max-w-[800px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-lg font-semibold m-0 flex items-center gap-2">
              <Calendar size={18} className="text-mail-accent" /> My Bookings
            </h1>
            <p className="text-xs text-mail-subtle mt-1 m-0">
              {bookings.length} total · {upcoming.length} upcoming
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <button onClick={() => router.push('/mails/v1/booking-settings')} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-xs cursor-pointer hover:bg-mail-hover transition-colors disabled:opacity-50">
              <BookPlusIcon size={12} className={loading ? 'animate-spin' : ''} /> Booking Settings
            </button>
            <button onClick={load} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-xs cursor-pointer hover:bg-mail-hover transition-colors disabled:opacity-50">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-5">
          {[
            { value: '', label: 'All', count: bookings.length },
            { value: 'confirmed', label: 'Confirmed', count: confirmed.length },
            { value: 'cancelled', label: 'Cancelled', count: bookings.length - confirmed.length },
          ].map((tab) => (
            <button key={tab.value} onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition-colors ${
                filter === tab.value
                  ? 'border-mail-accent/30 text-mail-accent bg-transparent'
                  : 'border-mail-border text-mail-muted bg-transparent hover:bg-mail-hover'
              }`}>
              {tab.label} <span className="font-mono ml-1 opacity-60">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && bookings.length === 0 && (
          <div className="flex items-center justify-center py-16 text-mail-subtle text-sm gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading...
          </div>
        )}

        {/* Empty */}
        {!loading && bookings.length === 0 && (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <Calendar size={36} strokeWidth={1} className="text-mail-subtle opacity-30" />
            <div className="text-base font-medium text-mail-text">No bookings yet</div>
            <div className="text-[13px] text-mail-subtle">Share your booking link to start receiving bookings.</div>
          </div>
        )}

        {/* Bookings list */}
        {bookings.length > 0 && (
          <div className="flex flex-col gap-2">
            {bookings.map((b) => {
              const sc = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.confirmed;
              const Icon = sc.icon;
              const isPast = new Date(b.date + 'T' + b.endTime) <= new Date();
              return (
                <div key={b.id}
                  className={`rounded-xl border border-mail-border bg-mail-surface p-4 transition-colors ${isPast ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-mail-accent-soft flex items-center justify-center text-mail-accent text-[13px] font-bold shrink-0">
                      {b.guestName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[14px] font-semibold text-mail-text">{b.guestName}</span>
                        <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ background: `${sc.color}15`, color: sc.color }}>
                          <Icon size={9} /> {sc.label}
                        </span>
                        {isPast && <span className="text-[10px] text-mail-subtle">Past</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-mail-muted mb-1.5">
                        <span className="flex items-center gap-1"><Mail size={11} /> {b.guestEmail}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-mail-subtle flex-wrap">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {fmtDate(b.date)}</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {fmtTime(b.startTime)} — {fmtTime(b.endTime)}</span>
                        <span>{b.durationMinutes} min</span>
                        {b.meetLink && (
                          <a href={b.meetLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 no-underline hover:underline">
                            <Video size={11} /> Meet
                          </a>
                        )}
                      </div>
                      {b.notes && <div className="text-[12px] text-mail-subtle mt-2 italic">"{b.notes}"</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
