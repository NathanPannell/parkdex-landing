CREATE TABLE IF NOT EXISTS waitlist_signups (
  email_normalized text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_email_length CHECK (char_length(email_normalized) BETWEEN 3 AND 254)
);
