"use client";
import {
  Zap,
  Users,
  Key,
  Shield,
  Bot,
  CalendarDays,
  Search,
  MailOpen,
  Database,
  ChevronDown,
  Compass,
  Send,
  BellRing,
  Paperclip,
  Check,
  LucideX,
  LucideLock,
  Mail,
} from 'lucide-react';

export function PricingAndFooter() {
    return (
      <div id="pricing" className="bg-[#070908] text-white font-sans antialiased selection:bg-[#CCFF00] selection:text-black min-h-screen relative overflow-hidden">
  
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#CCFF00]/[0.03] rounded-full blur-[140px] pointer-events-none" />
  
        {/* Pricing */}
        <section className="max-w-7xl mx-auto px-6 py-24 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl sm:text-5xl font-normal tracking-tight text-white mb-4">
              Start Free. <br />
              <span>Scale with Your Own Key.</span>
            </h2>
            <p className="text-sm text-neutral-400">
              No credit card required. Bring your own API key when you're ready for more.
            </p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
  
            {/* Free */}
            <div className="bg-[#141615] border border-neutral-800/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-neutral-700/50">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">Free</h3>
                    <p className="text-xs text-neutral-400 mt-1.5 min-h-[32px]">
                      Everything you need to try Context Mode and see the difference.
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center shrink-0">
                    <Zap size={14} />
                  </div>
                </div>
                <div className="my-6">
                  <span className="text-3xl font-semibold tracking-tight text-white">$0</span>
                  <span className="text-xs text-neutral-500 ml-1">forever</span>
                </div>
                <a href="/login" className="flex items-center justify-center w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-medium py-3 rounded-xl transition-all mb-8 no-underline">
                  Get Started
                </a>
                <div className="border-t border-neutral-800/60 pt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-4">Includes</p>
                  <ul className="space-y-3 text-xs text-neutral-300">
                    <li className="flex items-start gap-2.5"><span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span><span>10 AI chats per day</span></li>
                    <li className="flex items-start gap-2.5"><span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span><span>5 email sync per batch</span></li>
                    <li className="flex items-start gap-2.5"><span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span><span>AI priority inbox</span></li>
                    <li className="flex items-start gap-2.5"><span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span><span>Calendar &amp; meeting prep</span></li>
                    <li className="flex items-start gap-2.5"><span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span><span>Public booking page</span></li>
                  </ul>
                </div>
              </div>
            </div>
  
            {/* BYOK (Featured) */}
            <div className="bg-gradient-to-b from-[#1c1435] to-[#141615] border border-purple-500/40 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative shadow-2xl transition-all duration-300 transform md:-translate-y-2 hover:border-purple-400/50">
              <div className="absolute top-4 right-4 bg-[#CCFF00] text-black font-bold tracking-wider text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                Most Popular
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">BYOK</h3>
                    <p className="text-xs text-neutral-300 mt-1.5 min-h-[32px]">
                      Bring your own OpenRouter key. Unlimited everything at your own cost.
                    </p>
                  </div>
                </div>
                <div className="my-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-white">$0</span>
                  <span className="text-xs text-neutral-400">+ your API costs</span>
                </div>
                <a href="/login" className="flex items-center justify-center w-full bg-[#CCFF00] hover:bg-[#b5e000] text-black text-xs font-semibold py-3 rounded-xl transition-all mb-8 shadow-md no-underline">
                  Get Started
                </a>
                <div className="border-t border-neutral-700/30 pt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-300 mb-4">Everything in Free, plus:</p>
                  <ul className="space-y-3 text-xs text-neutral-200">
                    <li className="flex items-start gap-2.5"><span className="w-4 h-4 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span><span>Unlimited AI chats</span></li>
                    <li className="flex items-start gap-2.5"><span className="w-4 h-4 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span><span>Up to 500 email sync per batch</span></li>
                    <li className="flex items-start gap-2.5"><span className="w-4 h-4 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span><span>AES-256-GCM key encryption</span></li>
                    <li className="flex items-start gap-2.5"><span className="w-4 h-4 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span><span>Configurable sync limits</span></li>
                    <li className="flex items-start gap-2.5"><span className="w-4 h-4 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span><span>Full AI agent capabilities</span></li>
                  </ul>
                </div>
              </div>
            </div>
  
            {/* Pro */}
            <div className="bg-[#141615] border border-neutral-800/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-neutral-700/50">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">Pro</h3>
                    <p className="text-xs text-neutral-400 mt-1.5 min-h-[32px]">
                      For power users and teams who want premium support and advanced features.
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center shrink-0">
                    <Users size={14} />
                  </div>
                </div>
                <div className="my-6 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-tight text-white">$12</span>
                  <span className="text-xs text-neutral-500">/month</span>
                </div>
                <button className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-medium py-3 rounded-xl transition-all mb-8">
                  Coming Soon
                </button>
                <div className="border-t border-neutral-800/60 pt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-4">Everything in BYOK, plus:</p>
                  <ul className="space-y-3 text-xs text-neutral-300">
                    <li className="flex items-start gap-2.5"><span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span><span>No API key needed — we cover AI costs</span></li>
                    <li className="flex items-start gap-2.5"><span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span><span>Priority support</span></li>
                    <li className="flex items-start gap-2.5"><span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span><span>Advanced analytics dashboard</span></li>
                    <li className="flex items-start gap-2.5"><span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span><span>Custom AI model selection</span></li>
                    <li className="flex items-start gap-2.5"><span className="w-4 h-4 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></span><span>Team collaboration (coming soon)</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 py-12 relative z-10 mb-20">
          <div className="max-w-5xl mx-auto bg-gradient-to-b from-[#141615] to-[#0F1110] border border-neutral-800/80 rounded-2xl p-8 sm:p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div className="relative z-10 max-w-xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-white leading-tight">
                Stop Managing Email. <br />Let AI Handle It.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Join Context Mode and turn your inbox from a time sink into a productivity engine. Free forever, no credit card required.
              </p>
              <div className="pt-4">
                <a href="/login" className="inline-block bg-white text-black font-semibold text-xs px-8 py-3.5 rounded-xl hover:bg-neutral-200 transition-all shadow-md transform hover:scale-[1.01] no-underline">
                  Get Started Free
                </a>
              </div>
            </div>
          </div>
        </section>
  
        {/* Footer */}
        <footer className="border-t border-neutral-900 bg-[#0A0C0B] relative z-10 pt-16 pb-8 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 mb-16">
            <div className="space-y-4 max-w-sm">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-6 h-6 rounded-md bg-[#CCFF00] flex items-center justify-center">
                  <Zap size={12} className="text-black" />
                </div>
                <span className="font-semibold text-sm tracking-tight text-white">Context Mode</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                AI-powered email and calendar workspace. Search, act, and schedule — all from one place.
              </p>
            </div>
  
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 md:gap-16">
              <div className="space-y-4">
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">Product</h4>
                <ul className="space-y-2 text-xs text-neutral-500">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">Resources</h4>
                <ul className="space-y-2 text-xs text-neutral-500">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>
              <div className="space-y-4 col-span-2 sm:col-span-1">
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">Legal</h4>
                <ul className="space-y-2 text-xs text-neutral-500">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
  
          <div className="max-w-7xl mx-auto border-t border-neutral-900/60 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-neutral-600">
            <p>© 2026 Context Mode. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors"><LucideX size={14} /></a>
              <a href="#" className="hover:text-white transition-colors"><LucideLock size={14} /></a>
              <a href="#" className="hover:text-white transition-colors"><Mail size={14} /></a>
            </div>
          </div>
        </footer>
      </div>
    );
  }