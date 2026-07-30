CREATE TABLE departments (
    id          UUID PRIMARY KEY,
    name        VARCHAR(120)    NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at  TIMESTAMP       NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT now()
);
