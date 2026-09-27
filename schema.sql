-- Original Android launch list. It no longer receives signups; its rows keep their original
-- launch-notification consent and are not copied into the beta list.
CREATE TABLE IF NOT EXISTS waitlist_signups (
  email_normalized text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_email_length CHECK (char_length(email_normalized) BETWEEN 3 AND 254)
);

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
