import CalendarAssistantSection from './_components/CalendarAssistantSection';
import InboxOrganizerSection from './_components/InboxOrganizerSection';
import EmailAssistantChatSection from './_components/EmailAssistantChatSection';
import InboxDashboardSection from './_components/InboxDashboardSection';
import SmartPriorityInboxSection from './_components/SmartPriorityInboxSection';
import CallBriefingFollowUpSection from './_components/CallBriefingFollowUpSection';
import BentoGridFeaturesPage from './_components/BentoGridFeaturesPage';
import { HeroSection } from './_components/HeroSection';
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