"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Star,
  Menu,
  X,
  Mail,
  BarChart3,
  Users,
  Zap,
  MessageSquare,
  FileText,
  Sparkles,
  PenTool,
  Expand,
  Clock,
  Shield,
  Calendar,
  Inbox,
  BellRing,
  Send,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Copy,
  Palette,
  Code2,
  Factory,
  Inspect,
  TowelRackIcon,
  Library,
} from "lucide-react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS  (dark theme, amber-orange accent)
   ───────────────────────────────────────────── */
const t = {
  bg: "#09090b",
  surface: "#121214",
  surfaceAlt: "#18181b",
  card: "#1a1a1f",
  cardHover: "#222228",
  border: "#27272a",
  borderSubtle: "#1e1e22",
  text: "#fafafa",
  muted: "#a1a1aa",
  subtle: "#52525b",
  accent: "#ed8b3a",
  accentHover: "#d47d27",
  accentSoft: "rgba(237,139,58,0.1)",
  accentSofter: "rgba(237,139,58,0.06)",
};

/* ─── NAV ─── */
function Navbar() {
  const [open, setOpen] = useState(false);
  const links = ["Home", "About Us", "Reviews", "Products", "Blog"];
  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{
        background: `${t.bg}cc`,
        borderColor: t.borderSubtle,
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-7 h-7" style={{ color: t.accent }} />
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: t.text }}
          >
            Vistore.
          </span>
        </div>

        <div
          className="hidden md:flex items-center gap-1 rounded-full px-2 py-1.5 text-sm"
          style={{ background: t.surfaceAlt, border: `1px solid ${t.border}` }}
        >
          {links.map((l) => (
            <a
              key={l}
              href="#"
              className="px-4 py-1.5 rounded-full transition"
              style={{
                background: l === "Home" ? t.accent : "transparent",
                color: l === "Home" ? "#000" : t.muted,
                fontWeight: l === "Home" ? 600 : 400,
              }}
            >
              {l}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3 text-sm">
          <a href="#" style={{ color: t.muted }}>
            Sign In
          </a>
          <a
            href="#"
            className="rounded-full px-5 py-2 font-medium transition"
            style={{
              border: `1px solid ${t.border}`,
              color: t.text,
            }}
          >
            Sign up Free
          </a>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? (
            <X className="w-6 h-6" style={{ color: t.text }} />
          ) : (
            <Menu className="w-6 h-6" style={{ color: t.text }} />
          )}
        </button>
      </div>

      {open && (
        <div
          className="md:hidden px-6 py-4 space-y-3"
          style={{
            background: t.surface,
            borderTop: `1px solid ${t.border}`,
          }}
        >
          {links.map((l) => (
            <a
              key={l}
              href="#"
              className="block"
              style={{ color: t.muted }}
            >
              {l}
            </a>
          ))}
          <div
            className="pt-3 space-y-2"
            style={{ borderTop: `1px solid ${t.border}` }}
          >
            <a href="#" className="block" style={{ color: t.muted }}>
              Sign In
            </a>
            <a
              href="#"
              className="block text-center rounded-full py-2 font-medium"
              style={{ border: `1px solid ${t.border}`, color: t.text }}
            >
              Sign up Free
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── HERO ─── */
function Hero() {
  const logos = ["Boltshift", "Lightbox", "Spherule", "GlobalBank", "Nietzsche"];
  return (
    <section className="relative overflow-hidden">
      {/* radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[120px] -z-10"
        style={{ background: `radial-gradient(ellipse, ${t.accentSoft} 0%, transparent 70%)` }}
      />

      <div className="max-w-4xl mx-auto text-center pt-20 pb-8 px-6">
        <span
          className="inline-flex items-center gap-2 text-sm mb-6"
          style={{ color: t.muted }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: t.accent }}
          />
          Top CRM Platform 🚀
        </span>
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
          style={{ color: t.text }}
        >
          Smarter CRM{" "}
          <span style={{ color: t.accent }}>Stronger</span>
          <br />
          Sustainable Sales
        </h1>
        <p
          className="text-lg max-w-xl mx-auto mb-8"
          style={{ color: t.muted }}
        >
          Our CRM helps you nurture relationships, automate sales processes, and
          make data-driven decisions — so you can focus on closing more deals.
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-medium transition"
          style={{ background: t.accent, color: "#000" }}
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* dashboard card */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            boxShadow: `0 24px 80px -12px rgba(0,0,0,0.6)`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3
                className="text-xl font-semibold flex items-center gap-2"
                style={{ color: t.text }}
              >
                <BarChart3 className="w-5 h-5" style={{ color: t.accent }} />
                Promotion Analysis
              </h3>
              <p className="text-sm mt-0.5" style={{ color: t.subtle }}>
                Automatic private sector investing
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span
                className="rounded-lg px-3 py-1.5"
                style={{ background: t.surfaceAlt, color: t.muted, border: `1px solid ${t.border}` }}
              >
                Last Week
              </span>
              <span
                className="rounded-lg px-3 py-1.5 font-medium"
                style={{ background: t.accent, color: "#000" }}
              >
                Export ↗
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* sales target */}
            <div
              className="rounded-xl p-5"
              style={{ background: t.surfaceAlt, border: `1px solid ${t.borderSubtle}` }}
            >
              <p className="text-sm mb-3 font-medium" style={{ color: t.muted }}>
                Sales Target
              </p>
              <p className="text-4xl font-bold" style={{ color: t.text }}>
                <span style={{ color: t.accent }}>%</span> 86
              </p>
              <p className="text-xs mt-1" style={{ color: t.subtle }}>
                Better Than Last Month
              </p>
              <div className="flex gap-1.5 mt-4">
                {[72, 88, 60, 95, 80].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-full"
                    style={{
                      height: `${h * 0.6}px`,
                      background: [
                        t.accent,
                        "#fbbf24",
                        "#f97316",
                        t.accent,
                        "#fbbf24",
                      ][i],
                      opacity: [0.7, 0.5, 0.6, 0.8, 0.5][i],
                    }}
                  />
                ))}
              </div>
            </div>

            {/* recent activity */}
            <div
              className="rounded-xl p-5"
              style={{ background: t.surfaceAlt, border: `1px solid ${t.borderSubtle}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium" style={{ color: t.muted }}>
                  Recent Activity
                </p>
                <TrendingUp className="w-4 h-4" style={{ color: t.accent }} />
              </div>
              <div className="space-y-3">
                {[
                  { price: "$200.00", color: "#22c55e" },
                  { price: "$140.00", color: t.muted },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg"
                      style={{ background: `${t.accent}20` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: t.text }}
                      >
                        Stone Black Jacket
                      </p>
                      <p className="text-xs" style={{ color: t.subtle }}>
                        Qty: 10 · 5 Min Ago
                      </p>
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: item.color }}
                    >
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* savings goal */}
            <div
              className="rounded-xl p-5"
              style={{ background: t.accentSoft, border: `1px solid ${t.accent}22` }}
            >
              <p className="text-sm font-medium mb-1" style={{ color: t.muted }}>
                My Saving Goals
              </p>
              <p className="text-xs mb-3" style={{ color: t.subtle }}>
                Lancer Evo 10 · Yes Targeted &gt; 87%
              </p>
              <div
                className="w-full rounded-full h-2 mb-4"
                style={{ background: `${t.accent}30` }}
              >
                <div
                  className="h-2 rounded-full w-3/4"
                  style={{ background: t.accent }}
                />
              </div>
              <p className="text-2xl font-bold" style={{ color: t.text }}>
                $24,120{" "}
                <span
                  className="text-sm font-normal"
                  style={{ color: t.subtle }}
                >
                  /$32,200
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* logos */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {logos.map((name) => (
            <span
              key={name}
              className="text-lg font-semibold tracking-wide"
              style={{ color: t.subtle }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── AI TOOLS GRID ─── */
function AIToolsGrid() {
  const tools = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "AI Subject Line",
      desc: "Boost open rates with smart, catchy headlines tailored to your audience.",
      featured: true,
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Smart Summary",
      desc: "Make your message digestible by summarizing content for busy readers.",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Fix Grammar",
      desc: "Ensure clarity and professionalism with AI-powered error fixes.",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Rephrase Message",
      desc: "Instantly reword your text to match your brand voice or campaign needs.",
    },
    {
      icon: <Expand className="w-5 h-5" />,
      title: "Expand Content",
      desc: "Grow your paragraph or idea to enrich the overall content strategy.",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Follow-Up Generator",
      desc: "Never miss an opportunity — keep leads warm with contextual follow-ups.",
    },
  ];

  return (
    <section className="py-24" style={{ background: t.surface }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
            style={{ color: t.text }}
          >
            <span style={{ color: t.accent }}>Revolutionize</span> Your Inbox
            <br />
            with Swiftlet AI
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: t.muted }}>
            Supercharge emails using smart AI tools — from catchy subject lines
            to summaries, grammar fixes, and flawless follow-ups.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="rounded-2xl p-6 transition-colors group"
              style={{
                background: t.card,
                border: `1px solid ${tool.featured ? t.accent + "40" : t.border}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{
                  background: tool.featured ? t.accentSoft : `${t.subtle}20`,
                  color: tool.featured ? t.accent : t.muted,
                }}
              >
                {tool.icon}
              </div>
              <h3
                className="font-semibold text-lg mb-1.5"
                style={{ color: t.text }}
              >
                {tool.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: t.muted }}
              >
                {tool.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── INTELLIGENCE FEATURES ─── */
function IntelligenceFeatures() {
  const features = [
    {
      icon: <Mail className="w-5 h-5" style={{ color: "#f87171" }} />,
      title: "AI Summaries",
      desc: "Get the gist of any email in one glance — no more scanning long threads.",
    },
    {
      icon: <Inbox className="w-5 h-5" style={{ color: t.accent }} />,
      title: "Priority Detection",
      desc: "Automatically labels and organizes important emails so you can act fast.",
    },
    {
      icon: <Calendar className="w-5 h-5" style={{ color: "#4ade80" }} />,
      title: "Event-Aware Sidebar",
      desc: "See upcoming meetings and emails tied to events — all in one view.",
    },
  ];

  const bottomFeatures = [
    {
      icon: <BellRing className="w-5 h-5" style={{ color: "#fbbf24" }} />,
      title: "Smart Recommendations",
      desc: "Follow-ups, reminders, suggested replies — Vistore nudges you at the right time.",
    },
    {
      icon: <PenTool className="w-5 h-5" style={{ color: "#60a5fa" }} />,
      title: "Writing Assistant",
      desc: "Highlight any sentence while composing to check for tone, clarity, and professionalism.",
    },
  ];

  const FeatureCard = ({ f }: { f: (typeof features)[0] }) => (
    <div
      className="rounded-2xl p-6"
      style={{ background: t.card, border: `1px solid ${t.border}` }}
    >
      <div
        className="rounded-xl p-4 mb-5 h-40 flex items-center justify-center"
        style={{ background: t.surfaceAlt, border: `1px solid ${t.borderSubtle}` }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${t.subtle}20` }}
        >
          {f.icon}
        </div>
      </div>
      <h3 className="font-semibold text-lg mb-1.5" style={{ color: t.text }}>
        {f.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: t.muted }}>
        {f.desc}
      </p>
    </div>
  );

  return (
    <section className="py-24" style={{ background: t.bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
            style={{ color: t.text }}
          >
            Built-in Intelligence.
            <br />
            Designed for Speed.
          </h2>
          <p className="max-w-lg mx-auto" style={{ color: t.muted }}>
            AI features that go beyond automation — with summaries, suggestions,
            and time-saving tools built right into your inbox.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {features.map((f) => (
            <FeatureCard key={f.title} f={f} />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {bottomFeatures.map((f) => (
            <FeatureCard key={f.title} f={f} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ─── */
function Testimonials() {
  const testimonials = [
    {
      name: "Jordan Morgan",
      role: "Co-Founder",
      text: "With AI summaries and recommendations, I breeze through email in a fraction of the time it used to take me.",
    },
    {
      name: "Nadia Robert",
      role: "Product Manager",
      text: "Vistore feels like having an assistant in my inbox. I no longer miss follow-ups or waste time digging through threads.",
    },
    {
      name: "Amanda Carla",
      role: "UX Designer",
      text: "The most efficient email experience I've ever had. The moment I started using Vistore, I realized how much pain my old inbox was causing.",
    },
  ];

  return (
    <section className="py-24" style={{ background: t.surface }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
            style={{ color: t.text }}
          >
            Real Results from Real Users
          </h2>
          <p className="max-w-lg mx-auto" style={{ color: t.muted }}>
            From founders to freelancers, people are loving how Vistore
            transforms their daily email routine.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl p-6"
              style={{ background: t.card, border: `1px solid ${t.border}` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${t.accent}40, ${t.accent}15)`,
                  }}
                />
                <div>
                  <p className="font-semibold text-sm" style={{ color: t.text }}>
                    {item.name}
                  </p>
                  <p className="text-xs" style={{ color: t.subtle }}>
                    {item.role}
                  </p>
                </div>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: t.muted }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── KEY FEATURES ─── */
function KeyFeatures() {
  const features = [
    {
      icon: <Shield className="w-5 h-5" style={{ color: t.accent }} />,
      title: "Better Lead Management",
      desc: "Track every interaction with potential customers in one centralized place.",
      bg: t.accentSoft,
    },
    {
      icon: <BarChart3 className="w-5 h-5" style={{ color: "#a78bfa" }} />,
      title: "Smart Data Analytics",
      desc: "Get real-time reports and insights to make better decisions.",
      bg: "rgba(167,139,250,0.1)",
    },
  ];

  return (
    <section className="py-24" style={{ background: t.bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <div
          className="rounded-3xl p-8 sm:p-12"
          style={{ background: t.surface, border: `1px solid ${t.border}` }}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* activity card */}
            <div
              className="rounded-2xl p-6 max-w-sm mx-auto md:mx-0"
              style={{
                background: t.card,
                border: `1px solid ${t.border}`,
                boxShadow: `0 16px 48px -8px rgba(0,0,0,0.5)`,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg" style={{ color: t.text }}>
                  Recent Activity
                </h3>
                <TrendingUp className="w-5 h-5" style={{ color: t.accent }} />
              </div>

              <div className="flex gap-4 text-xs mb-4" style={{ color: t.subtle }}>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" style={{ color: "#4ade80" }} />{" "}
                  Incoming
                </span>
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" style={{ color: "#f87171" }} />{" "}
                  Outgoing
                </span>
              </div>

              {[
                { label: "Outgoing Products", price: "$200.00" },
                { label: "Incoming Products", price: "$140.00" },
              ].map((section) => (
                <div key={section.label} className="mb-4 last:mb-0">
                  <p
                    className="text-sm font-medium mb-2"
                    style={{ color: t.subtle }}
                  >
                    {section.label}
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg"
                      style={{ background: `${t.accent}15` }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: t.text }}>
                        Stone Black Jacket
                      </p>
                      <p className="text-xs" style={{ color: t.subtle }}>
                        Qty: 10 · 5 Minutes Ago
                      </p>
                    </div>
                    <span className="font-semibold" style={{ color: t.text }}>
                      {section.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* text */}
            <div>
              <span
                className="inline-flex items-center gap-2 text-sm mb-3"
                style={{ color: t.subtle }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: t.accent }}
                />
                Key Features
              </span>
              <h2
                className="text-3xl sm:text-4xl font-bold tracking-tight mb-8"
                style={{ color: t.text }}
              >
                What Can Our CRM Sales Do For You?
              </h2>
              <div className="space-y-6">
                {features.map((f) => (
                  <div key={f.title} className="flex gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: f.bg }}
                    >
                      {f.icon}
                    </div>
                    <div>
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: t.text }}
                      >
                        {f.title}
                      </h4>
                      <p className="text-sm" style={{ color: t.muted }}>
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium mt-8 transition"
                style={{ background: t.accent, color: "#000" }}
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── EMAIL ASSISTANCE ─── */
function EmailAssistance() {
  return (
    <section className="py-24" style={{ background: t.surface }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* text */}
          <div>
            <span
              className="inline-flex items-center gap-2 text-sm font-medium mb-3"
              style={{ color: t.accent }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: t.accent }}
              />
              AI EMAIL ASSISTANCE
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6"
              style={{ color: t.text }}
            >
              Everything you need to{" "}
              <span style={{ color: t.accent }}>stay on top of your inbox.</span>{" "}
              <span style={{ color: t.subtle }}>Nothing you don't</span>
            </h2>
          </div>

          {/* mock email */}
          <div className="space-y-4">
            <div
              className="rounded-2xl p-6"
              style={{
                background: t.card,
                border: `1px solid ${t.border}`,
                boxShadow: `0 16px 48px -8px rgba(0,0,0,0.5)`,
              }}
            >
              <div
                className="flex items-center gap-2 text-xs mb-3"
                style={{ color: "#4ade80" }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> AI automatically
                checked
              </div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold" style={{ color: t.text }}>
                  New Message
                </p>
                <span
                  className="text-xs rounded-full px-2.5 py-0.5"
                  style={{ background: t.accentSoft, color: t.accent }}
                >
                  Drafted
                </span>
              </div>
              <div className="text-sm space-y-1 mb-4" style={{ color: t.muted }}>
                <p>
                  <span style={{ color: t.subtle }}>To</span>&nbsp;&nbsp;
                  marcuslee@gmail.com
                </p>
                <p>
                  <span style={{ color: t.subtle }}>Sub</span>&nbsp;&nbsp;Re: Q4
                  marketing plan
                </p>
              </div>
              <div
                className="rounded-xl p-4 text-sm leading-relaxed"
                style={{
                  background: t.surfaceAlt,
                  color: t.muted,
                  border: `1px solid ${t.borderSubtle}`,
                }}
              >
                <p>Hi Sarah,</p>
                <p className="mt-2">
                  Thanks for sending this over. I've reviewed the numbers and
                  agree with increasing the paid social allocation. This
                  adjustment should help us reach a wider audience.
                </p>
                <p className="mt-2 underline" style={{ color: t.accent }}>
                  Let's schedule a 30-minute sync this Thursday at 2 PM to
                  finalize the details.
                </p>
              </div>
            </div>

            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: t.card, border: `1px solid ${t.border}` }}
            >
              <Calendar className="w-5 h-5" style={{ color: "#60a5fa" }} />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: t.text }}>
                  Q4 Planning Meeting
                </p>
                <p className="text-xs" style={{ color: t.subtle }}>
                  Thursday, 02:00 PM - 03:00 PM
                </p>
              </div>
              <span
                className="text-xs rounded-full px-2 py-0.5"
                style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80" }}
              >
                Scheduled
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── ORDER FEATURES / STATS ─── */
function OrderFeatures() {
  const features = [
    {
      icon: <Copy className="w-5 h-5" />,
      title: "Simply Copy & Paste",
      desc: "Duplicate any configuration or template and make it your own in seconds.",
      color: "#fbbf24",
    },
    {
      icon: <Palette className="w-5 h-5" />,
      title: "Easy To Customize",
      desc: "Adjust layouts, colors, and content to match your brand with no code required.",
      color: t.accent,
    },
    {
      icon: <Code2 className="w-5 h-5" />,
      title: "Made With TailwindCSS",
      desc: "Built on utility-first CSS for lightning-fast load times and clean code.",
      color: "#60a5fa",
    },
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const salesData = [35.19, 30.04, 40.12, 52.32, 38.19, 20.82, 16.93];
  const insightData = [22, 25, 32, 28, 35, 18, 22];
  const maxVal = 55;

  return (
    <section className="py-24" style={{ background: t.bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14">
          <span
            className="inline-flex items-center gap-2 text-sm mb-3"
            style={{ color: t.subtle }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: t.accent }}
            />
            Order Features
          </span>
          <div className="grid md:grid-cols-2 gap-6">
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ color: t.text }}
            >
              Vistore Helps You Build Beautiful Workflows
            </h2>
            <p className="md:pt-2" style={{ color: t.muted }}>
              Providing customer service in one platform, our responsive
              dashboard works on all devices, with a fully redesigned project
              management experience.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="space-y-8">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `${f.color}15`,
                    color: f.color,
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: t.text }}>
                    {f.title}
                  </h4>
                  <p className="text-sm" style={{ color: t.muted }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* chart */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: t.card,
              border: `1px solid ${t.border}`,
              boxShadow: `0 16px 48px -8px rgba(0,0,0,0.4)`,
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-semibold" style={{ color: t.text }}>
                  Store Order Analysis
                </h4>
                <p className="text-xs" style={{ color: t.subtle }}>
                  Your income and expense in last 30 days
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs" style={{ color: t.muted }}>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded"
                    style={{ background: t.accent }}
                  />{" "}
                  Sales
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded"
                    style={{ background: "#fbbf24" }}
                  />{" "}
                  Insight
                </span>
              </div>
            </div>

            <div className="flex items-end gap-3 h-48">
              {months.map((m, i) => (
                <div
                  key={m}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: t.muted }}
                  >
                    ${salesData[i]}
                  </span>
                  <div
                    className="w-full flex gap-0.5 items-end"
                    style={{ height: "140px" }}
                  >
                    <div
                      className="flex-1 rounded-t-md"
                      style={{
                        height: `${(salesData[i] / maxVal) * 100}%`,
                        background: t.accent,
                        opacity: 0.85,
                      }}
                    />
                    <div
                      className="flex-1 rounded-t-md"
                      style={{
                        height: `${(insightData[i] / maxVal) * 100}%`,
                        background: "#fbbf24",
                        opacity: 0.4,
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] mt-1"
                    style={{ color: t.subtle }}
                  >
                    {m}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── PRICING ─── */
function Pricing() {
  const plans = [
    {
      icon: <Star className="w-5 h-5" style={{ color: "#fbbf24" }} />,
      name: "Starter",
      desc: "Perfect for individuals who want to experience AI-enhanced email.",
      price: "Free",
      period: "",
      highlighted: false,
      badge: null,
      prefix: "Benefits",
      benefits: [
        "AI summaries (limited per day)",
        "Smart filters & categories",
        "Email compose assistant",
        "Basic AI recommendations",
        "Calendar integration",
      ],
    },
    {
      icon: <Zap className="w-5 h-5" style={{ color: "#000" }} />,
      name: "Pro",
      desc: "For professionals who live in their inbox and want full control.",
      price: "$12",
      period: "/month",
      highlighted: true,
      badge: "BEST DEAL",
      prefix: "Everything in Starter, plus:",
      benefits: [
        "Priority & follow-up suggestions",
        "AI insights & reminders",
        "Unlimited AI summaries",
        "Priority inbox view",
        "Smart reply templates",
      ],
    },
    {
      icon: <Users className="w-5 h-5" style={{ color: "#a78bfa" }} />,
      name: "Team",
      desc: "For teams that want to collaborate, delegate, and scale with AI.",
      price: "$29",
      period: "/user/month",
      highlighted: false,
      badge: null,
      prefix: "Everything in Pro, plus:",
      benefits: [
        "Shared inbox & roles",
        "Team-level insights",
        "Admin controls",
        "Integration with Slack & Notion",
        "Email delegation",
      ],
    },
  ];

  return (
    <section className="py-24" style={{ background: t.surface }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
            style={{ color: t.text }}
          >
            Simple Pricing for a
            <br />
            Smarter Inbox
          </h2>
          <p style={{ color: t.muted }}>
            No clutter. No confusion. Just plans that scale with you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl p-6 sm:p-8 flex flex-col"
              style={{
                background: p.highlighted
                  ? `linear-gradient(145deg, ${t.accent}, #d47d27)`
                  : t.card,
                border: `1px solid ${p.highlighted ? t.accent : t.border}`,
                boxShadow: p.highlighted
                  ? `0 16px 48px -8px ${t.accent}40`
                  : "none",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: p.highlighted ? "rgba(0,0,0,0.15)" : `${t.subtle}20`,
                  }}
                >
                  {p.icon}
                </div>
                {p.badge && (
                  <span
                    className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase"
                    style={{ background: "rgba(0,0,0,0.15)", color: "#000" }}
                  >
                    {p.badge}
                  </span>
                )}
              </div>
              <h3
                className="text-xl font-bold mb-1"
                style={{ color: p.highlighted ? "#000" : t.text }}
              >
                {p.name}
              </h3>
              <p
                className="text-sm mb-5"
                style={{ color: p.highlighted ? "rgba(0,0,0,0.6)" : t.muted }}
              >
                {p.desc}
              </p>

              <p
                className="text-4xl font-bold mb-5"
                style={{ color: p.highlighted ? "#000" : t.text }}
              >
                {p.price}
                {p.period && (
                  <span
                    className="text-base font-normal"
                    style={{
                      color: p.highlighted ? "rgba(0,0,0,0.5)" : t.subtle,
                    }}
                  >
                    {p.period}
                  </span>
                )}
              </p>

              <a
                href="#"
                className="block text-center rounded-xl py-3 font-medium mb-6 transition"
                style={{
                  background: p.highlighted ? "#000" : "transparent",
                  color: p.highlighted ? t.accent : t.text,
                  border: p.highlighted ? "none" : `1px solid ${t.border}`,
                }}
              >
                Get Started
              </a>

              <p
                className="text-xs font-medium mb-3"
                style={{
                  color: p.highlighted ? "rgba(0,0,0,0.5)" : t.subtle,
                }}
              >
                {p.prefix}
              </p>

              <ul className="space-y-2.5">
                {p.benefits.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm"
                    style={{
                      color: p.highlighted ? "rgba(0,0,0,0.75)" : t.muted,
                    }}
                  >
                    <CheckCircle2
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{
                        color: p.highlighted ? "rgba(0,0,0,0.5)" : "#4ade80",
                      }}
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);
  const faqs = [
    {
      q: "How do I integrate CRM Sales with other tools?",
      a: "We offer comprehensive guides, expert insights, and hands-on technical support to help you seamlessly integrate CRM Sales with your existing tools. Our goal is to simplify the process, enhance compatibility, and ensure you get the most out of your CRM system for improved productivity and business growth.",
    },
    {
      q: "Is there a free trial available?",
      a: "Yes! Our Starter plan is completely free and includes core AI features. You can upgrade to Pro or Team at any time to unlock the full suite of tools.",
    },
    {
      q: "Is CRM Sales suitable for small businesses?",
      a: "Absolutely. Vistore is designed to scale from solo founders to enterprise teams. Our Starter and Pro plans are perfect for small businesses looking to automate their sales workflow.",
    },
  ];

  return (
    <section className="py-24" style={{ background: t.bg }}>
      <div className="max-w-3xl mx-auto px-6">
        <div
          className="rounded-3xl p-8 sm:p-12 mb-8"
          style={{ background: t.surface, border: `1px solid ${t.border}` }}
        >
          <div className="text-center mb-10">
            <span
              className="inline-flex items-center gap-2 text-sm mb-3"
              style={{ color: t.subtle }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: t.accent }}
              />
              Our FAQs
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
              style={{ color: t.text }}
            >
              CRM Sales FAQs
            </h2>
            <p
              className="text-sm max-w-md mx-auto"
              style={{ color: t.muted }}
            >
              As a leading digital marketing agency, we are dedicated to
              providing comprehensive educational resources and answering
              frequently asked questions to help our clients.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition"
                style={{ background: t.accent, color: "#000" }}
              >
                More Questions <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="text-sm font-medium underline underline-offset-2"
                style={{ color: t.text }}
              >
                Contact Us
              </a>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{
                  background: t.card,
                  border: `1px solid ${openIdx === i ? t.accent + "40" : t.border}`,
                }}
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left font-semibold"
                  style={{ color: t.text }}
                  onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                >
                  {f.q}
                  <ChevronDown
                    className="w-5 h-5 shrink-0 transition-transform"
                    style={{
                      color: t.subtle,
                      transform: openIdx === i ? "rotate(180deg)" : "none",
                    }}
                  />
                </button>
                {openIdx === i && (
                  <div
                    className="px-5 pb-5 text-sm leading-relaxed -mt-1"
                    style={{ color: t.muted }}
                  >
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA BANNER ─── */
function CTABanner() {
  return (
    <section className="pb-24" style={{ background: t.bg }}>
      <div className="max-w-5xl mx-auto px-6">
        <div
          className="relative overflow-hidden rounded-3xl text-center px-8 py-16"
          style={{
            background: `linear-gradient(145deg, ${t.accent}, #c2650f)`,
          }}
        >
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute top-8 left-8 w-32 h-32 rounded-full"
              style={{ border: "1px solid rgba(0,0,0,0.3)" }}
            />
            <div
              className="absolute bottom-8 right-8 w-48 h-48 rounded-full"
              style={{ border: "1px solid rgba(0,0,0,0.2)" }}
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 relative" style={{ color: "#000" }}>
            Experience a Smarter Inbox Today
          </h2>
          <p
            className="max-w-md mx-auto mb-8 relative"
            style={{ color: "rgba(0,0,0,0.6)" }}
          >
            Join the waitlist and be among the first to try Vistore — your new
            favorite way to do email.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-medium transition relative"
            style={{ background: "#000", color: t.accent }}
          >
            Get Started Free
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer style={{ background: t.surface, borderTop: `1px solid ${t.border}` }}>
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <h3
              className="text-2xl font-bold mb-2"
              style={{ color: t.text }}
            >
              Are You Interested With Vistore?
            </h3>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mt-4 transition"
              style={{ background: t.accent, color: "#000" }}
            >
              Contact Sales <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          {[
            {
              title: "Company",
              links: ["Security", "Brand Guidelines", "Careers"],
            },
            { title: "Career", links: ["Jobs", "New", "Hiring"] },
            {
              title: "Legal Information",
              links: ["Privacy Policy", "Terms of Service", "Cookies Policy"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4
                className="font-semibold mb-4"
                style={{ color: t.text }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="transition"
                      style={{ color: t.muted }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: `1px solid ${t.border}` }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" style={{ color: t.accent }} />
            <span
              className="text-lg font-bold"
              style={{ color: t.text }}
            >
              Vistore.
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-sm">
            {["Home", "About Us", "Products", "Reviews"].map((l) => (
              <a
                key={l}
                href="#"
                className="px-3 py-1 rounded-full"
                style={{
                  color: l === "Home" ? t.accent : t.muted,
                  border:
                    l === "Home" ? `1px solid ${t.accent}40` : "1px solid transparent",
                }}
              >
                {l}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {[Factory, Inspect, TowelRackIcon, Library].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full flex items-center justify-center transition"
                style={{
                  border: `1px solid ${t.border}`,
                  color: t.muted,
                }}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between text-xs mt-6 gap-2"
          style={{ color: t.subtle }}
        >
          <p>&copy; Vistore by Sans Brothers</p>
          <div className="flex gap-4">
            <a href="#" className="transition hover:opacity-80">
              Terms &amp; Conditions
            </a>
            <a href="#" className="transition hover:opacity-80">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── PAGE ─── */
export default function LandingPage() {
  return (
    <main
      className="min-h-screen antialiased"
      style={{ background: t.bg, color: t.text }}
    >
      <Navbar />
      <Hero />
      <AIToolsGrid />
      <IntelligenceFeatures />
      <Testimonials />
      <KeyFeatures />
      <EmailAssistance />
      <OrderFeatures />
      <Pricing />
      <FAQ />
      <CTABanner />
      <Footer />
    </main>
  );
}