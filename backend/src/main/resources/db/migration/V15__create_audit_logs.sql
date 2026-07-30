CREATE TABLE audit_logs (
    id           UUID PRIMARY KEY,
    user_id      UUID          REFERENCES users (id) ON DELETE SET NULL,
    action       VARCHAR(30)   NOT NULL,
    entity_type  VARCHAR(100)  NOT NULL,
    entity_id    VARCHAR(100),
    details      TEXT,
    ip_address   VARCHAR(45),
    created_at   TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_created_at ON audit_logs (created_at);
CREATE INDEX idx_audit_user ON audit_logs (user_id);
