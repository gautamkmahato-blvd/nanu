import React from 'react';
import { 
  Sparkles, 
  Zap, 
  Target, 
  BarChart3, 
  Shield, 
  Inbox, 
  CheckCircle2, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  AlertOctagon, 
  Mail, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function SmartPriorityInboxSection() {
  return (
    <div className="bg-[#070908] text-white font-sans antialiased selection:bg-[#00D062] selection:text-black min-h-screen py-20 px-6 relative overflow-hidden flex items-center justify-center">
      
      {/* Background ambient deep green atmosphere glow layers matching hero theme */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#00D062]/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto relative z-10">
        
        {/* Main Split Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-16">
          
          {/* ========================================================
              LEFT COLUMN: PRODUCT DESCRIPTION & BENCHMARKS
             ======================================================== */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
            
            {/* Pill Badge indicator */}
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#00D062] tracking-wider uppercase bg-[#00D062]/5 border border-[#00D062]/20 px-3 py-1.5 rounded-full self-start">
              <Sparkles size={13} />
              <span>Smart Priority Inbox</span>
            </div>

            {/* Typography Main Headlines */}
            <h1 className="text-4xl sm:text-5xl lg:text-4xl font-normal tracking-tight text-white leading-[1.1]">
              Smart <span className="text-[#00D062] font-medium">Priority Inbox</span>
            </h1>

            {/* Subtext description paragraph */}
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-sm">
              AI analyzes every email for urgency, opportunity, and risk — so you always know what needs attention first.
            </p>

            {/* Feature List items */}
            <div className="space-y-5 pt-4 border-t border-neutral-900">
              
              {/* Feature 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">AI-Powered Prioritization</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                    Every email is scored for urgency, opportunity, and risk.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <Target size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">Focus on What Matters</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                    Important emails rise to the top, noise stays out of the way.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart3 size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">Clear Priority Signals</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                    See why an email matters at a glance.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <Shield size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">Stay Ahead of Risks</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                    AI flags time-sensitive or high-impact messages.
                  </p>
                </div>
              </div>

            </div>

            {/* Action Call Button */}
            <div className="pt-2">
              <button className="flex items-center gap-2 bg-[#00D062] hover:bg-[#00b354] text-black font-semibold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-[#00D062]/10 transition-all transform hover:scale-[1.01]">
                See what matters first <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: HIGH-FIDELITY PRIORITY INBOX INTERFACE
             ======================================================== */}
          <div className="lg:col-span-7 bg-[#121413] border border-neutral-800/80 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
            
            {/* Soft decorative gradient mesh over the conversation area */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-emerald-500/[0.01] to-transparent pointer-events-none" />

            {/* Top Navigation Row inside window Mockup */}
            <div className="flex items-center justify-between border-b border-neutral-800/40 pb-4 z-10">
              <div className="flex items-center gap-2 text-sm text-neutral-200 font-semibold tracking-tight">
                <Inbox size={16} className="text-[#00D062]" />
                <span>Inbox</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-medium bg-neutral-900/85 border border-neutral-800/60 px-2 py-1 rounded-md">
                <CheckCircle2 size={12} className="text-[#00D062]" />
                <span>AI Scanning 100%</span>
              </div>
            </div>

            {/* Categorized Filter Tabs Container Row */}
            <div className="grid grid-cols-4 gap-2 text-[11px] font-medium text-neutral-400 z-10">
              
              {/* Priority - Active State Tab */}
              <div className="bg-[#00D062]/10 border border-[#00D062]/30 text-[#00D062] rounded-xl px-3 py-2.5 flex items-center justify-between shadow-inner">
                <span className="flex items-center gap-1.5"><Inbox size={13} /> Priority</span>
                <span className="font-mono text-[10px] bg-[#00D062]/10 px-1.5 py-0.5 rounded-md font-bold">5</span>
              </div>

              {/* Opportunity */}
              <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-xl px-3 py-2.5 flex items-center justify-between hover:bg-neutral-900 transition-colors">
                <span className="flex items-center gap-1.5"><TrendingUp size={13} /> Opportunity</span>
                <span className="font-mono text-[10px] text-neutral-500 bg-neutral-950 px-1.5 py-0.5 rounded-md">6</span>
              </div>

              {/* Risk */}
              <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-xl px-3 py-2.5 flex items-center justify-between hover:bg-neutral-900 transition-colors">
                <span className="flex items-center gap-1.5"><Shield size={13} /> Risk</span>
                <span className="font-mono text-[10px] text-neutral-500 bg-neutral-950 px-1.5 py-0.5 rounded-md">3</span>
              </div>

              {/* Other */}
              <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-xl px-3 py-2.5 flex items-center justify-between hover:bg-neutral-900 transition-colors">
                <span className="flex items-center gap-1.5"><Mail size={13} /> Other</span>
                <span className="font-mono text-[10px] text-neutral-500 bg-neutral-950 px-1.5 py-0.5 rounded-md">27</span>
              </div>

            </div>

            {/* AI Confirmation Sub-bar system banner */}
            <div className="flex items-center gap-2 text-[10px] text-neutral-400 bg-neutral-950/40 border border-neutral-800/40 p-2.5 rounded-xl z-10">
              <Sparkles size={12} className="text-[#00D062]" />
              <span>AI has prioritized your inbox. Focus on what matters most.</span>
            </div>

            {/* Email Rows Table View Stack */}
            <div className="space-y-2 text-[11px] my-1 z-10">
              
              {/* Row 1: High Priority */}
              <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-3 flex items-center justify-between gap-4 hover:bg-neutral-900/70 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-[#00D062] border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Briefcase size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-white truncate">Alex Carter</span>
                      <span className="text-neutral-300 font-medium truncate hidden sm:inline">Q2 Partnership Proposal</span>
                    </div>
                    <p className="text-neutral-500 text-[10px] truncate mt-0.5">Let's finalize the terms and next steps by EOD.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 font-mono text-[9px] text-neutral-500">
                  <span className="bg-red-950/40 text-red-400 border border-red-900/40 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-400 block" /> High Priority
                  </span>
                  <span>9:41 AM</span>
                </div>
              </div>

              {/* Row 2: Opportunity */}
              <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-3 flex items-center justify-between gap-4 hover:bg-neutral-900/70 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-[#00D062] border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <TrendingUp size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-white truncate">Sarah Rogers</span>
                      <span className="text-neutral-300 font-medium truncate hidden sm:inline">Re: Project Timeline Update</span>
                    </div>
                    <p className="text-neutral-500 text-[10px] truncate mt-0.5">We'll need your input on the revised milestones.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 font-mono text-[9px] text-neutral-500">
                  <span className="bg-orange-950/40 text-orange-400 border border-orange-900/40 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-orange-400 block" /> Opportunity
                  </span>
                  <span>8:15 AM</span>
                </div>
              </div>

              {/* Row 3: Medium Priority */}
              <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-3 flex items-center justify-between gap-4 hover:bg-neutral-900/70 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-[#00D062] border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Clock size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-white truncate">David Chen</span>
                      <span className="text-neutral-300 font-medium truncate hidden sm:inline">Client Feedback on Proposal</span>
                    </div>
                    <p className="text-neutral-500 text-[10px] truncate mt-0.5">Important feedback from Acme Corp.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 font-mono text-[9px] text-neutral-500">
                  <span className="bg-yellow-950/40 text-yellow-400 border border-yellow-900/40 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-yellow-400 block" /> Medium Priority
                  </span>
                  <span>Yesterday</span>
                </div>
              </div>

              {/* Row 4: Risk */}
              <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-3 flex items-center justify-between gap-4 hover:bg-neutral-900/70 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-[#00D062] border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <ShieldAlert size={14} className="text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-white truncate">System Alert</span>
                      <span className="text-neutral-300 font-medium truncate hidden sm:inline">Security Alert: Unusual Sign-in Detected</span>
                    </div>
                    <p className="text-neutral-500 text-[10px] truncate mt-0.5">We noticed a sign-in from a new device.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 font-mono text-[9px] text-neutral-500">
                  <span className="bg-rose-950/40 text-rose-400 border border-rose-900/40 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-rose-400 block" /> Risk
                  </span>
                  <span>Yesterday</span>
                </div>
              </div>

              {/* Row 5: Low Priority */}
              <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-3 flex items-center justify-between gap-4 hover:bg-neutral-900/70 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-[#00D062] border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Mail size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-white truncate">Marketing Team</span>
                      <span className="text-neutral-300 font-medium truncate hidden sm:inline">June Newsletter Draft</span>
                    </div>
                    <p className="text-neutral-500 text-[10px] truncate mt-0.5">Please review the draft when you have a moment.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 font-mono text-[9px] text-neutral-500">
                  <span className="bg-neutral-900 text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-neutral-500 block" /> Low Priority
                  </span>
                  <span>May 22</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ========================================================
            FOUR-COLUMN SUBSIDIARY METRICS CAPSULE SYSTEM FOOTER
           ======================================================== */}
        <div className="bg-[#121413]/40 border border-neutral-800/50 rounded-2xl p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-center shadow-xl">
          
          {/* Capsule Item 1 */}
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800/80 text-[#00D062] flex items-center justify-center shrink-0">
              <CheckCircle2 size={14} />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold">Save hours every week</h4>
              <p className="text-[10px] text-neutral-500 mt-0.5">No more digging through emails.</p>
            </div>
          </div>

          {/* Capsule Item 2 */}
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800/80 text-[#00D062] flex items-center justify-center shrink-0">
              <Target size={14} />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold">Make faster decisions</h4>
              <p className="text-[10px] text-neutral-500 mt-0.5">Everything important, front and center.</p>
            </div>
          </div>

          {/* Capsule Item 3 */}
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800/80 text-[#00D062] flex items-center justify-center shrink-0">
              <Shield size={14} />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold">Reduce risks</h4>
              <p className="text-[10px] text-neutral-500 mt-0.5">AI flags what could cost you.</p>
            </div>
          </div>

          {/* Capsule Item 4 */}
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800/80 text-[#00D062] flex items-center justify-center shrink-0">
              <Sparkles size={14} />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold">More opportunities</h4>
              <p className="text-[10px] text-neutral-500 mt-0.5">Never miss what could move forward.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}