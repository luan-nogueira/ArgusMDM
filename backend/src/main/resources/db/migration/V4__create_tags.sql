CREATE TABLE tags (
    id          UUID PRIMARY KEY,
    name        VARCHAR(60)     NOT NULL UNIQUE,
    color       VARCHAR(20),
    created_at  TIMESTAMP       NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT now()
);
