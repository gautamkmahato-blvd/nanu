"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Mail,
  BarChart3,
  Zap,
  MessageSquare,
  Sparkles,
  Search,
  Calendar,
  Bell,
  CheckCircle2,
  Shield,
  Database,
  Server,
  Lock,
  Send,
  Clock,
  Tag,
  Columns3,
  Brain,
  Activity,
  ChevronRight,
  Star,
  AlertTriangle,
  TrendingUp,
  Minus,
  Eye,
  Inbox,
  ListChecks,
  Contact,
  Radio,
  FileText,
  Menu,
  X,
} from "lucide-react";

/* ══════════════════════════════════════════════
   TOKENS
   ══════════════════════════════════════════════ */
const c = {
  bg: "#09090b",
  surface: "#0f0f12",
  card: "#141418",
  cardAlt: "#1a1a1f",
  border: "#1e1e22",
  borderLight: "#27272a",
  text: "#fafafa",
  muted: "#a1a1aa",
  subtle: "#52525b",
  dim: "#3f3f46",
  accent: "#ed8b3a",
  accentHover: "#d47d27",
  accentSoft: "rgba(237,139,58,0.08)",
  accentMid: "rgba(237,139,58,0.15)",
  green: "#4ade80",
  red: "#f87171",
  blue: "#60a5fa",
  yellow: "#fbbf24",
  purple: "#a78bfa",
};

/* ══════════════════════════════════════════════
   SCROLL FADE-IN
   ══════════════════════════════════════════════ */
function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════
   DOT GRID BACKGROUND
   ══════════════════════════════════════════════ */
function DotGrid() {
  return (
    <div
      className="absolute inset-0 -z-10 pointer-events-none"
      style={{
        backgroundImage: `radial-gradient(${c.dim} 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        opacity: 0.3,
        maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
      }}
    />
  );
}

/* ══════════════════════════════════════════════
   NAV
   ══════════════════════════════════════════════ */
function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
      style={{ background: `${c.bg}dd`, borderBottom: `1px solid ${c.border}` }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
        <a href="/" className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: c.accent }}
          >
            <Mail className="w-3.5 h-3.5" style={{ color: "#000" }} />
          </div>
          <span className="font-semibold text-sm tracking-tight" style={{ color: c.text }}>
            Context Mode
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6 text-[13px]" style={{ color: c.muted }}>
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
          <a href="#security" className="hover:text-white transition">Security</a>
        </div>

        <div className="hidden md:flex items-center gap-3 text-[13px]">
          <a href="/login" style={{ color: c.muted }} className="hover:text-white transition">
            Sign in
          </a>
          <a
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition text-[13px]"
            style={{ background: c.accent, color: "#000" }}
          >
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open
            ? <X className="w-5 h-5" style={{ color: c.text }} />
            : <Menu className="w-5 h-5" style={{ color: c.text }} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-4 space-y-3 text-sm" style={{ background: c.bg, borderTop: `1px solid ${c.border}` }}>
          <a href="#features" className="block py-2" style={{ color: c.muted }}>Features</a>
          <a href="#how-it-works" className="block py-2" style={{ color: c.muted }}>How It Works</a>
          <a href="#security" className="block py-2" style={{ color: c.muted }}>Security</a>
          <a href="/login" className="block py-2" style={{ color: c.muted }}>Sign in</a>
          <a
            href="/login"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg font-medium"
            style={{ background: c.accent, color: "#000" }}
          >
            Get Started Free <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </nav>
  );
}

/* ══════════════════════════════════════════════
   HERO
   ══════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative pt-32 pb-4 overflow-hidden">
      <DotGrid />
      {/* warm glow */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] -z-10"
        style={{ background: `radial-gradient(ellipse, ${c.accentSoft} 0%, transparent 70%)` }}
      />

      <div className="max-w-3xl mx-auto text-center px-6">
        <Reveal>
          <div
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-8"
            style={{ background: c.accentSoft, color: c.accent, border: `1px solid ${c.accentMid}` }}
          >
            <Radio className="w-3 h-3" /> Now in private beta
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h1
            className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-6"
            style={{ color: c.text }}
          >
            Your inbox has context.
            <br />
            <span style={{ color: c.accent }}>Now your tools do too.</span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p
            className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10"
            style={{ color: c.muted }}
          >
            Context Mode connects your Gmail and Calendar to an AI layer that reads,
            classifies, searches, and briefs you — so you spend less time managing
            email and more time acting on it.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition text-sm"
              style={{ background: c.accent, color: "#000" }}
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition"
              style={{ color: c.muted, border: `1px solid ${c.borderLight}` }}
            >
              See features <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </Reveal>
      </div>

      {/* Abstract inbox mockup */}
      <Reveal delay={350}>
        <div className="max-w-5xl mx-auto px-6 mt-16">
          <InboxMockup />
        </div>
      </Reveal>
    </section>
  );
}

/* ══════════════════════════════════════════════
   LIVE INBOX MOCKUP
   ══════════════════════════════════════════════ */
function InboxMockup() {
  const emails = [
    {
      from: "Sarah Chen",
      subject: "Re: Q1 Pipeline Review — updated numbers",
      preview: "Hey, I've attached the revised deck with the new pipeline figures. Can we sync before the board...",
      time: "10:32 AM",
      priority: "high",
      sentiment: "neutral",
      category: "Work",
      catColor: c.blue,
    },
    {
      from: "Alex Rivera",
      subject: "Urgent: Production deploy failing on staging",
      preview: "The CI pipeline is throwing a segfault on the new migration. Blocking the 2.4.1 release. Need...",
      time: "9:48 AM",
      priority: "urgent",
      sentiment: "negative",
      category: "Engineering",
      catColor: c.red,
    },
    {
      from: "Nadia Okafor",
      subject: "Meeting prep: Acme Corp renewal discussion",
      preview: "I've pulled together the account history and renewal terms. A few risk flags to discuss before...",
      time: "9:15 AM",
      priority: "high",
      sentiment: "positive",
      category: "Clients",
      catColor: c.green,
    },
    {
      from: "David Kim",
      subject: "FYI: New competitor pricing analysis",
      preview: "Sharing the competitive landscape report. Interesting shift in their mid-market tier. Worth...",
      time: "8:30 AM",
      priority: "medium",
      sentiment: "neutral",
      category: "Strategy",
      catColor: c.purple,
    },
    {
      from: "Calendly",
      subject: "New event: Design Review — Thu 2:00 PM",
      preview: "A new event has been scheduled with Jordan Lee. Duration: 30 min. Agenda: Review updated...",
      time: "Yesterday",
      priority: "low",
      sentiment: "neutral",
      category: "Calendar",
      catColor: c.yellow,
    },
  ];

  const priorityBadge = (p: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      urgent: { bg: "rgba(248,113,113,0.12)", text: c.red, label: "Urgent" },
      high: { bg: c.accentSoft, text: c.accent, label: "High" },
      medium: { bg: "rgba(96,165,250,0.1)", text: c.blue, label: "Medium" },
      low: { bg: `${c.subtle}20`, text: c.subtle, label: "Low" },
    };
    const s = map[p] || map.low;
    return (
      <span
        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
        style={{ background: s.bg, color: s.text }}
      >
        {s.label}
      </span>
    );
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        boxShadow: `0 32px 80px -16px rgba(0,0,0,0.7), 0 0 0 1px ${c.border}`,
      }}
    >
      {/* toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 text-xs"
        style={{ borderBottom: `1px solid ${c.border}` }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.red, opacity: 0.7 }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.yellow, opacity: 0.7 }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.green, opacity: 0.7 }} />
          </div>
          <span style={{ color: c.subtle }}>Inbox — Priority View</span>
        </div>
        <div className="flex items-center gap-2" style={{ color: c.subtle }}>
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded"
            style={{ background: c.card, border: `1px solid ${c.border}` }}
          >
            <Search className="w-3 h-3" />
            <span className="hidden sm:inline">Search emails...</span>
          </div>
          <span style={{ color: c.accent }}>●</span>
          <span>Synced</span>
        </div>
      </div>

      {/* sidebar + list */}
      <div className="flex">
        {/* mini sidebar */}
        <div
          className="hidden md:flex flex-col items-center gap-3 py-4 px-3"
          style={{ borderRight: `1px solid ${c.border}`, background: c.bg }}
        >
          {[Inbox, Star, Clock, Send, Tag, Columns3].map((Icon, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition"
              style={{
                background: i === 0 ? c.accentSoft : "transparent",
                color: i === 0 ? c.accent : c.subtle,
              }}
            >
              <Icon className="w-4 h-4" />
            </div>
          ))}
        </div>

        {/* email list */}
        <div className="flex-1 min-w-0">
          {emails.map((email, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-3 transition"
              style={{
                borderBottom: `1px solid ${c.border}`,
                background: i === 0 ? c.accentSoft : "transparent",
              }}
            >
              {/* avatar */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold mt-0.5"
                style={{
                  background: `${email.catColor}18`,
                  color: email.catColor,
                }}
              >
                {email.from.split(" ").map(w => w[0]).join("")}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-medium truncate" style={{ color: c.text }}>
                    {email.from}
                  </span>
                  {priorityBadge(email.priority)}
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded hidden sm:inline"
                    style={{ background: `${email.catColor}12`, color: email.catColor }}
                  >
                    {email.category}
                  </span>
                </div>
                <p className="text-[13px] truncate mb-0.5" style={{ color: c.muted }}>
                  {email.subject}
                </p>
                <p className="text-xs truncate" style={{ color: c.subtle }}>
                  {email.preview}
                </p>
              </div>

              <span className="text-[11px] shrink-0 mt-1" style={{ color: c.subtle }}>
                {email.time}
              </span>
            </div>
          ))}
        </div>

        {/* AI detail panel */}
        <div
          className="hidden lg:block w-72 p-4"
          style={{ borderLeft: `1px solid ${c.border}`, background: c.bg }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4" style={{ color: c.accent }} />
            <span className="text-xs font-medium" style={{ color: c.text }}>
              AI Analysis
            </span>
          </div>

          <div className="space-y-3">
            {[
              { label: "Summary", value: "Q1 pipeline deck updated with revised figures. Board sync requested.", icon: <FileText className="w-3 h-3" /> },
              { label: "Action Items", value: "Review deck before Thursday. Confirm board meeting slot.", icon: <ListChecks className="w-3 h-3" /> },
              { label: "Sentiment", value: "Neutral — Professional", icon: <Activity className="w-3 h-3" /> },
              { label: "Priority", value: "High — Needs response today", icon: <AlertTriangle className="w-3 h-3" /> },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span style={{ color: c.subtle }}>{item.icon}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: c.subtle }}>
                    {item.label}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: c.muted }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${c.border}` }}>
            <div className="flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-3 h-3" style={{ color: c.subtle }} />
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: c.subtle }}>
                Suggested Reply
              </span>
            </div>
            <div
              className="rounded-lg p-2.5 text-xs leading-relaxed"
              style={{ background: c.card, color: c.muted, border: `1px solid ${c.border}` }}
            >
              "Thanks Sarah — I'll review the deck this afternoon. Let's block 30m Thursday AM to align before the board meeting."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PRIMARY FEATURES (3 big cards)
   ══════════════════════════════════════════════ */
function PrimaryFeatures() {
  const features = [
    {
      icon: <Inbox className="w-5 h-5" />,
      title: "AI Priority Inbox",
      desc: "Every email is classified by urgency, sentiment, relationship type, and topic. Filter by time period. Emails that need action float to the top.",
      accent: c.accent,
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Meeting Prep Briefs",
      desc: "Before every meeting, hybrid RAG finds relevant threads per attendee and generates a briefing with talking points, open items, and risk flags.",
      accent: c.blue,
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "AI Chat — Ask Your Inbox",
      desc: "Natural language search across your entire email history. 3-layer hybrid search with structured filters, full-text, and semantic embeddings.",
      accent: c.purple,
    },
  ];

  return (
    <section id="features" className="py-24 relative">
      <DotGrid />
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <div className="mb-14">
            <span className="text-xs font-medium uppercase tracking-widest mb-3 block" style={{ color: c.accent }}>
              Core Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: c.text }}>
              Intelligence at every layer
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div
                className="rounded-xl p-6 h-full group transition-colors"
                style={{ background: c.card, border: `1px solid ${c.border}` }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                  style={{ background: `${f.accent}12`, color: f.accent }}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[15px] mb-2" style={{ color: c.text }}>
                  {f.title}
                </h3>
                <p className="text-[13px] leading-relaxed" style={{ color: c.muted }}>
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   FEATURE DEEP DIVES (alternating layout)
   ══════════════════════════════════════════════ */
function FeatureDeepDives() {
  return (
    <section id="how-it-works" className="py-24" style={{ background: c.surface }}>
      <div className="max-w-6xl mx-auto px-6 space-y-32">

        {/* Smart Email Details */}
        <Reveal>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-medium uppercase tracking-widest mb-3 block" style={{ color: c.accent }}>
                Smart Email Details
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4" style={{ color: c.text }}>
                Every email, fully understood
              </h3>
              <p className="text-[15px] leading-relaxed mb-6" style={{ color: c.muted }}>
                Click any email and get an AI analysis panel: summary, action items,
                sentiment, relationship context, business intelligence, entities, and
                a suggested response — all generated automatically on sync.
              </p>
              <div className="space-y-3">
                {["Auto-generated summary & action items", "Sentiment & relationship scoring", "Entity extraction & business intel", "One-click suggested responses"].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: c.accent }} />
                    <span className="text-[13px]" style={{ color: c.muted }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Visual */}
            <div
              className="rounded-xl p-5"
              style={{ background: c.card, border: `1px solid ${c.border}` }}
            >
              <div className="space-y-3">
                {[
                  { label: "SUMMARY", value: "Quarterly review deck ready for final sign-off. Two action items pending from legal.", icon: <FileText className="w-3.5 h-3.5" />, color: c.accent },
                  { label: "ACTION ITEMS", value: "1. Review redlined contract §4.2\n2. Confirm pricing with finance by EOD Friday", icon: <ListChecks className="w-3.5 h-3.5" />, color: c.green },
                  { label: "SENTIMENT", value: "Positive — collaborative tone, follow-up expected", icon: <Activity className="w-3.5 h-3.5" />, color: c.blue },
                  { label: "ENTITIES", value: "Acme Corp · Q4 Contract · $240K ARR · Sarah Chen", icon: <Tag className="w-3.5 h-3.5" />, color: c.purple },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="rounded-lg p-3"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span style={{ color: row.color }}>{row.icon}</span>
                      <span className="text-[10px] font-medium tracking-wider" style={{ color: c.subtle }}>
                        {row.label}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: c.muted }}>
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* AI Email Assistant */}
        <Reveal>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Visual */}
            <div
              className="rounded-xl p-5 order-2 md:order-1"
              style={{ background: c.card, border: `1px solid ${c.border}` }}
            >
              <div className="space-y-3">
                {/* Chat messages */}
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: c.accentSoft, color: c.accent }}>
                    <span className="text-[10px] font-bold">G</span>
                  </div>
                  <div className="rounded-lg px-3 py-2 text-xs" style={{ background: c.bg, color: c.muted, border: `1px solid ${c.border}` }}>
                    What were the key pricing points discussed with Acme in the last 3 months?
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: c.accentMid }}>
                    <Sparkles className="w-3 h-3" style={{ color: c.accent }} />
                  </div>
                  <div className="rounded-lg px-3 py-2 text-xs leading-relaxed" style={{ background: c.bg, color: c.muted, border: `1px solid ${c.border}` }}>
                    Based on 14 threads found between Jan–Mar 2025:<br /><br />
                    <span style={{ color: c.text }}>• $240K ARR</span> — proposed in Jan, countered at $210K<br />
                    <span style={{ color: c.text }}>• 3-year term</span> — agreed on in Feb thread with Sarah<br />
                    <span style={{ color: c.text }}>• Implementation fee</span> — still open, last discussed Mar 2<br /><br />
                    <span style={{ color: c.subtle }}>Sources: 3 threads cited</span>
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}
                >
                  <MessageSquare className="w-3.5 h-3.5" style={{ color: c.subtle }} />
                  <span className="text-xs" style={{ color: c.subtle }}>Ask a follow-up question...</span>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <span className="text-xs font-medium uppercase tracking-widest mb-3 block" style={{ color: c.accent }}>
                AI Email Assistant
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4" style={{ color: c.text }}>
                Chat with your inbox
              </h3>
              <p className="text-[15px] leading-relaxed mb-6" style={{ color: c.muted }}>
                Ask follow-up questions about any email, get context from related
                threads, draft replies. A conversational interface right on the email
                detail page — backed by your full email history.
              </p>
              <div className="space-y-3">
                {["Natural language queries across all mail", "3-layer hybrid search: filters + full-text + semantic", "AI answers with source thread citations", "Draft replies with full conversation context"].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: c.accent }} />
                    <span className="text-[13px]" style={{ color: c.muted }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Meeting Prep + Kanban */}
        <Reveal>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-medium uppercase tracking-widest mb-3 block" style={{ color: c.accent }}>
                Meeting Prep Briefs
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4" style={{ color: c.text }}>
                Walk in prepared, every time
              </h3>
              <p className="text-[15px] leading-relaxed mb-6" style={{ color: c.muted }}>
                Before every meeting, Context Mode searches your email history using
                hybrid RAG — semantic and keyword — finds relevant threads per attendee,
                and generates a briefing with talking points, open items, risk flags,
                and a suggested approach.
              </p>
            </div>
            {/* Meeting brief mockup */}
            <div
              className="rounded-xl p-5"
              style={{ background: c.card, border: `1px solid ${c.border}` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4" style={{ color: c.blue }} />
                <span className="text-[13px] font-medium" style={{ color: c.text }}>
                  Acme Corp — Renewal Discussion
                </span>
                <span className="text-[11px] ml-auto" style={{ color: c.subtle }}>
                  Today, 2:00 PM
                </span>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg p-3" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <span className="text-[10px] font-medium tracking-wider block mb-1.5" style={{ color: c.green }}>
                    TALKING POINTS
                  </span>
                  <ul className="text-xs space-y-1" style={{ color: c.muted }}>
                    <li>• Renewal pricing: last offer at $240K/yr</li>
                    <li>• Implementation timeline concern raised in Feb</li>
                    <li>• Champion (Sarah) promoted — confirm new stakeholder</li>
                  </ul>
                </div>
                <div className="rounded-lg p-3" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <span className="text-[10px] font-medium tracking-wider block mb-1.5" style={{ color: c.yellow }}>
                    RISK FLAGS
                  </span>
                  <ul className="text-xs space-y-1" style={{ color: c.muted }}>
                    <li>• Competitor eval mentioned in thread from Mar 5</li>
                    <li>• Legal review still pending on §4.2 redlines</li>
                  </ul>
                </div>
                <div className="rounded-lg p-3" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <span className="text-[10px] font-medium tracking-wider block mb-1.5" style={{ color: c.accent }}>
                    SUGGESTED APPROACH
                  </span>
                  <p className="text-xs" style={{ color: c.muted }}>
                    Lead with the expanded support package to counter the competitor eval.
                    Address legal redlines early — offer a concession on §4.2 to move timeline forward.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   FEATURE GRID (remaining 6 features)
   ══════════════════════════════════════════════ */
function FeatureGrid() {
  const features = [
    {
      icon: <Columns3 className="w-4.5 h-4.5" />,
      title: "Kanban Board",
      desc: "Drag emails through stages: New → In Progress → Waiting → Done → Archived. Visual workflow for email task management.",
      color: c.accent,
    },
    {
      icon: <Tag className="w-4.5 h-4.5" />,
      title: "Categories & Labels",
      desc: "Custom categories with color coding and nested subcategories. Organize emails your way — beyond what Gmail labels offer.",
      color: c.green,
    },
    {
      icon: <Calendar className="w-4.5 h-4.5" />,
      title: "Calendar Integration",
      desc: "View events, check availability, create meetings with AI descriptions, send invitations with ICS attachments — all from inside the workspace.",
      color: c.blue,
    },
    {
      icon: <Bell className="w-4.5 h-4.5" />,
      title: "Priority Contacts + Telegram",
      desc: "Mark important contacts. When they email you, get an instant Telegram notification with sender, subject, and preview.",
      color: c.yellow,
    },
    {
      icon: <ListChecks className="w-4.5 h-4.5" />,
      title: "Tasks & Deadlines",
      desc: "AI extracts action items and deadlines from emails automatically. See everything due today, this week, and overdue in one view.",
      color: c.purple,
    },
    {
      icon: <Contact className="w-4.5 h-4.5" />,
      title: "Contact Intelligence",
      desc: "Interaction history, email frequency, relationship score, and AI-generated briefs for every contact you communicate with.",
      color: c.red,
    },
  ];

  return (
    <section className="py-24 relative">
      <DotGrid />
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-14">
            <span className="text-xs font-medium uppercase tracking-widest mb-3 block" style={{ color: c.accent }}>
              And More
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: c.text }}>
              Everything you need to own your inbox
            </h2>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div
                className="rounded-xl p-5 h-full"
                style={{ background: c.card, border: `1px solid ${c.border}` }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${f.color}12`, color: f.color }}
                >
                  {f.icon}
                </div>
                <h4 className="font-semibold text-[14px] mb-1.5" style={{ color: c.text }}>
                  {f.title}
                </h4>
                <p className="text-[13px] leading-relaxed" style={{ color: c.muted }}>
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   REAL-TIME SYNC CALLOUT
   ══════════════════════════════════════════════ */
function SyncCallout() {
  return (
    <section className="py-16" style={{ background: c.surface }}>
      <div className="max-w-4xl mx-auto px-6">
        <Reveal>
          <div
            className="rounded-xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6"
            style={{ background: c.card, border: `1px solid ${c.border}` }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: c.accentSoft, color: c.accent }}
            >
              <Radio className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[15px] mb-1" style={{ color: c.text }}>
                Real-Time Sync
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: c.muted }}>
                Emails arrive via Gmail push notifications (Pub/Sub webhooks). New mail is
                ingested, classified by AI, embedded for search, and available in your inbox
                within seconds — not minutes.
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0"
              style={{ background: `${c.green}12`, color: c.green }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.green }} />
              Live
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   SECURITY & TECH
   ══════════════════════════════════════════════ */
function Security() {
  const items = [
    {
      icon: <Shield className="w-4.5 h-4.5" />,
      title: "Multi-tenant isolation",
      desc: "Your data is completely isolated from every other user at the database level.",
    },
    {
      icon: <Lock className="w-4.5 h-4.5" />,
      title: "AES-256-GCM encryption",
      desc: "All sessions encrypted with AES-256-GCM. Tokens never stored in plain text.",
    },
    {
      icon: <Eye className="w-4.5 h-4.5" />,
      title: "Your data only",
      desc: "All AI processing happens on your data only — nothing is shared between users or used for training.",
    },
    {
      icon: <Server className="w-4.5 h-4.5" />,
      title: "Self-hostable",
      desc: "Deploy on your own infrastructure. Next.js 15, PostgreSQL + pgvector, Drizzle ORM.",
    },
  ];

  return (
    <section id="security" className="py-24 relative">
      <DotGrid />
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-14">
            <span className="text-xs font-medium uppercase tracking-widest mb-3 block" style={{ color: c.accent }}>
              Trust & Security
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ color: c.text }}>
              Built for privacy from day one
            </h2>
            <p className="max-w-xl mx-auto text-[15px]" style={{ color: c.muted }}>
              No shared models. No data leaks. Your email stays yours.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div
                className="rounded-xl p-5 h-full"
                style={{ background: c.card, border: `1px solid ${c.border}` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: c.accentSoft, color: c.accent }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[14px] mb-1" style={{ color: c.text }}>
                      {item.title}
                    </h4>
                    <p className="text-[13px] leading-relaxed" style={{ color: c.muted }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* tech stack pills */}
        <Reveal delay={350}>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
            {["Next.js 15", "PostgreSQL", "pgvector", "Drizzle ORM", "Gmail API", "Pub/Sub Webhooks", "OpenAI Embeddings"].map((tech) => (
              <span
                key={tech}
                className="text-[11px] font-medium px-3 py-1.5 rounded-lg"
                style={{ background: c.card, color: c.subtle, border: `1px solid ${c.border}` }}
              >
                {tech}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   CTA
   ══════════════════════════════════════════════ */
function CTA() {
  return (
    <section className="py-24" style={{ background: c.surface }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <Reveal>
          <div
            className="rounded-xl p-10 sm:p-14 relative overflow-hidden"
            style={{ background: c.card, border: `1px solid ${c.border}` }}
          >
            {/* subtle glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] blur-[100px] -z-0"
              style={{ background: c.accentSoft }}
            />
            <div className="relative z-10">
              <h2
                className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
                style={{ color: c.text }}
              >
                Your inbox is waiting
              </h2>
              <p className="text-[15px] mb-8 max-w-md mx-auto" style={{ color: c.muted }}>
                Stop triaging manually. Let AI handle the context so you can
                focus on the decisions that matter.
              </p>
              <a
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition text-sm"
                style={{ background: c.accent, color: "#000" }}
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${c.border}` }}>
      <div
        className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: c.accent }}
          >
            <Mail className="w-3 h-3" style={{ color: "#000" }} />
          </div>
          <span className="text-sm font-medium" style={{ color: c.text }}>
            Context Mode
          </span>
        </div>

        <div className="flex items-center gap-6 text-[13px]" style={{ color: c.subtle }}>
          <a href="https://thumbnix.com" className="hover:text-white transition flex items-center gap-1">
            Built by Gautam <ArrowUpRight className="w-3 h-3" />
          </a>
          <a href="/login" className="hover:text-white transition">
            Sign in
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <main
      className="min-h-screen antialiased"
      style={{ background: c.bg, color: c.text, fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <Nav />
      <Hero />
      <PrimaryFeatures />
      <FeatureDeepDives />
      <FeatureGrid />
      <SyncCallout />
      <Security />
      <CTA />
      <Footer />
    </main>
  );
}