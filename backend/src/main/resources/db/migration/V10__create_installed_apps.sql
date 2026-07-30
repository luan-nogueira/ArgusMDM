CREATE TABLE installed_apps (
    id            UUID PRIMARY KEY,
    device_id     UUID          NOT NULL REFERENCES devices (id) ON DELETE CASCADE,
    package_name  VARCHAR(200)  NOT NULL,
    app_name      VARCHAR(200),
    version_name  VARCHAR(60),
    version_code  BIGINT,
    size_bytes    BIGINT,
    system_app    BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP     NOT NULL DEFAULT now(),
    CONSTRAINT uk_device_package UNIQUE (device_id, package_name)
);
