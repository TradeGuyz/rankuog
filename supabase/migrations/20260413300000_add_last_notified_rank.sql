-- Stores the rank value from the last notification run.
-- NULL = user has never been included in a notification run (no email sent on first run).
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_notified_rank integer;
