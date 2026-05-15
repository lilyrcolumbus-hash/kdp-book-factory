// Cloud Storage — Supabase wrapper for cross-device sync.
//
// Architecture:
//  - Reads stay synchronous via an in-memory cache (`cs.cache`).
//  - Writes update the cache + localStorage (offline backup) + fire async
//    upserts to Supabase.
//  - Boot sequence: sign in anonymously, ensure a workspace exists, hydrate
//    the cache from cloud, then emit `cs:ready`. Pre-existing localStorage
//    data is migrated to the cloud on first run.
//  - Realtime subscriptions update the cache whenever another device (or
//    another tab) writes to the workspace.
//
// Public surface: `window.cs` exposes the API to the rest of the app.
// Wizard / book-ideas / book-compile call `cs.upsertProject(...)`, etc.

(function () {
  const C = window.CLOUD_CONFIG;
  if (!C || !C.SUPABASE_URL) {
    console.error('[cloud] Missing CLOUD_CONFIG — load js/cloud-config.js first.');
    return;
  }
  if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
    console.error('[cloud] supabase-js not loaded yet.');
    return;
  }

  const LS_AUTH = 'cs_auth_session_v1';
  const LS_WORKSPACE = 'cs_workspace_id_v1';
  const LS_OFFLINE_PROJECTS = 'cs_offline_projects_v1';
  const LS_OFFLINE_IDEAS = 'cs_offline_ideas_v1';
  const LS_OFFLINE_SETTINGS = 'cs_offline_settings_v1';
  const LS_MIGRATION_DONE = 'cs_migration_v1_done';

  const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, {
    auth: {
      storage: window.localStorage,
      storageKey: LS_AUTH,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  // In-memory cache. Reads from wizard etc. hit this synchronously.
  const cache = {
    projects: new Map(),   // id → project object
    ideas: new Map(),      // id → idea object
    settings: { active_project_id: null, active_idea_id: null },
  };

  let workspace = null;          // { id, invite_code, name }
  let user = null;               // supabase auth user
  let ready = false;
  let readyResolve;
  const readyPromise = new Promise(r => { readyResolve = r; });

  // ====== Auth ======
  async function ensureSignedIn() {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) {
      user = session.user;
      return user;
    }
    const { data, error } = await sb.auth.signInAnonymously();
    if (error) throw error;
    user = data.user;
    return user;
  }

  // ====== Workspace lifecycle ======
  function genInviteCode() {
    // 8 chars alphanumeric uppercase, easy to read
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // skip ambiguous I/1, O/0
    let s = '';
    for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  async function ensureWorkspace() {
    // 1. Try to load saved workspace from localStorage.
    const savedId = localStorage.getItem(LS_WORKSPACE);
    if (savedId) {
      const { data } = await sb.from('workspaces').select('*').eq('id', savedId).maybeSingle();
      if (data) {
        workspace = data;
        return workspace;
      }
      // saved id is stale (maybe deleted) → fall through to membership lookup
    }
    // 2. Look up any workspace this user is already a member of.
    const { data: memberships } = await sb.from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id);
    if (memberships && memberships.length > 0) {
      const wsId = memberships[0].workspace_id;
      const { data: ws } = await sb.from('workspaces').select('*').eq('id', wsId).maybeSingle();
      if (ws) {
        workspace = ws;
        localStorage.setItem(LS_WORKSPACE, ws.id);
        return workspace;
      }
    }
    // 3. No workspace yet — create one.
    const { data: ws, error } = await sb.from('workspaces').insert({
      invite_code: genInviteCode(),
      name: 'My books',
    }).select().single();
    if (error) throw error;
    await sb.from('workspace_members').insert({
      workspace_id: ws.id,
      user_id: user.id,
    });
    workspace = ws;
    localStorage.setItem(LS_WORKSPACE, ws.id);
    return workspace;
  }

  async function joinWorkspace(inviteCode) {
    const code = String(inviteCode || '').trim().toUpperCase();
    if (!code) throw new Error('Empty invite code');
    const { data: ws, error } = await sb.from('workspaces')
      .select('*')
      .eq('invite_code', code)
      .maybeSingle();
    if (error || !ws) throw new Error('Invite code not found');
    // Add self as member if not already
    await sb.from('workspace_members').upsert({
      workspace_id: ws.id,
      user_id: user.id,
    }, { onConflict: 'workspace_id,user_id' });
    workspace = ws;
    localStorage.setItem(LS_WORKSPACE, ws.id);
    // Reload cache for the new workspace
    cache.projects.clear();
    cache.ideas.clear();
    await hydrateCache();
    setupRealtime();
    window.dispatchEvent(new CustomEvent('cs:workspace-changed', { detail: ws }));
    return ws;
  }

  // ====== Hydration: load all cloud data into cache ======
  async function hydrateCache() {
    if (!workspace) return;
    const wsId = workspace.id;
    const [projectsRes, ideasRes, settingsRes] = await Promise.all([
      sb.from('projects').select('id, data, updated_at').eq('workspace_id', wsId),
      sb.from('book_ideas').select('id, data, updated_at').eq('workspace_id', wsId),
      sb.from('workspace_settings').select('*').eq('workspace_id', wsId).maybeSingle(),
    ]);
    cache.projects.clear();
    cache.ideas.clear();
    (projectsRes.data || []).forEach(row => cache.projects.set(row.id, row.data));
    (ideasRes.data || []).forEach(row => cache.ideas.set(row.id, row.data));
    if (settingsRes.data) {
      cache.settings.active_project_id = settingsRes.data.active_project_id;
      cache.settings.active_idea_id = settingsRes.data.active_idea_id;
    }
    persistOffline();
  }

  function persistOffline() {
    try {
      // Cloud-format offline cache (used to warm-start on next boot before
      // cloud hydration finishes).
      localStorage.setItem(LS_OFFLINE_PROJECTS, JSON.stringify([...cache.projects.entries()]));
      localStorage.setItem(LS_OFFLINE_IDEAS, JSON.stringify([...cache.ideas.entries()]));
      localStorage.setItem(LS_OFFLINE_SETTINGS, JSON.stringify(cache.settings));

      // Legacy-format mirror so the existing wizard code (bwLoadAll reads
      // 'bw_projects', book-ideas reads IDB) keeps working without changes.
      // Whenever cs cache updates (boot hydrate, realtime, local write), the
      // legacy keys stay in sync.
      localStorage.setItem('bw_projects', JSON.stringify({
        active: cache.settings.active_project_id,
        list: [...cache.projects.values()],
      }));
    } catch (e) {
      console.warn('[cloud] localStorage quota — offline cache write skipped', e);
    }
  }

  function loadOfflineCache() {
    try {
      const p = JSON.parse(localStorage.getItem(LS_OFFLINE_PROJECTS) || '[]');
      const i = JSON.parse(localStorage.getItem(LS_OFFLINE_IDEAS) || '[]');
      const s = JSON.parse(localStorage.getItem(LS_OFFLINE_SETTINGS) || '{}');
      cache.projects = new Map(p);
      cache.ideas = new Map(i);
      cache.settings = { active_project_id: s.active_project_id || null, active_idea_id: s.active_idea_id || null };
    } catch (e) { /* first boot — empty */ }
  }

  // ====== Legacy migration: lift localStorage → cloud once ======
  async function migrateLocalStorageIfNeeded() {
    if (localStorage.getItem(LS_MIGRATION_DONE)) return;
    if (!workspace) return;
    const wsId = workspace.id;
    let migrated = 0;

    // 1. Projects from bw_projects
    try {
      const raw = localStorage.getItem('bw_projects');
      if (raw) {
        const parsed = JSON.parse(raw);
        const list = parsed?.list || [];
        for (const p of list) {
          if (!p?.id) continue;
          await sb.from('projects').upsert({ id: p.id, workspace_id: wsId, data: p }, { onConflict: 'id' });
          cache.projects.set(p.id, p);
          migrated++;
        }
        if (parsed?.active) {
          cache.settings.active_project_id = parsed.active;
        }
      }
    } catch (e) { console.warn('[cloud] migrate projects failed', e); }

    // 2. Book ideas from IndexedDB (handled by book-ideas.js after cs:ready)
    //    We can't reach IDB synchronously here; book-ideas.js does its own
    //    one-shot migration to cloud after detecting LS_MIGRATION_DONE missing.

    // 3. Persist settings if we picked up an active id
    if (cache.settings.active_project_id) {
      await sb.from('workspace_settings').upsert({
        workspace_id: wsId,
        active_project_id: cache.settings.active_project_id,
        active_idea_id: cache.settings.active_idea_id,
      }, { onConflict: 'workspace_id' });
    }

    localStorage.setItem(LS_MIGRATION_DONE, new Date().toISOString());
    if (migrated > 0) {
      console.log(`[cloud] Migrated ${migrated} project(s) from localStorage`);
    }
  }

  // ====== CRUD wrappers (sync cache + async cloud) ======
  // Strip the in-memory-only fields (asset dataUrls — the canonical store is the
  // 'assets' bucket; dataUrls are cached locally for fast compile/render).
  // Without this, every project upsert would push 5-20MB of base64 to Postgres.
  function stripForCloud(project) {
    if (!project?.assets) return project;
    const clone = JSON.parse(JSON.stringify(project));
    for (const slotId of Object.keys(clone.assets || {})) {
      const a = clone.assets[slotId];
      if (a && a.dataUrl) {
        delete a.dataUrl; // keep .url, .width, .height, .sizeKB, .uploadedAt
      }
    }
    return clone;
  }

  function upsertProject(project) {
    if (!project?.id) return;
    cache.projects.set(project.id, project);
    persistOffline();
    if (!workspace) return; // queued in offline cache, will sync on next boot
    sb.from('projects').upsert({
      id: project.id,
      workspace_id: workspace.id,
      data: stripForCloud(project),
    }, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.warn('[cloud] upsertProject failed', error.message);
    });
  }

  // After cache hydrates from cloud, projects have asset.url but no .dataUrl.
  // Fetch each asset's URL → dataUrl, cache it in memory, fire event so UI
  // re-renders. Runs in background; doesn't block ready.
  async function hydrateAssetDataUrls() {
    for (const project of cache.projects.values()) {
      if (!project.assets) continue;
      const slotIds = Object.keys(project.assets);
      for (const slotId of slotIds) {
        const a = project.assets[slotId];
        if (a && a.url && !a.dataUrl) {
          try {
            a.dataUrl = await fetchAssetAsDataUrl(a.url);
            window.dispatchEvent(new CustomEvent('cs:asset-loaded', {
              detail: { projectId: project.id, slotId }
            }));
          } catch (e) {
            console.warn(`[cloud] Failed to fetch asset ${slotId}:`, e.message);
          }
        }
      }
    }
  }

  function deleteProject(id) {
    cache.projects.delete(id);
    persistOffline();
    if (!workspace) return;
    sb.from('projects').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn('[cloud] deleteProject failed', error.message);
    });
  }

  function upsertIdea(idea) {
    if (!idea?.id) return;
    cache.ideas.set(idea.id, idea);
    persistOffline();
    if (!workspace) return;
    sb.from('book_ideas').upsert({
      id: idea.id,
      workspace_id: workspace.id,
      data: idea,
    }, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.warn('[cloud] upsertIdea failed', error.message);
    });
  }

  function deleteIdea(id) {
    cache.ideas.delete(id);
    persistOffline();
    if (!workspace) return;
    sb.from('book_ideas').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn('[cloud] deleteIdea failed', error.message);
    });
  }

  function setActiveProject(id) {
    cache.settings.active_project_id = id;
    persistOffline();
    if (!workspace) return;
    sb.from('workspace_settings').upsert({
      workspace_id: workspace.id,
      active_project_id: id,
      active_idea_id: cache.settings.active_idea_id,
    }, { onConflict: 'workspace_id' });
  }

  function setActiveIdea(id) {
    cache.settings.active_idea_id = id;
    persistOffline();
    if (!workspace) return;
    sb.from('workspace_settings').upsert({
      workspace_id: workspace.id,
      active_project_id: cache.settings.active_project_id,
      active_idea_id: id,
    }, { onConflict: 'workspace_id' });
  }

  // ====== Asset storage (Hito C) ======
  // Upload a Blob/dataURL to Storage. Returns the public URL.
  async function uploadAsset(projectId, slotId, blobOrDataUrl, mime = 'image/png') {
    if (!workspace) throw new Error('No workspace');
    const blob = (blobOrDataUrl instanceof Blob) ? blobOrDataUrl : dataUrlToBlob(blobOrDataUrl);
    const ext = (mime.split('/')[1] || 'png').replace('+xml', '');
    const path = `${workspace.id}/${projectId}/${slotId}.${ext}`;
    const { error } = await sb.storage.from(C.ASSETS_BUCKET).upload(path, blob, {
      cacheControl: '3600',
      upsert: true,
      contentType: mime,
    });
    if (error) throw error;
    const { data } = sb.storage.from(C.ASSETS_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async function deleteAsset(projectId, slotId, ext = 'png') {
    if (!workspace) return;
    const path = `${workspace.id}/${projectId}/${slotId}.${ext}`;
    await sb.storage.from(C.ASSETS_BUCKET).remove([path]);
  }

  function dataUrlToBlob(dataUrl) {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const u8 = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
    return new Blob([u8], { type: mime });
  }

  async function fetchAssetAsDataUrl(url) {
    // Convert a public URL back to a dataURL for jsPDF (which needs base64).
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  // ====== Realtime ======
  let realtimeChan = null;
  function setupRealtime() {
    if (!workspace) return;
    if (realtimeChan) sb.removeChannel(realtimeChan);
    realtimeChan = sb.channel('ws-' + workspace.id)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `workspace_id=eq.${workspace.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            cache.projects.delete(payload.old.id);
          } else {
            cache.projects.set(payload.new.id, payload.new.data);
            // The remote update may have included new asset URLs that this
            // device doesn't have dataUrls for yet. Lazy-fetch in background.
            hydrateAssetDataUrls();
          }
          persistOffline();
          window.dispatchEvent(new CustomEvent('cs:projects-updated'));
        })
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'book_ideas', filter: `workspace_id=eq.${workspace.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            cache.ideas.delete(payload.old.id);
          } else {
            cache.ideas.set(payload.new.id, payload.new.data);
          }
          persistOffline();
          window.dispatchEvent(new CustomEvent('cs:ideas-updated'));
        })
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'workspace_settings', filter: `workspace_id=eq.${workspace.id}` },
        (payload) => {
          if (payload.new) {
            cache.settings.active_project_id = payload.new.active_project_id;
            cache.settings.active_idea_id = payload.new.active_idea_id;
            persistOffline();
            window.dispatchEvent(new CustomEvent('cs:settings-updated'));
          }
        })
      .subscribe();
  }

  // ====== Boot ======
  async function boot() {
    // Warm-start cache from localStorage offline copy so wizard can render
    // something IMMEDIATELY (no flash of empty state while we wait for cloud).
    loadOfflineCache();

    try {
      await ensureSignedIn();
      await ensureWorkspace();
      await migrateLocalStorageIfNeeded();
      await hydrateCache();
      setupRealtime();
      ready = true;
      readyResolve();
      window.dispatchEvent(new CustomEvent('cs:ready', { detail: { workspace } }));
      // Lazy-fetch asset dataUrls in the background so the UI can render thumbs
      // and the compiler can build PDFs without re-downloading every time.
      hydrateAssetDataUrls();
    } catch (e) {
      console.error('[cloud] Boot failed — operating in OFFLINE mode', e);
      // Stay with the offline cache. Wizard still works locally, sync resumes
      // once the user reconnects and reloads.
      ready = true;
      readyResolve();
      window.dispatchEvent(new CustomEvent('cs:offline', { detail: { error: e.message } }));
    }
  }

  // ====== Public API ======
  window.cs = {
    ready: () => readyPromise,
    isReady: () => ready,
    get workspace() { return workspace; },
    get user() { return user; },
    get cache() { return cache; },

    // Workspace management
    joinWorkspace,
    getInviteCode: () => workspace?.invite_code,

    // Project CRUD
    upsertProject,
    deleteProject,
    getProject: (id) => cache.projects.get(id),
    listProjects: () => [...cache.projects.values()],

    // Idea CRUD
    upsertIdea,
    deleteIdea,
    getIdea: (id) => cache.ideas.get(id),
    listIdeas: () => [...cache.ideas.values()],

    // Settings
    setActiveProject,
    setActiveIdea,
    getActiveProjectId: () => cache.settings.active_project_id,
    getActiveIdeaId: () => cache.settings.active_idea_id,

    // Assets
    uploadAsset,
    deleteAsset,
    fetchAssetAsDataUrl,
  };

  boot();
})();
