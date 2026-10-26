INSERT INTO event_settings (id, unlock_at, updated_at)
VALUES (1, '2026-12-06T23:00:00.000Z', CURRENT_TIMESTAMP)
ON CONFLICT(id) DO UPDATE SET
  unlock_at = excluded.unlock_at,
  updated_at = CURRENT_TIMESTAMP;

