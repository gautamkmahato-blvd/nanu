import React from 'react';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  Users, 
  RefreshCw, 
  Search, 
  Send, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export default function CalendarAssistantSection() {
  return (
    <div className="bg-[#070908] text-white font-sans antialiased selection:bg-[#00D062] selection:text-black min-h-screen py-20 px-6 relative overflow-hidden flex items-center justify-center">
      
      {/* Background ambient deep green atmosphere glow layer */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#00D062]/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto relative z-10">
        
        {/* Main Content Splits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-16">
          
          {/* ========================================================
              LEFT COLUMN: MARKETING DESCRIPTIVES
             ======================================================== */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Calendar Assistant Pill Badge */}
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#00D062] tracking-wider uppercase bg-[#00D062]/5 border border-[#00D062]/20 px-3 py-1.5 rounded-full">
              <Calendar size={13} />
              <span>Calendar Assistant</span>
            </div>

            {/* Typography Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-4xl font-normal tracking-tight text-white leading-[1.1]">
              I schedule your meetings, and <br />
              <span className="text-[#00D062] font-medium">manage your calendar.</span>
            </h1>

            {/* Sub-description copy text paragraph */}
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-md">
              I find a time that works, send the invite, and reschedule when plans change. No more back-and-forth.
            </p>

            {/* Functional feature bullet rows layout */}
            <div className="space-y-6 pt-4 border-t border-neutral-900">
              
              {/* Feature Bullet 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">Find the right time</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                    I check availability across calendars and time zones to find the best slot.
                  </p>
                </div>
              </div>

              {/* Feature Bullet 2 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <Send size={15} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">Send the invite</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                    I write the invite, add details, and send it on your behalf.
                  </p>
                </div>
              </div>

              {/* Feature Bullet 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-[#00D062] flex items-center justify-center shrink-0 mt-0.5">
                  <RefreshCw size={14} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">Reschedule with ease</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                    Plans change — I handle the updates and keep everyone in the loop.
                  </p>
                </div>
              </div>

            </div>

            {/* Main Action Trigger Link Button */}
            {/* <div className="pt-4">
              <button className="flex items-center gap-2 bg-[#00D062] hover:bg-[#00b354] text-black font-semibold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-[#00D062]/10 transition-all transform hover:scale-[1.01]">
                Let me handle your calendar <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div> */}

          </div>

          {/* ========================================================
              RIGHT COLUMN: PROCESS FLOW BENCHMARK ARCHITECTURE
             ======================================================== */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-6 relative min-h-[580px]">
            
            {/* Absolute Precision SVG Dotted Vector Paths Layer */}
            <svg className="absolute inset-0 w-full h-full text-[#00D062] pointer-events-none hidden sm:block overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00D062" />
                </marker>
              </defs>

              {/* Path 1: From Calendar (Left edge) up & left, pointing right into "Finding the best time" */}
              <path 
                d="M 430 110 C 350 110, 360 50, 404 50" 
                stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5"
                markerEnd="url(#arrow)" 
              />

              {/* Path 2: From "Managing changes" (Right edge) right & up, pointing right into "Everyone's up to date" */}
              <path 
                d="M 390 480 C 425 480, 410 420, 434 420" 
                stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5"
                markerEnd="url(#arrow)" 
              />

              {/* Path 3: From "Everyone's up to date" (Left edge) looping up into Calendar (Bottom/Left area) */}
              <path 
                d="M 430 380 C 400 350, 470 300, 480 250" 
                stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5"
                markerEnd="url(#arrow)" 
              />
            </svg>

            {/* Left Column Stack: Interactive Operational Process States */}
            <div className="sm:col-span-7 space-y-5 z-10">
              
              {/* Process Card 1: Finding the best time */}
              <div id="card-finding" className="bg-[#121413] border border-neutral-800/80 rounded-xl p-4 shadow-xl">
                <div className="flex gap-3 items-start mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#00D062]/10 text-[#00D062] flex items-center justify-center shrink-0">
                    <Search size={14} />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-semibold">Finding the best time</h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Checking availability across calendars...</p>
                  </div>
                </div>

                {/* Simulated Calendar Rows Options slot stack */}
                <div className="space-y-2 text-[11px]">
                  {/* Selected Item */}
                  <div className="flex items-center justify-between bg-[#00D062]/5 border border-[#00D062]/20 rounded-lg px-3 py-2 text-[#00D062]">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#00D062] flex items-center justify-center text-black shrink-0"><Check size={9} strokeWidth={3} /></span>
                      <span className="font-medium">Tue, May 27</span>
                    </div>
                    <span className="font-mono text-[10px] bg-[#00D062]/10 px-1.5 py-0.5 rounded">10:00 AM – 10:30 AM</span>
                  </div>
                  {/* Item 2 */}
                  <div className="flex items-center justify-between bg-neutral-900/40 border border-neutral-800/60 rounded-lg px-3 py-2 text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border border-neutral-700 shrink-0" />
                      <span>Tue, May 27</span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-500">11:00 AM – 11:30 AM</span>
                  </div>
                  {/* Item 3 */}
                  <div className="flex items-center justify-between bg-neutral-900/40 border border-neutral-800/60 rounded-lg px-3 py-2 text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border border-neutral-700 shrink-0" />
                      <span>Wed, May 28</span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-500">9:30 AM – 10:00 AM</span>
                  </div>
                </div>
              </div>

              {/* Process Card 2: Sending the invite */}
              <div className="bg-[#121413] border border-neutral-800/80 rounded-xl p-4 shadow-xl">
                <div className="flex gap-3 items-start mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#00D062]/10 text-[#00D062] flex items-center justify-center shrink-0">
                    <Send size={13} />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-semibold">Sending the invite</h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Creating and sending the invite...</p>
                  </div>
                </div>

                {/* Inner Meeting Confirmation sub-panel metadata box */}
                <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-3 flex items-center justify-between gap-4">
                  <div className="space-y-1.5 text-[10px]">
                    <p className="text-white font-medium text-[11px]">Meeting with Alex</p>
                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <Calendar size={11} className="text-neutral-500" />
                      <span>Tue, May 27 • 10:00 – 10:30 AM</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <Users size={11} className="text-neutral-500" />
                      <span>Alex, You</span>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-[#00D062]/10 text-[#00D062] flex items-center justify-center shrink-0 border border-[#00D062]/20">
                    <Check size={11} strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Process Card 3: Managing changes */}
              <div id="card-changes" className="bg-[#121413] border border-neutral-800/80 rounded-xl p-4 shadow-xl">
                <div className="flex gap-3 items-start mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#00D062]/10 text-[#00D062] flex items-center justify-center shrink-0">
                    <RefreshCw size={13} />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-semibold">Managing changes</h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Rescheduling and notifying everyone...</p>
                  </div>
                </div>

                {/* Inner Alert Rescheduled success notification state box */}
                <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-3 text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#00D062] font-semibold mb-1 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D062]" /> Rescheduled to
                  </div>
                  <p className="text-neutral-300 font-medium">Thu, May 29 • 2:00 – 2:30 PM</p>
                </div>
              </div>

            </div>

            {/* Right Column Stack: Calendar Widget & Live Sync Feedback Card */}
            <div className="sm:col-span-5 flex flex-col gap-6 justify-start pt-6 sm:pt-12 z-10">
              
              {/* Calendar Days Tracker Component Card Box */}
              <div id="card-calendar" className="bg-[#121413] border border-neutral-800/80 rounded-xl p-4 shadow-2xl text-center">
                {/* Header Month Navigation control line */}
                <div className="flex items-center justify-between text-[11px] font-medium border-b border-neutral-800/40 pb-2.5 mb-3 text-neutral-300">
                  <ChevronLeft size={14} className="text-neutral-500 cursor-pointer hover:text-white" />
                  <span className="font-semibold tracking-tight text-white">May 2025</span>
                  <ChevronRight size={14} className="text-neutral-500 cursor-pointer hover:text-white" />
                </div>

                {/* Days of the Week Headers list grid row */}
                <div className="grid grid-cols-7 gap-y-2 text-[9px] font-bold text-neutral-600 uppercase tracking-wider mb-2">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>

                {/* Grid Numbers Layer list panel */}
                <div className="grid grid-cols-7 gap-y-1.5 text-[10px] font-mono font-medium text-neutral-500">
                  <span className="opacity-30">27</span><span className="opacity-30">28</span><span className="opacity-30">29</span><span className="opacity-30">30</span>
                  <span className="text-white">1</span><span className="text-white">2</span><span className="text-white">3</span>
                  <span className="text-white">4</span><span className="text-white">5</span><span className="text-white">6</span>
                  <span className="text-white">7</span><span className="text-white">8</span><span className="text-white">9</span>
                  <span className="text-white">10</span><span className="text-white">11</span><span className="text-white">12</span>
                  <span className="text-white">13</span><span className="text-white">14</span><span className="text-white">15</span>
                  <span className="text-white">16</span><span className="text-white">17</span><span className="text-white">18</span>
                  <span className="text-white">19</span><span className="text-white">20</span><span className="text-white">21</span>
                  <span className="text-white">22</span><span className="text-white">23</span><span className="text-white">24</span>
                  
                  <span className="text-white">25</span><span className="text-white">26</span>
                  {/* Highlight Active Chosen Date Pin Circle Node */}
                  <span className="bg-[#00D062] text-black rounded-full font-bold flex items-center justify-center w-5 h-5 mx-auto shadow-md">27</span>
                  <span className="text-white">28</span><span className="text-white">29</span><span className="text-white">30</span><span className="text-white">31</span>
                </div>
              </div>

              {/* Status Confirmation Flow Card bottom right */}
              <div id="card-status" className="bg-[#121413] border border-neutral-800/80 rounded-xl p-4 flex gap-3 items-start shadow-xl self-stretch transform sm:translate-y-8">
                <div className="w-6 h-6 rounded-full bg-[#00D062]/10 text-[#00D062] flex items-center justify-center shrink-0 border border-[#00D062]/20">
                  <Check size={12} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-white text-xs font-semibold">Everyone's up to date</h4>
                  <p className="text-[10px] text-neutral-400 leading-relaxed mt-0.5">
                    I've updated the invite and notified all attendees.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ========================================================
            FOUR-COLUMN SUBSIDIARY SYSTEM VALUE CAPSULE FOOTER
           ======================================================== */}
        <div className="bg-[#121413]/40 border border-neutral-800/50 rounded-2xl p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-6 items-center shadow-xl">
          
          {/* Stat Item 1 */}
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800/80 text-[#00D062] flex items-center justify-center shrink-0">
              <Clock size={14} />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold">Saves hours</h4>
              <p className="text-[10px] text-neutral-500 mt-0.5">No more back-and-forth</p>
            </div>
          </div>

          {/* Stat Item 2 */}
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800/80 text-[#00D062] flex items-center justify-center shrink-0">
              <Users size={14} />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold">Everyone in sync</h4>
              <p className="text-[10px] text-neutral-500 mt-0.5">I keep all attendees updated</p>
            </div>
          </div>

          {/* Stat Item 3 */}
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800/80 text-[#00D062] flex items-center justify-center shrink-0">
              <Calendar size={14} />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold">Always organized</h4>
              <p className="text-[10px] text-neutral-500 mt-0.5">Your calendar stays clean</p>
            </div>
          </div>

          {/* Stat Item 4 */}
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800/80 text-[#00D062] flex items-center justify-center shrink-0">
              <UserCheck size={14} />
            </div>
            <div>
              <h4 className="text-white text-xs font-semibold">Stress-free</h4>
              <p className="text-[10px] text-neutral-500 mt-0.5">I handle the details</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}