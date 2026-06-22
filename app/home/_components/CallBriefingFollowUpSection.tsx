import React from 'react';
import { 
  Sparkles, 
  FileText, 
  AudioLines, 
  Mail, 
  Mic, 
  CheckSquare, 
  ArrowRight, 
  Zap,
  CheckSquareIcon, 
} from 'lucide-react';

export default function CallBriefingFollowUpSection() {
  return (
    <div className="bg-[#070908] text-white font-sans antialiased selection:bg-[#00D062] selection:text-black min-h-screen py-20 px-6 relative overflow-hidden flex items-center justify-center">
      
      {/* Background ambient deep green atmosphere glow layers matching premium theme */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#00D062]/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto relative z-10">
        
        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 items-stretch">
          
          {/* ========================================================
              LEFT COLUMN: PRODUCT DESCRIPTION & BENCHMARKS
             ======================================================== */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 py-2">
            
            <div className="space-y-4">
              {/* Pill Badge indicator */}
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#00D062] tracking-wider uppercase bg-[#00D062]/5 border border-[#00D062]/20 px-3 py-1.5 rounded-full self-start">
                <Sparkles size={13} />
                <span>Before. During. After.</span>
              </div>

              {/* Typography Main Headlines */}
              <h1 className="text-4xl sm:text-4xl font-normal tracking-tight text-white leading-[1.1] max-w-sm">
                I brief you before every call, and <span className="text-[#00D062] font-medium">follow up after.</span>
              </h1>

              {/* Subtext description paragraph */}
              <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
                Walk into every call prepared.
                Leave every call with clarity.
                I handle the prep so you can focus on the conversation.
              </p>

              {/* Action Call Button */}
              <div className="pt-2">
                <button className="flex items-center gap-2 bg-[#00D062] hover:bg-[#00b354] text-black font-semibold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-[#00D062]/10 transition-all transform hover:scale-[1.01]">
                  See It In Action <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Feature Row Footer Links Stack */}
            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-neutral-900 text-[11px] text-neutral-400">
              {/* Item 1 */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0">
                  <Sparkles size={12} />
                </div>
                <span>Better preparation</span>
              </div>
              {/* Item 2 */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0">
                  <Zap size={12} />
                </div>
                <span>Sharper conversations</span>
              </div>
              {/* Item 3 */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0">
                  <CheckSquareIcon size={12} />
                </div>
                <span>Faster follow-ups</span>
              </div>
            </div>

          </div>

          {/* ========================================================
              MIDDLE COLUMN: VERITABLE TIMELINE CONNECTING LINE
             ======================================================== */}
          <div className="lg:col-span-2 hidden lg:flex flex-col items-center justify-between relative py-6">
            
            {/* Thread Line connecting chronological nodes */}
            <div className="absolute top-12 bottom-12 w-[1px] bg-gradient-to-b from-[#00D062]/60 via-[#00D062]/40 to-[#00D062]/60" />

            {/* Node 1: BEFORE */}
            <div className="relative z-10 flex flex-col items-center gap-2 group cursor-default">
              <div className="w-12 h-12 rounded-full bg-[#070908] border border-[#00D062]/40 text-[#00D062] flex items-center justify-center transition-all shadow-lg group-hover:border-[#00D062] group-hover:bg-[#00D062]/5">
                <FileText size={18} />
              </div>
              <span className="text-[10px] font-bold text-[#00D062] tracking-widest uppercase mt-1">Before</span>
            </div>

            {/* Node 2: DURING */}
            <div className="relative z-10 flex flex-col items-center gap-2 group cursor-default">
              <div className="w-12 h-12 rounded-full bg-[#070908] border border-[#00D062]/40 text-[#00D062] flex items-center justify-center transition-all shadow-lg group-hover:border-[#00D062] group-hover:bg-[#00D062]/5">
                <AudioLines size={18} />
              </div>
              <span className="text-[10px] font-bold text-[#00D062] tracking-widest uppercase mt-1">During</span>
            </div>

            {/* Node 3: AFTER */}
            <div className="relative z-10 flex flex-col items-center gap-2 group cursor-default">
              <div className="w-12 h-12 rounded-full bg-[#070908] border border-[#00D062]/40 text-[#00D062] flex items-center justify-center transition-all shadow-lg group-hover:border-[#00D062] group-hover:bg-[#00D062]/5">
                <Mail size={18} />
              </div>
              <span className="text-[10px] font-bold text-[#00D062] tracking-widest uppercase mt-1">After</span>
            </div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: HIGH-FIDELITY APP CONTEXT CARDS STACK
             ======================================================== */}
          <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
            
            {/* Card 1: Call Briefing */}
            <div className="bg-[#121413] border border-neutral-800/80 rounded-2xl p-5 shadow-xl hover:border-neutral-800 transition-all flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00D062] flex items-center justify-center shrink-0 shadow-inner">
                <Sparkles size={16} />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="text-white text-sm font-semibold tracking-tight">Call Briefing</h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">I gather context and surface what matters most.</p>
                </div>
                <ul className="space-y-1.5 text-[11px] text-neutral-300">
                  <li className="flex items-center gap-2">
                    <span className="text-[#00D062] block shrink-0"><CheckSquare size={12} strokeWidth={3} /></span>
                    <span>Who you're meeting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#00D062] block shrink-0"><CheckSquare size={12} strokeWidth={3} /></span>
                    <span>Recent conversations & updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#00D062] block shrink-0"><CheckSquare size={12} strokeWidth={3} /></span>
                    <span>Key topics & goals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#00D062] block shrink-0"><CheckSquare size={12} strokeWidth={3} /></span>
                    <span>Talking points & suggested questions</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2: The Call */}
            <div className="bg-[#121413] border border-neutral-800/80 rounded-2xl p-5 shadow-xl hover:border-neutral-800 transition-all flex items-start gap-4 relative overflow-hidden">
              {/* Subtle wave waveform background track display overlay */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-24 opacity-20 pointer-events-none hidden sm:block">
                <svg className="w-full h-full text-[#00D062]" viewBox="0 0 100 30" fill="none">
                  <path d="M0 15 Q10 5 20 15 T40 15 T60 15 T80 15 T100 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00D062] flex items-center justify-center shrink-0 shadow-inner">
                <Mic size={16} />
              </div>
              <div className="space-y-1">
                <h3 className="text-white text-sm font-semibold tracking-tight">The Call</h3>
                <p className="text-[11px] text-neutral-300">You have the conversation.</p>
                <p className="text-[11px] text-neutral-500 pt-1">I listen, take notes, and extract what matters.</p>
              </div>
            </div>

            {/* Card 3: Follow-Up Pack */}
            <div className="bg-[#121413] border border-neutral-800/80 rounded-2xl p-5 shadow-xl hover:border-neutral-800 transition-all flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00D062] flex items-center justify-center shrink-0 shadow-inner">
                <Mail size={16} />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="text-white text-sm font-semibold tracking-tight">Follow-Up Pack</h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">I deliver everything you need to move forward.</p>
                </div>
                <ul className="space-y-1.5 text-[11px] text-neutral-300">
                  <li className="flex items-center gap-2">
                    <span className="text-[#00D062] block shrink-0"><CheckSquare size={12} strokeWidth={3} /></span>
                    <span>Meeting summary</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#00D062] block shrink-0"><CheckSquare size={12} strokeWidth={3} /></span>
                    <span>Action items & owners</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#00D062] block shrink-0"><CheckSquare size={12} strokeWidth={3} /></span>
                    <span>Follow-up email draft</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#00D062] block shrink-0"><CheckSquare size={12} strokeWidth={3} /></span>
                    <span>Next steps & reminders</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}