
"use client";

import {
    Key,
    Shield,
    Send,
    BellRing,
    Sparkles,
    Calendar,
    Clock,
    Star,
  } from 'lucide-react';


export function FeaturesAndTestimonials() {
    return (
      <div id="features" className="bg-[#070908] text-white font-sans min-h-screen py-24 px-6 relative overflow-hidden selection:bg-[#CCFF00] selection:text-black">
  
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#CCFF00]/5 rounded-full blur-[120px] pointer-events-none" />
  
        {/* Features */}
        <section className="max-w-7xl mx-auto mb-32 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-normal tracking-tight text-white mb-4 leading-tight">
              Your Email, <br />
              <span>Supercharged by AI.</span>
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              AI that doesn't just summarize — it searches, acts, and schedules.
              Everything your inbox should have been from the start.
            </p>
          </div>
  
          <div className="space-y-6">
            {/* Top Row: 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  
              {/* AI Agent */}
              <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-6 flex flex-col justify-between group hover:border-neutral-700/60 transition-all duration-300">
                <div className="bg-[#0F1110] border border-neutral-800/80 rounded-lg p-4 mb-8 relative min-h-[160px] overflow-hidden">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800/40">
                    <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
                    <span className="text-[10px] text-neutral-400 font-mono">AI Agent</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-neutral-900/60 p-2 rounded text-[10px] text-neutral-300">"Send a follow-up to Sarah about the proposal"</div>
                    <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded p-2.5">
                      <div className="flex items-center gap-1.5 text-[#CCFF00] text-[10px] font-medium mb-1">
                        <Send size={10} /> Ready to send
                      </div>
                      <p className="text-[10px] text-neutral-300">Draft: "Hi Sarah, just checking in on the proposal we discussed..."</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm mb-1.5">AI Agent That Acts</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Send emails, schedule meetings, and search your inbox — all through natural conversation.
                  </p>
                </div>
              </div>
  
              {/* Priority Inbox */}
              <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-6 flex flex-col justify-between group hover:border-neutral-700/60 transition-all duration-300">
                <div className="bg-[#0F1110] border border-neutral-800/80 rounded-lg p-4 mb-8 min-h-[160px] flex flex-col justify-center">
                  <div className="text-[11px] text-neutral-400 mb-3 px-1 font-medium">Priority Detection</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 font-medium px-2.5 py-1 rounded-md">Urgent · 3</span>
                    <span className="text-[10px] bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 font-medium px-2.5 py-1 rounded-md">Opportunity · 4</span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium px-2.5 py-1 rounded-md">Follow-up · 2</span>
                    <span className="text-[10px] bg-neutral-800/80 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-700/40">Info · 10</span>
                  </div>
                  <div className="mt-4 border-t border-neutral-800/60 pt-3 flex items-center gap-2 px-1">
                    <Sparkles size={12} className="text-[#CCFF00]" />
                    <span className="text-[10px] text-neutral-400">AI scores every email by urgency, risk &amp; opportunity</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm mb-1.5">Smart Priority Inbox</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    AI analyzes every email for urgency, opportunity, and risk — so you always know what needs attention first.
                  </p>
                </div>
              </div>
  
              {/* Meeting Prep */}
              <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-6 flex flex-col justify-between group hover:border-neutral-700/60 transition-all duration-300">
                <div className="bg-[#0F1110] border border-neutral-800/80 rounded-lg p-4 mb-8 min-h-[160px] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 border-b border-neutral-800/40 pb-2">
                    <span className="flex items-center gap-1.5"><Calendar size={11} /> Meeting Prep</span>
                    <span>In 30 min</span>
                  </div>
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded p-2.5 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#CCFF00] rounded-l" />
                    <p className="text-[11px] text-white font-medium">Q4 Planning Sync</p>
                    <p className="text-[9px] text-neutral-500 mt-0.5">3 attendees · AI brief ready</p>
                  </div>
                  <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded p-2 mt-2">
                    <p className="text-[9px] text-[#CCFF00]">💡 Sarah mentioned budget concerns in her last 3 emails. Lead with ROI data.</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm mb-1.5">AI Meeting Prep</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Get AI-generated briefs with talking points pulled from your actual email history with each attendee.
                  </p>
                </div>
              </div>
            </div>
  
            {/* Bottom Row: 2 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  
              {/* Scheduled Emails */}
              <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center justify-between group hover:border-neutral-700/60 transition-all duration-300">
                <div className="flex-1 order-2 sm:order-1">
                  <h3 className="text-white font-medium text-sm mb-1.5">Schedule Send &amp; Follow-ups</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                    Write now, send later. Set automatic follow-ups that cancel themselves if a reply arrives.
                  </p>
                </div>
                <div className="w-full sm:w-64 bg-[#0F1110] border border-neutral-800/80 rounded-lg p-3.5 order-1 sm:order-2 shrink-0">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block mb-2.5">Scheduled</span>
                  <div className="space-y-1.5">
                    <div className="w-full flex items-center gap-2 bg-neutral-900 border border-neutral-800 text-left text-[10px] text-neutral-300 p-2 rounded">
                      <Clock size={12} className="text-[#CCFF00]" />
                      <div>
                        <span className="block">Re: Proposal update</span>
                        <span className="text-[9px] text-neutral-500">Tomorrow 9:00 AM</span>
                      </div>
                    </div>
                    <div className="w-full flex items-center gap-2 bg-neutral-900 border border-neutral-800 text-left text-[10px] text-neutral-300 p-2 rounded">
                      <BellRing size={12} className="text-amber-400" />
                      <div>
                        <span className="block">Follow-up: Invoice #4521</span>
                        <span className="text-[9px] text-neutral-500">Auto-sends if no reply in 48h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* BYOK */}
              <div className="bg-[#141615] border border-neutral-800/60 rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center justify-between group hover:border-neutral-700/60 transition-all duration-300">
                <div className="flex-1 order-2 sm:order-1">
                  <h3 className="text-white font-medium text-sm mb-1.5">Bring Your Own Key</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                    Use your own OpenRouter API key for unlimited AI chats and higher sync limits. Your key, your costs, full control.
                  </p>
                </div>
                <div className="w-full sm:w-64 bg-[#0F1110] border border-neutral-800/80 rounded-lg p-3.5 order-1 sm:order-2 shrink-0">
                  <div className="flex items-center justify-between text-[10px] border-b border-neutral-800/40 pb-2 mb-2.5 text-neutral-400">
                    <span className="flex items-center gap-1.5"><Key size={11} /> API Key</span>
                    <Shield size={11} />
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] bg-neutral-900/50 p-2 rounded border border-neutral-800/40">
                      <div className="text-[#CCFF00] text-[9px] font-medium mb-0.5">AES-256-GCM Encrypted</div>
                      <p className="text-neutral-400 text-[9px] font-mono">sk-or-v1-ab••••••••xyz9</p>
                    </div>
                    <div className="flex gap-1 justify-end">
                      <span className="text-[8px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">Unlimited Chats</span>
                      <span className="text-[8px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">500 Sync</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* Testimonials */}
        <section className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-white mb-3">
              Built for People Who Live in Their Inbox
            </h2>
            <p className="text-sm text-neutral-400">
              From founders to freelancers — Context Mode transforms how you handle email.
            </p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-[#141615] border border-neutral-800/60 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-4 text-[#CCFF00]">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
                <h4 className="text-white text-sm font-medium mb-2 leading-snug">"I cleared 200 emails in 15 minutes."</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  The AI priority inbox tells me exactly what needs my attention. I skip the noise and focus on what matters. The meeting prep feature alone saves me an hour every day.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-neutral-800/40">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-300">AP</div>
                <div>
                  <p className="text-xs text-white font-medium">Arjun P.</p>
                  <p className="text-[10px] text-neutral-500">Startup Founder</p>
                </div>
              </div>
            </div>
  
            <div className="bg-[#141615] border border-neutral-800/60 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-4 text-[#CCFF00]">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
                <h4 className="text-white text-sm font-medium mb-2 leading-snug">"The AI agent is like having a personal assistant."</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  I just type "schedule a meeting with John about the Q4 budget" and it checks my calendar, finds a free slot, and creates the event. It's magical.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-neutral-800/40">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-300">SK</div>
                <div>
                  <p className="text-xs text-white font-medium">Sneha K.</p>
                  <p className="text-[10px] text-neutral-500">Product Manager</p>
                </div>
              </div>
            </div>
  
            <div className="bg-[#141615] border border-neutral-800/60 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-4 text-[#CCFF00]">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
                <h4 className="text-white text-sm font-medium mb-2 leading-snug">"BYOK means I'm not locked into anyone's pricing."</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  I plugged in my own OpenRouter key and got unlimited AI features instantly. No subscription tiers, no upsells. Just bring your key and go.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-neutral-800/40">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-300">RV</div>
                <div>
                  <p className="text-xs text-white font-medium">Rahul V.</p>
                  <p className="text-[10px] text-neutral-500">Freelance Developer</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }