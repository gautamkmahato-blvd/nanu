// app/mails/v1/meeting-prep/page.tsx
// Updated: "View Related Emails" button + right side panel per meeting card.
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MarkdownRenderer from '../_components/ui/MarkdownRenderer';
import {
  Loader2, Target, Users, AlertTriangle, Flag, ChevronDown, ChevronUp,
  Lightbulb, ShieldAlert, CheckCircle, Video, ExternalLink,
  MapPin, Clock, ArrowRight, ArrowLeft, Sparkles, Mail,
  AlertCircle, X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types (matching new API response)
// ---------------------------------------------------------------------------

type AttendeePrep = {
  email: string;
  name: string | null;
  responseStatus: string;
  emailsReceived: number;
  emailsSent: number;
};

type AiPrep = {
  briefing: string;
  talkingPoints: string[];
  openItems: string[];
  riskFlags: string[];
  suggestedApproach: string;
  attendeeNotes: Record<string, string>;
};

// Lightweight shape returned by the API for the side panel
type RelatedEmail = {
  id: string;
  subject: string | null;
  fromEmail: string;
  fromName: string | null;
  snippet: string | null;
  receivedAt: string;
  finalScore: number;
  relevantToAttendees: string[];
};

type PreparedEvent = {
  id: string;
  summary: string;
  startTime: string;
  endTime: string;
  hangoutLink: string | null;
  htmlLink: string | null;
  location: string | null;
  description: string | null;
  attendeePrep: AttendeePrep[];
  prepSummary: string;
  aiPrep: AiPrep | null;
  relatedEmails?: RelatedEmail[];
};

type ApiResponse = {
  events: PreparedEvent[];
  errors: { meetingId: string; meetingSummary: string; error: string }[];
  success: boolean;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const RESP_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  accepted: { icon: CheckCircle, color: '#22c55e', label: 'Accepted' },
  declined: { icon: AlertCircle, color: '#ef4444', label: 'Declined' },
  tentative: { icon: Clock, color: '#f59e0b', label: 'Tentative' },
  needsAction: { icon: Clock, color: '#6b7280', label: 'Pending' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtTime(iso: string): string { return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }); }
function fmtDuration(s: string, e: string): string { const m = Math.round((new Date(e).getTime() - new Date(s).getTime()) / 60000); if (m < 60) return `${m}m`; const h = Math.floor(m / 60); const r = m % 60; return r ? `${h}h ${r}m` : `${h}h`; }
function timeUntil(iso: string): { label: string; urgent: boolean } { const diff = new Date(iso).getTime() - Date.now(); if (diff < 0) return { label: 'Now', urgent: true }; const mins = Math.floor(diff / 60000); if (mins < 60) return { label: `in ${mins}m`, urgent: mins < 15 }; const hrs = Math.floor(mins / 60); if (hrs < 24) return { label: `in ${hrs}h`, urgent: false }; return { label: `in ${Math.floor(hrs / 24)}d`, urgent: false }; }
function nameOf(n: string | null, e: string): string { return n || (e.indexOf('@') > 0 ? e.slice(0, e.indexOf('@')) : e); }

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MeetingPrepPage() {
  return (
    <Suspense fallback={
      <div className="bg-mail-bg h-full flex items-center justify-center text-mail-subtle text-sm">
        <Loader2 size={16} className="animate-spin mr-2" /> Loading...
      </div>
    }>
      <MeetingPrepContent />
    </Suspense>
  );
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

function MeetingPrepContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightEventId = searchParams.get('event');

  const [events, setEvents] = useState<PreparedEvent[]>([]);
  const [errors, setErrors] = useState<ApiResponse['errors']>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Related emails side panel state
  const [emailPanelEventId, setEmailPanelEventId] = useState<string | null>(null);
  const emailPanelEvent = events.find((e) => e.id === emailPanelEventId) ?? null;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/v1/calendar/meeting-prep?hours=48&limit=10');
        if (!res.ok) throw new Error('Failed to load');
        const data: ApiResponse = await res.json();
        setEvents(data.events ?? []);
        setErrors(data.errors ?? []);
        if (highlightEventId && data.events?.some((e) => e.id === highlightEventId)) setExpandedId(highlightEventId);
        else if (data.events?.length > 0) setExpandedId(data.events[0].id);
      } catch (err) { setFetchError(err instanceof Error ? err.message : 'Failed'); }
      finally { setLoading(false); }
    };
    load();
  }, [highlightEventId]);

  const totalAttendees = useMemo(() => new Set(events.flatMap((e) => e.attendeePrep.map((a) => a.email))).size, [events]);
  const totalPending = useMemo(() => events.reduce((s, e) => s + (e.aiPrep?.openItems.length ?? 0), 0), [events]);
  const totalRisks = useMemo(() => events.reduce((s, e) => s + (e.aiPrep?.riskFlags.length ?? 0), 0), [events]);

  // Toggle handler: clicking the same meeting closes the panel, different meeting switches it
  const handleShowEmails = (eventId: string) => {
    setEmailPanelEventId((prev) => (prev === eventId ? null : eventId));
  };

  return (
    <div className="flex h-full">
      {/* ── Main content area ── */}
      <div className="bg-mail-bg flex-1 min-w-0 h-full overflow-y-auto text-mail-text font-sans">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-mail-border">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Target size={18} className="text-mail-accent" />
                <h1 className="text-lg font-semibold m-0">Meeting Prep</h1>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-mail-accent-soft text-mail-accent">AI Powered</span>
              </div>
              <p className="text-xs text-mail-subtle mt-1 m-0">Briefings for your upcoming meetings · Next 48 hours</p>
            </div>
            <button onClick={() => router.push('/mails/v1/calendar')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mail-border bg-transparent text-mail-muted text-xs cursor-pointer hover:bg-mail-hover transition-colors">
              <ArrowLeft size={13} /> Calendar
            </button>
          </div>
          {events.length > 0 && (
            <div className="flex items-center gap-2">
              <StatBadge icon={Target} label="Meetings" value={events.length} color="var(--mail-accent)" />
              <StatBadge icon={Users} label="People" value={totalAttendees} color="#3b82f6" />
              {totalPending > 0 && <StatBadge icon={AlertTriangle} label="Open Items" value={totalPending} color="#f59e0b" />}
              {totalRisks > 0 && <StatBadge icon={Flag} label="Risks" value={totalRisks} color="#ef4444" />}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-w-[900px]">
          {loading && (
            <div className="text-center py-16 flex flex-col items-center gap-3">
              <Loader2 size={24} className="animate-spin text-mail-accent" />
              <div className="text-sm text-mail-subtle">Preparing meeting briefs...</div>
              <div className="text-xs text-mail-subtle/60">Searching emails with RAG · Analyzing with AI</div>
            </div>
          )}

          {fetchError && <div className="px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 text-[13px] mb-4">{fetchError}</div>}

          {/* Pipeline errors for individual meetings */}
          {errors.length > 0 && (
            <div className="mb-4">
              {errors.map((e, i) => (
                <div key={i} className="px-4 py-2.5 rounded-lg bg-red-500/5 border border-red-500/20 text-[12px] text-red-400 mb-2">
                  <span className="font-medium">{e.meetingSummary || 'Unknown meeting'}:</span> {e.error}
                </div>
              ))}
            </div>
          )}

          {!loading && events.length === 0 && !fetchError && (
            <div className="text-center py-16 flex flex-col items-center gap-3">
              <Target size={36} strokeWidth={1} className="text-mail-subtle opacity-30" />
              <div className="text-base font-medium text-mail-text">No upcoming meetings</div>
              <div className="text-[13px] text-mail-subtle">No meetings with attendees in the next 48 hours</div>
            </div>
          )}

          {events.map((event) => (
            <MeetingCard key={event.id} event={event}
              isExpanded={expandedId === event.id}
              isHighlighted={highlightEventId === event.id}
              isEmailPanelActive={emailPanelEventId === event.id}
              onToggle={() => setExpandedId(expandedId === event.id ? null : event.id)}
              onShowEmails={handleShowEmails} />
          ))}
        </div>
      </div>

      {/* ── Related Emails side panel ── */}
      {emailPanelEvent && (
        <RelatedEmailsPanel
          event={emailPanelEvent}
          onClose={() => setEmailPanelEventId(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meeting Card
// ---------------------------------------------------------------------------

function MeetingCard({ event, isExpanded, isHighlighted, isEmailPanelActive, onToggle, onShowEmails }: {
  event: PreparedEvent;
  isExpanded: boolean;
  isHighlighted: boolean;
  isEmailPanelActive: boolean;
  onToggle: () => void;
  onShowEmails: (eventId: string) => void;
}) {
  const tu = timeUntil(event.startTime);
  const ai = event.aiPrep;
  const hasAiContent = ai && (ai.briefing || ai.talkingPoints.length > 0);
  const emailCount = event.relatedEmails?.length ?? 0;

  return (
    <div className={`rounded-xl border mb-3 overflow-hidden transition-colors ${isHighlighted ? 'border-mail-accent' : isEmailPanelActive ? 'border-mail-accent/50' : 'border-mail-border'}`}>
      {/* Header — always visible */}
      <div onClick={onToggle} className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-mail-hover transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[15px] font-semibold text-mail-text">{event.summary}</span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tu.urgent ? 'bg-red-500/10 text-red-400' : 'bg-mail-accent-soft text-mail-accent'}`}>{tu.label}</span>
            {hasAiContent && <span className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-mail-accent-soft text-mail-accent"><Sparkles size={9} /> AI</span>}
          </div>
          <div className="flex items-center gap-2 text-xs text-mail-subtle flex-wrap">
            <span className="flex items-center gap-1"><Clock size={11} /> {fmtTime(event.startTime)} – {fmtTime(event.endTime)}</span>
            <span>·</span>
            <span>{fmtDuration(event.startTime, event.endTime)}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Users size={11} /> {event.attendeePrep.length} attendee{event.attendeePrep.length !== 1 ? 's' : ''}</span>
            {event.prepSummary && <><span>·</span><span className="flex items-center gap-1"><Mail size={11} /> {event.prepSummary}</span></>}
          </div>
        </div>

        {/* Avatar stack */}
        <div className="flex -space-x-1.5 shrink-0">
          {event.attendeePrep.slice(0, 5).map((a) => (
            <div key={a.email} className="w-7 h-7 rounded-full bg-mail-hover border-2 border-mail-bg flex items-center justify-center text-[9px] font-bold text-mail-muted">
              {nameOf(a.name, a.email).slice(0, 2).toUpperCase()}
            </div>
          ))}
        </div>

        {isExpanded ? <ChevronUp size={16} className="text-mail-subtle shrink-0 ml-2" /> : <ChevronDown size={16} className="text-mail-subtle shrink-0 ml-2" />}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-mail-border">
          {ai && hasAiContent ? (
            <>
              {ai.briefing && (
                <PrepSection icon={Sparkles} title="AI Briefing" color="var(--mail-accent)" accent>
                  <div className="text-[13px] text-mail-muted leading-relaxed"><MarkdownRenderer content={ai.briefing} /></div>
                </PrepSection>
              )}

              {ai.talkingPoints.length > 0 && (
                <PrepSection icon={Lightbulb} title="Talking Points" color="var(--mail-accent)">
                  {ai.talkingPoints.map((pt, i) => (
                    <div key={i} className="flex gap-2 py-1 text-[13px]">
                      <span className="text-mail-accent font-semibold shrink-0">{i + 1}.</span>
                      <span className="text-mail-muted">{pt}</span>
                    </div>
                  ))}
                </PrepSection>
              )}

              {ai.openItems.length > 0 && (
                <PrepSection icon={AlertTriangle} title="Open Items" color="#f59e0b" accent>
                  {ai.openItems.map((item, i) => (
                    <div key={i} className="flex gap-2 py-0.5 text-[13px]">
                      <ArrowRight size={13} className="text-yellow-400 shrink-0 mt-0.5" />
                      <span className="text-yellow-400/80">{item}</span>
                    </div>
                  ))}
                </PrepSection>
              )}

              {ai.riskFlags.length > 0 && (
                <PrepSection icon={ShieldAlert} title="Watch Out" color="#ef4444" accent>
                  {ai.riskFlags.map((flag, i) => (
                    <div key={i} className="text-[13px] text-red-400/80 py-0.5 flex gap-2">
                      <Flag size={12} className="text-red-400 shrink-0 mt-0.5" />{flag}
                    </div>
                  ))}
                </PrepSection>
              )}

              {ai.suggestedApproach && (
                <div className="mt-3 px-4 py-3 rounded-lg bg-green-500/5 border border-green-500/15 text-[13px]">
                  <span className="font-semibold text-green-400">Suggested Approach: </span>
                  <span className="text-mail-muted">{ai.suggestedApproach}</span>
                </div>
              )}
            </>
          ) : (
            <div className="py-6 text-center text-mail-subtle text-xs">AI prep not available for this meeting</div>
          )}

          {/* Attendees */}
          <div className="mt-5">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-mail-subtle mb-3">
              <Users size={13} /> Attendees ({event.attendeePrep.length})
            </div>
            {event.attendeePrep.map((a) => (
              <AttendeeCard key={a.email} attendee={a} aiNote={ai?.attendeeNotes?.[a.email] ?? null} />
            ))}
          </div>

          {/* Meeting info */}
          {(event.location || event.description) && (
            <div className="mt-3 px-4 py-3 rounded-lg bg-mail-surface border border-mail-border text-xs">
              {event.location && <div className="flex items-center gap-1.5 text-mail-subtle mb-1"><MapPin size={11} /> {event.location}</div>}
              {event.description && <div className="text-mail-subtle leading-relaxed"><MarkdownRenderer content={event.description} /></div>}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {event.hangoutLink && (
              <a href={event.hangoutLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-lg border-none bg-blue-500 hover:bg-blue-600 text-white no-underline font-medium transition-colors">
                <Video size={13} /> Join Meeting
              </a>
            )}
            {event.htmlLink && (
              <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-lg border border-mail-border text-mail-muted no-underline hover:bg-mail-hover transition-colors">
                <ExternalLink size={12} /> Open in Calendar
              </a>
            )}
            {/* Related emails button — only show when emails exist */}
            {emailCount > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); onShowEmails(event.id); }}
                className={`flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                  isEmailPanelActive
                    ? 'border-mail-accent bg-mail-accent-soft text-mail-accent'
                    : 'border-mail-border text-mail-muted hover:bg-mail-hover'
                }`}
              >
                <Mail size={12} /> View Related Emails ({emailCount})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Related Emails Side Panel
// ---------------------------------------------------------------------------

function RelatedEmailsPanel({ event, onClose }: { event: PreparedEvent; onClose: () => void }) {
  const router = useRouter();
  const emails = event.relatedEmails ?? [];

  return (
    <div className="w-[380px] shrink-0 h-full border-l border-mail-border bg-mail-bg overflow-y-auto">
      {/* Sticky header */}
      <div className="px-4 py-3 border-b border-mail-border flex items-center justify-between sticky top-0 bg-mail-bg z-10">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-mail-text">
            <Mail size={14} className="text-mail-accent shrink-0" />
            Related Emails
            <span className="text-[10px] font-normal text-mail-subtle ml-1">({emails.length})</span>
          </div>
          <div className="text-[11px] text-mail-subtle mt-0.5 truncate">{event.summary}</div>
        </div>
        <button
          onClick={onClose}
          className="text-mail-subtle hover:text-mail-text transition-colors p-1 rounded hover:bg-mail-hover cursor-pointer shrink-0 ml-2"
        >
          <X size={14} />
        </button>
      </div>

      {/* Email list */}
      <div className="px-3 py-2">
        {emails.length === 0 ? (
          <div className="text-center py-8 text-mail-subtle text-xs">No related emails found</div>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              onClick={() => router.push(`/mails/v1/ai-email-details/${email.id}`)}
              className="px-3 py-3 rounded-lg cursor-pointer hover:bg-mail-hover transition-colors mb-1 border border-transparent hover:border-mail-border group"
            >
              {/* From + date */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-medium text-mail-text truncate max-w-[220px]">
                  {email.fromName || email.fromEmail}
                </span>
                <span className="text-[10px] text-mail-subtle shrink-0 ml-2">
                  {new Date(email.receivedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Subject */}
              <div className="text-[12px] text-mail-muted truncate">{email.subject || '(no subject)'}</div>

              {/* Snippet */}
              {email.snippet && (
                <div className="text-[11px] text-mail-subtle mt-1 line-clamp-2 leading-relaxed">{email.snippet}</div>
              )}

              {/* Score + attendee count */}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-mail-accent-soft text-mail-accent">
                  Relevance {(email.finalScore * 100).toFixed(0)}%
                </span>
                {email.relevantToAttendees.length > 0 && (
                  <span className="text-[9px] text-mail-subtle flex items-center gap-0.5">
                    <Users size={8} /> {email.relevantToAttendees.length} attendee{email.relevantToAttendees.length !== 1 ? 's' : ''}
                  </span>
                )}
                {/* Arrow hint on hover */}
                <ArrowRight size={10} className="text-mail-subtle opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Attendee Card (simplified for new API)
// ---------------------------------------------------------------------------

function AttendeeCard({ attendee: a, aiNote }: { attendee: AttendeePrep; aiNote: string | null }) {
  const display = nameOf(a.name, a.email);
  const respConf = RESP_CONFIG[a.responseStatus] ?? RESP_CONFIG.needsAction;
  const RespIcon = respConf.icon;

  return (
    <div className="py-3 border-b border-mail-border last:border-b-0">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-full bg-mail-hover flex items-center justify-center text-[11px] font-bold text-mail-muted shrink-0">
          {display.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-mail-text">{display}</div>
          <div className="text-[11px] text-mail-subtle truncate">{a.email}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {a.emailsReceived > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-mail-chip text-mail-subtle">
              <Mail size={9} /> {a.emailsReceived} emails
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${respConf.color}12`, color: respConf.color }}>
            <RespIcon size={10} /> {respConf.label}
          </span>
        </div>
      </div>

      {/* AI note */}
      {aiNote ? (
        <div className="text-[12px] text-mail-muted leading-relaxed ml-[42px] px-3 py-2 rounded-md border-l-2 border-mail-accent/30 bg-mail-accent-soft/20">
          {aiNote}
        </div>
      ) : (
        <div className="text-[12px] text-mail-subtle italic ml-[42px]">No prior email context</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

function PrepSection({ icon: Icon, title, color, accent, children }: { icon: React.ElementType; title: string; color: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <div className="mt-3 px-4 py-3 rounded-lg border" style={{ background: accent ? `color-mix(in srgb, ${color} 4%, transparent)` : 'transparent', borderColor: accent ? `color-mix(in srgb, ${color} 12%, transparent)` : 'var(--mail-border)' }}>
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color }}>
        <Icon size={13} /> {title}
      </div>
      {children}
    </div>
  );
}

function StatBadge({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-mail-border bg-mail-surface">
      <span className="text-[10px] text-mail-subtle font-medium">{label}</span>
      <span className="text-sm font-bold font-mono" style={{ color }}>{value}</span>
    </div>
  );
}