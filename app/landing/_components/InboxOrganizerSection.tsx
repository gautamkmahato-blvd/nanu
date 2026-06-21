import React from 'react';
import { 
  Mail, 
  Sparkles, 
  PenSquare, 
  Tag, 
  MessageSquare, 
  CheckCircle2, 
  Send, 
  Archive, 
  Lock, 
  ArrowRight,
  Smartphone,
  ChevronRight
} from 'lucide-react';

export default function InboxOrganizerSection() {
  return (
    <div className="bg-[#070908] text-white font-sans antialiased selection:bg-[#00D062] selection:text-black min-h-screen py-20 px-6 relative overflow-hidden flex items-center justify-center">
      
      {/* Ambient background glow layers matching the dark high-end SaaS theme */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#00D062]/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto relative z-10">
        
        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-16">
          
          {/* ========================================================
              LEFT COLUMN: CONTENT AND TEXT FEATURES
             ======================================================== */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#00D062] tracking-wider uppercase bg-[#00D062]/5 border border-[#00D062]/20 px-3 py-1.5 rounded-full">
              <Mail size={13} className="text-[#00D062]" />
              <span>AI Email Assistant</span>
            </div>

            {/* Headline Typography */}
            <h1 className="text-4xl sm:text-5xl lg:text-4xl font-normal tracking-tight text-white leading-[1.1]">
              I organize your inbox, <br />
              and <span className="text-[#00D062] font-medium">draft your replies.</span>
            </h1>

            {/* Subtext description paragraph */}
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-md">
              I label every email, and draft replies in your voice. Just review, edit if needed, and hit send.
            </p>

            {/* Feature Bullet Points */}
            <div className="space-y-6 pt-4 border-t border-neutral-900">
              
              {/* Feature 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <Tag size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">I label every email</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                    Priority, category, and action—so your inbox stays organized.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <PenSquare size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">I draft in your voice</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                    Replies that sound like you, not a template.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">I text you what matters</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                    Important emails, right to your phone—never miss a thing.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">You stay in control</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                    Review, edit if needed, and send with confidence.
                  </p>
                </div>
              </div>

            </div>

            {/* Action Trigger Button */}
            {/* <div className="pt-4">
              <button className="flex items-center gap-2 bg-[#00D062] hover:bg-[#00b354] text-black font-semibold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-[#00D062]/10 transition-all transform hover:scale-[1.01]">
                Let me handle your inbox <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div> */}

          </div>

          {/* ========================================================
              RIGHT COLUMN: VISUAL CONTEXT MOCKUPS & PIPELINES
             ======================================================== */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-6 relative min-h-[540px]">
            
            {/* Absolute SVG Flow Connector Vector Paths Layer */}
            <svg className="absolute inset-0 w-full h-full text-[#00D062] pointer-events-none hidden sm:block overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="flow-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00D062" />
                </marker>
              </defs>

              {/* Line 1: From Sarah Rogers item right edge to Drafted Reply card left edge */}
              <path 
                d="M 285 240 C 330 240, 310 180, 350 180" 
                stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4"
                markerEnd="url(#flow-arrow)" 
              />

              {/* Line 2: From Drafted Reply card bottom center straight down into Important Email notification box */}
              <path 
                d="M 460 450 L 460 490" 
                stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4"
                markerEnd="url(#flow-arrow)" 
              />
            </svg>

            {/* Left Stack Component: Inbox Organized Queue Panel */}
            <div className="sm:col-span-6 bg-[#121413] border border-neutral-800/80 rounded-xl p-4 shadow-xl self-start z-10">
              <div className="flex items-center justify-between border-b border-neutral-800/40 pb-3 mb-4">
                <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
                  <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[#00D062] flex items-center justify-center">
                    <Mail size={12} />
                  </div>
                  <span>Inbox organized</span>
                </div>
                <Sparkles size={13} className="text-neutral-600" />
              </div>

              {/* Email Items List */}
              <div className="space-y-2 text-[11px]">
                
                {/* Email Item 1 */}
                <div className="bg-neutral-900/50 border border-neutral-800/40 rounded-lg p-2.5 relative flex items-start gap-2.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D062] mt-2 shrink-0" />
                  <div className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 font-semibold flex items-center justify-center text-[10px] shrink-0">AC</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-semibold text-white truncate">Alex Carter</span>
                      <span className="text-[9px] bg-emerald-950 text-[#00D062] border border-emerald-900 px-1.5 py-0.5 rounded scale-90 origin-right">Priority</span>
                    </div>
                    <p className="text-neutral-300 truncate mt-0.5">Partnership opportunity</p>
                    <p className="text-[10px] text-neutral-500 mt-1 flex justify-between">
                      <span className="truncate">Let's explore ways to work together...</span>
                      <span className="font-mono text-[9px] text-neutral-600 shrink-0 ml-1">9:41 AM</span>
                    </p>
                  </div>
                </div>

                {/* Email Item 2: Highlighted connector source */}
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-2.5 relative flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D062] mt-2 shrink-0" />
                  <div className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 font-semibold flex items-center justify-center text-[10px] shrink-0">SR</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-semibold text-white truncate">Sarah Rogers</span>
                      <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-900/60 px-1.5 py-0.5 rounded scale-90 origin-right">Follow Up</span>
                    </div>
                    <p className="text-neutral-300 truncate mt-0.5">Project update</p>
                    <p className="text-[10px] text-neutral-500 mt-1 flex justify-between">
                      <span className="truncate">Here's the latest update on...</span>
                      <span className="font-mono text-[9px] text-neutral-600 shrink-0 ml-1">9:20 AM</span>
                    </p>
                  </div>
                </div>

                {/* Email Item 3 */}
                <div className="bg-neutral-900/30 border border-transparent rounded-lg p-2.5 relative flex items-start gap-2.5 opacity-70">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D062] mt-2 shrink-0" />
                  <div className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-500 font-semibold flex items-center justify-center text-[10px] shrink-0">TM</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-semibold text-neutral-400 truncate">Team Meeting</span>
                      <span className="text-[9px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded scale-90 origin-right">Info</span>
                    </div>
                    <p className="text-neutral-400 truncate mt-0.5">Notes & next steps</p>
                    <p className="text-[10px] text-neutral-600 mt-1 flex justify-between">
                      <span className="truncate">Sharing the notes from our call...</span>
                      <span className="font-mono text-[9px] text-neutral-700 shrink-0 ml-1">8:15 AM</span>
                    </p>
                  </div>
                </div>

                {/* Email Item 4 */}
                {/* <div className="bg-neutral-900/30 border border-transparent rounded-lg p-2.5 relative flex items-start gap-2.5 opacity-70">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D062] mt-2 shrink-0" />
                  <div className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-500 font-semibold flex items-center justify-center text-[10px] shrink-0">JB</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-semibold text-neutral-400 truncate">John Bennett</span>
                      <span className="text-[9px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded scale-90 origin-right">Finance</span>
                    </div>
                    <p className="text-neutral-400 truncate mt-0.5">Invoice #INV-327</p>
                    <p className="text-[10px] text-neutral-600 mt-1 flex justify-between">
                      <span className="truncate">Please find the invoice attached.</span>
                      <span className="font-mono text-[9px] text-neutral-700 shrink-0 ml-1">Yesterday</span>
                    </p>
                  </div>
                </div> */}

              </div>
            </div>

            {/* Right Stack Column: Drafted Reply Component + Alert Module */}
            <div className="sm:col-span-6 flex flex-col gap-5 z-10">
              
              {/* Drafted Reply Box Card */}
              <div className="bg-[#121413] border border-neutral-800/80 rounded-xl p-4 shadow-xl flex flex-col">
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-800/40 pb-3 mb-4">
                    <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
                      <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[#00D062] flex items-center justify-center">
                        <PenSquare size={12} />
                      </div>
                      <span>Drafted reply</span>
                    </div>
                    <Sparkles size={13} className="text-neutral-600" />
                  </div>

                  {/* Mail Message Headers Fields */}
                  <div className="space-y-2 text-[11px] border-b border-neutral-800/30 pb-3 mb-3">
                    <div className="flex items-center gap-2"><span className="text-neutral-500 w-12">To:</span> <span className="text-white font-medium">Alex Carter</span></div>
                    <div className="flex items-center gap-2"><span className="text-neutral-500 w-12">Subject:</span> <span className="text-neutral-300">Re: Partnership opportunity</span></div>
                  </div>

                  {/* Message Composition Body Content */}
                  <div className="text-[11px] text-neutral-300 space-y-3 leading-relaxed font-sans pt-1">
                    <p>Hi Alex,</p>
                    <p>Thanks for reaching out. I'd love to explore how we can work together.</p>
                    {/* <p>Are you available this week for a quick call? Let me know what works for you.</p> */}
                    <p className="text-neutral-400 text-[10px] pt-1">Best,<br />Your Name</p>
                  </div>
                </div>

                {/* Card Control Buttons Footer segment */}
                <div className="flex items-center gap-2 pt-4 border-t border-neutral-800/40 mt-4">
                  <button className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] font-medium py-2 rounded-lg border border-neutral-800 transition-colors">
                    Edit
                  </button>
                  <button className="flex-1 bg-[#00D062] hover:bg-[#00b354] text-black text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all">
                    <Send size={11} strokeWidth={2.5} /> Send
                  </button>
                </div>
              </div>

              {/* Mobile Phone Simulation Alerts Card Module */}
              <div className="bg-[#121413] border border-neutral-800/80 rounded-xl p-3.5 flex gap-3 items-start shadow-xl self-stretch">
                <div className="w-6 h-6 rounded-full bg-[#00D062]/10 text-[#00D062] flex items-center justify-center shrink-0 border border-[#00D062]/20 mt-0.5">
                  <Smartphone size={13} />
                </div>
                <div className="flex-1 min-w-0 text-[11px]">
                  <div className="flex justify-between items-center gap-2 text-neutral-400">
                    <h4 className="font-semibold text-white text-xs">Important email</h4>
                    <span className="font-mono text-[9px] text-neutral-500">9:41 AM</span>
                  </div>
                  <p className="text-neutral-300 truncate mt-0.5">Partnership opportunity from Alex Carter</p>
                  <span className="text-[10px] text-neutral-500 font-medium block mt-1 cursor-pointer hover:text-white transition-colors">
                    Tap to view email
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ========================================================
            FOUR-COLUMN SYSTEM CAPSULE FOOTER MODULE
           ======================================================== */}
        <div className="bg-[#121413]/40 border border-neutral-800/50 rounded-2xl p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-6 items-center shadow-xl">
          
          {/* Capsule Item 1 */}
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800/80 text-[#00D062] flex items-center justify-center shrink-0">
              <Archive size={14} />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold">Inbox that's under control</h4>
              <p className="text-[10px] text-neutral-500 mt-0.5">Clean, labeled, and easy to scan.</p>
            </div>
          </div>

          {/* Capsule Item 2 */}
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800/80 text-[#00D062] flex items-center justify-center shrink-0">
              <PenSquare size={14} />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold">Replies, ready to send</h4>
              <p className="text-[10px] text-neutral-500 mt-0.5">Drafted in your voice and tone.</p>
            </div>
          </div>

          {/* Capsule Item 3 */}
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800/80 text-[#00D062] flex items-center justify-center shrink-0">
              <MessageSquare size={14} />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold">Never miss what matters</h4>
              <p className="text-[10px] text-neutral-500 mt-0.5">Important emails, texted to you.</p>
            </div>
          </div>

          {/* Capsule Item 4 */}
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800/80 text-[#00D062] flex items-center justify-center shrink-0">
              <Lock size={14} />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold">Your data stays private</h4>
              <p className="text-[10px] text-neutral-500 mt-0.5">Secure, confidential, always.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}