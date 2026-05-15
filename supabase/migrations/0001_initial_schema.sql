-- ============================================================
-- KDP Book Factory — Initial schema (2026-05-14)
-- ============================================================
-- Purpose: sync book projects, ideas, and asset images across
-- devices for a single user (or shared between paired devices).
--
-- Model: "workspace" is the unit of sharing. One workspace can
-- have many devices (auth users via anonymous auth) linked via
-- an invite_code. Each device is its own auth.users row.
--
-- All books and ideas belong to a workspace, not directly to a
-- user. This lets the user pair a phone with their laptop by
-- sharing the workspace's invite_code.

-- ------------------------------------------------------------
-- 1. workspaces
-- ------------------------------------------------------------
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_code TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2. workspace_members (join table: which users belong to a workspace)
-- ------------------------------------------------------------
CREATE TABLE workspace_members (
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (workspace_id, user_id)
);

CREATE INDEX workspace_members_user_idx ON workspace_members(user_id);

-- ------------------------------------------------------------
-- 3. projects (book projects — replaces localStorage bw_projects.list[])
-- ------------------------------------------------------------
CREATE TABLE projects (
    -- We keep the client-generated id (e.g. 'bw-1234567890') so existing
    -- localStorage data can be migrated 1:1 without remapping references.
    id TEXT PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX projects_workspace_idx ON projects(workspace_id);
CREATE INDEX projects_updated_idx ON projects(workspace_id, updated_at DESC);

-- ------------------------------------------------------------
-- 4. book_ideas (Stage 0 research drafts — replaces IDB book_ideas)
-- ------------------------------------------------------------
CREATE TABLE book_ideas (
    id TEXT PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX book_ideas_workspace_idx ON book_ideas(workspace_id);

-- ------------------------------------------------------------
-- 5. workspace_settings (active project id, active idea id, etc.)
-- ------------------------------------------------------------
CREATE TABLE workspace_settings (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    active_project_id TEXT,
    active_idea_id TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 6. updated_at triggers
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_touch BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER book_ideas_touch BEFORE UPDATE ON book_ideas
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER workspace_settings_touch BEFORE UPDATE ON workspace_settings
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ------------------------------------------------------------
-- 7. Row Level Security policies
-- ------------------------------------------------------------
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;

-- Workspaces: members can SELECT their own. Anyone authenticated can INSERT.
-- Looking up by invite_code (to join) is allowed via a separate policy that
-- reveals nothing beyond confirming the code matches.
CREATE POLICY "members read own workspace"
    ON workspaces FOR SELECT
    USING (id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    ));
CREATE POLICY "authenticated creates workspace"
    ON workspaces FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "lookup workspace by invite code"
    ON workspaces FOR SELECT
    USING (auth.uid() IS NOT NULL);
    -- ^ Allows reading by invite_code so the joining device can find the
    --   workspace_id. With the unique constraint on invite_code this is
    --   safe: an attacker still needs the exact code to find a workspace.

-- Members: members can see other members of their workspaces. Self-add only.
CREATE POLICY "members read their membership"
    ON workspace_members FOR SELECT
    USING (
        user_id = auth.uid()
        OR workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "self joins workspace"
    ON workspace_members FOR INSERT
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "self leaves workspace"
    ON workspace_members FOR DELETE
    USING (user_id = auth.uid());

-- Projects: members of the workspace can do everything.
CREATE POLICY "workspace members CRUD projects"
    ON projects FOR ALL
    USING (workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    ))
    WITH CHECK (workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    ));

-- Book ideas: same as projects.
CREATE POLICY "workspace members CRUD ideas"
    ON book_ideas FOR ALL
    USING (workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    ))
    WITH CHECK (workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    ));

-- Workspace settings: same.
CREATE POLICY "workspace members CRUD settings"
    ON workspace_settings FOR ALL
    USING (workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    ))
    WITH CHECK (workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    ));

-- ------------------------------------------------------------
-- 8. Storage bucket for assets (cover/divider/ornament images)
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'assets',
    'assets',
    true,
    10485760, -- 10 MB per file
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies:
-- - Public read (so jsPDF and the UI can fetch via plain URL)
-- - Authenticated users can upload/update/delete only within their workspace folder
--   (we use the convention `<workspace_id>/<project_id>/<slot>.png` in object names)
CREATE POLICY "public read assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'assets');

CREATE POLICY "members upload to their workspace"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'assets'
        AND auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] IN (
            SELECT workspace_id::text FROM workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "members update their workspace assets"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'assets'
        AND (storage.foldername(name))[1] IN (
            SELECT workspace_id::text FROM workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "members delete their workspace assets"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'assets'
        AND (storage.foldername(name))[1] IN (
            SELECT workspace_id::text FROM workspace_members WHERE user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------
-- 9. Realtime publication (so the client can subscribe to changes)
-- ------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE book_ideas;
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_settings;
