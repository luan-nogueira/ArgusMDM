CREATE TABLE geofences (
    id                UUID PRIMARY KEY,
    name              VARCHAR(120)      NOT NULL,
    center_latitude   DOUBLE PRECISION  NOT NULL,
    center_longitude  DOUBLE PRECISION  NOT NULL,
    radius_meters     DOUBLE PRECISION  NOT NULL,
    active            BOOLEAN           NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP         NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP         NOT NULL DEFAULT now()
);

CREATE TABLE geofence_devices (
    geofence_id  UUID NOT NULL REFERENCES geofences (id) ON DELETE CASCADE,
    device_id    UUID NOT NULL REFERENCES devices (id) ON DELETE CASCADE,
    PRIMARY KEY (geofence_id, device_id)
);
