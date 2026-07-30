CREATE TABLE alerts (
    id          UUID PRIMARY KEY,
    type        VARCHAR(30)   NOT NULL,
    device_id   UUID          REFERENCES devices (id) ON DELETE CASCADE,
    message     VARCHAR(500)  NOT NULL,
    read        BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX idx_alerts_read ON alerts (read);
CREATE INDEX idx_alerts_device ON alerts (device_id);
