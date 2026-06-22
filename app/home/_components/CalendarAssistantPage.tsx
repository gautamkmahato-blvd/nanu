"use client";

import React from "react";
import {
  Search,
  Send,
  RefreshCw,
  ArrowRight,
  Clock,
  Users,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Check,
  Circle,
} from "lucide-react";

/* ─────────── Process Step Card ─────────── */
function ProcessCard({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="bg-[#0d1710] border border-emerald-900/40 rounded-2xl p-4 flex items-center gap-3.5">
      <div className="w-12 h-12 rounded-full bg-emerald-900/40 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-white text-[15px] font-semibold leading-tight">{title}</p>
        <p className="text-gray-500 text-[13px] mt-0.5 leading-snug">{subtitle}</p>
      </div>
    </div>
  );
}

/* ─────────── Time Slots Card ─────────── */
function TimeSlotsCard() {
  const slots = [
    { day: "Tue, May 27", time: "10:00 AM – 10:30 AM", selected: true },
    { day: "Tue, May 27", time: "11:00 AM – 11:30 AM", selected: false },
    { day: "Wed, May 28", time: "9:30 AM – 10:00 AM", selected: false },
  ];

  return (
    <div className="bg-[#0d1710] border border-emerald-900/40 rounded-2xl p-3">
      {slots.map((slot, i) => (
        <div
          key={i}
          className={`flex items-center gap-4 px-4 py-3 rounded-xl whitespace-nowrap ${
            i === 0 ? "border border-emerald-700/40 bg-emerald-950/50" : ""
          } ${i > 0 ? "mt-1" : ""}`}
        >
          {i === 0 ? (
            <CheckCircle2 className="w-[18px] h-[18px] text-emerald-400 shrink-0" />
          ) : (
            <Circle className="w-[18px] h-[18px] text-gray-700 shrink-0" />
          )}
          <span
            className={`text-[13.5px] font-semibold ${
              i === 0 ? "text-emerald-400" : "text-gray-500"
            }`}
          >
            {slot.day}
          </span>
          <span
            className={`text-[13.5px] ml-auto ${
              i === 0 ? "text-emerald-400" : "text-gray-600"
            }`}
          >
            {slot.time}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────── Mini Calendar ─────────── */
function MiniCalendar() {
  const dayHeaders = ["S", "M", "T", "W", "T", "F", "S"];
  const weeks = [
    [27, 28, 29, 30, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31],
  ];

  return (
    <div className="bg-[#0d1710] border border-emerald-900/40 rounded-2xl p-5 w-[260px]">
      <div className="flex items-center justify-between mb-4">
        <ChevronLeft className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-400" />
        <span className="text-white text-[14px] font-semibold">May 2025</span>
        <ChevronRight className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-400" />
      </div>
      <div className="grid grid-cols-7 mb-1.5">
        {dayHeaders.map((d, i) => (
          <span key={i} className="text-center text-[11px] text-gray-600 font-semibold py-1.5">
            {d}
          </span>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day, di) => {
            const isPrev = wi === 0 && day > 20;
            const isToday = wi === 4 && day === 27;
            return (
              <span
                key={di}
                className={`text-center text-[12.5px] py-[7px] rounded-full font-medium ${
                  isToday
                    ? "bg-emerald-600 text-white"
                    : isPrev
                    ? "text-gray-700"
                    : "text-gray-300"
                }`}
              >
                {day}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ─────────── Meeting Invite Card ─────────── */
function MeetingInviteCard() {
  return (
    <div className="bg-[#0d1710] border border-emerald-900/40 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-white text-[15px] font-semibold mb-2.5">Meeting with Alex</p>
          <div className="flex items-center gap-2 text-gray-500 text-[13px] mb-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-gray-600" />
            <span>Tue, May 27 · 10:00 – 10:30 AM</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-[13px]">
            <Users className="w-3.5 h-3.5 text-gray-600" />
            <span>Alex, You</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full border-2 border-emerald-600 flex items-center justify-center shrink-0">
          <Check className="w-5 h-5 text-emerald-400" />
        </div>
      </div>
    </div>
  );
}

/* ─────────── Rescheduled Card ─────────── */
function RescheduledCard() {
  return (
    <div className="bg-[#0d1710] border border-emerald-900/40 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <CheckCircle2 className="w-[17px] h-[17px] text-emerald-400" />
        <span className="text-emerald-400 text-[13.5px] font-semibold">Rescheduled</span>
      </div>
      <p className="text-gray-500 text-[13.5px] pl-[25px]">Thu, May 29 · 2:00 – 2:30 PM</p>
    </div>
  );
}

/* ─────────── Success Card ─────────── */
function SuccessCard() {
  return (
    <div className="bg-[#0d1710] border border-emerald-900/40 rounded-2xl p-5 w-[268px]">
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-full bg-emerald-900/50 flex items-center justify-center shrink-0">
          <Check className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-white text-[14.5px] font-semibold mb-1">
            Everyone&apos;s up to date
          </p>
          <p className="text-gray-500 text-[13px] leading-relaxed">
            I&apos;ve updated the invite and notified all attendees.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Feature Bullet ─────────── */
function FeatureBullet({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full border border-emerald-800/30 bg-emerald-950/20 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-white font-semibold text-[15.5px] mb-1">{title}</p>
        <p className="text-gray-500 text-[14px] leading-[1.6] max-w-[260px]">{desc}</p>
      </div>
    </div>
  );
}

/* ─────────── Bottom Stat ─────────── */
function BottomStat({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="w-11 h-11 rounded-full border border-emerald-800/25 bg-emerald-950/15 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-white text-[14px] font-semibold">{title}</p>
        <p className="text-gray-500 text-[13px]">{desc}</p>
      </div>
    </div>
  );
}

/* ─────────── Dashed Vertical Line ─────────── */
function DashedV({ h = 24 }: { h?: number }) {
  return (
    <svg width="2" height={h} className="mx-auto block">
      <line
        x1="1" y1="0" x2="1" y2={h}
        stroke="rgba(16,185,129,0.30)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
    </svg>
  );
}

/* ─────────── Right Column SVG Connectors ─────────── */
function FlowConnectors() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      viewBox="0 0 800 1000"
      fill="none"
    >
      {/* Curve from time-slots area → calendar */}
      <path
        d="M 340 120 C 400 120, 420 80, 460 80"
        stroke="rgba(16,185,129,0.30)"
        strokeWidth="1.5"
        strokeDasharray="6 5"
      />
      {/* Curve from rescheduled area → success card */}
      <path
        d="M 340 870 C 420 870, 440 830, 460 830"
        stroke="rgba(16,185,129,0.30)"
        strokeWidth="1.5"
        strokeDasharray="6 5"
      />
    </svg>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */
export default function CalendarAssistantPage() {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        background: "radial-gradient(ellipse at 30% 10%, #0a120a 0%, #070c07 40%, #060a06 100%)",
        fontFamily: "'Inter', 'Manrope', system-ui, -apple-system, sans-serif",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 pt-14 md:pt-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-6">

          {/* ════ LEFT COLUMN ════ */}
          <div className="lg:w-[440px] xl:w-[470px] shrink-0 pt-2">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 border border-emerald-700/40 bg-emerald-950/25 rounded-full px-4 py-2 mb-10">
              <CalendarDays className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-[11px] font-bold uppercase tracking-[0.14em]">
                Calendar Assistant
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[42px] sm:text-[48px] xl:text-[54px] font-bold leading-[1.06] tracking-[-2px] mb-7">
              <span className="text-white">I schedule your meetings, and </span>
              <span className="text-emerald-400">manage your calendar.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-400 text-[17px] leading-[1.7] mb-12 max-w-[410px]">
              I find a time that works, send the invite,
              and reschedule when plans change.
              No more back-and-forth.
            </p>

            {/* Feature bullets */}
            <div className="space-y-7 mb-12">
              <FeatureBullet
                icon={<Clock className="w-5 h-5 text-emerald-400/80" />}
                title="Find the right time"
                desc="I check availability across calendars and time zones to find the best slot."
              />
              <FeatureBullet
                icon={<Send className="w-5 h-5 text-emerald-400/80" />}
                title="Send the invite"
                desc="I write the invite, add details, and send it on your behalf."
              />
              <FeatureBullet
                icon={<RefreshCw className="w-5 h-5 text-emerald-400/80" />}
                title="Reschedule with ease"
                desc="Plans change — I handle the updates and keep everyone in the loop."
              />
            </div>

            {/* CTA */}
            <button className="group inline-flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[15px] px-7 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-emerald-900/30">
              Let me handle your calendar
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* ════ RIGHT COLUMN — Positioned Flow ════ */}
          <div className="flex-1 min-w-0 lg:pt-0">
            <div className="relative" style={{ minHeight: 960 }}>

              {/* ▸ FLOW COLUMN — positioned left-center of right area */}
              <div className="absolute left-0 top-0 w-[340px]">

                {/* Step 1: Finding best time */}
                <ProcessCard
                  icon={<Search className="w-5 h-5 text-emerald-400" />}
                  title="Finding the best time"
                  subtitle="Checking availability across calendars..."
                />

                <DashedV h={20} />

                <TimeSlotsCard />

                <DashedV h={28} />

                {/* Step 2: Sending invite */}
                <ProcessCard
                  icon={<Send className="w-5 h-5 text-emerald-400" />}
                  title="Sending the invite"
                  subtitle="Creating and sending the invite..."
                />

                <DashedV h={20} />

                <MeetingInviteCard />

                <DashedV h={28} />

                {/* Step 3: Managing changes */}
                <ProcessCard
                  icon={<RefreshCw className="w-5 h-5 text-emerald-400" />}
                  title="Managing changes"
                  subtitle="Rescheduling and notifying everyone..."
                />

                <DashedV h={20} />

                <RescheduledCard />
              </div>

              {/* ▸ CALENDAR — absolute top-right */}
              <div className="hidden lg:block absolute top-[10px] right-0">
                {/* Curved dashed connector from flow to calendar */}
                <svg
                  className="absolute -left-[70px] top-[45px]"
                  width="70"
                  height="50"
                  viewBox="0 0 70 50"
                  fill="none"
                >
                  <path
                    d="M 0 50 C 20 50, 30 5, 70 5"
                    stroke="rgba(16,185,129,0.30)"
                    strokeWidth="1.5"
                    strokeDasharray="6 5"
                  />
                </svg>
                <MiniCalendar />
              </div>

              {/* ▸ SUCCESS CARD — absolute bottom-right */}
              <div className="hidden lg:block absolute bottom-[50px] right-0">
                {/* Curved dashed connector from flow to success */}
                <svg
                  className="absolute -left-[70px] top-[20px]"
                  width="70"
                  height="50"
                  viewBox="0 0 70 50"
                  fill="none"
                >
                  <path
                    d="M 0 50 C 25 50, 35 5, 70 5"
                    stroke="rgba(16,185,129,0.30)"
                    strokeWidth="1.5"
                    strokeDasharray="6 5"
                  />
                </svg>
                <SuccessCard />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Benefits Bar ── */}
      <div className="border-t border-emerald-900/25 mt-8">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <BottomStat
              icon={<Clock className="w-[18px] h-[18px] text-emerald-500/60" />}
              title="Saves hours"
              desc="No more back-and-forth"
            />
            <BottomStat
              icon={<Users className="w-[18px] h-[18px] text-emerald-500/60" />}
              title="Everyone in sync"
              desc="I keep all attendees updated"
            />
            <BottomStat
              icon={<CalendarDays className="w-[18px] h-[18px] text-emerald-500/60" />}
              title="Always organized"
              desc="Your calendar stays clean"
            />
            <BottomStat
              icon={<CheckCircle2 className="w-[18px] h-[18px] text-emerald-500/60" />}
              title="Stress-free"
              desc="I handle the details"
            />
          </div>
        </div>
      </div>
    </div>
  );
}