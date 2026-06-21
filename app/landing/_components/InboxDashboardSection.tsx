import React from 'react';
import { 
  Inbox, 
  Star, 
  Clock, 
  Bell, 
  Send, 
  FileText, 
  Mail, 
  Trash2, 
  Settings, 
  Search, 
  Sparkles, 
  Info, 
  ChevronDown, 
  SlidersHorizontal, 
  Layers, 
  Sliders, 
  Zap, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';

export default function InboxDashboardSection() {
  return (
    <div className="bg-[#070908] text-white font-sans antialiased selection:bg-[#00D062] selection:text-black min-h-screen py-20 px-6 relative overflow-hidden flex items-center justify-center">
      
      {/* Background ambient deep green atmosphere glow layers matching hero theme */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#00D062]/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto relative z-10">
        
        {/* Main Split Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-stretch">
          
          {/* ========================================================
              LEFT COLUMN: PRODUCT DESCRIPTION & BENCHMARKS
             ======================================================== */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-4 pr-0 lg:pr-4">
            
            {/* Pill Badge indicator */}
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#00D062] tracking-wider uppercase bg-[#00D062]/5 border border-[#00D062]/20 px-3 py-1.5 rounded-full self-start">
              <Layers size={13} />
              <span>Dashboard &gt; Inbox</span>
            </div>

            {/* Typography Main Headlines */}
            <h1 className="text-4xl sm:text-4xl font-normal tracking-tight text-white leading-[1.1]">
              An organized view into everything <br />
              <span className="text-[#00D062] font-medium">you're up to.</span>
            </h1>

            {/* Subtext description paragraph */}
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-sm">
              An inbox that is truly transformed. From a dump of emails to an intuitive dashboard that tells you what you need to know.
            </p>

            {/* Feature List items */}
            <div className="space-y-5 pt-4 border-t border-neutral-900">
              
              {/* Feature 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <Inbox size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">Everything at a glance</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                    See what matters most, right when you open your inbox.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <Sliders size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">Smart organization</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                    Emails are labeled, prioritized, and grouped for you.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">Action with clarity</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                    Know what to do, what's waiting, and what can wait.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">Stay in the loop</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                    I'll text you about important emails so you never miss what matters.
                  </p>
                </div>
              </div>

            </div>

            {/* Action Call Button */}
            <div className="pt-2">
              <button className="flex items-center gap-2 bg-[#00D062] hover:bg-[#00b354] text-black font-semibold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-[#00D062]/10 transition-all transform hover:scale-[1.01]">
                See your inbox in action <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: HIGH-FIDELITY EMAIL DASHBOARD WINDOW
             ======================================================== */}
          <div className="lg:col-span-8 bg-[#121413] border border-neutral-800/80 rounded-2xl flex shadow-2xl overflow-hidden relative min-h-[620px]">
            
            {/* Sidebar Navigation Sub-component inside mockup */}
            <aside className="w-44 border-r border-neutral-800/50 p-4 flex flex-col justify-between hidden sm:flex bg-[#0B0D0C]/40 shrink-0 text-xs text-neutral-400">
              <div className="space-y-6">
                {/* Logo Envelope Badge */}
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#00D062] flex items-center justify-center mb-6">
                  <Mail size={14} />
                </div>

                {/* Internal Nav links */}
                <nav className="flex flex-col gap-1">
                  <a href="#" className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-neutral-800/60 text-white font-medium">
                    <span className="flex items-center gap-2"><Inbox size={13} className="text-[#00D062]" /> Inbox</span>
                    <span className="font-mono text-[10px] text-neutral-400">12</span>
                  </a>
                  <a href="#" className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-neutral-800/20 transition-colors">
                    <span className="flex items-center gap-2"><Star size={13} /> Priority</span>
                    <span className="font-mono text-[10px] text-neutral-500">4</span>
                  </a>
                  <a href="#" className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-neutral-800/20 transition-colors">
                    <span className="flex items-center gap-2"><Clock size={13} /> Waiting on me</span>
                    <span className="font-mono text-[10px] text-neutral-500">3</span>
                  </a>
                  <a href="#" className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-neutral-800/20 transition-colors">
                    <span className="flex items-center gap-2"><Bell size={13} /> Reminders</span>
                    <span className="font-mono text-[10px] text-neutral-500">2</span>
                  </a>
                  <a href="#" className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-neutral-800/20 transition-colors mt-2">
                    <Send size={13} /> Sent
                  </a>
                  <a href="#" className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-neutral-800/20 transition-colors">
                    <FileText size={13} /> Drafts
                  </a>
                  <a href="#" className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-neutral-800/20 transition-colors">
                    <Mail size={13} /> All mail
                  </a>
                  <a href="#" className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-neutral-800/20 transition-colors">
                    <Trash2 size={13} /> Trash
                  </a>
                </nav>
              </div>

              {/* Settings entry */}
              <a href="#" className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-neutral-800/20 transition-colors">
                <Settings size={13} /> Settings
              </a>
            </aside>

            {/* Main Application Interface Viewspace */}
            <main className="flex-1 p-5 flex flex-col gap-5 overflow-x-hidden">
              
              {/* Header Context Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/30 pb-4">
                <div>
                  <h4 className="text-white text-sm font-semibold tracking-tight">Inbox</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Here's what's happening today.</p>
                </div>

                {/* Interactive query buttons block */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <div className="bg-neutral-950 border border-neutral-800 px-2.5 py-1.5 rounded-lg flex items-center gap-2 w-40 sm:w-44 focus-within:border-neutral-700 transition-all">
                    <Search size={12} className="text-neutral-600" />
                    <input 
                      type="text" 
                      placeholder="Search emails..." 
                      className="bg-transparent text-[11px] text-white placeholder-neutral-600 outline-none w-full"
                    />
                  </div>
                  <button className="flex items-center gap-1.5 bg-[#00D062] hover:bg-[#00b354] text-black text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm shadow-[#00D062]/10 transition-colors">
                    <Sparkles size={12} strokeWidth={2.5} /> Ask Inbox
                  </button>
                </div>
              </div>

              {/* Metric Overview Category Grid Rows */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                
                {/* Metric 1 */}
                <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-3 flex flex-col justify-between min-h-[84px] relative overflow-hidden group hover:border-neutral-700/40 transition-all">
                  <div>
                    <span className="text-[10px] text-neutral-500 font-medium block">Priority</span>
                    <span className="text-2xl font-bold text-[#00D062] tracking-tight block mt-1">4</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-neutral-400 mt-2">
                    <span>Needs your attention</span>
                    <span className="w-4 h-4 rounded bg-neutral-900 flex items-center justify-center text-amber-400 border border-neutral-800"><Sparkles size={10} /></span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-3 flex flex-col justify-between min-h-[84px] relative overflow-hidden group hover:border-neutral-700/40 transition-all">
                  <div>
                    <span className="text-[10px] text-neutral-500 font-medium block">Waiting on you</span>
                    <span className="text-2xl font-bold text-white tracking-tight block mt-1">3</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-neutral-400 mt-2">
                    <span>People waiting</span>
                    <span className="w-4 h-4 rounded bg-neutral-900 flex items-center justify-center text-amber-500 border border-neutral-800"><Clock size={10} /></span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-3 flex flex-col justify-between min-h-[84px] relative overflow-hidden group hover:border-neutral-700/40 transition-all">
                  <div>
                    <span className="text-[10px] text-neutral-500 font-medium block">Updates</span>
                    <span className="text-2xl font-bold text-white tracking-tight block mt-1">8</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-neutral-400 mt-2">
                    <span>FYI only</span>
                    <span className="w-4 h-4 rounded bg-neutral-900 flex items-center justify-center text-neutral-500 border border-neutral-800"><Info size={10} /></span>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-3 flex flex-col justify-between min-h-[84px] relative overflow-hidden group hover:border-neutral-700/40 transition-all">
                  <div>
                    <span className="text-[10px] text-neutral-500 font-medium block">Newsletters</span>
                    <span className="text-2xl font-bold text-white tracking-tight block mt-1">12</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-neutral-400 mt-2">
                    <span>Automated</span>
                    <span className="w-4 h-4 rounded bg-neutral-900 flex items-center justify-center text-neutral-500 border border-neutral-800"><Mail size={10} /></span>
                  </div>
                </div>

              </div>

              {/* Filter Row Controls */}
              <div className="flex items-center justify-between border-b border-neutral-800/20 pb-2 text-[10px] text-neutral-400 mt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button className="bg-[#00D062]/10 text-[#00D062] border border-[#00D062]/20 font-semibold px-2.5 py-1 rounded-md">All</button>
                  <button className="bg-neutral-900 hover:bg-neutral-800 px-2.5 py-1 rounded-md border border-neutral-800/60">Priority</button>
                  <button className="bg-neutral-900 hover:bg-neutral-800 px-2.5 py-1 rounded-md border border-neutral-800/60">Waiting on me</button>
                  <button className="bg-neutral-900 hover:bg-neutral-800 px-2.5 py-1 rounded-md border border-neutral-800/60">Updates</button>
                  <button className="bg-neutral-900 hover:bg-neutral-800 px-2.5 py-1 rounded-md border border-neutral-800/60">Newsletters</button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button className="flex items-center gap-1 bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-800/60">
                    <span>Sort: Newest</span> <ChevronDown size={11} />
                  </button>
                  <button className="p-1 rounded bg-neutral-900 border border-neutral-800/60 text-neutral-500 hover:text-white"><SlidersHorizontal size={12} /></button>
                </div>
              </div>

              {/* Email Records Main Table Stack */}
              <div className="space-y-1.5 text-[11px] my-1">
                
                {/* Row 1 */}
                <div className="bg-[#141615]/70 border border-neutral-800/40 hover:border-neutral-700/30 rounded-xl p-2.5 flex items-center justify-between gap-4 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <input type="checkbox" className="accent-[#00D062] border-neutral-700 rounded bg-transparent opacity-40 group-hover:opacity-100" />
                    <div className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-300 font-semibold flex items-center justify-center text-[10px] shrink-0 relative">
                      AC <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#00D062] border-2 border-[#141615]" />
                    </div>
                    <span className="font-semibold text-white w-20 truncate shrink-0">Alex Carter</span>
                    <span className="text-neutral-300 font-medium truncate hidden sm:inline">Partnership opportunity</span>
                    <span className="text-neutral-500 truncate text-[10px] max-w-xs">Hi, I'd love to explore how we can work together...</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 font-mono text-[9px] text-neutral-500">
                    <span className="bg-emerald-950/80 text-[#00D062] border border-emerald-900 px-2 py-0.5 rounded scale-90">Priority</span>
                    <span>9:41 AM</span>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="bg-[#141615]/70 border border-neutral-800/40 hover:border-neutral-700/30 rounded-xl p-2.5 flex items-center justify-between gap-4 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <input type="checkbox" className="accent-[#00D062] border-neutral-700 rounded bg-transparent opacity-40 group-hover:opacity-100" />
                    <div className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-300 font-semibold flex items-center justify-center text-[10px] shrink-0 relative">
                      SR <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#00D062] border-2 border-[#141615]" />
                    </div>
                    <span className="font-semibold text-white w-20 truncate shrink-0">Sarah Rogers</span>
                    <span className="text-neutral-300 font-medium truncate hidden sm:inline">Project update</span>
                    <span className="text-neutral-500 truncate text-[10px] max-w-xs">Here's the latest update on the project timeline...</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 font-mono text-[9px] text-neutral-500">
                    <span className="bg-amber-950/80 text-amber-400 border border-amber-900/60 px-2 py-0.5 rounded scale-90">Waiting on you</span>
                    <span>9:20 AM</span>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="bg-[#141615]/70 border border-neutral-800/40 hover:border-neutral-700/30 rounded-xl p-2.5 flex items-center justify-between gap-4 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <input type="checkbox" className="accent-[#00D062] border-neutral-700 rounded bg-transparent opacity-40 group-hover:opacity-100" />
                    <div className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 font-semibold flex items-center justify-center text-[10px] shrink-0">TM</div>
                    <span className="font-semibold text-neutral-300 w-20 truncate shrink-0">Team Meeting</span>
                    <span className="text-neutral-300 font-medium truncate hidden sm:inline">Notes & next steps</span>
                    <span className="text-neutral-500 truncate text-[10px] max-w-xs">Sharing the notes from our call and next steps...</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 font-mono text-[9px] text-neutral-500">
                    <span className="bg-neutral-900 text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded scale-90">Updates</span>
                    <span>8:15 AM</span>
                  </div>
                </div>

                {/* Row 4 */}
                {/* <div className="bg-[#141615]/70 border border-neutral-800/40 hover:border-neutral-700/30 rounded-xl p-2.5 flex items-center justify-between gap-4 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <input type="checkbox" className="accent-[#00D062] border-neutral-700 rounded bg-transparent opacity-40 group-hover:opacity-100" />
                    <div className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 font-semibold flex items-center justify-center text-[10px] shrink-0">JB</div>
                    <span className="font-semibold text-neutral-300 w-20 truncate shrink-0">John Bennett</span>
                    <span className="text-neutral-300 font-medium truncate hidden sm:inline">Invoice #INV-327</span>
                    <span className="text-neutral-500 truncate text-[10px] max-w-xs">Please find the invoice attached for your review.</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 font-mono text-[9px] text-neutral-500">
                    <span className="bg-amber-950/80 text-amber-400 border border-amber-900/60 px-2 py-0.5 rounded scale-90">Waiting on you</span>
                    <span>Yesterday</span>
                  </div>
                </div> */}

                {/* Row 5 */}
                {/* <div className="bg-[#141615]/70 border border-neutral-800/40 hover:border-neutral-700/30 rounded-xl p-2.5 flex items-center justify-between gap-4 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <input type="checkbox" className="accent-[#00D062] border-neutral-700 rounded bg-transparent opacity-40 group-hover:opacity-100" />
                    <div className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 font-semibold flex items-center justify-center text-[10px] shrink-0">NL</div>
                    <span className="font-semibold text-neutral-300 w-20 truncate shrink-0">Morning Brew</span>
                    <span className="text-neutral-300 font-medium truncate hidden sm:inline">Today's Briefing</span>
                    <span className="text-neutral-500 truncate text-[10px] max-w-xs">Your daily dose of business news.</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 font-mono text-[9px] text-neutral-500">
                    <span className="bg-neutral-900 text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded scale-90">Newsletters</span>
                    <span>Yesterday</span>
                  </div>
                </div> */}

              </div>

              {/* Bottom Insight Analytics Row Modules */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-auto pt-2">
                
                {/* Graph Card block */}
                <div className="md:col-span-6 bg-[#141615] border border-neutral-800/60 rounded-xl p-3.5 flex flex-col justify-between min-h-[110px] relative overflow-hidden">
                  <span className="text-[10px] text-neutral-500 font-medium block">Inbox insights</span>
                  
                  {/* Embedded Micro Vector Line Chart */}
                  <div className="h-10 my-1 relative w-full">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 240 40" preserveAspectRatio="none">
                      <path 
                        d="M 0 32 Q 30 15 60 28 T 120 30 T 180 12 T 240 20" 
                        fill="none" 
                        stroke="#00D062" 
                        strokeWidth="1.5" 
                      />
                      <circle cx="240" cy="20" r="2.5" fill="#00D062" />
                    </svg>
                  </div>

                  <p className="text-[10px] text-neutral-400 font-medium leading-tight">
                    You're all caught up! 🎉 <span className="text-neutral-500 font-normal block mt-0.5">You've cleared 18 emails in the last 7 days.</span>
                  </p>
                </div>

                {/* Time Saved Card */}
                <div className="md:col-span-3 bg-[#141615] border border-neutral-800/60 rounded-xl p-3.5 flex flex-col justify-between min-h-[110px]">
                  <span className="text-[10px] text-neutral-500 font-medium block">Time saved</span>
                  <div>
                    <span className="text-2xl font-bold text-white tracking-tight">4.5</span>
                    <span className="text-neutral-400 font-medium text-[11px] ml-1">hr</span>
                  </div>
                  <span className="text-[9px] text-neutral-500 block">In the last 7 days</span>
                </div>

                {/* Emails Handled Card */}
                <div className="md:col-span-3 bg-[#141615] border border-neutral-800/60 rounded-xl p-3.5 flex flex-col justify-between min-h-[110px]">
                  <span className="text-[10px] text-neutral-500 font-medium block">Emails handled</span>
                  <span className="text-2xl font-bold text-white tracking-tight">128</span>
                  <span className="text-[9px] text-neutral-500 block">In the last 7 days</span>
                </div>

              </div>

            </main>
          </div>

        </div>

      </div>
    </div>
  );
}