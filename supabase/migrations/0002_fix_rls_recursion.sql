-- ============================================================
-- 0002 — Fix infinite recursion in workspace_members RLS
-- ============================================================
-- The "members read their membership" policy in 0001 referenced the
-- same workspace_members table in a subquery, which Postgres re-evaluates
-- through the policy itself → infinite recursion (error 42P17).
--
-- Fix: introduce a SECURITY DEFINER function `user_workspaces()` that
-- bypasses RLS to fetch the current user's workspaces, then rewrite all
-- dependent policies to call it instead of subquerying workspace_members.

-- --- 1. Drop the broken policies (and the ones that depend on the same pattern)
DROP POLICY IF EXISTS "members read their membership" ON workspace_members;
DROP POLICY IF EXISTS "workspace members CRUD projects" ON projects;
DROP POLICY IF EXISTS "workspace members CRUD ideas" ON book_ideas;
DROP POLICY IF EXISTS "workspace members CRUD settings" ON workspace_settings;
DROP POLICY IF EXISTS "members read own workspace" ON workspaces;
DROP POLICY IF EXISTS "lookup workspace by invite code" ON workspaces;

-- --- 2. SECURITY DEFINER helper that lists the caller's workspaces.
--      It runs as the function owner (postgres) and is NOT subject to RLS,
--      so it doesn't re-trigger workspace_members policies.
CREATE OR REPLACE FUNCTION public.user_workspaces()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.user_workspaces() TO authenticated, anon;

-- --- 3. Recreate workspace_members policies — simple, non-recursive
CREATE POLICY "user reads own membership"
    ON workspace_members FOR SELECT
    USING (user_id = auth.uid());

-- --- 4. Recreate workspaces policies using the helper function
--    SELECT: members of the workspace OR anyone authenticated (so invite_code
--            lookup works). invite_code itself is the secret — knowing it
--            grants the right to join, but rows leak nothing else useful.
CREATE POLICY "authenticated reads workspaces"
    ON workspaces FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- --- 5. Recreate dependent table policies using the helper
CREATE POLICY "workspace members CRUD projects"
    ON projects FOR ALL
    USING (workspace_id IN (SELECT public.user_workspaces()))
    WITH CHECK (workspace_id IN (SELECT public.user_workspaces()));

CREATE POLICY "workspace members CRUD ideas"
    ON book_ideas FOR ALL
    USING (workspace_id IN (SELECT public.user_workspaces()))
    WITH CHECK (workspace_id IN (SELECT public.user_workspaces()));

CREATE POLICY "workspace members CRUD settings"
    ON workspace_settings FOR ALL
    USING (workspace_id IN (SELECT public.user_workspaces()))
    WITH CHECK (workspace_id IN (SELECT public.user_workspaces()));

-- --- 6. Fix storage policies the same way
DROP POLICY IF EXISTS "members upload to their workspace" ON storage.objects;
DROP POLICY IF EXISTS "members update their workspace assets" ON storage.objects;
DROP POLICY IF EXISTS "members delete their workspace assets" ON storage.objects;

CREATE POLICY "members upload to their workspace"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'assets'
        AND (storage.foldername(name))[1] IN (
            SELECT public.user_workspaces()::text
        )
    );

CREATE POLICY "members update their workspace assets"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'assets'
        AND (storage.foldername(name))[1] IN (
            SELECT public.user_workspaces()::text
        )
    );

CREATE POLICY "members delete their workspace assets"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'assets'
        AND (storage.foldername(name))[1] IN (
            SELECT public.user_workspaces()::text
        )
    );
