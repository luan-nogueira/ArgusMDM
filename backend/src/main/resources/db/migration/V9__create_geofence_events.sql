CREATE TABLE geofence_events (
    id            UUID PRIMARY KEY,
    geofence_id   UUID          NOT NULL REFERENCES geofences (id) ON DELETE CASCADE,
    device_id     UUID          NOT NULL REFERENCES devices (id) ON DELETE CASCADE,
    type          VARCHAR(10)   NOT NULL,
    occurred_at   TIMESTAMP     NOT NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX idx_geofence_events_device ON geofence_events (device_id, occurred_at);
