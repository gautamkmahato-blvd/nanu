// lib/v1/ai-agent/tools.ts
import { corsair } from '@/corsair';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OpenAITool = {
  type: 'function';
  function: { name: string; description: string; parameters: Record<string, unknown> };
};

type CorsairMcpTool = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  execute?: (args: Record<string, unknown>) => Promise<unknown>;
  [key: string]: unknown;
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let _corsairTools: CorsairMcpTool[] = [];
let _allOpenAITools: OpenAITool[] = [];
let _initialized = false;

const executorMap = new Map<string, (args: Record<string, unknown>, tenantId: string) => Promise<{ success: boolean; data: unknown; error?: string }>>();

export const DESTRUCTIVE_TOOLS = new Set<string>();

// ---------------------------------------------------------------------------
// Initialize
// ---------------------------------------------------------------------------

export async function initializeTools(hasEmailContext: boolean): Promise<OpenAITool[]> {
  if (!_initialized) {
    await loadCorsairMcpTools();
    registerCustomTools();
    _initialized = true;
  }

  if (hasEmailContext) return _allOpenAITools;
  return _allOpenAITools.filter((t) => t.function.name !== 'reply_to_email');
}

// ---------------------------------------------------------------------------
// Load Corsair MCP tools
// ---------------------------------------------------------------------------

async function loadCorsairMcpTools(): Promise<void> {
  // ALWAYS register manual tools first
  registerManualCorsairTools();

  // Then TRY to load Corsair MCP tools alongside (optional extras)
  try {
    const { AnthropicProvider } = await import('@corsair-dev/mcp');
    const provider = new AnthropicProvider();
    const tools = provider.build({ corsair });

    _corsairTools = tools as CorsairMcpTool[];
    console.log(`[ai-agent] also loaded ${_corsairTools.length} Corsair MCP tools: ${_corsairTools.map((t) => t.name).join(', ')}`);

    for (const tool of _corsairTools) {
      _allOpenAITools.push({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description ?? '',
          parameters: tool.input_schema ?? { type: 'object', properties: {} },
        },
      });

      if (typeof tool.execute === 'function') {
        const execFn = tool.execute.bind(tool);
        executorMap.set(tool.name, async (args) => {
          try {
            const result = await execFn(args);
            return { success: true, data: result };
          } catch (err) {
            return { success: false, data: null, error: err instanceof Error ? err.message : 'Corsair tool failed' };
          }
        });
      }
    }

    if (_corsairTools.some((t) => t.name === 'run_script')) {
      DESTRUCTIVE_TOOLS.add('run_script');
    }
  } catch (err) {
    // Manual tools already registered above — nothing else needed
    console.log('[ai-agent] @corsair-dev/mcp not available, using manual tools only');
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureISO(d: string): string {
  try {
    const parsed = new Date(d.includes('T') ? d : d + 'T00:00:00');
    if (isNaN(parsed.getTime())) {
      throw new Error('invalid');
    }
    return parsed.toISOString();
  } catch {
    throw new Error(`Could not parse date "${d}". Please use a format like "2026-06-17" or "2026-06-17T10:00:00".`);
  }
}

// ---------------------------------------------------------------------------
// Manual Corsair tools
// ---------------------------------------------------------------------------

function registerManualCorsairTools(): void {
  const manualTools: { def: OpenAITool; exec: (args: Record<string, unknown>, tenantId: string) => Promise<{ success: boolean; data: unknown; error?: string }> }[] = [
    {
      def: {
        type: 'function',
        function: {
          name: 'send_email',
          description: 'Send a new email to recipients.',
          parameters: {
            type: 'object',
            properties: {
              to: { type: 'array', items: { type: 'string' }, description: 'Recipient emails' },
              subject: { type: 'string', description: 'Subject line' },
              body: { type: 'string', description: 'Email body' },
              cc: { type: 'array', items: { type: 'string' }, description: 'CC emails' },
            },
            required: ['to', 'subject', 'body'],
          },
        },
      },
      exec: async (args, tenantId) => {
        const { sendEmail } = await import('@/app/service/v1/sendEmail');
        const result = await sendEmail({ to: args.to as string[], subject: args.subject as string, body: args.body as string, cc: (args.cc as string[]) ?? [] }, tenantId);
        return { success: true, data: { messageId: result.id, threadId: result.threadId } };
      },
    },
    {
      def: {
        type: 'function',
        function: {
          name: 'create_event',
          description: 'Create a Google Calendar event with optional Google Meet link.',
          parameters: {
            type: 'object',
            properties: {
              summary: { type: 'string', description: 'Event title' },
              startDateTime: { type: 'string', description: 'Start time as ISO 8601 string (e.g., "2026-06-17T10:00:00")' },
              endDateTime: { type: 'string', description: 'End time as ISO 8601 string (e.g., "2026-06-17T11:00:00")' },
              attendeeEmails: { type: 'array', items: { type: 'string' }, description: 'Attendee emails' },
              description: { type: 'string', description: 'Event description' },
              includeMeet: { type: 'boolean', description: 'Auto-generate Google Meet link' },
            },
            required: ['summary', 'startDateTime', 'endDateTime'],
          },
        },
      },
      exec: async (args, tenantId) => {
        const { corsair: c } = await import('@/corsair');
        const tenant = c.withTenant(tenantId);
        const attendees = ((args.attendeeEmails as string[]) ?? []).filter((e) => e.includes('@')).map((email) => ({ email }));
        const startISO = ensureISO(args.startDateTime as string);
        const endISO = ensureISO(args.endDateTime as string);
        const eventBody: Record<string, unknown> = { summary: args.summary, start: { dateTime: startISO }, end: { dateTime: endISO }, attendees };
        if (args.description) eventBody.description = args.description;
        const createParams: Record<string, unknown> = { calendarId: 'primary', sendUpdates: 'all', event: eventBody };
        if (args.includeMeet) {
          createParams.conferenceDataVersion = 1;
          eventBody.conferenceData = { createRequest: { requestId: `agent-${Date.now()}`, conferenceSolutionKey: { type: 'hangoutsMeet' } } };
        }
        const event = await tenant.googlecalendar.api.events.create(createParams as Parameters<typeof tenant.googlecalendar.api.events.create>[0]);
        return { success: true, data: { eventId: (event as Record<string, unknown>).id, hangoutLink: (event as Record<string, unknown>).hangoutLink } };
      },
    },
    {
      def: {
        type: 'function',
        function: {
          name: 'check_availability',
          description: 'Check calendar free/busy slots for a date range.',
          parameters: {
            type: 'object',
            properties: {
              startDate: { type: 'string', description: 'Start date as ISO 8601 string (e.g., "2026-06-17T00:00:00")' },
              endDate: { type: 'string', description: 'End date as ISO 8601 string (e.g., "2026-06-18T00:00:00")' },
            },
            required: ['startDate', 'endDate'],
          },
        },
      },
      exec: async (args, tenantId) => {
        const { getAvailability } = await import('@/lib/v1/calendar/availability');
        const startDate = ensureISO(args.startDate as string);
        const endDate = ensureISO(args.endDate as string);
        const result = await getAvailability(startDate, endDate, tenantId);
        return { success: true, data: { free: result.free?.slice(0, 10), busy: result.busy?.slice(0, 10) } };
      },
    },
    {
      def: {
        type: 'function',
        function: {
          name: 'search_calendar',
          description: 'Search past and upcoming Google Calendar events. Can filter by attendee email to find meetings with a specific person.',
          parameters: {
            type: 'object',
            properties: {
              attendeeEmail: { type: 'string', description: 'Filter events that include this attendee email (optional)' },
              query: { type: 'string', description: 'Search text to match event titles (optional)' },
              daysBack: { type: 'number', description: 'How many days in the past to search. Default 30.' },
              daysForward: { type: 'number', description: 'How many days ahead to search. Default 7.' },
            },
            required: [],
          },
        },
      },
      exec: async (args, tenantId) => {
        const { corsair: c } = await import('@/corsair');
        const tenant = c.withTenant(tenantId);

        const daysBack = (args.daysBack as number) ?? 30;
        const daysForward = (args.daysForward as number) ?? 7;
        const now = new Date();
        const timeMin = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000).toISOString();
        const timeMax = new Date(now.getTime() + daysForward * 24 * 60 * 60 * 1000).toISOString();

        const params: Record<string, unknown> = {
          calendarId: 'primary',
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 50,
        };
        if (args.query) params.q = args.query;

        const response = await tenant.googlecalendar.api.events.getMany(
          params as Parameters<typeof tenant.googlecalendar.api.events.getMany>[0],
        );

        let events = ((response as Record<string, unknown>).items as Record<string, unknown>[]) ?? [];

        const attendeeEmail = (args.attendeeEmail as string)?.toLowerCase();
        if (attendeeEmail) {
          events = events.filter((ev) => {
            const attendees = (ev.attendees as { email: string }[]) ?? [];
            const organizer = (ev.organizer as { email: string })?.email ?? '';
            return attendees.some((a) => a.email.toLowerCase() === attendeeEmail) ||
                   organizer.toLowerCase() === attendeeEmail;
          });
        }

        return {
          success: true,
          data: {
            count: events.length,
            events: events.slice(0, 10).map((ev) => ({
              title: ev.summary ?? '(no title)',
              start: (ev.start as Record<string, unknown>)?.dateTime ?? (ev.start as Record<string, unknown>)?.date ?? '',
              end: (ev.end as Record<string, unknown>)?.dateTime ?? (ev.end as Record<string, unknown>)?.date ?? '',
              attendees: ((ev.attendees as { email: string; displayName?: string }[]) ?? []).map((a) => a.displayName ?? a.email),
              hangoutLink: ev.hangoutLink ?? null,
              status: ev.status ?? 'confirmed',
            })),
          },
        };
      },
    },
  ];

  for (const { def, exec } of manualTools) {
    _allOpenAITools.push(def);
    executorMap.set(def.function.name, exec);
    if (['send_email', 'create_event'].includes(def.function.name)) {
      DESTRUCTIVE_TOOLS.add(def.function.name);
    }
  }
}

// ---------------------------------------------------------------------------
// Custom tools
// ---------------------------------------------------------------------------

function registerCustomTools(): void {
  _allOpenAITools.push({
    type: 'function',
    function: {
      name: 'search_inbox',
      description: 'Search the user\'s email inbox using AI. Finds emails by topic, sender, content, sentiment.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Natural language search query' } },
        required: ['query'],
      },
    },
  });
  executorMap.set('search_inbox', async (args, tenantId) => {
    const { handleChatQuery } = await import('@/lib/v1/ai-chat');
    const result = await handleChatQuery(args.query as string, { tenantId });
    return {
      success: true,
      data: {
        answer: result.answer,
        emailCount: result.emails.length,
        emails: result.emails.slice(0, 5),
      },
    };
  });

  _allOpenAITools.push({
    type: 'function',
    function: {
      name: 'reply_to_email',
      description: 'Reply to the current email thread.',
      parameters: {
        type: 'object',
        properties: {
          body: { type: 'string', description: 'Reply body text' },
          mode: { type: 'string', enum: ['reply', 'replyAll'], description: 'Reply or reply all' },
        },
        required: ['body'],
      },
    },
  });

  DESTRUCTIVE_TOOLS.add('send_email');
  DESTRUCTIVE_TOOLS.add('reply_to_email');
  DESTRUCTIVE_TOOLS.add('create_event');
}

// ---------------------------------------------------------------------------
// Execute
// ---------------------------------------------------------------------------

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  emailContext?: { threadId?: string },
  tenantId = 'default',
): Promise<{ success: boolean; data: unknown; error?: string }> {
  if (name === 'reply_to_email') {
    if (!emailContext?.threadId) return { success: false, data: null, error: 'No email context — cannot reply' };
    const { replyToThread } = await import('@/app/service/v1/sendEmail');
    const result = await replyToThread(emailContext.threadId, { body: args.body as string, mode: (args.mode as 'reply' | 'replyAll') ?? 'reply' }, tenantId);
    return { success: true, data: { messageId: result.id, threadId: result.threadId } };
  }

  const exec = executorMap.get(name);
  if (!exec) return { success: false, data: null, error: `Unknown tool: ${name}` };

  try {
    return await exec(args, tenantId);
  } catch (err) {
    return { success: false, data: null, error: err instanceof Error ? err.message : 'Execution failed' };
  }
}

// ---------------------------------------------------------------------------
// Preview
// ---------------------------------------------------------------------------

export function generatePreview(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case 'send_email': {
      const to = (args.to as string[])?.join(', ') ?? '?';
      const subject = (args.subject as string) ?? '(no subject)';
      const body = ((args.body as string) ?? '').slice(0, 200);
      return `📧 Send Email\nTo: ${to}\nSubject: ${subject}\n\n${body}${body.length >= 200 ? '...' : ''}`;
    }
    case 'reply_to_email': {
      const body = ((args.body as string) ?? '').slice(0, 200);
      return `↩️ ${(args.mode as string) === 'replyAll' ? 'Reply All' : 'Reply'}\n\n${body}${body.length >= 200 ? '...' : ''}`;
    }
    case 'create_event': {
      const summary = (args.summary as string) ?? 'Meeting';
      const start = (args.startDateTime as string) ?? '';
      const attendees = (args.attendeeEmails as string[])?.join(', ') ?? 'none';
      return `📅 Create Event\nTitle: ${summary}\nTime: ${start}\nAttendees: ${attendees}${args.includeMeet ? '\n📹 Google Meet' : ''}`;
    }
    case 'run_script': {
      const op = (args.operation as string) ?? (args.name as string) ?? 'unknown';
      return `⚡ Corsair: ${op}\nArgs: ${JSON.stringify(args).slice(0, 150)}`;
    }
    default:
      return `Execute: ${name}\n${JSON.stringify(args).slice(0, 150)}`;
  }
}

const TOOL_TIMEOUT_MS = 30_000;

export async function executeToolWithTimeout(
  name: string,
  args: Record<string, unknown>,
  emailContext?: { threadId?: string },
  tenantId = 'default',
): Promise<{ success: boolean; data: unknown; error?: string }> {
  try {
    return await Promise.race([
      executeTool(name, args, emailContext, tenantId),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Tool '${name}' timed out after 30s`)), TOOL_TIMEOUT_MS)
      ),
    ]);
  } catch (err) {
    return { success: false, data: null, error: err instanceof Error ? err.message : 'Tool execution failed' };
  }
}