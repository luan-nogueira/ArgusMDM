CREATE TABLE location_history (
    id           UUID PRIMARY KEY,
    device_id    UUID              NOT NULL REFERENCES devices (id) ON DELETE CASCADE,
    latitude     DOUBLE PRECISION  NOT NULL,
    longitude    DOUBLE PRECISION  NOT NULL,
    accuracy     DOUBLE PRECISION,
    altitude     DOUBLE PRECISION,
    speed        DOUBLE PRECISION,
    captured_at  TIMESTAMP         NOT NULL,
    created_at   TIMESTAMP         NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP         NOT NULL DEFAULT now()
);

CREATE INDEX idx_location_device_captured ON location_history (device_id, captured_at);
