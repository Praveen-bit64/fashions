-- AI Customizer rate limiting / quota table
--
-- identity_key format:
--   "anon:<ip>"   → lifetime cap (window_starts_at IS NULL)
--   "user:<id>"   → daily sliding window (window_starts_at = window start)

CREATE TABLE IF NOT EXISTS ai_quota (
    identity_key      TEXT        PRIMARY KEY,
    used_count        INTEGER     NOT NULL DEFAULT 0,
    window_starts_at  TIMESTAMPTZ,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_quota_window_idx
    ON ai_quota (window_starts_at)
    WHERE window_starts_at IS NOT NULL;
