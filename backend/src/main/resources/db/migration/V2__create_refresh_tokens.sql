CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY,
    user_id     UUID            NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token       VARCHAR(500)    NOT NULL UNIQUE,
    expires_at  TIMESTAMP       NOT NULL,
    revoked     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP       NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);
