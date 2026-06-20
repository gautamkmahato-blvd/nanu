import React from 'react';
import { 
  LayoutDashboard, 
  Cpu, 
  Map, 
  Layers, 
  FileText, 
  Leaf, 
  Download, 
  Plus, 
  Filter, 
  Maximize2,
  X,
  LucideUnlockKeyhole,
  LucideAArrowUp
} from 'lucide-react';
import { 
  Sparkles, 
  Inbox, 
  Calendar, 
  CornerDownRight, 
  CheckCircle2,  
  PenTool, 
  Sliders, 
  ArrowLeft, 
  ArrowRight,
  Star
} from 'lucide-react';
import { 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  UserCheck, 
  BarChart3, 
  Grid, 
  Copy,
  Terminal,
  CircleDollarSign
} from 'lucide-react';
import { 
  CheckCircle, 
  MessageSquare,  
  Clock, 
  Mail, 
  Check,
  ChevronRight
} from 'lucide-react';
import { 
  Zap, 
  Users, 
} from 'lucide-react';

import { 
  Search, 
  MailOpen, 
  Database, 
  ChevronDown,
  Compass,
  Send
} from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative min-h-screen bg-[#070908] text-white font-sans overflow-hidden selection:bg-[#CCFF00] selection:text-black">
      
      {/* 1. Base Background Graphic Pattern */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60 pointer-events-none mix-blend-screen"
        style={{ 
          backgroundImage: `url('https://res.cloudinary.com/dqryhg3rs/image/upload/v1781871792/ChatGPT_Image_Jun_19_2026_05_51_54_PM_wd88fs.png')` 
        }}
      />
      
      {/* 2. Smooth Vertical Edge Overlay (Top & Bottom Shading) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070908] via-transparent to-[#070908] opacity-95 pointer-events-none z-[1]" />

      {/* 3. Smooth Horizontal Edge Overlay (Left & Right Shading) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#070908] via-transparent to-[#070908] opacity-90 pointer-events-none z-[1]" />
      
      {/* 4. Ambient Center Glow Layer */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#070908]/30 to-[#070908] pointer-events-none z-[1]" />

      {/* Navigation Bar */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-6 h-6 flex flex-wrap gap-[2px]">
            <div className="w-[10px] h-[10px] bg-white rounded-sm" />
            <div className="w-[10px] h-[10px] bg-white rounded-sm" />
            <div className="w-[10px] h-[10px] bg-white rounded-sm" />
            <div className="w-[10px] h-[10px] bg-transparent" />
          </div>
        </div>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-400 font-medium">
          <a href="#" className="hover:text-white transition-colors">How it works</a>
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Case Studies</a>
        </nav>

        {/* CTA */}
        <button className="bg-[#CCFF00] text-black text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#b5e000] transition-all transform hover:scale-[1.02]">
          Contact us
        </button>
      </header>

      {/* Hero Body Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center">
        {/* Subtitle Badge */}
        <div className="inline-flex items-center bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs text-neutral-300 tracking-wide mb-6 backdrop-blur-md">
          Smart Oil Infrastructure Management
        </div>

        {/* Main Typography Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight max-w-4xl text-white mb-8 leading-[1.1]">
          Predict the Leak. <br />
          <span className="text-white">Prevent the Disaster.</span>
        </h1>

        {/* Hero Action Button */}
        <button className="bg-white text-black text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-neutral-200 transition-all shadow-lg hover:shadow-white/5 mb-16 transform hover:scale-[1.01]">
          Book a Demo
        </button>

        {/* Dashboard Mockup Display */}
        <div className="w-full max-w-5xl bg-[#0F1110]/90 border border-neutral-800/80 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl flex text-left text-xs text-neutral-400">
          
          {/* Sidebar Area */}
          <aside className="w-48 border-r border-neutral-800/60 p-4 flex flex-col gap-6 bg-[#0B0D0C]/50 hidden sm:flex shrink-0">
            <div className="flex items-center gap-2 text-white font-semibold mb-2">
              <div className="w-4 h-4 flex flex-wrap gap-[1px]">
                <div className="w-[6px] h-[6px] bg-[#CCFF00] rounded-sm" />
                <div className="w-[6px] h-[6px] bg-white rounded-sm" />
                <div className="w-[6px] h-[6px] bg-white rounded-sm" />
              </div>
              <span className="text-sm tracking-tight">MethaneGuard</span>
            </div>

            <div>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Operations</p>
              <nav className="flex flex-col gap-1">
                <a href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-neutral-800/50 text-white font-medium">
                  <LayoutDashboard size={14} className="text-[#CCFF00]" /> Overview
                </a>
                <a href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-neutral-800/30 transition-colors">
                  <Cpu size={14} /> Predictive Engine
                </a>
                <a href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-neutral-800/30 transition-colors">
                  <Map size={14} /> Pipeline Map
                </a>
                <a href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-neutral-800/30 transition-colors">
                  <Layers size={14} /> Asset Ledger
                </a>
              </nav>
            </div>

            <div>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Compliance</p>
              <nav className="flex flex-col gap-1">
                <a href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-neutral-800/30 transition-colors">
                  <FileText size={14} /> Compliance Report
                </a>
                <a href="#" className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-neutral-800/30 transition-colors">
                  <Leaf size={14} /> Carbon Credits
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Internal Dashboard Space */}
          <main className="flex-1 p-5 flex flex-col gap-5 overflow-x-hidden">
            
            {/* Inner Dashboard Header Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/40 pb-4">
              <div>
                <h3 className="text-white font-medium text-sm">Operations Overview</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">Permian Basin · 847 monitored assets · Last sync 28s ago</p>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button className="flex items-center gap-1.5 bg-neutral-800/60 hover:bg-neutral-800 text-white px-3 py-1.5 rounded-md border border-neutral-700/40 transition-colors">
                  <Download size={13} /> Export
                </button>
                <button className="flex items-center gap-1.5 bg-[#CCFF00] hover:bg-[#b5e000] text-black font-medium px-3 py-1.5 rounded-md transition-colors">
                  <Plus size={13} /> New Report
                </button>
              </div>
            </div>

            {/* Performance Metric Cards Grid Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1 */}
              <div className="bg-[#141615] border border-neutral-800/50 p-3.5 rounded-lg">
                <p className="text-[11px] text-neutral-400">Methane Saved (MTD)</p>
                <p className="text-neutral-500 text-[10px] mt-0.5">Last saving: 12%</p>
                <div className="flex items-baseline gap-2 mt-2.5">
                  <span className="text-lg font-semibold text-white tracking-tight">184t</span>
                  <span className="text-[10px] text-[#CCFF00] font-medium">↗ 12% vs last month</span>
                </div>
              </div>
              {/* Card 2 */}
              <div className="bg-[#141615] border border-neutral-800/50 p-3.5 rounded-lg">
                <p className="text-[11px] text-neutral-400">Active Alerts</p>
                <p className="text-neutral-500 text-[10px] mt-0.5">Last alert: 2 days ago</p>
                <div className="flex items-baseline gap-2 mt-2.5">
                  <span className="text-lg font-semibold text-white tracking-tight">12</span>
                  <span className="text-[10px] text-red-400 font-medium">↘ 2 since yesterday</span>
                </div>
              </div>
              {/* Card 3 */}
              <div className="bg-[#141615] border border-neutral-800/50 p-3.5 rounded-lg">
                <p className="text-[11px] text-neutral-400">Credits Banked</p>
                <p className="text-neutral-500 text-[10px] mt-0.5">Last credit: this week</p>
                <div className="flex items-baseline gap-2 mt-2.5">
                  <span className="text-lg font-semibold text-white tracking-tight">1,240</span>
                  <span className="text-[10px] text-[#CCFF00] font-medium">↗ 48 this week</span>
                </div>
              </div>
              {/* Card 4 */}
              <div className="bg-[#141615] border border-neutral-800/50 p-3.5 rounded-lg">
                <p className="text-[11px] text-neutral-400">Compliance Score</p>
                <p className="text-neutral-500 text-[10px] mt-0.5">Last status: EPA 40 CFR - on track</p>
                <div className="flex items-baseline gap-2 mt-2.5">
                  <span className="text-lg font-semibold text-white tracking-tight">94%</span>
                  <span className="text-[10px] text-neutral-500 font-medium">EPA 40 CFR - on track</span>
                </div>
              </div>
            </div>

            {/* Split Panel: Chart Analytics & Alerts Module */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-1">
              
              {/* Left Segment: SVG Analytical Line Chart */}
              <div className="lg:col-span-2 bg-[#141615] border border-neutral-800/50 p-4 rounded-lg flex flex-col justify-between relative overflow-hidden min-h-[240px]">
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                    <span className="text-white font-medium">Emission rate</span>
                    <span className="text-neutral-500 text-[11px]">· 30 day trend</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                    <button className="text-neutral-500">1W</button>
                    <button className="text-white font-medium">1M</button>
                    <button className="text-neutral-500">2M</button>
                    <button className="text-neutral-500">3M</button>
                    <button className="text-neutral-500">6M</button>
                    <button className="text-neutral-500">1Y</button>
                  </div>
                </div>

                {/* Simulated Chart Rendering Area */}
                <div className="absolute inset-x-0 bottom-4 h-32 px-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 120" preserveAspectRatio="none">
                    <line x1="0" y1="20" x2="600" y2="20" stroke="#222" strokeDasharray="3 3" />
                    <line x1="0" y1="60" x2="600" y2="60" stroke="#222" strokeDasharray="3 3" />
                    <line x1="0" y1="100" x2="600" y2="100" stroke="#222" strokeDasharray="3 3" />

                    <path
                      d="M 0 90 Q 75 105 150 85 T 300 70 T 450 95 T 600 80"
                      fill="none"
                      stroke="#444"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />

                    <path
                      d="M 0 50 Q 60 40 120 65 T 240 55 T 360 30 T 480 75 T 600 35"
                      fill="none"
                      stroke="#CCFF00"
                      strokeWidth="2"
                    />

                    <circle cx="280" cy="45" r="4" fill="#CCFF00" />
                    <line x1="280" y1="0" x2="280" y2="120" stroke="#CCFF00" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
                  </svg>

                  {/* Absolute Anchored Hover Interactive Tooltip Box */}
                  <div className="absolute top-2 left-[38%] bg-[#0B0D0C] border border-neutral-800 p-2 rounded shadow-xl text-[10px] pointer-events-none z-20 min-w-[80px]">
                    <p className="text-neutral-400 font-medium mb-1">May 4, 25</p>
                    <div className="flex items-center justify-between gap-4 text-neutral-400">
                      <span>Detected</span>
                      <span className="text-white font-mono">395</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-neutral-400 mt-0.5">
                      <span>Leaked</span>
                      <span className="text-white font-mono">182</span>
                    </div>
                  </div>
                </div>

                {/* Chart Vertical Axis Metric Indicators */}
                <div className="flex flex-col justify-between text-[9px] text-neutral-600 h-28 absolute left-4 bottom-5 pointer-events-none">
                  <span>500</span>
                  <span>400</span>
                  <span>300</span>
                  <span>200</span>
                </div>
              </div>

              {/* Right Segment: Active Realtime Alerts Component */}
              <div className="bg-[#141615] border border-neutral-800/50 p-4 rounded-lg flex flex-col justify-between min-h-[240px]">
                <div className="flex items-center justify-between border-b border-neutral-800/40 pb-2">
                  <span className="text-white font-medium">Active alerts</span>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Filter size={13} className="cursor-pointer hover:text-white" />
                    <Maximize2 size={13} className="cursor-pointer hover:text-white" />
                  </div>
                </div>

                {/* Individual Realtime Alert Feeds list */}
                <div className="flex flex-col gap-2 mt-3 flex-1 overflow-y-auto">
                  
                  {/* Alert Card 1 */}
                  <div className="flex items-start justify-between bg-neutral-900/40 border border-neutral-800/30 p-2.5 rounded-md">
                    <div>
                      <p className="text-white text-[11px] font-medium">Valve V-042 pressure anomaly</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Well #14-B · 4 min ago</p>
                    </div>
                    <span className="text-[9px] bg-red-950/40 text-red-400 border border-red-900/40 px-2 py-0.5 rounded font-medium">
                      Critical
                    </span>
                  </div>

                  {/* Alert Card 2 */}
                  <div className="flex items-start justify-between bg-neutral-900/40 border border-neutral-800/30 p-2.5 rounded-md">
                    <div>
                      <p className="text-white text-[11px] font-medium">Satellite plume detected — Block C</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">GHGSat pass · 1h ago</p>
                    </div>
                    <span className="text-[9px] bg-amber-950/40 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded font-medium">
                      Pending
                    </span>
                  </div>

                  {/* Alert Card 3 */}
                  <div className="flex items-start justify-between bg-neutral-900/40 border border-neutral-800/30 p-2.5 rounded-md">
                    <div>
                      <p className="text-white text-[11px] font-medium">Drone OGI flyover complete</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Zone D · 2h ago · 0 leaks found</p>
                    </div>
                    <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded font-medium">
                      Clear
                    </span>
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


export function FeaturesAndTestimonials() {
  return (
    <div className="bg-[#070908] text-white font-sans min-h-screen py-24 px-6 relative overflow-hidden selection:bg-[#CCFF00] selection:text-black">
      
      {/* Ambient background glows to match the hero theme */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#CCFF00]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* ========================================================
          SECTION 1: FEATURES BENTO GRID
         ======================================================== */}
      <section className="max-w-7xl mx-auto mb-32 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-normal tracking-tight text-white mb-4 leading-tight">
            Built-in Intelligence. <br />
            <span className="text-white">Designed for Speed.</span>
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            AI features that go beyond automation — with summaries, suggestions, 
            and time-saving tools built right into your inbox.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="space-y-6">
          
          {/* Top Row: 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: AI Summaries */}
            <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-6 flex flex-col justify-between group hover:border-neutral-700/60 transition-all duration-300">
              {/* Mockup Window */}
              <div className="bg-[#0F1110] border border-neutral-800/80 rounded-lg p-4 mb-8 relative min-h-[160px] overflow-hidden">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800/40">
                  <span className="w-2 h-2 rounded-full bg-red-500/60" />
                  <span className="text-[10px] text-neutral-400 font-mono">ScalerHub Events</span>
                </div>
                <p className="text-[11px] text-white font-medium mb-1">Growth Tactics Webinar</p>
                <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded p-2.5 mt-3">
                  <div className="flex items-center gap-1.5 text-[#CCFF00] text-[10px] font-medium mb-1">
                    <Sparkles size={12} /> AI Summary
                  </div>
                  <p className="text-[10px] text-neutral-300 leading-normal">
                    Quick recap: Scale session starts at 4 PM. Focus is on founder-led growth strategies. Zoom link attached.
                  </p>
                </div>
              </div>
              {/* Text Info */}
              <div>
                <h3 className="text-white font-medium text-sm mb-1.5 flex items-center gap-2">
                  AI Summaries
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Get the gist of any email in one glance — no more scanning long threads.
                </p>
              </div>
            </div>

            {/* Card 2: Priority Detection */}
            <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-6 flex flex-col justify-between group hover:border-neutral-700/60 transition-all duration-300">
              {/* Mockup Window */}
              <div className="bg-[#0F1110] border border-neutral-800/80 rounded-lg p-4 mb-8 min-h-[160px] flex flex-col justify-center">
                <div className="text-[11px] text-neutral-400 mb-3 px-1 font-medium">Inbox</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] bg-[#CCFF00] text-black font-semibold px-2.5 py-1 rounded-md shadow-sm">
                    Important
                  </span>
                  <span className="text-[10px] bg-neutral-800/80 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-700/40">
                    Work
                  </span>
                  <span className="text-[10px] bg-neutral-800/80 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-700/40">
                    Clients
                  </span>
                  <span className="text-[10px] bg-neutral-800/80 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-700/40">
                    Urgent
                  </span>
                </div>
                <div className="mt-4 border-t border-neutral-800/60 pt-3 flex items-center gap-2 px-1">
                  <Inbox size={12} className="text-[#CCFF00]" />
                  <span className="text-[10px] text-neutral-400">Smart routing active</span>
                </div>
              </div>
              {/* Text Info */}
              <div>
                <h3 className="text-white font-medium text-sm mb-1.5">Priority Detection</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Automatically labels and organizes important emails so you can act fast.
                </p>
              </div>
            </div>

            {/* Card 3: Event-Aware Sidebar */}
            <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-6 flex flex-col justify-between group hover:border-neutral-700/60 transition-all duration-300">
              {/* Mockup Window */}
              <div className="bg-[#0F1110] border border-neutral-800/80 rounded-lg p-4 mb-8 min-h-[160px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-neutral-400 border-b border-neutral-800/40 pb-2">
                  <span className="flex items-center gap-1.5"><Calendar size={11} /> Today's Calendar</span>
                  <span>10:00 AM</span>
                </div>
                <div className="bg-neutral-900/80 border border-neutral-800 rounded p-2.5 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#CCFF00] rounded-l" />
                  <p className="text-[11px] text-white font-medium">Weekly Marketing Sync</p>
                  <p className="text-[9px] text-neutral-500 mt-0.5">Content, Ads, and SEO Teams</p>
                </div>
                <span className="text-[9px] text-neutral-500 tracking-tight text-right block">All-in-one view</span>
              </div>
              {/* Text Info */}
              <div>
                <h3 className="text-white font-medium text-sm mb-1.5">Event-Aware Sidebar</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  See upcoming meetings and emails tied to events — all in one view.
                </p>
              </div>
            </div>

          </div>

          {/* Bottom Row: 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 4: Smart Recommendations */}
            <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center justify-between group hover:border-neutral-700/60 transition-all duration-300">
              <div className="flex-1 order-2 sm:order-1">
                <h3 className="text-white font-medium text-sm mb-1.5">Smart Recommendations</h3>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                  Follow-ups, reminders, suggested replies — Fluxyn nudges you at the right time.
                </p>
              </div>
              {/* Mockup Panel */}
              <div className="w-full sm:w-64 bg-[#0F1110] border border-neutral-800/80 rounded-lg p-3.5 order-1 sm:order-2 shrink-0">
                <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block mb-2.5">AI Suggestion</span>
                <div className="space-y-1.5">
                  <button className="w-full flex items-center gap-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700/60 text-left text-[10px] text-neutral-300 p-2 rounded transition-colors">
                    <FileText size={12} className="text-[#CCFF00]" />
                    <span>Open & review the attached sheet</span>
                  </button>
                  <button className="w-full flex items-center gap-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700/60 text-left text-[10px] text-neutral-300 p-2 rounded transition-colors">
                    <CornerDownRight size={12} className="text-neutral-500" />
                    <span>Evaluate line items 4, 6, and 9</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 5: Writing Assistant */}
            <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center justify-between group hover:border-neutral-700/60 transition-all duration-300">
              <div className="flex-1 order-2 sm:order-1">
                <h3 className="text-white font-medium text-sm mb-1.5">Writing Assistant</h3>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                  Highlight any sentence while composing to check for tone, clarity, and professionalism.
                </p>
              </div>
              {/* Mockup Panel */}
              <div className="w-full sm:w-64 bg-[#0F1110] border border-neutral-800/80 rounded-lg p-3.5 order-1 sm:order-2 shrink-0">
                <div className="flex items-center justify-between text-[10px] border-b border-neutral-800/40 pb-2 mb-2.5 text-neutral-400">
                  <span className="flex items-center gap-1.5"><PenTool size={11} /> Tone Adjuster</span>
                  <Sliders size={11} />
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] bg-neutral-900/50 p-2 rounded border border-neutral-800/40">
                    <div className="text-[#CCFF00] text-[9px] font-medium mb-0.5">Professional · 85%</div>
                    <p className="text-neutral-400 text-[9px]">The content feels crisp, concise, and appropriate.</p>
                  </div>
                  <div className="flex gap-1 justify-end">
                    <span className="text-[8px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">More Concise</span>
                    <span className="text-[8px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">Formal Style</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION 2: TESTIMONIALS SLIDER MODULE
         ======================================================== */}
      <section className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-white mb-3">
            Real Results from Real Users
          </h2>
          <p className="text-sm text-neutral-400">
            From founders to freelancers, people are loving how Fluxyn transforms their daily email routine.
          </p>
        </div>

        {/* Carousel / Slider Wrapper Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Testimonial Card 1 */}
          <div className="bg-[#141615] border border-neutral-800/60 p-6 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 mb-4 text-[#CCFF00]">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
              </div>
              <h4 className="text-white text-sm font-medium mb-2 leading-snug">
                "Inbox clear out in record time."
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                With instant AI summaries and clear action recommendations, I breeze through email in a fraction of the time it used to take me.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-neutral-800/40">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-300">
                MK
              </div>
              <div>
                <p className="text-xs text-white font-medium">Morgan K.</p>
                <p className="text-[10px] text-neutral-500">Founder</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card 2 */}
          <div className="bg-[#141615] border border-neutral-800/60 p-6 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 mb-4 text-[#CCFF00]">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
              </div>
              <h4 className="text-white text-sm font-medium mb-2 leading-snug">
                "Fluxyn feels like having an assistant in my inbox."
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                I no longer miss important follow-ups or waste hours digging through long threads. The custom AI summaries are seriously a game changer.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-neutral-800/40">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-300">
                NR
              </div>
              <div>
                <p className="text-xs text-white font-medium">Nadia Robert</p>
                <p className="text-[10px] text-neutral-500">Product Manager</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card 3 */}
          <div className="bg-[#141615] border border-neutral-800/60 p-6 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 mb-4 text-[#CCFF00]">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
              </div>
              <h4 className="text-white text-sm font-medium mb-2 leading-snug">
                "The most efficient email experience I've ever had."
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                The moment I started using Fluxyn, I realized how much mental fatigue my old clunky inbox setup was causing me daily.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-neutral-800/40">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-300">
                AC
              </div>
              <div>
                <p className="text-xs text-white font-medium">Amanda Carla</p>
                <p className="text-[10px] text-neutral-500">UX Designer</p>
              </div>
            </div>
          </div>

        </div>

        {/* Carousel Slider Navigation Interface Toggle */}
        <div className="flex items-center justify-center gap-2.5">
          <button className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-all">
            <ArrowLeft size={14} />
          </button>
          <button className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-all">
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

    </div>
  );
}

export function MarketingSections() {
  return (
    <div className="bg-[#070908] text-white font-sans antialiased selection:bg-[#CCFF00] selection:text-black">
      
      {/* Ambient background glows shared with the main theme */}
      <div className="absolute left-0 w-[500px] h-[500px] bg-[#CCFF00]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* ========================================================
          SECTION 1: CRM FEATURES SPLIT (Based on image_3afb82.png)
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 border-b border-neutral-900/60">
        
        {/* Left Side: Mockup Frame Display */}
        <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
          <div className="w-full max-w-md bg-[#141615] border border-neutral-800/60 rounded-2xl p-6 shadow-2xl relative group hover:border-neutral-700/40 transition-all duration-300">
            {/* Soft backdrop glow behind card */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            {/* Recent Activity Card Box */}
            <div className="bg-[#0F1110] border border-neutral-800/80 rounded-xl p-5 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-semibold text-white tracking-tight">Recent Activity</h4>
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center cursor-pointer hover:bg-indigo-500 hover:text-white transition-all">
                  <ArrowUpRight size={14} />
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex gap-4 mb-6 border-b border-neutral-800/40 pb-3 text-[11px]">
                <span className="flex items-center gap-1 text-[#CCFF00] font-medium">
                  <TrendingUp size={12} /> Incoming
                </span>
                <span className="flex items-center gap-1 text-neutral-500">
                  <TrendingDown size={12} /> Outgoing
                </span>
              </div>

              {/* Product Listing Items */}
              <div className="space-y-4">
                {/* Product 1 */}
                <div>
                  <p className="text-[10px] text-neutral-500 font-medium mb-2 tracking-wide uppercase">Outgoing Products</p>
                  <div className="flex items-center justify-between bg-neutral-900/40 border border-neutral-800/40 rounded-lg p-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-neutral-800 flex items-center justify-center font-mono text-[10px] text-neutral-400 border border-neutral-700/20">
                        IMG
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-white">Stone Black Jacket</p>
                        <p className="text-[9px] text-neutral-500 mt-0.5">Qty : 10 · 5 Minuts Ago</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-medium text-white">$200.00</span>
                  </div>
                </div>

                {/* Product 2 */}
                <div>
                  <p className="text-[10px] text-neutral-500 font-medium mb-2 tracking-wide uppercase">Incoming Products</p>
                  <div className="flex items-center justify-between bg-neutral-900/40 border border-neutral-800/40 rounded-lg p-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-neutral-800 flex items-center justify-center font-mono text-[10px] text-neutral-400 border border-neutral-700/20">
                        IMG
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-white">Stone Black Jacket</p>
                        <p className="text-[9px] text-neutral-500 mt-0.5">Qty : 10 · 5 Minuts Ago</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-medium text-white">$140.00</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Copy & Features */}
        <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[#CCFF00] bg-[#CCFF00]/5 border border-[#CCFF00]/10 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
            <span className="w-1 h-1 rounded-full bg-[#CCFF00]" /> Key Features
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white leading-[1.15]">
            What Can Our CRM <br />Sales Do For You?
          </h2>

          {/* Feature Bullets Rows */}
          <div className="space-y-5 pt-4">
            {/* Feature 1 */}
            <div className="flex gap-4 items-start max-w-md">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <UserCheck size={15} />
              </div>
              <div>
                <h3 className="text-white text-sm font-medium mb-1">Better Lead Management</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Track Every Interaction With Potential Customers In One Centralized Place.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4 items-start max-w-md">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <BarChart3 size={15} />
              </div>
              <div>
                <h3 className="text-white text-sm font-medium mb-1">Smart Data Analytics</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Get Real-Time Reports And Insights To Make Better Decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Action Row Controls */}
          <div className="flex items-center gap-4 pt-6">
            <button className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-5 py-3 rounded-full border border-neutral-800 hover:border-neutral-700 transition-all">
              Learn More <ArrowRight size={13} />
            </button>
            <div className="flex gap-1.5">
              <button className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-white hover:border-neutral-700 transition-all">
                <Grid size={13} />
              </button>
              <button className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-white hover:border-neutral-700 transition-all">
                <Star size={13} />
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* ========================================================
          SECTION 2: CORE ANALYSIS METRICS GRID (Based on image_3afb9f.png)
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        
        {/* Ambient background glow for right side */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

        {/* Section Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[#CCFF00] bg-[#CCFF00]/5 border border-[#CCFF00]/10 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              <span className="w-1 h-1 rounded-full bg-[#CCFF00]" /> Order Features
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white leading-[1.15]">
              GetCRM Helps You Build <br />Beautiful Website
            </h2>
          </div>
          <p className="text-xs text-neutral-400 max-w-xs leading-relaxed md:mb-1">
            Providing Customer Service In One Platform, Our Responsive Landing Page Works On All Devices, With A Fully Redesigned Project Management Experience.
          </p>
        </div>

        {/* Content Split: Feature items / Chart Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Block: List Rows */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Feature 1 */}
            <div className="p-4 rounded-xl hover:bg-neutral-900/30 border border-transparent hover:border-neutral-800/40 transition-all duration-200">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Copy size={14} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1.5">Simply Copy & Paste</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Many desktop publishing packages and web page editors now use for them.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-4 rounded-xl hover:bg-neutral-900/30 border border-transparent hover:border-neutral-800/40 transition-all duration-200">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sliders size={14} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1.5">Easy To Customize</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Many desktop publishing packages and web page editors now use for them.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-4 rounded-xl hover:bg-neutral-900/30 border border-transparent hover:border-neutral-800/40 transition-all duration-200">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Terminal size={14} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1.5">Made With TailwindCSS</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Many desktop publishing packages and web page editors now use for them.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Block: Statistics Bar Chart Panel */}
          <div className="lg:col-span-7">
            <div className="bg-[#141615] border border-neutral-800/60 rounded-2xl p-6 shadow-2xl">
              
              {/* Inner Mock Window Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/40 pb-4 mb-6">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 mt-0.5">
                    <CircleDollarSign size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Store Order Analysis</h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Your income and expense in last 30days</p>
                  </div>
                </div>

                {/* Chart Key Indicators */}
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="text-neutral-400 font-medium">Statistics</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Sales
                    </span>
                    <span className="flex items-center gap-1 text-neutral-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" /> Insight
                    </span>
                  </div>
                </div>
              </div>

              {/* Graphical Dynamic Bars Layout */}
              <div className="relative pt-4">
                {/* Y-Axis Label Grid lines background */}
                <div className="absolute inset-0 flex flex-col justify-between text-[9px] text-neutral-600 pointer-events-none pb-6">
                  <div className="w-full border-b border-neutral-800/30 pb-1 flex justify-between"><span>$20k</span></div>
                  <div className="w-full border-b border-neutral-800/30 pb-1 flex justify-between"><span>$10k</span></div>
                  <div className="w-full border-b border-neutral-800/30 pb-1 flex justify-between"><span>$5k</span></div>
                  <div className="w-full border-b border-neutral-800/30 pb-1 flex justify-between"><span>$20</span></div>
                </div>

                {/* Columns Container */}
                <div className="relative z-10 grid grid-cols-7 gap-2 sm:gap-4 items-end pt-8 h-48 text-center text-[10px] font-mono text-neutral-400">
                  
                  {/* Jan */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[9px] font-medium text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">$35.19</div>
                    <div className="w-full max-w-[28px] bg-indigo-500/20 rounded-full h-[60%] relative overflow-hidden">
                      <div className="absolute bottom-0 inset-x-0 bg-indigo-500/40 h-[70%] rounded-b-full" />
                    </div>
                    <span className="text-[10px] text-neutral-500 font-sans mt-1">Jan</span>
                  </div>

                  {/* Feb */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[9px] font-medium text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">$30.04</div>
                    <div className="w-full max-w-[28px] bg-indigo-500/20 rounded-full h-[45%] relative overflow-hidden">
                      <div className="absolute bottom-0 inset-x-0 bg-indigo-500/40 h-[60%] rounded-b-full" />
                    </div>
                    <span className="text-[10px] text-neutral-500 font-sans mt-1">Feb</span>
                  </div>

                  {/* Mar */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[9px] font-medium text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">$40.12</div>
                    <div className="w-full max-w-[28px] bg-indigo-500/20 rounded-full h-[70%] relative overflow-hidden">
                      <div className="absolute bottom-0 inset-x-0 bg-indigo-500/60 h-[80%] rounded-b-full" />
                    </div>
                    <span className="text-[10px] text-neutral-500 font-sans mt-1">Mar</span>
                  </div>

                  {/* Apr (Active High Peak State) */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[9px] font-medium text-[#CCFF00] mb-1 font-semibold">$52.32</div>
                    <div className="w-full max-w-[28px] bg-indigo-500/30 rounded-full h-[90%] relative overflow-hidden ring-1 ring-indigo-500/30">
                      <div className="absolute bottom-0 inset-x-0 bg-indigo-500 h-[85%] rounded-b-full shadow-lg shadow-indigo-500/20" />
                    </div>
                    <span className="text-[10px] text-white font-sans font-medium mt-1">Apr</span>
                  </div>

                  {/* May */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[9px] font-medium text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">$38.19</div>
                    <div className="w-full max-w-[28px] bg-indigo-500/20 rounded-full h-[65%] relative overflow-hidden">
                      <div className="absolute bottom-0 inset-x-0 bg-indigo-500/70 h-[75%] rounded-b-full" />
                    </div>
                    <span className="text-[10px] text-neutral-500 font-sans mt-1">May</span>
                  </div>

                  {/* Jun */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[9px] font-medium text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">$20.82</div>
                    <div className="w-full max-w-[28px] bg-indigo-500/10 rounded-full h-[40%] relative overflow-hidden">
                      <div className="absolute bottom-0 inset-x-0 bg-indigo-500/30 h-[50%] rounded-b-full" />
                    </div>
                    <span className="text-[10px] text-neutral-500 font-sans mt-1">Jun</span>
                  </div>

                  {/* Jul */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[9px] font-medium text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">$16.93</div>
                    <div className="w-full max-w-[28px] bg-indigo-500/10 rounded-full h-[35%] relative overflow-hidden">
                      <div className="absolute bottom-0 inset-x-0 bg-indigo-500/30 h-[40%] rounded-b-full" />
                    </div>
                    <span className="text-[10px] text-neutral-500 font-sans mt-1">Jul</span>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>

      </section>

    </div>
  );
}

export function InboxRevolutionSections() {
  return (
    <div className="bg-[#070908] text-white font-sans antialiased selection:bg-[#CCFF00] selection:text-black min-h-screen py-24 relative overflow-hidden">
      
      {/* Dynamic ambient dark green/lime glow matching main hero theme */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#CCFF00]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* ========================================================
          SECTION 1: REVOLUTIONIZE INBOX GRID (image_3a9a02.jpg)
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-6 mb-32 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-normal tracking-tight text-white mb-4 leading-tight">
            Revolutionize Your Inbox <br />
            <span>with Swiftlet AI</span>
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-xl mx-auto">
            Supercharge emails using smart AI tools—from catchy subject lines to 
            summaries, grammar fixes, and flawless follow-ups.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          
          {/* Card 1: AI Subject Line (Featured Active State) */}
          <div className="bg-gradient-to-br from-[#1b1230] to-[#141615] border border-purple-500/30 rounded-xl p-5 flex items-start gap-4 shadow-xl transition-all duration-300 hover:border-purple-500/50">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold mb-1">AI Subject Line</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Boost open rates with smart, catchy headlines tailored to your audience.
              </p>
            </div>
          </div>

          {/* Card 2: Smart Summary */}
          <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-5 flex items-start gap-4 transition-all duration-300 hover:border-neutral-700/60">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-white text-sm font-medium mb-1">Smart Summary</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Make your message digestible by summarizing content for busy readers.
              </p>
            </div>
          </div>

          {/* Card 3: Fix Grammar */}
          <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-5 flex items-start gap-4 transition-all duration-300 hover:border-neutral-700/60">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center shrink-0">
              <CheckCircle size={18} />
            </div>
            <div>
              <h3 className="text-white text-sm font-medium mb-1">Fix Grammar</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Ensure clarity and professionalism with AI-powered error fixes.
              </p>
            </div>
          </div>

          {/* Card 4: Rephrase Message */}
          <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-5 flex items-start gap-4 transition-all duration-300 hover:border-neutral-700/60">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center shrink-0">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="text-white text-sm font-medium mb-1">Rephrase Message</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Instantly reword your text to match your brand voice or campaign needs.
              </p>
            </div>
          </div>

          {/* Card 5: Expand Content */}
          <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-5 flex items-start gap-4 transition-all duration-300 hover:border-neutral-700/60">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center shrink-0">
              <Maximize2 size={18} />
            </div>
            <div>
              <h3 className="text-white text-sm font-medium mb-1">Expand Content</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Grow your paragraph or idea to enrich the overall content strategy.
              </p>
            </div>
          </div>

          {/* Card 6: Follow-Up Generator */}
          <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-5 flex items-start gap-4 transition-all duration-300 hover:border-neutral-700/60">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-white text-sm font-medium mb-1">Follow-Up Generator</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Never miss an opportunity—keep leads warm with contextual follow-ups.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION 2: WORKSPACE ASSISTANT COMPONENT (image_3a9a27.png)
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#CCFF00] tracking-wider uppercase mb-4 bg-[#CCFF00]/5 border border-[#CCFF00]/10 px-3 py-1 rounded-full">
            <span className="w-1 h-1 rounded-full bg-[#CCFF00]" /> AI Email Assistance
          </div>
          <h2 className="text-4xl sm:text-5xl font-normal tracking-tight leading-[1.15] text-white">
            Everything you need to <span className="text-purple-400 font-medium">stay on top</span> <br />
            <span className="text-amber-500/90 font-medium">of your inbox.</span> Nothing you don't
          </h2>
        </div>

        {/* Content Side-by-Side Splits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Interactive Mail Composer Mockup */}
          <div className="lg:col-span-7 bg-[#141615] border border-neutral-800/80 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
            <div>
              {/* App Meta Header */}
              <div className="flex items-center justify-between border-b border-neutral-800/50 pb-4 mb-4">
                <div className="flex items-center gap-2 text-[#CCFF00] text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#CCFF00] block animate-pulse" />
                  AI automatically checked
                </div>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">Drafted</span>
              </div>

              {/* Input Forms Simulation */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2 border-b border-neutral-800/30 pb-2">
                  <span className="text-neutral-500 w-8">To</span>
                  <div className="flex items-center gap-1.5 bg-neutral-900 px-2 py-1 rounded border border-neutral-800 text-white">
                    <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] font-bold">M</div>
                    <span>marcuslee@gmail.com</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-b border-neutral-800/30 pb-2">
                  <span className="text-neutral-500 w-8">Sub</span>
                  <span className="text-white font-medium">Re: Q4 marketing plan</span>
                </div>

                {/* Email Draft Content body */}
                <div className="pt-4 space-y-4 text-neutral-300 leading-relaxed text-xs">
                  <p>Hi Sarah,</p>
                  <p>
                    Thanks for sending this over. I've reviewed the numbers and agree with increasing the paid social allocation. 
                    This adjustment should help us reach a wider audience and improve our campaign performance significantly.
                  </p>
                  
                  {/* Inline smart AI suggestions prompt box */}
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-indigo-400 underline decoration-indigo-400/40 underline-offset-4 font-medium">
                      Let's schedule a 30-minute sync this Thursday at 2 PM to finalize the details.
                    </p>
                    <button className="text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/40 px-3 py-1.5 rounded-md shrink-0 transition-colors">
                      Press <kbd className="bg-neutral-900 px-1 py-0.5 rounded mx-0.5 text-white">Tab</kbd> to accept
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Anchored Calendar Card block at base */}
            <div className="mt-8 pt-4 border-t border-neutral-800/40">
              <div className="bg-[#0F1110] border border-neutral-800 rounded-xl p-3.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Calendar size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Q4 Planning Meeting</h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500" /> Scheduled · Let's schedule a 30-minute sync this Thursday at 2 PM to finalize the det...
                    </p>
                    <span className="text-[10px] text-neutral-400 block mt-2 font-medium">Thursday, 02.00 AM - 03.00 PM</span>
                  </div>
                </div>
                <span className="text-[9px] bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 px-2 py-0.5 rounded-md font-medium tracking-wide">
                  AI sync
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: High-fidelity Context Layer list panels */}
          <div className="lg:col-span-5 flex flex-col gap-3 justify-between">
            
            {/* Accordion Card 1: Plain text placeholder style */}
            <div className="bg-[#141615]/40 border border-neutral-800/40 rounded-xl px-4 py-3.5 flex justify-between items-center opacity-60">
              <span className="text-xs font-medium text-neutral-500">Feature 01</span>
              <span className="text-xs text-white">Create Account</span>
            </div>

            {/* Accordion Card 2: Active Dynamic Expanded Slate */}
            <div className="bg-[#141615] border border-neutral-800 rounded-xl p-5 relative overflow-hidden flex-1 flex flex-col justify-between shadow-xl min-h-[180px]">
              {/* Dynamic glass contour overlay simulating wavy aesthetic textures */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] via-transparent to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-center z-10 border-b border-neutral-800/40 pb-2">
                <span className="text-xs font-semibold text-white">Reply in seconds</span>
                <span className="text-[10px] text-indigo-400 font-medium">Real time</span>
              </div>
              
              <p className="text-xs text-neutral-400 leading-relaxed z-10 py-4 my-auto">
                Stop staring at a blinking cursor. Get contextual, tone-matched drafts ready to send in a single click.
              </p>

              <div className="flex items-center gap-1.5 text-[11px] text-[#CCFF00] z-10 font-medium cursor-pointer hover:underline pt-2">
                Explore function <ChevronRight size={12} />
              </div>
            </div>

            {/* Accordion Card 3: Plain text placeholder style */}
            <div className="bg-[#141615]/40 border border-neutral-800/40 rounded-xl px-4 py-3.5 flex justify-between items-center opacity-60">
              <span className="text-xs font-medium text-neutral-500">Feature 03</span>
              <span className="text-xs text-white">Setup Payment</span>
            </div>

            {/* Accordion Card 4: Plain text placeholder style */}
            <div className="bg-[#141615]/40 border border-neutral-800/40 rounded-xl px-4 py-3.5 flex justify-between items-center opacity-60">
              <span className="text-xs font-medium text-neutral-500">Feature 04</span>
              <span className="text-xs text-white">Launch Store</span>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}

export function PricingAndFooter() {
  return (
    <div className="bg-[#070908] text-white font-sans antialiased selection:bg-[#CCFF00] selection:text-black min-h-screen relative overflow-hidden">
      
      {/* Background ambient lighting artifacts */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#CCFF00]/[0.03] rounded-full blur-[140px] pointer-events-none" />

      {/* ========================================================
          SECTION 1: PRICING GRID (Based on image_3a8e63.jpg)
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-4xl sm:text-5xl font-normal tracking-tight text-white mb-4">
            Simple Pricing for a <br />
            <span className="text-white">Smarter Inbox</span>
          </h2>
          <p className="text-sm text-neutral-400">
            No clutter. No confusion. Just plans that scale with you.
          </p>
        </div>

        {/* 3-Tier Pricing Cards Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          
          {/* Card 1: Starter */}
          <div className="bg-[#141615] border border-neutral-800/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-neutral-700/50">
            <div>
              {/* Header Info */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">Starter</h3>
                  <p className="text-xs text-neutral-400 mt-1.5 min-h-[32px]">
                    Perfect for individuals who want to experience AI-enhanced email.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center shrink-0">
                  <Zap size={14} />
                </div>
              </div>

              {/* Pricing Tier Metric */}
              <div className="my-6">
                <span className="text-3xl font-semibold tracking-tight text-white">Free</span>
              </div>

              {/* Action Trigger */}
              <button className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-medium py-3 rounded-xl transition-all mb-8">
                Get Started
              </button>

              {/* Benefits Checklist Divider */}
              <div className="border-t border-neutral-800/60 pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-4">Benefits</p>
                <ul className="space-y-3 text-xs text-neutral-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                    <span>AI summaries (limited per day)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                    <span>Smart filters & categories</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                    <span>Email compose assistant</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                    <span>Basic AI recommendations</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                    <span>Calendar integration</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 2: Pro (Featured Active State) */}
          <div className="bg-gradient-to-b from-[#1c1435] to-[#141615] border border-purple-500/40 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative shadow-2xl transition-all duration-300 transform md:-translate-y-2 hover:border-purple-400/50">
            {/* Edge Ribbon Highlight Tag */}
            <div className="absolute top-4 right-4 bg-[#CCFF00] text-black font-bold tracking-wider text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-sm">
              Best Deal
            </div>

            <div>
              {/* Header Info */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Pro</h3>
                  <p className="text-xs text-neutral-300 mt-1.5 min-h-[32px]">
                    For professionals who live in their inbox and want full control.
                  </p>
                </div>
              </div>

              {/* Pricing Tier Metric */}
              <div className="my-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-white">$12</span>
                <span className="text-xs text-neutral-400">/month</span>
              </div>

              {/* Action Trigger */}
              <button className="w-full bg-[#CCFF00] hover:bg-[#b5e000] text-black text-xs font-semibold py-3 rounded-xl transition-all mb-8 shadow-md">
                Get Started
              </button>

              {/* Benefits Checklist Divider */}
              <div className="border-t border-neutral-700/30 pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-300 mb-4">Everything in Starter, plus:</p>
                <ul className="space-y-3 text-xs text-neutral-200">
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                    <span>Priority & follow-up suggestions</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                    <span>AI insights & reminders</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                    <span>Unlimited AI summaries</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                    <span>Priority inbox view</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                    <span>Smart reply templates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 3: Team */}
          <div className="bg-[#141615] border border-neutral-800/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-neutral-700/50">
            <div>
              {/* Header Info */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">Team</h3>
                  <p className="text-xs text-neutral-400 mt-1.5 min-h-[32px]">
                    For teams that want to collaborate, delegate, and scale with AI.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center shrink-0">
                  <Users size={14} />
                </div>
              </div>

              {/* Pricing Tier Metric */}
              <div className="my-6 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight text-white">$29</span>
                <span className="text-xs text-neutral-500">/user/month</span>
              </div>

              {/* Action Trigger */}
              <button className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-medium py-3 rounded-xl transition-all mb-8">
                Get Started
              </button>

              {/* Benefits Checklist Divider */}
              <div className="border-t border-neutral-800/60 pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-4">Everything in Pro, plus:</p>
                <ul className="space-y-3 text-xs text-neutral-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                    <span>Shared inbox & roles</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                    <span>Team-level insights</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                    <span>Admin controls</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                    <span>Integration with Slack & Notion</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span>
                    <span>Email delegation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          SECTION 2: CENTERED CTA BLOCK (Based on image_3a8e63.jpg)
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-6 py-12 relative z-10 mb-20">
        <div className="max-w-5xl mx-auto bg-gradient-to-b from-[#141615] to-[#0F1110] border border-neutral-800/80 rounded-2xl p-8 sm:p-16 text-center relative overflow-hidden shadow-2xl">
          {/* Subtle geometric structural pattern behind the text */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-white leading-tight">
              Experience a Smarter <br />Inbox Today
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Join the waitlist and be among the first to try Fluxyn — your new favorite way to do email.
            </p>
            <div className="pt-4">
              <button className="bg-white text-black font-semibold text-xs px-8 py-3.5 rounded-xl hover:bg-neutral-200 transition-all shadow-md transform hover:scale-[1.01]">
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 3: PREMIUM UNIFIED FOOTER 
         ======================================================== */}
      <footer className="border-t border-neutral-900 bg-[#0A0C0B] relative z-10 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 mb-16">
          
          {/* Left Column: Brand Description */}
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-5 h-5 flex flex-wrap gap-[1px]">
                <div className="w-[8px] h-[8px] bg-[#CCFF00] rounded-sm" />
                <div className="w-[8px] h-[8px] bg-white rounded-sm" />
                <div className="w-[8px] h-[8px] bg-white rounded-sm" />
                <div className="w-[8px] h-[8px] bg-transparent" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-white">Fluxyn</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Next-generation intelligence context engines designed to optimize messaging pipelines, workflow organization, and focus metrics seamlessly.
            </p>
          </div>

          {/* Right Column Grid Layout: Navigation Links channels */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 md:gap-16">
            
            {/* Links Block 1 */}
            <div className="space-y-4">
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">Product</h4>
              <ul className="space-y-2 text-xs text-neutral-500">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing Options</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Links Block 2 */}
            <div className="space-y-4">
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">Resources</h4>
              <ul className="space-y-2 text-xs text-neutral-500">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides & Help</a></li>
                <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>

            {/* Links Block 3 */}
            <div className="space-y-4 col-span-2 sm:col-span-1">
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">Company</h4>
              <ul className="space-y-2 text-xs text-neutral-500">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog Insights</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Footer Sub-bar row info block */}
        <div className="max-w-7xl mx-auto border-t border-neutral-900/60 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-neutral-600">
          <p>© 2026 Fluxyn Inc. All rights reserved.</p>
          
          {/* Social icons links stack */}
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors"><X size={14} /></a>
            <a href="#" className="hover:text-white transition-colors"><LucideUnlockKeyhole size={14} /></a>
            <a href="#" className="hover:text-white transition-colors"><LucideAArrowUp size={14} /></a>
            <a href="#" className="hover:text-white transition-colors"><Mail size={14} /></a>
          </div>

          <div className="flex gap-4">
            <a href="#" className="hover:text-neutral-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export function SalesIntelligenceSection() {
  return (
    <div className="bg-[#070908] text-white font-sans antialiased selection:bg-[#CCFF00] selection:text-black min-h-screen py-24 relative overflow-hidden">
      
      {/* Background radial atmosphere glow matching the hero design pattern */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-[#CCFF00]/[0.03] rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* ========================================================
            SECTION HEADER
           ======================================================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[#CCFF00] bg-[#CCFF00]/5 border border-[#CCFF00]/10 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              <span className="w-1 h-1 rounded-full bg-[#CCFF00]" /> Use it for sales
            </div>
            <h2 className="text-4xl sm:text-5xl font-normal tracking-tight text-white leading-[1.1]">
              Close more deals than ever with AI.
            </h2>
          </div>
          
          <a href="#" className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-[#CCFF00] font-medium tracking-tight transition-colors group mb-1 shrink-0">
            Sales templates <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* ========================================================
            MAIN BENTO WORKSPACE LAYOUT
           ======================================================== */}
        <div className="space-y-6">
          
          {/* Row 1: Qualify Inbound Leads */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#141615] border border-neutral-800/60 rounded-2xl overflow-hidden p-6 sm:p-8 items-center group hover:border-neutral-700/50 transition-all duration-300">
            <div className="lg:col-span-5 space-y-4 order-2 lg:order-1">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <UserCheck size={12} />
                </div>
                <span>Lead Qualifier</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-normal text-white tracking-tight">Qualify inbound leads.</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
                Get Lindy to research leads, no matter where they're coming from, and give you advanced insights so you can better prioritize your sales activities.
              </p>
              <div className="pt-2">
                <a href="#" className="inline-flex items-center gap-1 text-xs text-white hover:text-[#CCFF00] font-medium transition-colors group">
                  Try it <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>

            {/* Right side: Mockup UI Stack */}
            <div className="lg:col-span-7 bg-[#0F1110] border border-neutral-800/80 rounded-xl p-6 flex flex-col justify-center min-h-[200px] order-1 lg:order-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/[0.02] to-transparent pointer-events-none" />
              <div className="space-y-3 max-w-md mx-auto w-full relative z-10">
                {/* Form Submited pill */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 flex items-center justify-between text-xs text-neutral-400 shadow-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded bg-neutral-800 flex items-center justify-center border border-neutral-700/30 text-white font-bold text-[10px]">T</span>
                    <div>
                      <p className="text-white font-medium text-[11px]">Lead submitted form</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Researching Employment Information</p>
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-neutral-600" />
                </div>
                
                {/* Highly Qualified pill */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 flex items-center justify-between text-xs text-neutral-400 shadow-xl transform translate-x-2">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00]"><Sparkles size={11} /></span>
                    <div>
                      <p className="text-[#CCFF00] font-semibold text-[11px]">Highly qualified</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Employee: 200, Industry: Logistics...</p>
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-neutral-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Find Leads Across Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#141615] border border-neutral-800/60 rounded-2xl overflow-hidden p-6 sm:p-8 items-center group hover:border-neutral-700/50 transition-all duration-300">
            {/* Left side: Node diagram cluster */}
            <div className="lg:col-span-7 bg-[#0F1110] border border-neutral-800/80 rounded-xl p-6 min-h-[220px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/[0.01] to-transparent pointer-events-none" />
              
              {/* Custom SVG Nodes Cluster Network Layout */}
              <div className="relative w-full max-w-sm flex flex-col items-center justify-center h-full min-h-[140px]">
                
                {/* Anchor Central Source Connector line framework */}
                <svg className="absolute inset-0 w-full h-full text-neutral-800" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 110 C 50 50, 192 50, 192 10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path d="M120 110 C 120 50, 192 50, 192 10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path d="M192 110 L 192 10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path d="M264 110 C 264 50, 192 50, 192 10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path d="M334 110 C 334 50, 192 50, 192 10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                </svg>

                {/* Top Center Master Target Pin node */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shadow-lg shadow-[#CCFF00]/5">
                  <Compass size={14} className="animate-spin-slow" />
                </div>

                {/* Bottom Source Horizontal Rows */}
                <div className="absolute bottom-0 inset-x-0 flex justify-between px-2">
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono text-neutral-400 font-bold shadow-md">i</div>
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono text-neutral-400 font-bold shadow-md">ig</div>
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono text-neutral-400 font-bold shadow-md text-[#CCFF00]">in</div>
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono text-neutral-400 font-bold shadow-md">g2</div>
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono text-neutral-400 font-bold shadow-md">tk</div>
                </div>

              </div>
            </div>

            {/* Right side: text info */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
                <div className="w-5 h-5 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Search size={12} />
                </div>
                <span>Lead Generator</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-normal text-white tracking-tight">Find leads across 200+ sources</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
                Use Lindy's 200+ web scrapers to find your perfect leads from all major social media and B2B indexes effortlessly.
              </p>
              <div className="pt-2">
                <a href="#" className="inline-flex items-center gap-1 text-xs text-white hover:text-[#CCFF00] font-medium transition-colors group">
                  Try it <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Row 3: Write Perfect Outreach */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#141615] border border-neutral-800/60 rounded-2xl overflow-hidden p-6 sm:p-8 items-center group hover:border-neutral-700/50 transition-all duration-300">
            <div className="lg:col-span-5 space-y-4 order-2 lg:order-1">
              <div className="flex items-center gap-2 text-xs font-medium text-purple-400">
                <div className="w-5 h-5 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <MailOpen size={12} />
                </div>
                <span>Lead Outreach</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-normal text-white tracking-tight">Write the perfect outreach</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
                Lindy researches each individual lead to write personalized outreach emails that capture immediate attention and drastically increase conversion benchmarks.
              </p>
              <div className="pt-2">
                <a href="#" className="inline-flex items-center gap-1 text-xs text-white hover:text-[#CCFF00] font-medium transition-colors group">
                  Try it <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>

            {/* Right side: Outreach Email Generation Preview interface card */}
            <div className="lg:col-span-7 bg-[#0F1110] border border-neutral-800/80 rounded-xl p-5 flex flex-col gap-3 order-1 lg:order-2 shadow-2xl relative overflow-hidden min-h-[220px]">
              
              {/* Context Action Bar step */}
              <div className="bg-neutral-900/60 border border-neutral-800/60 rounded-lg p-2.5 flex items-center justify-between text-[11px] text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                  <span className="font-medium text-white">Researching Lead</span>
                  <span className="text-neutral-600">· Mark Mjolnir</span>
                </div>
                <ChevronDown size={13} className="text-neutral-500" />
              </div>

              {/* Composition Workspace Module Box */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-2 relative">
                <div className="flex items-center gap-2 text-[10px] text-neutral-500 border-b border-neutral-800/50 pb-2 mb-1">
                  <Send size={11} className="text-indigo-400" />
                  <span className="font-semibold text-neutral-300">Need help finding engineers?</span>
                </div>
                <div className="text-[11px] space-y-1 text-neutral-400">
                  <div className="flex items-center gap-2"><span className="text-neutral-600 w-8">From</span> <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300 text-[10px]">You</span></div>
                  <div className="flex items-center gap-2"><span className="text-neutral-600 w-8">To</span> <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300 text-[10px]">Mark Mjolnir</span></div>
                </div>
                
                {/* Draft text simulation body lines */}
                <div className="text-[11px] text-neutral-300 space-y-2 pt-2 leading-relaxed font-sans">
                  <p>Hi Bob,</p>
                  <p className="text-neutral-400">
                    I saw that you were hiring for software engineers. Our firm has experience in your stack of React and GraphQL...
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ========================================================
            FOUR-COLUMN SUBSIDIARY helper micro-cards layout row
           ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          
          {/* Card 1 */}
          <div className="bg-[#141615] border border-neutral-800/40 p-5 rounded-xl hover:bg-[#141615]/80 hover:border-neutral-700/40 transition-all duration-200">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <UserCheck size={14} />
            </div>
            <h4 className="text-white text-xs font-semibold mb-1.5">New Lead Qualifier</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Qualifies leads and alerts your team when criteria are met.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#141615] border border-neutral-800/40 p-5 rounded-xl hover:bg-[#141615]/80 hover:border-neutral-700/40 transition-all duration-200">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <Database size={14} />
            </div>
            <h4 className="text-white text-xs font-semibold mb-1.5">CRM Contact Assistant</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Instant CRM contact creation and automated data enrichment.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#141615] border border-neutral-800/40 p-5 rounded-xl hover:bg-[#141615]/80 hover:border-neutral-700/40 transition-all duration-200">
            <div className="w-7 h-7 rounded-lg bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center mb-3">
              <Sparkles size={13} />
            </div>
            <h4 className="text-white text-xs font-semibold mb-1.5">Sales Coach</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Sales coach analyzes calls and provides interactive real-time feedback.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#141615] border border-neutral-800/40 p-5 rounded-xl hover:bg-[#141615]/80 hover:border-neutral-700/40 transition-all duration-200">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Layers size={14} />
            </div>
            <h4 className="text-white text-xs font-semibold mb-1.5">Lead Outreacher</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Have Lindy perform multi-touch, personalized outreach and alert you instantly.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <FeaturesAndTestimonials />
      <MarketingSections />
      <InboxRevolutionSections />
      <SalesIntelligenceSection />
      <PricingAndFooter />
    </div>
  );
}