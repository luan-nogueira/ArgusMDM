CREATE TABLE users (
    id              UUID PRIMARY KEY,
    name            VARCHAR(150)    NOT NULL,
    email           VARCHAR(180)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    role            VARCHAR(20)     NOT NULL,
    active          BOOLEAN         NOT NULL DEFAULT TRUE,
    two_fa_enabled  BOOLEAN         NOT NULL DEFAULT FALSE,
    two_fa_secret   VARCHAR(255),
    created_at      TIMESTAMP       NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);
