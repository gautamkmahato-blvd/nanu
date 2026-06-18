// lib/v1/meeting-prep/step5-deduplicate.ts
// Step 5: Deduplicate emails across attendees, cap per-attendee and total.

import type {
  MeetingSearchResults, MeetingEmailBundles,
  AttendeeBundledEmails, DeduplicatedEmail, StepResult,
} from './types';

const MAX_PER_ATTENDEE = 5;
const MAX_PER_MEETING = 10;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function deduplicateAndCap(searchResults: MeetingSearchResults[]): StepResult<MeetingEmailBundles[]> {
  try {
    const results: MeetingEmailBundles[] = [];

    for (const sr of searchResults) {
      const bundles = deduplicateMeeting(sr);
      results.push(bundles);
    }

    return { ok: true, data: results };
  } catch (err) {
    return { ok: false, error: `Step 5 failed: ${err instanceof Error ? err.message : 'Unknown'}` };
  }
}

// ---------------------------------------------------------------------------
// Sub-step 5a: Deduplicate for a single meeting
// ---------------------------------------------------------------------------

function deduplicateMeeting(sr: MeetingSearchResults): MeetingEmailBundles {
  // Build a global map: emailId → DeduplicatedEmail
  const globalMap = new Map<string, DeduplicatedEmail>();

  for (const attendeeResult of sr.attendeeResults) {
    for (const email of attendeeResult.emails) {
      const existing = globalMap.get(email.id);

      if (existing) {
        // Email already seen — add this attendee to relevantToAttendees
        if (!existing.relevantToAttendees.includes(attendeeResult.attendeeEmail)) {
          existing.relevantToAttendees.push(attendeeResult.attendeeEmail);
        }
        // Keep the higher score
        if (email.finalScore > existing.finalScore) {
          globalMap.set(email.id, {
            ...email,
            relevantToAttendees: existing.relevantToAttendees,
          });
        }
      } else {
        globalMap.set(email.id, {
          ...email,
          relevantToAttendees: [attendeeResult.attendeeEmail],
        });
      }
    }
  }

  // Sort all emails by score
  const allEmails = Array.from(globalMap.values())
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, MAX_PER_MEETING); // global cap

  // Build per-attendee bundles
  const attendeeBundles = buildAttendeeBundles(sr, allEmails);

  return {
    meeting: sr.meeting,
    attendeeBundles,
    allEmails,
    totalRetrieved: allEmails.length,
  };
}

// ---------------------------------------------------------------------------
// Sub-step 5b: Build per-attendee email bundles from global pool
// ---------------------------------------------------------------------------

function buildAttendeeBundles(
  sr: MeetingSearchResults,
  allEmails: DeduplicatedEmail[]
): AttendeeBundledEmails[] {
  return sr.attendeeResults.map((ar) => {
    // Get emails relevant to this attendee, capped
    const attendeeEmails = allEmails
      .filter((e) => e.relevantToAttendees.includes(ar.attendeeEmail))
      .slice(0, MAX_PER_ATTENDEE);

    return {
      attendeeEmail: ar.attendeeEmail,
      attendeeName: ar.attendeeName,
      emails: attendeeEmails,
    };
  });
}
