import { db } from './db';

const ANON_LIFETIME_QUOTA = Number(process.env.ANON_LIFETIME_QUOTA ?? 2);
const USER_DAILY_QUOTA = Number(process.env.USER_DAILY_QUOTA ?? 10);

const anonKey = (ip: string) => `anon:${ip}`;
const userKey = (userId: string) => `user:${userId}`;

type QuotaRow = { used_count: number };

/**
 * Check anonymous quota WITHOUT consuming.
 * Anon users have a lifetime cap (no reset).
 */
export async function checkAnonQuota(ip: string): Promise<{
    success: boolean;
    remaining: number;
    limit: number;
}> {
    const { rows } = await db.query<QuotaRow>(
        'SELECT used_count FROM ai_quota WHERE identity_key = $1',
        [anonKey(ip)]
    );
    const used = rows[0]?.used_count ?? 0;
    const remaining = Math.max(0, ANON_LIFETIME_QUOTA - used);
    return {
        success: used < ANON_LIFETIME_QUOTA,
        remaining,
        limit: ANON_LIFETIME_QUOTA,
    };
}

/**
 * Increment the anonymous quota counter. Called only after a successful
 * generation, so failures don't burn the free preview.
 */
export async function consumeAnonQuota(ip: string): Promise<void> {
    await db.query(
        `INSERT INTO ai_quota (identity_key, used_count, window_starts_at, updated_at)
         VALUES ($1, 1, NULL, now())
         ON CONFLICT (identity_key) DO UPDATE
         SET used_count = ai_quota.used_count + 1,
             updated_at = now()`,
        [anonKey(ip)]
    );
}

/**
 * Atomic check-and-consume for signed-in users.
 * Uses a 24h sliding window: if the existing window is older than 24h,
 * the counter resets to 1 (this call). Otherwise the counter increments.
 *
 * Returns success=false when the user is already over the daily cap;
 * the row is left untouched in that case.
 */
export async function consumeUserDaily(userId: string): Promise<{
    success: boolean;
    remaining: number;
    limit: number;
}> {
    const key = userKey(userId);

    // Step 1: roll the window if it's expired (no-op if not present / not expired)
    await db.query(
        `UPDATE ai_quota
         SET used_count = 0,
             window_starts_at = now(),
             updated_at = now()
         WHERE identity_key = $1
           AND window_starts_at IS NOT NULL
           AND window_starts_at < now() - INTERVAL '1 day'`,
        [key]
    );

    // Step 2: atomic INSERT/UPDATE that only proceeds when under quota
    const { rows } = await db.query<QuotaRow>(
        `INSERT INTO ai_quota (identity_key, used_count, window_starts_at, updated_at)
         VALUES ($1, 1, now(), now())
         ON CONFLICT (identity_key) DO UPDATE
         SET used_count = ai_quota.used_count + 1,
             updated_at = now()
         WHERE ai_quota.used_count < $2
         RETURNING used_count`,
        [key, USER_DAILY_QUOTA]
    );

    if (rows.length === 0) {
        return { success: false, remaining: 0, limit: USER_DAILY_QUOTA };
    }

    const used = rows[0].used_count;
    return {
        success: true,
        remaining: Math.max(0, USER_DAILY_QUOTA - used),
        limit: USER_DAILY_QUOTA,
    };
}

/**
 * Read-only: how many generations the user has left in the current window.
 */
export async function getUserUsage(userId: string): Promise<{
    remaining: number;
    limit: number;
}> {
    const { rows } = await db.query<QuotaRow & { window_starts_at: Date | null }>(
        `SELECT used_count, window_starts_at FROM ai_quota WHERE identity_key = $1`,
        [userKey(userId)]
    );

    const row = rows[0];
    if (!row) {
        return { remaining: USER_DAILY_QUOTA, limit: USER_DAILY_QUOTA };
    }

    // If the window has expired, the user effectively has full quota again
    if (
        row.window_starts_at &&
        Date.now() - row.window_starts_at.getTime() > 24 * 60 * 60 * 1000
    ) {
        return { remaining: USER_DAILY_QUOTA, limit: USER_DAILY_QUOTA };
    }

    return {
        remaining: Math.max(0, USER_DAILY_QUOTA - row.used_count),
        limit: USER_DAILY_QUOTA,
    };
}

/**
 * Backwards-compatible facade so route.ts doesn't need to change.
 * Mirrors the Upstash Ratelimit shape we previously used.
 */
export const userDailyLimiter = {
    limit: async (userId: string) => {
        const result = await consumeUserDaily(userId);
        return result;
    },
};

export { ANON_LIFETIME_QUOTA, USER_DAILY_QUOTA };
