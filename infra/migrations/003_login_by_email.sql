-- Allow login to find user by email (no org_id known yet). SECURITY DEFINER bypasses RLS.
CREATE OR REPLACE FUNCTION get_user_by_email(p_email TEXT)
RETURNS TABLE(
  user_id UUID,
  org_id UUID,
  email TEXT,
  password_hash TEXT,
  name TEXT,
  role TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT u.user_id, u.org_id, u.email, u.password_hash, u.name, u.role
  FROM users u
  WHERE u.email = p_email
  LIMIT 1;
$$;
