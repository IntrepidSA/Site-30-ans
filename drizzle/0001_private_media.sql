CREATE TABLE IF NOT EXISTS private_media (id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL CHECK(kind IN ('photo','audio')), object_key TEXT NOT NULL UNIQUE, content_type TEXT NOT NULL, original_name TEXT, guest_name TEXT NOT NULL, message TEXT, duration INTEGER, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_private_media_kind_created ON private_media(kind, created_at DESC);

