"use client";

import {
  Zap,
  LayoutDashboard,
  Sparkles,
  Bot,
  Inbox,
  Clock,
  Calendar,
} from 'lucide-react';


export function HeroSection() {
    return (
      <div className="relative min-h-screen bg-[#070908] text-white font-sans overflow-hidden selection:bg-[#009541] selection:text-black">
  
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 pointer-events-none mix-blend-screen"
          style={{
            backgroundImage: `url('https://res.cloudinary.com/dqryhg3rs/image/upload/v1781871792/ChatGPT_Image_Jun_19_2026_05_51_54_PM_wd88fs.png')`
          }}
        />
  
        <div className="absolute inset-0 bg-gradient-to-b from-[#070908] via-transparent to-[#070908] opacity-95 pointer-events-none z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070908] via-transparent to-[#070908] opacity-90 pointer-events-none z-[1]" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#070908]/30 to-[#070908] pointer-events-none z-[1]" />
  
        {/* Navigation */}
        <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-7 h-7 rounded-lg bg-[#009541] flex items-center justify-center">
              <Zap size={14} className="text-black" />
            </div>
            <span className="font-semibold text-sm tracking-tight">Context Mode</span>
          </div>
  
          <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-400 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
  
          <a href="/login" className="bg-[#009541] text-neutral-50 text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#b5e000] transition-all transform hover:scale-[1.02] no-underline">
            Get Started Free
          </a>
        </header>
  
        {/* Hero */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center">
          <div className="inline-flex items-center bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs text-neutral-300 tracking-wide mb-6 backdrop-blur-md">
            AI-Powered Email &amp; Calendar Workspace
          </div>
  
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight max-w-4xl text-white mb-8 leading-[1.1]">
            Your Inbox, <br />
            <span className="text-white">Finally Intelligent.</span>
          </h1>
  
          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mb-10 leading-relaxed">
            AI that reads, prioritizes, and acts on your email. Schedule meetings, search conversations,
            and draft replies — all through a single chat interface.
          </p>
  
          <a href="/login" className="bg-white text-black text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-neutral-200 transition-all shadow-lg hover:shadow-white/5 mb-16 transform hover:scale-[1.01] no-underline">
            Try Context Mode Free
          </a>
  
          {/* Dashboard Mockup */}
          <div className="w-full max-w-5xl bg-[#0F1110]/90 border border-neutral-800/80 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl flex text-left text-xs text-neutral-400">
  
            {/* Sidebar */}
            <aside className="w-48 border-r border-neutral-800/60 p-4 flex flex-col gap-6 bg-[#0B0D0C]/50 hidden sm:flex shrink-0">
              <div className="flex items-center gap-2 text-white font-semibold mb-2">
                <div className="w-5 h-5 rounded-md bg-[#009541] flex items-center justify-center text-neutral-200">
                  <Zap size={11} className="text-black" />
                </div>
                <span className="text-sm text-neutral-200">Context Mode</span>
              </div>
  
              <div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Overview</p>
                <nav className="flex flex-col gap-1">
                  <a href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-neutral-800/50 text-white font-medium">
                    <LayoutDashboard size={14} className="text-[#009541]" /> Dashboard
                  </a>
                  <a href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-neutral-800/30 transition-colors">
                    <Sparkles size={14} /> Priority Inbox
                  </a>
                  <a href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-neutral-800/30 transition-colors">
                    <Bot size={14} /> AI Chat
                  </a>
                </nav>
              </div>
  
              <div>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Email</p>
                <nav className="flex flex-col gap-1">
                  <a href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-neutral-800/30 transition-colors">
                    <Inbox size={14} /> Inbox
                  </a>
                  <a href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-neutral-800/30 transition-colors">
                    <Clock size={14} /> Scheduled
                  </a>
                </nav>
              </div>
            </aside>
  
            {/* Main Dashboard */}
            <main className="flex-1 p-5 flex flex-col gap-5 overflow-x-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/40 pb-4">
                <div>
                  <h3 className="text-white font-medium text-sm">Good morning, Gautam 👋</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Here's what's happening in your inbox today</p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button className="flex items-center gap-1.5 bg-[#009541] hover:bg-[#b5e000] text-black font-medium px-3 py-1.5 rounded-md transition-colors">
                    <Sparkles size={13} /> Sync Now
                  </button>
                </div>
              </div>
  
              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#141615] border border-neutral-800/50 p-3.5 rounded-lg">
                  <p className="text-[11px] text-neutral-400">Opportunities</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-semibold text-white tracking-tight">4</span>
                    <span className="text-[10px] text-[#009541] font-medium">High value</span>
                  </div>
                </div>
                <div className="bg-[#141615] border border-neutral-800/50 p-3.5 rounded-lg">
                  <p className="text-[11px] text-neutral-400">Risks</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-semibold text-white tracking-tight">2</span>
                    <span className="text-[10px] text-red-400 font-medium">Need attention</span>
                  </div>
                </div>
                <div className="bg-[#141615] border border-neutral-800/50 p-3.5 rounded-lg">
                  <p className="text-[11px] text-neutral-400">Deadlines</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-semibold text-white tracking-tight">6</span>
                    <span className="text-[10px] text-amber-400 font-medium">This week</span>
                  </div>
                </div>
                <div className="bg-[#141615] border border-neutral-800/50 p-3.5 rounded-lg">
                  <p className="text-[11px] text-neutral-400">Follow Ups</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-semibold text-white tracking-tight">3</span>
                    <span className="text-[10px] text-neutral-500 font-medium">Awaiting reply</span>
                  </div>
                </div>
              </div>
  
              {/* Action Required + Calendar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-1">
                <div className="lg:col-span-2 bg-[#141615] border border-neutral-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium flex items-center gap-1.5"><Sparkles size={13} className="text-[#009541]" /> Action Required</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between bg-neutral-900/40 border border-neutral-800/30 p-2.5 rounded-md">
                      <div>
                        <p className="text-white text-[11px] font-medium">Contract renewal deadline</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">From: sarah@acme.com · Urgent</p>
                      </div>
                      <span className="text-[9px] bg-red-950/40 text-red-400 border border-red-900/40 px-2 py-0.5 rounded font-medium">Deadline</span>
                    </div>
                    <div className="flex items-start justify-between bg-neutral-900/40 border border-neutral-800/30 p-2.5 rounded-md">
                      <div>
                        <p className="text-white text-[11px] font-medium">New partnership proposal</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">From: mark@techcorp.io · Opportunity</p>
                      </div>
                      <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded font-medium">Opportunity</span>
                    </div>
                    <div className="flex items-start justify-between bg-neutral-900/40 border border-neutral-800/30 p-2.5 rounded-md">
                      <div>
                        <p className="text-white text-[11px] font-medium">Invoice #4521 overdue</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">From: billing@vendor.co · Follow up</p>
                      </div>
                      <span className="text-[9px] bg-amber-950/40 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded font-medium">Follow up</span>
                    </div>
                  </div>
                </div>
  
                <div className="bg-[#141615] border border-neutral-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium flex items-center gap-1.5"><Calendar size={13} /> Today</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-neutral-900/40 border border-neutral-800/30 p-2.5 rounded-md border-l-2 border-l-[#009541]">
                      <p className="text-white text-[11px] font-medium">Q4 Planning Sync</p>
                      <p className="text-[10px] text-neutral-500">10:00 AM · Google Meet</p>
                    </div>
                    <div className="bg-neutral-900/40 border border-neutral-800/30 p-2.5 rounded-md border-l-2 border-l-indigo-500">
                      <p className="text-white text-[11px] font-medium">Design Review</p>
                      <p className="text-[10px] text-neutral-500">2:00 PM · 3 attendees</p>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </main>
      </div>
    );
  }