import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Map,
  Layers,
  FileText,
  Leaf,
  Download,
  Plus,
  Filter,
  Maximize2,
  X,
  LucideX,
  LucideLock,
  Mic2,
  CheckSquare,
} from 'lucide-react';
import {
  Sparkles,
  Inbox,
  Calendar,
  CornerDownRight,
  CheckCircle2,
  PenTool,
  Sliders,
  ArrowLeft,
  ArrowRight,
  Star
} from 'lucide-react';
import {
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  UserCheck,
  BarChart3,
  Grid,
  Copy,
  Terminal,
  CircleDollarSign
} from 'lucide-react';
import {
  CheckCircle,
  MessageSquare,
  Clock,
  Mail,
  Check,
  ChevronRight
} from 'lucide-react';
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
} from 'lucide-react';
import {
  Mic,
  CircleCheck,
} from "lucide-react";
import CalendarAssistantPage from './_components/CalendarAssistantPage';
import CalendarAssistantSection from './_components/CalendarAssistantSection';
import InboxOrganizerSection from './_components/InboxOrganizerSection';
import EmailAssistantChatSection from './_components/EmailAssistantChatSection';
import InboxDashboardSection from './_components/InboxDashboardSection';
import SmartPriorityInboxSection from './_components/SmartPriorityInboxSection';
import CallBriefingFollowUpSection from './_components/CallBriefingFollowUpSection';
import BentoGridFeatures from './_components/BentoGridFeatures';
import BentoGridFeaturesPage from './_components/BentoGridFeaturesPage';
import { HeroSection } from './_components/HeroSection';
import { FeaturesAndTestimonials } from './_components/FeaturesAndTestimonials';
import { PricingAndFooter } from './_components/PricingAndFooter';



export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <BentoGridFeaturesPage />
      <CalendarAssistantSection />
      <InboxOrganizerSection />
      <EmailAssistantChatSection />
      <InboxDashboardSection />
      <SmartPriorityInboxSection />
      <CallBriefingFollowUpSection />
      
      <PricingAndFooter />
    </div>
  );
}