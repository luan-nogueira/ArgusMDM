CREATE TABLE policies (
    id                          UUID PRIMARY KEY,
    name                        VARCHAR(120)  NOT NULL UNIQUE,
    description                 VARCHAR(500),
    password_required           BOOLEAN       NOT NULL DEFAULT TRUE,
    min_password_length         INTEGER       NOT NULL DEFAULT 6,
    max_inactivity_lock_ms      BIGINT        NOT NULL DEFAULT 60000,
    update_policy               VARCHAR(20)   NOT NULL DEFAULT 'WINDOWED',
    camera_disabled             BOOLEAN       NOT NULL DEFAULT FALSE,
    screen_capture_disabled     BOOLEAN       NOT NULL DEFAULT FALSE,
    factory_reset_disabled      BOOLEAN       NOT NULL DEFAULT TRUE,
    install_apps_disabled       BOOLEAN       NOT NULL DEFAULT FALSE,
    usb_file_transfer_disabled  BOOLEAN       NOT NULL DEFAULT FALSE,
    restrictions_json           TEXT,
    active                      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMP     NOT NULL DEFAULT now()
);
