CREATE TABLE device_metrics (
    id                    UUID          PRIMARY KEY,
    device_id             UUID          NOT NULL REFERENCES devices (id) ON DELETE CASCADE,
    battery_level         INTEGER,
    charging              BOOLEAN,
    storage_used_bytes    BIGINT,
    storage_total_bytes   BIGINT,
    memory_used_bytes     BIGINT,
    memory_total_bytes    BIGINT,
    cpu_usage_percent     DOUBLE PRECISION,
    wifi_connected        BOOLEAN,
    wifi_ssid             VARCHAR(120),
    bluetooth_enabled     BOOLEAN,
    network_operator      VARCHAR(120),
    captured_at           TIMESTAMP     NOT NULL,
    created_at            TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at            TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX idx_metric_device_captured ON device_metrics (device_id, captured_at);
