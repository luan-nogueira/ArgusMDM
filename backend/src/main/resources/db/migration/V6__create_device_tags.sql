CREATE TABLE device_tags (
    device_id   UUID NOT NULL REFERENCES devices (id) ON DELETE CASCADE,
    tag_id      UUID NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (device_id, tag_id)
);
