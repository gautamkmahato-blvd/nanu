export const MESSAGE_BODY_CACHE_PREFIX = 'mail:body';
export const THREAD_CONVERSATION_CACHE_PREFIX = 'mail:thread';
export const LABEL_THREAD_LIST_CACHE_PREFIX = 'mail:label-threads';

/** Bodies are immutable enough to cache for a day; TTL refreshes on every read/write. */
export const MESSAGE_BODY_CACHE_TTL_SECONDS = 60 * 60 * 24;

/** Thread metadata is refreshed on sync; bodies are merged separately from the body cache. */
export const THREAD_CONVERSATION_CACHE_TTL_SECONDS = 60 * 60 * 6;

/** Label thread lists are served from DB; Redis avoids repeated aggregation. */
export const LABEL_THREAD_LIST_CACHE_TTL_SECONDS = 60 * 15;
