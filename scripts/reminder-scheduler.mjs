// scripts/reminder-scheduler.mjs
// Run with PM2: pm2 start scripts/reminder-scheduler.mjs --name reminder-scheduler
// Calls the internal cron endpoint every 60 seconds.
// This script is intentionally simple — all logic lives in the cron endpoint.

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;
const INTERVAL_MS = 60_000; // 60 seconds

if (!CRON_SECRET) {
  console.error('[reminder-scheduler] CRON_SECRET env var is required');
  process.exit(1);
}

console.log(`[reminder-scheduler] started — checking every ${INTERVAL_MS / 1000}s`);
console.log(`[reminder-scheduler] target: ${BASE_URL}/api/v1/reminders/cron`);

async function tick() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/reminders/cron?secret=${CRON_SECRET}`, {
      headers: { 'x-cron-secret': CRON_SECRET },
      signal: AbortSignal.timeout(30_000), // 30s timeout
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`[reminder-scheduler] cron returned ${res.status}: ${body}`);
      return;
    }

    const data = await res.json();
    if (data.callsTriggered > 0 || data.errors?.length > 0) {
      console.log(`[reminder-scheduler] ${data.callsTriggered} calls, ${data.errors?.length ?? 0} errors`);
    }
  } catch (err) {
    console.error(`[reminder-scheduler] tick failed:`, err.message ?? err);
  }
}

// Run immediately, then every INTERVAL_MS
tick();
setInterval(tick, INTERVAL_MS);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[reminder-scheduler] shutting down');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('[reminder-scheduler] interrupted');
  process.exit(0);
});
