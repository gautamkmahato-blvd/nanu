// app/ai-inbox/page.tsx
// Route: /ai-inbox — the AI Priority Inbox (separate from /mails)

import { Suspense } from "react";
import AIInboxComponent from "./_components/AIInboxComponent";



export default function AIInboxPage() {
  return <Suspense fallback={<div className="bg-mail-bg h-full flex items-center justify-center text-mail-subtle text-sm">Loading...</div>}>
    <AIInboxComponent />
  </Suspense>
}

