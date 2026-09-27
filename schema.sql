-- One DO block because the preview script and Neon's HTTP driver accept a single statement.
-- Safe to rerun on persistent branches.
DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS android_beta_signups (
    email_normalized text PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT android_beta_email_length CHECK (char_length(email_normalized) BETWEEN 3 AND 254)
  );

  CREATE TABLE IF NOT EXISTS app_store_waitlist_signups (
    email_normalized text PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT app_store_waitlist_email_length CHECK (char_length(email_normalized) BETWEEN 3 AND 254)
  );

  -- Retire the original Android launch list. Signups already moved to either new list stay where
  -- the operator put them; any others are kept on the App Store waitlist before the table is dropped.
  IF to_regclass('public.waitlist_signups') IS NOT NULL THEN
    INSERT INTO app_store_waitlist_signups (email_normalized, created_at)
    SELECT w.email_normalized, w.created_at
    FROM waitlist_signups w
    WHERE NOT EXISTS (SELECT 1 FROM android_beta_signups a WHERE a.email_normalized = w.email_normalized)
    ON CONFLICT (email_normalized) DO NOTHING;
    DROP TABLE waitlist_signups;
  END IF;
END
$$;
