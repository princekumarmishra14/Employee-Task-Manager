-- Ensure permissions exist
INSERT INTO "permissions" ("id", "module", "action", "description", "created_at")
VALUES
  (gen_random_uuid(), 'audit_logs', 'view', 'Can view audit_logs', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'settings', 'view', 'Can view settings', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'settings', 'update', 'Can update settings', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'roles', 'manage', 'Can manage roles', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'departments', 'delete', 'Can delete departments', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'teams', 'delete', 'Can delete teams', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'projects', 'delete', 'Can delete projects', CURRENT_TIMESTAMP)
ON CONFLICT ("module", "action") DO NOTHING;

-- Grant permissions to ADMIN role
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r."name" = 'ADMIN'
  AND (
    (p."module" = 'audit_logs' AND p."action" = 'view') OR
    (p."module" = 'settings' AND p."action" IN ('view', 'update')) OR
    (p."module" = 'roles' AND p."action" = 'manage') OR
    (p."module" = 'departments' AND p."action" = 'delete') OR
    (p."module" = 'teams' AND p."action" = 'delete') OR
    (p."module" = 'projects' AND p."action" = 'delete')
  )
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- Grant employees:view to EMPLOYEE role if missing
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r."name" = 'EMPLOYEE'
  AND (p."module" = 'employees' AND p."action" = 'view')
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
