ALTER TABLE guests ADD COLUMN rsvp_owner_name TEXT;
CREATE INDEX IF NOT EXISTS idx_guests_rsvp_owner ON guests(rsvp_owner_name);

