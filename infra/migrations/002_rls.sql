-- RLS: alle tenant-tabeller filtreres på app.current_org_id (sættes pr. request i API).

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- organizations: SELECT/UPDATE kun egen org; INSERT tilladt (register-flow sætter ikke current_org_id)
CREATE POLICY organizations_select ON organizations FOR SELECT
  USING (id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY organizations_update ON organizations FOR UPDATE
  USING (id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY organizations_insert ON organizations FOR INSERT
  WITH CHECK (true);

-- Tenant-tabeller: USING og WITH CHECK = org_id = session
CREATE POLICY users_tenant ON users FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY vehicle_profiles_tenant ON vehicle_profiles FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY saved_places_tenant ON saved_places FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY saved_routes_tenant ON saved_routes FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY export_jobs_tenant ON export_jobs FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY audit_log_tenant ON audit_log FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);
