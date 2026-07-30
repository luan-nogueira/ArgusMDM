CREATE TABLE devices (
    id                    UUID PRIMARY KEY,
    name                  VARCHAR(150)  NOT NULL,
    model                 VARCHAR(100),
    manufacturer          VARCHAR(100),
    android_version       VARCHAR(20),
    imei                  VARCHAR(30)   UNIQUE,
    serial_number         VARCHAR(60)   UNIQUE,
    status                VARCHAR(20)   NOT NULL DEFAULT 'PROVISIONING',
    last_sync_at          TIMESTAMP,
    device_owner_active   BOOLEAN       NOT NULL DEFAULT FALSE,
    fcm_token             VARCHAR(500),
    department_id         UUID          REFERENCES departments (id) ON DELETE SET NULL,
    responsible_user_id   UUID          REFERENCES users (id) ON DELETE SET NULL,
    created_at            TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at            TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX idx_devices_status ON devices (status);
CREATE INDEX idx_devices_department ON devices (department_id);
