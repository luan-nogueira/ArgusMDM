CREATE TABLE policy_assignments (
    id             UUID PRIMARY KEY,
    policy_id      UUID          NOT NULL REFERENCES policies (id) ON DELETE CASCADE,
    target_type    VARCHAR(20)   NOT NULL,
    device_id      UUID          REFERENCES devices (id) ON DELETE CASCADE,
    department_id  UUID          REFERENCES departments (id) ON DELETE CASCADE,
    tag_id         UUID          REFERENCES tags (id) ON DELETE CASCADE,
    created_at     TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX idx_policy_assignments_policy ON policy_assignments (policy_id);
