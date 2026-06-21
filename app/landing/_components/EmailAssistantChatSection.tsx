import React from 'react';
import { 
  MessageSquare, 
  Search, 
  Zap, 
  Shield, 
  Mail, 
  ShieldCheck, 
  MoreVertical, 
  Sparkles, 
  Briefcase, 
  Users, 
  Calendar, 
  FileText, 
  ArrowRight, 
  Send, 
  Lock,
} from 'lucide-react';

export default function EmailAssistantChatSection() {
  return (
    <div className="bg-[#070908] text-white font-sans antialiased selection:bg-[#00D062] selection:text-black min-h-screen py-20 px-6 relative overflow-hidden flex items-center justify-center">
      
      {/* Background ambient deep green atmosphere glow layers matching the hero design pattern */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#00D062]/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto relative z-10">
        
        {/* Main Split Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* ========================================================
              LEFT COLUMN: EXPLANATORY MARKETING COPY
             ======================================================== */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Pill Badge indicator */}
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#00D062] tracking-wider uppercase bg-[#00D062]/5 border border-[#00D062]/20 px-3 py-1.5 rounded-full">
              <MessageSquare size={13} />
              <span>Chat with your emails</span>
            </div>

            {/* Typography Main Headlines */}
            <h1 className="text-4xl sm:text-5xl lg:text-4xl font-normal tracking-tight text-white leading-[1.1]">
              Personal email assistant. <br />
              <span className="text-[#00D062] font-medium">Now you can chat with your emails.</span>
            </h1>

            {/* Subtext description paragraph */}
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-md">
              A ChatGPT-like assistant means a wealth of insights are just a few words away. Imagine that.
            </p>

            {/* List Stack rows separated by subtle dividers */}
            <div className="space-y-4 pt-4 border-t border-neutral-900">
              
              {/* Item 1 */}
              <div className="flex gap-4 items-start pb-4 border-b border-neutral-900/60">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">Ask anything</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                    Get answers from across all your emails in seconds.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex gap-4 items-start pb-4 border-b border-neutral-900/60">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <Search size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">Deep insights</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                    Find patterns, summaries, and key takeaways instantly.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex gap-4 items-start pb-4 border-b border-neutral-900/60">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">Save hours</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                    No more digging through threads or endless searching.
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <Shield size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">100% private</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                    Your emails stay private and secure—always.
                  </p>
                </div>
              </div>

            </div>

            {/* Action Link Call Trigger button */}
            {/* <div className="pt-4">
              <button className="flex items-center gap-2 bg-[#00D062] hover:bg-[#00b354] text-black font-semibold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-[#00D062]/10 transition-all transform hover:scale-[1.01]">
                Chat with your emails <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div> */}

          </div>

          {/* ========================================================
              RIGHT COLUMN: FULL SYSTEM CHAT UI SIMULATION CONTAINEUR
             ======================================================== */}
          <div className="lg:col-span-6 bg-[#121413] border border-neutral-800/80 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-2 relative overflow-hidden">
            
            {/* Soft decorative gradient mesh over the conversation area */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-emerald-500/[0.01] to-transparent pointer-events-none" />

            {/* Chat Frame Header Component */}
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-4 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#00D062] flex items-center justify-center">
                  <Mail size={14} />
                </div>
                <h4 className="text-xs font-semibold text-white tracking-tight">Email Assistant</h4>
              </div>

              <div className="flex items-center gap-3 text-neutral-500 text-[10px]">
                <div className="flex items-center gap-1 bg-neutral-900/80 px-2 py-1 rounded border border-neutral-800/60 text-neutral-400 font-medium">
                  <ShieldCheck size={12} className="text-neutral-500" />
                  <span>Your data is private</span>
                </div>
                <MoreVertical size={14} className="cursor-pointer hover:text-white transition-colors" />
              </div>
            </div>

            {/* Conversational Dialog History Area */}
            <div className="space-y-6 flex-1 min-h-[380px] z-10 text-xs">
              
              {/* User Message Bubble Box right-anchored */}
              <div className="flex justify-end pl-12">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-200 font-medium shadow-md">
                  What are the updates on the Acme project?
                </div>
              </div>

              {/* Assistant Response Bubble System left-anchored */}
              <div className="flex gap-3.5 items-start pr-4">
                {/* AI Avatar circle pin badge */}
                <div className="w-7 h-7 rounded-full bg-[#00D062]/10 border border-[#00D062]/20 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-[#00D062]/5">
                  <Sparkles size={13} />
                </div>
                
                <div className="space-y-3 flex-1">
                  <p className="text-neutral-300 font-medium">Here's what I found about the Acme project:</p>

                  {/* HIGH-FIDELITY STRUCTURED BLOCK INSIDE THE CHAT STREAM */}
                  <div className="bg-neutral-950/40 border border-neutral-800/80 rounded-xl p-4 space-y-4 shadow-inner">
                    
                    {/* Inner Row 1: Project status */}
                    <div className="flex gap-3.5 items-start pb-4 border-b border-neutral-900/50">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-[#00D062] border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Briefcase size={13} />
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-white font-semibold text-[11px]">Project status</h5>
                        <p className="text-neutral-400 text-[11px] leading-relaxed">
                          Acme project is on track. <br className="hidden sm:inline" /> Next milestone due on May 30.
                        </p>
                      </div>
                    </div>

                    {/* Inner Row 2: Key people */}
                    {/* <div className="flex gap-3.5 items-start pb-4 border-b border-neutral-900/50">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-[#00D062] border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Users size={13} />
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-white font-semibold text-[11px]">Key people</h5>
                        <p className="text-neutral-400 text-[11px] leading-relaxed">
                          You, Alex Turner, and Priya Shah <br className="hidden sm:inline" /> are the main contributors.
                        </p>
                      </div>
                    </div> */}

                    {/* Inner Row 3: Recent updates with internal list metrics */}
                    <div className="flex gap-3.5 items-start pb-4 border-b border-neutral-900/50">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-[#00D062] border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Calendar size={13} />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <h5 className="text-white font-semibold text-[11px]">Recent updates</h5>
                        <ul className="space-y-1 text-neutral-400 text-[11px] list-none">
                          <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#00D062] block shrink-0" />
                            <span>Alex shared the Q2 roadmap on May 12</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#00D062] block shrink-0" />
                            <span>Budget approval confirmed on May 15</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#00D062] block shrink-0" />
                            <span>Next sync scheduled for May 22</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Inner Row 4: Related emails */}
                    <div className="flex gap-3.5 items-start">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-[#00D062] border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText size={13} />
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-white font-semibold text-[11px]">Related emails</h5>
                        <p className="text-neutral-400 text-[11px]">12 emails from the last 30 days</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>

            {/* Interactive horizontal Pill Suggestions Actions link list row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 z-10 text-[10px] text-neutral-300">
              <button className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800/80 px-3 py-1.5 rounded-lg transition-colors">
                <Mail size={12} className="text-neutral-500" /> Show emails
              </button>
              <button className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800/80 px-3 py-1.5 rounded-lg transition-colors">
                <FileText size={12} className="text-neutral-500" /> Summarize latest updates
              </button>
              <button className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800/80 px-3 py-1.5 rounded-lg transition-colors">
                <ArrowRight size={12} className="text-neutral-500" /> What's next?
              </button>
            </div>

            {/* Chat Input Prompt Form module line block */}
            <div className="space-y-2.5 z-10">
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 flex items-center justify-between gap-4 focus-within:border-neutral-700 transition-all shadow-md">
                <input 
                  type="text" 
                  placeholder="Ask anything about your emails..." 
                  className="bg-transparent flex-1 text-xs text-white placeholder-neutral-600 outline-none pl-2.5"
                />
                <button className="w-7 h-7 rounded-full bg-[#00D062] hover:bg-[#00b354] text-black flex items-center justify-center shrink-0 shadow-sm shadow-[#00D062]/20 transition-all">
                  <Send size={12} strokeWidth={2.5} />
                </button>
              </div>

              {/* Secure bottom lock footnote description line subtext */}
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 pl-1 font-medium">
                <Lock size={11} />
                <span>Only you can see your data</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}