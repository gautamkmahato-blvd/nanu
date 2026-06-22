import React from 'react';
import { 
  Sparkles, 
  FileText, 
  AudioLines, 
  CheckCircle2, 
  Calendar, 
  Check, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  ShieldAlert, 
  Mail, 
  Inbox, 
  Star, 
  Send, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  User,
  MoreHorizontal
} from 'lucide-react';

export default function BentoGridFeatures() {
  return (
    <div className="bg-[#070908] text-white font-sans antialiased selection:bg-[#00D062] selection:text-black min-h-screen py-16 px-6 flex items-center justify-center relative overflow-hidden">
      
      {/* Background ambient deep green atmosphere glow layers matching premium theme */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#00D062]/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      {/* Bento Framework Grid System */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* ========================================================
            BLOCK 01: AI MEETING ASSISTANT (Top Left)
           ======================================================== */}
        <div className="lg:col-span-5 bg-[#121413] border border-neutral-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[340px] relative overflow-hidden group hover:border-neutral-700/40 transition-all">
          
          {/* Top right ambient sparkle container decoration */}
          <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-[#00D062]/10 blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
          <Sparkles className="absolute top-6 right-6 text-[#00D062]/30 group-hover:text-[#00D062]/60 transition-colors" size={24} />

          <div>
            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-[#00D062]/10 text-[#00D062] font-mono text-[10px] px-1.5 py-0.5 rounded font-bold border border-[#00D062]/20">01</span>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">AI Meeting Assistant</span>
            </div>

            {/* Typography Heading */}
            <h3 className="text-2xl font-normal tracking-tight text-white leading-snug max-w-sm">
              I brief you before every call, and <span className="text-neutral-400">follow up after.</span>
            </h3>
          </div>

          {/* Chronological Flow Node List Display */}
          <div className="relative flex items-start justify-between pt-8 max-w-md mx-auto w-full text-center">
            
            {/* SVG Linking line between nodes */}
            <div className="absolute top-5 inset-x-8 h-[1px] border-t border-dashed border-neutral-800 pointer-events-none z-0" />

            {/* Node 1: Before */}
            <div className="relative z-10 flex flex-col items-center gap-2 flex-1">
              <div className="w-10 h-10 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-[#00D062] shadow-md">
                <FileText size={15} />
              </div>
              <div className="space-y-0.5 mt-1">
                <p className="text-[10px] font-bold text-[#00D062] tracking-wider uppercase">Before</p>
                <p className="text-[9px] text-neutral-500 leading-tight">I prepare<br />and brief you</p>
              </div>
            </div>

            {/* Node 2: During */}
            <div className="relative z-10 flex flex-col items-center gap-2 flex-1">
              <div className="w-10 h-10 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-[#00D062] shadow-md">
                <AudioLines size={15} />
              </div>
              <div className="space-y-0.5 mt-1">
                <p className="text-[10px] font-bold text-[#00D062] tracking-wider uppercase">During</p>
                <p className="text-[9px] text-neutral-500 leading-tight">I listen and<br />take notes</p>
              </div>
            </div>

            {/* Node 3: After */}
            <div className="relative z-10 flex flex-col items-center gap-2 flex-1">
              <div className="w-10 h-10 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-[#00D062] shadow-md">
                <CheckCircle2 size={14} />
              </div>
              <div className="space-y-0.5 mt-1">
                <p className="text-[10px] font-bold text-[#00D062] tracking-wider uppercase">After</p>
                <p className="text-[9px] text-neutral-500 leading-tight">I send recaps<br />and next steps</p>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================
            BLOCK 02: CALENDAR MANAGEMENT (Top Right)
           ======================================================== */}
        <div className="lg:col-span-7 bg-[#121413] border border-neutral-800/80 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 shadow-xl min-h-[340px] hover:border-neutral-700/40 transition-all">
          
          {/* Left Split Info Area */}
          <div className="md:col-span-6 flex flex-col justify-between py-1">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-[#00D062]/10 text-[#00D062] font-mono text-[10px] px-1.5 py-0.5 rounded font-bold border border-[#00D062]/20">02</span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Calendar Management</span>
              </div>
              <h3 className="text-2xl font-normal tracking-tight text-white leading-snug">
                I schedule your meetings, and manage your calendar.
              </h3>
            </div>

            {/* Micro Activity Status Blocks */}
            <div className="space-y-2 mt-6">
              {/* Box 1 */}
              <div className="bg-neutral-950/60 border border-neutral-800/50 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center gap-2.5">
                  <Calendar size={13} className="text-[#00D062]" />
                  <span>Invite sent</span>
                </div>
                <Check size={12} className="text-[#00D062]" strokeWidth={3} />
              </div>
              {/* Box 2 */}
              <div className="bg-neutral-950/60 border border-neutral-800/50 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center gap-2.5">
                  <RefreshCwIcon size={12} className="text-[#00D062]" />
                  <span>Reschedule managed</span>
                </div>
                <Check size={12} className="text-[#00D062]" strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* Right Split Component Area: Interactive Calendar Mini UI Widget */}
          <div className="md:col-span-6 bg-neutral-950 border border-neutral-800/60 rounded-xl p-3 flex flex-col justify-between text-center select-none shadow-inner text-[10px]">
            <div>
              {/* Mini Month header slider layout */}
              <div className="flex items-center justify-between font-medium border-b border-neutral-900 pb-2 mb-2 text-neutral-400 text-[9px]">
                <ChevronLeft size={12} className="text-neutral-600 cursor-pointer hover:text-white" />
                <span className="font-semibold text-white">May 2025</span>
                <ChevronRight size={12} className="text-neutral-600 cursor-pointer hover:text-white" />
              </div>

              {/* Weekly Header Labels Grid */}
              <div className="grid grid-cols-7 text-[8px] font-bold text-neutral-600 tracking-wider mb-1.5 uppercase">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>

              {/* Numbers grid cluster */}
              <div className="grid grid-cols-7 gap-y-1 font-mono text-neutral-500 font-medium">
                <span className="opacity-20">27</span><span className="opacity-20">28</span><span className="opacity-20">29</span><span className="opacity-20">30</span>
                <span className="text-white">1</span><span className="text-white">2</span><span className="text-white">3</span>
                <span className="text-white">4</span><span className="text-white">5</span><span className="text-white">6</span>
                <span className="text-white">7</span><span className="text-white">8</span><span className="text-white">9</span>
                <span className="text-white">10</span><span className="text-white">11</span><span className="text-white">12</span>
                <span className="text-white">13</span><span className="text-white">14</span><span className="text-white">15</span>
                <span className="text-white">16</span><span className="text-white">17</span><span className="text-white">18</span>
                <span className="text-white">19</span>
                
                {/* Chosen active day pin display node */}
                <span className="bg-[#00D062] text-black rounded-full font-bold flex items-center justify-center w-4 h-4 mx-auto shadow-sm">20</span>
                
                <span className="text-white">21</span><span className="text-white">22</span><span className="text-white">23</span><span className="text-white">24</span>
              </div>
            </div>

            {/* List entries layout tied below calendar inside app block */}
            <div className="space-y-1 mt-3 pt-2 border-t border-neutral-900 text-[10px] text-left">
              {/* Row 1 Active selected tracking entry */}
              <div className="bg-[#00D062]/5 border border-[#00D062]/20 rounded-md px-2 py-1 flex items-center justify-between text-[#00D062]">
                <span className="font-medium">Tue, May 20</span>
                <div className="flex items-center gap-1.5 font-mono text-[9px]">
                  <span>10:00 AM</span>
                  <span className="w-3 h-3 rounded-full bg-[#00D062] text-black flex items-center justify-center text-[7px] font-bold"><Check size={7} strokeWidth={4} /></span>
                </div>
              </div>
              {/* Row 2 */}
              <div className="bg-neutral-900/40 border border-neutral-800/40 rounded-md px-2 py-1 flex items-center justify-between text-neutral-400">
                <span>Tue, May 20</span>
                <span className="font-mono text-[9px] text-neutral-500">1:30 PM</span>
              </div>
              {/* Row 3 */}
              <div className="bg-neutral-900/40 border border-neutral-800/40 rounded-md px-2 py-1 flex items-center justify-between text-neutral-400">
                <span>Wed, May 21</span>
                <span className="font-mono text-[9px] text-neutral-500">9:00 AM</span>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================
            BLOCK 03: SMART PRIORITY INBOX (Bottom Left)
           ======================================================== */}
        <div className="lg:col-span-4 bg-[#121413] border border-neutral-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[380px] hover:border-neutral-700/40 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-[#00D062]/10 text-[#00D062] font-mono text-[10px] px-1.5 py-0.5 rounded font-bold border border-[#00D062]/20">03</span>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Smart Priority Inbox</span>
            </div>
            <h3 className="text-xl font-normal tracking-tight text-white leading-snug">
              AI prioritizes what matters most.
            </h3>
          </div>

          {/* List items with respective colored tag counts */}
          <div className="space-y-1.5 mt-6 text-xs text-neutral-300">
            {/* Row 1 */}
            <div className="bg-neutral-950/50 border border-neutral-800/60 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={14} className="text-red-500" />
                <span>High Priority</span>
              </div>
              <span className="text-[10px] bg-red-950/60 text-red-400 border border-red-900/40 font-mono px-2 py-0.5 rounded-md font-bold">3</span>
            </div>
            {/* Row 2 */}
            <div className="bg-neutral-950/50 border border-neutral-800/60 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp size={14} className="text-orange-400" />
                <span>Opportunity</span>
              </div>
              <span className="text-[10px] bg-orange-950/60 text-orange-400 border border-orange-900/40 font-mono px-2 py-0.5 rounded-md font-bold">6</span>
            </div>
            {/* Row 3 */}
            <div className="bg-neutral-950/50 border border-neutral-800/60 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert size={14} className="text-yellow-500" />
                <span>Risk</span>
              </div>
              <span className="text-[10px] bg-yellow-950/60 text-yellow-400 border border-yellow-900/40 font-mono px-2 py-0.5 rounded-md font-bold">2</span>
            </div>
            {/* Row 4 */}
            <div className="bg-neutral-950/50 border border-neutral-800/60 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-neutral-500" />
                <span>Other</span>
              </div>
              <span className="text-[10px] bg-neutral-900 border border-neutral-800 font-mono px-2 py-0.5 rounded-md text-neutral-400">18</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            BLOCK 04: DASHBOARD > INBOX (Bottom Middle)
           ======================================================== */}
        <div className="lg:col-span-4 bg-[#121413] border border-neutral-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[380px] hover:border-neutral-700/40 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-[#00D062]/10 text-[#00D062] font-mono text-[10px] px-1.5 py-0.5 rounded font-bold border border-[#00D062]/20">04</span>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Dashboard &gt; Inbox</span>
            </div>
            <h3 className="text-xl font-normal tracking-tight text-white leading-snug">
              An organized view into everything you're up to.
            </h3>
          </div>

          {/* Miniature App Interface simulator */}
          <div className="bg-neutral-950 border border-neutral-800/60 rounded-xl p-3 flex gap-3 text-[10px] text-neutral-400 shadow-inner mt-6 flex-1 min-h-[200px]">
            
            {/* Left line icons side column strip */}
            <div className="flex flex-col gap-3 items-center text-neutral-600 border-r border-neutral-900 pr-2 shrink-0 pt-0.5">
              <Mail size={12} className="text-[#00D062]" />
              <Star size={12} />
              <Clock size={12} />
              <Send size={12} />
              <FileText size={12} />
              <Trash2 size={12} />
            </div>

            {/* Main simulation dashboard panel metrics views */}
            <div className="flex-1 space-y-3.5 min-w-0">
              <div>
                <p className="text-white font-semibold text-[10px]">Inbox Overview</p>
                
                {/* 4 grid metrics layout block */}
                <div className="grid grid-cols-4 gap-1.5 mt-2 font-mono">
                  <div className="bg-[#121413] border border-neutral-800/40 rounded p-1.5 text-center">
                    <p className="text-xs font-bold text-[#00D062]">12</p>
                    <p className="text-[7px] text-neutral-500 scale-90 mt-0.5">Priority</p>
                  </div>
                  <div className="bg-[#121413] border border-neutral-800/40 rounded p-1.5 text-center">
                    <p className="text-xs font-bold text-white">8</p>
                    <p className="text-[7px] text-neutral-500 scale-90 mt-0.5">Waiting</p>
                  </div>
                  <div className="bg-[#121413] border border-neutral-800/40 rounded p-1.5 text-center">
                    <p className="text-xs font-bold text-white">5</p>
                    <p className="text-[7px] text-neutral-500 scale-90 mt-0.5">Updates</p>
                  </div>
                  <div className="bg-[#121413] border border-neutral-800/40 rounded p-1.5 text-center">
                    <p className="text-xs font-bold text-white">12</p>
                    <p className="text-[7px] text-neutral-500 scale-90 mt-0.5">Newsletters</p>
                  </div>
                </div>
              </div>

              {/* Mini Email List tracking feed block */}
              <div>
                <p className="text-white font-semibold text-[9px] mb-1.5">Recent Emails</p>
                <div className="space-y-1 text-[9px]">
                  
                  {/* Row 1 */}
                  <div className="bg-[#121413]/60 rounded px-2 py-1 flex items-center justify-between gap-2 border border-neutral-900/30">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-400 font-bold flex items-center justify-center text-[7px] shrink-0">AC</div>
                      <span className="font-semibold text-white truncate">Alex Carter</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[8px] shrink-0">
                      <span className="text-[#00D062] bg-emerald-950/40 px-1 py-0.2 rounded border border-emerald-900/30 scale-90">Priority</span>
                      <span className="text-neutral-600">9:41 AM</span>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="bg-[#121413]/60 rounded px-2 py-1 flex items-center justify-between gap-2 border border-neutral-900/30">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-400 font-bold flex items-center justify-center text-[7px] shrink-0">SR</div>
                      <span className="font-semibold text-white truncate">Sarah Rogers</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[8px] shrink-0">
                      <span className="text-orange-400 bg-orange-950/40 px-1 py-0.2 rounded border border-orange-900/30 scale-90">Waiting on you</span>
                      <span className="text-neutral-600">9:20 AM</span>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="bg-[#121413]/60 rounded px-2 py-1 flex items-center justify-between gap-2 border border-neutral-900/30">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-400 font-bold flex items-center justify-center text-[7px] shrink-0">TM</div>
                      <span className="font-semibold text-neutral-400 truncate">Team Meeting</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[8px] shrink-0">
                      <span className="text-neutral-400 bg-neutral-800 px-1 py-0.2 rounded border border-neutral-700/30 scale-90">Updates</span>
                      <span className="text-neutral-600">8:15 AM</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================
            BLOCK 05: CHAT WITH YOUR EMAILS (Bottom Right)
           ======================================================== */}
        <div className="lg:col-span-4 bg-[#121413] border border-neutral-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[380px] hover:border-neutral-700/40 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-[#00D062]/10 text-[#00D062] font-mono text-[10px] px-1.5 py-0.5 rounded font-bold border border-[#00D062]/20">05</span>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Chat with your emails</span>
            </div>
            <h3 className="text-xl font-normal tracking-tight text-white leading-snug">
              Chat with your emails.
            </h3>
            <p className="text-[11px] text-neutral-500 mt-1 leading-normal">
              Answers and insights, <br className="hidden sm:inline" /> just a message away.
            </p>
          </div>

          {/* Inside interactive Conversation Chat UI container stream mockup */}
          <div className="space-y-3 text-[10px] mt-4 flex-1 flex flex-col justify-end">
            
            {/* User message input bubble (Right-anchored) */}
            <div className="flex items-center justify-end gap-2 pl-6">
              <div className="bg-emerald-950/60 border border-emerald-900/40 rounded-xl px-3 py-2 text-neutral-200 leading-normal">
                What are the updates on the Acme project?
              </div>
              <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-700/40">
                <User size={10} className="text-neutral-400" />
              </div>
            </div>

            {/* Assistant response loop item (Left-anchored) */}
            <div className="flex items-start gap-2 pr-4">
              <div className="w-5 h-5 rounded-full bg-[#00D062]/10 border border-[#00D062]/20 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Sparkles size={10} />
              </div>
              <div className="space-y-2 flex-1 min-w-0">
                <p className="text-neutral-400 font-medium">Here's what I found:</p>
                
                {/* Content structured highlights summary block layout */}
                <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3 text-[10px] space-y-1.5 text-neutral-400 font-medium shadow-inner">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#00D062] block shrink-0" />
                    <span>Project status: On track</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#00D062] block shrink-0" />
                    <span>Next milestone: May 30</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#00D062] block shrink-0" />
                    <span>Key people: Alex, Turner, Priya</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#00D062] block shrink-0" />
                    <span>Recent update: Q2 roadmap shared</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Input Query Bar footprint at layout bottom base */}
            <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-1.5 flex items-center justify-between gap-2 shadow-md mt-1">
              <span className="text-neutral-600 pl-1.5 text-[10px] truncate">Ask anything about your emails...</span>
              <button className="w-5 h-5 rounded-md bg-[#00D062] text-black flex items-center justify-center shrink-0 shadow-sm shadow-[#00D062]/10">
                <Send size={9} strokeWidth={2.5} />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// Custom Micro Refresh/Arrows Loop Icon placeholder module component
function RefreshCwIcon({ size = 14, className = "" }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}