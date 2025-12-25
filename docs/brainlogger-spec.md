# BrainLogger Specification

> A capture-first logging system for ADHD brains. Buffer locally, flush to NotebookLM, forget freely.

---

## Problem Statement

Traditional PKM tools (Notion, Obsidian, Roam) fail for ADHD users because they require ongoing executive function: tagging, linking, organizing, maintaining. The result is a "digital graveyard" - notes go in but never come out.

BrainLogger inverts the model:
- **Capture** is frictionless (type + text, nothing else)
- **Organization** is outsourced to AI (NotebookLM)
- **Local storage** is ephemeral (flush and wipe on schedule)

---

## Core Principles

1. **No taxonomy maintenance** - No tags, folders, or links to manage
2. **Append-only logging** - State changes are events, not edits
3. **Typed entries** - Structure lives in entry types, not metadata
4. **Scheduled forgetting** - Local buffer flushes to long-term AI memory
5. **Completion as event** - Tasks aren't checked off, they're marked DONE in the log

---

## Data Model

### Logs Table

```sql
CREATE TABLE logs (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id),
    timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type          VARCHAR(20) NOT NULL CHECK (type IN ('task', 'idea', 'note', 'wait')),
    content       TEXT NOT NULL,
    completed_at  TIMESTAMPTZ NULL
);

CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_type ON logs(type);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
```

### Entry Types

| Type | Purpose | Has Completion? |
|------|---------|-----------------|
| `task` | Something to do | Yes |
| `idea` | Something to remember | No |
| `note` | Context, reference, observation | No |
| `wait` | Blocked on external input | No |

> **Open Question:** Should `wait` have completion? It's kind of a task that you can't act on. Maybe `WaitResolved` as an event?

> **Open Question:** Additional types? Original prototype had GYM, PROJ. Do those belong as types or as content prefixes?

---

## API Endpoints

### Capture

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/log` | Create entry |

**POST /api/log**
```json
{
  "type": "task",
  "content": "Review PR from Tim"
}
```

Response: `201 Created`

### Tasks

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/tasks` | List open tasks |
| `POST` | `/api/tasks/{id}/complete` | Mark task complete |

**GET /api/tasks**

Returns JSON array of entries where `type = 'task' AND completed_at IS NULL`, ordered by timestamp descending.

**POST /api/tasks/{id}/complete**

Sets `completed_at = NOW()` for the given task ID.

Response: `204 No Content`

### Flush

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/flush/preview` | Preview export without flushing |
| `POST` | `/api/flush` | Execute flush cycle |
| `GET` | `/api/settings` | View/edit flush schedule |

**GET /api/flush/preview**

Returns:
- Entry count by type
- Date range covered
- Open vs completed task counts
- Rendered markdown preview

**POST /api/flush**

Executes the full flush cycle (see below). Returns summary of what was exported and wiped.

---

## Flush Cycle

Triggered by scheduler or manual `/flush` call.

### Steps

1. **Query** all entries ordered by `Timestamp ASC`
2. **Generate** markdown (see format below)
3. **Write** to `/data/export/brainlog-{flush-timestamp}.md`
4. **Sync** to Google Drive folder
5. **Wipe** SQLite: `DELETE FROM Logs`
6. **Log** flush metadata (optional separate table or stdout)

### Markdown Export Format

```markdown
# BrainLog Export
Generated: 2025-12-21T18:00:00Z
Entries: 47 | Tasks: 12 (8 completed)

---

## 2025-12-20

- [09:14] TASK: Review PR from Tim
- [09:30] IDEA: Route BrainLogger into Claude Code memory
- [10:15] NOTE: Sarah mentioned Q1 budget is tight
- [11:00] WAIT: API credentials from client
- [14:45] DONE: Review PR from Tim
- [16:00] TASK: Follow up with client on timeline

## 2025-12-21

- [08:00] NOTE: Slept poorly, low energy day
- [08:30] TASK: Book dentist appointment
- [09:00] IDEA: Add voice capture via Whisper
- [12:00] DONE: Book dentist appointment
```

### Why This Format?

- **Chronological within days** - Matches how memory works
- **DONE as separate entry** - NotebookLM can answer "what did I complete this week" without parsing checkbox state
- **Header metadata** - Quick stats for sanity checking before NotebookLM ingests
- **No nested structure** - Flat list is easier for LLMs to parse

> **Open Question:** Should incomplete tasks be flagged differently in export? e.g., `- [09:14] TASK (OPEN): Review PR from Tim`

---

## Scheduler

### Implementation

.NET `BackgroundService` with cron-like scheduling via `Cronos` library or simple interval timer.

### Configuration

```json
{
  "FlushSchedule": {
    "Enabled": true,
    "Cron": "0 0 * * 0",    // Weekly on Sunday midnight
    "RetainExports": 4       // Keep last N export files locally
  }
}
```

> **Open Question:** Flush cadence - daily? weekly? Should it align with a natural review rhythm or just run invisibly?

> **Open Question:** Should flush require minimum entry count? Avoid creating tiny export files with 2 entries.

---

## User Interface

### Capture Screen (GET /)

```
┌──────────────────────────────────────┐
│                                      │
│   [TASK]  [IDEA]  [NOTE]  [WAIT]    │  ← Type selector (tap/click)
│                                      │
├──────────────────────────────────────┤
│                                      │
│   What's on your mind?               │  ← Text input
│                                      │
│                                      │
├──────────────────────────────────────┤
│                                      │
│            [CAPTURE]                 │  ← Submit (Cmd+Enter on desktop)
│                                      │
└──────────────────────────────────────┘
```

**Behavior:**
- Type defaults to `note` (lowest friction)
- Selected type is visually highlighted
- Keyboard shortcut: `Cmd+Enter` / `Ctrl+Enter` submits
- After submit: clear form, brief success indicator, stay on page
- No confirmation dialogs

### Tasks Screen (GET /tasks)

```
┌──────────────────────────────────────┐
│  Open Tasks                     [3]  │
├──────────────────────────────────────┤
│                                      │
│  ○  Review PR from Tim         12/20 │  ← Tap circle to complete
│  ○  Follow up with client      12/20 │
│  ○  Book dentist appointment   12/21 │
│                                      │
├──────────────────────────────────────┤
│  [← Capture]              [Preview]  │
└──────────────────────────────────────┘
```

**Behavior:**
- Sorted by timestamp (oldest first? newest first?)
- Tap/click the circle → immediate completion, no confirm
- Visual feedback: task fades out or strikes through
- Shows relative date for context

> **Open Question:** Show completed tasks on this screen (struck through) or hide them entirely?

### Preview Screen (GET /preview)

```
┌──────────────────────────────────────┐
│  Flush Preview                       │
├──────────────────────────────────────┤
│                                      │
│  Period: Dec 15 - Dec 21, 2025       │
│  Entries: 47                         │
│  Tasks: 12 (8 completed, 4 open)     │
│  Ideas: 15                           │
│  Notes: 18                           │
│  Waiting: 2                          │
│                                      │
├──────────────────────────────────────┤
│  [View Markdown]       [Flush Now]   │
└──────────────────────────────────────┘
```

---

## Infrastructure

### Repository Structure

```
brainlogger-backend/              (repo 1)
├── Tiltfile                      # Backend-only dev
├── src/
│   └── Program.cs
├── BrainLogger.csproj
├── Dockerfile
└── k8s/
    ├── deployment.yaml
    └── service.yaml

brainlogger-frontend/             (repo 2)
├── Tiltfile                      # Frontend-only dev
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── Capture.tsx
│   │   ├── TypePicker.tsx
│   │   ├── TaskList.tsx
│   │   └── FlushPreview.tsx
│   └── api/
│       └── client.ts
├── package.json
├── vite.config.ts
├── Dockerfile
└── k8s/
    ├── deployment.yaml
    └── service.yaml

brainlogger-deploy/               (repo 3)
├── Tiltfile                      # Orchestrates full stack
├── k8s/
│   ├── namespace.yaml
│   ├── postgres.yaml             # StatefulSet + PVC
│   ├── secrets.yaml              # DB credentials, API keys
│   └── ingress.yaml
└── tilt_config.json              # Points to sibling repos
```

### Container Layout

```
backend container:
/app                              ← Application binaries

frontend container:
/usr/share/nginx/html             ← Built React assets

postgres container:
/var/lib/postgresql/data          ← Database files (PVC mounted)

host volume:
~/Brain/export/                   ← Markdown exports (mounted to backend)
```

### Database

**Postgres** running as a container in the deploy stack.

#### Volume Options

**Option A: hostPath (Recommended for Phase 1)**

Data lives on your Mac's filesystem. Survives Tilt restarts, K8s resets, Docker updates.

```yaml
# brainlogger-deploy/k8s/postgres.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16
        env:
        - name: POSTGRES_DB
          value: brainlogger
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        volumeMounts:
        - name: pgdata
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: pgdata
        hostPath:
          path: /Users/YOUR_USER/Brain/pgdata
          type: DirectoryOrCreate
```

Host folder structure:
```
~/Brain/
├── pgdata/          ← Postgres data (survives everything)
└── export/          ← Markdown exports for Drive sync
```

**Option B: PersistentVolumeClaim (For production/multi-node)**

Data managed by K8s. Survives pod restarts but tied to cluster lifecycle.

```yaml
# brainlogger-deploy/k8s/postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16
        env:
        - name: POSTGRES_DB
          value: brainlogger
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        volumeMounts:
        - name: pgdata
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: pgdata
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 1Gi
```

| Scenario | hostPath | PVC |
|----------|----------|-----|
| `tilt down` → `tilt up` | ✓ Survives | ✓ Survives |
| Restart Mac | ✓ Survives | ✓ Survives |
| Delete K8s cluster | ✓ Survives | ✗ Gone |
| Easy backup | ✓ Just copy folder | ✗ Need pg_dump |
| Multi-node cluster | ✗ Node-local | ✓ Works |

**Recommendation:** Use hostPath for Phase 1 personal tool. Switch to PVC or managed Postgres (Neon, Supabase) if you go multi-user.

Connection string pattern:
```
Host=postgres;Database=brainlogger;Username=${DB_USER};Password=${DB_PASS}
```

### Google Drive Sync

**Option A: Drive Desktop App (Simplest)**

Google Drive for Desktop syncs `~/Brain/export/` automatically. NotebookLM sources point to Drive folder.

**Option B: rclone (More Control)**

```bash
rclone sync /data/export gdrive:BrainLogger/
```

Run via cron or as part of flush cycle.

**Option C: Drive API (Most Robust)**

Direct API upload from application. Requires OAuth setup but gives confirmation of successful upload.

> **Open Question:** Which sync method? Trade-off between simplicity and reliability.

---

## NotebookLM Integration

### The Limitation

NotebookLM has no public API. You cannot programmatically:
- Add sources
- Trigger sync
- Query notebooks
- Generate audio overviews

### Current Workflow

1. Add Google Drive folder as source in NotebookLM (one-time setup)
2. BrainLogger flushes markdown to that folder
3. **Manual step:** Click "Sync" in NotebookLM to ingest new files

### Alternatives Considered

| Approach | Viable? | Notes |
|----------|---------|-------|
| Browser automation (Playwright) | Fragile | Breaks on UI changes, auth complexity |
| Gemini API directly | Yes | Loses NotebookLM features (audio, notebook UI) |
| Wait for API | Unknown | Google hasn't announced anything |

### Recommendation

Accept the single manual "Sync" click. Everything else is automated. The friction is minimal and the NotebookLM features (especially audio overview) are worth it.

> **Open Question:** Build a parallel Gemini API query path for quick lookups without opening NotebookLM?

---

## Future Considerations

### Voice Capture

Whisper API or local Whisper model for voice-to-text capture. Useful for phone capture while walking.

> Marked out of scope per discussion. Revisit later if needed.

### Claude Code Memory Integration

BrainLogger captures could feed into the Router Pattern memory system. Shared schema, separate flush targets.

### Multiple Flush Targets

Same capture buffer, different export formats:
- Markdown for NotebookLM
- JSON for Claude Code memory
- Structured data for analytics

### PWA Support

`manifest.json` + service worker for installable home screen app on mobile.

---

## Development Stack

| Component | Technology |
|-----------|------------|
| Backend | .NET 8 (ASP.NET Core Minimal API) |
| Frontend | React + Vite + TypeScript |
| Database | Postgres 16 via Npgsql |
| Container | Docker with multi-stage builds |
| Orchestration | Kubernetes via Tilt (local dev) |
| Scheduling | BackgroundService + Cronos |

---

## Open Questions Summary

1. **Wait completion** - Should `wait` type have a completion state?
2. **Additional types** - GYM, PROJ, or keep it minimal?
3. **Flush cadence** - Daily, weekly, or configurable?
4. **Minimum flush size** - Require N entries before flushing?
5. **Open task marking in export** - Explicit OPEN label or just absence of DONE?
6. **Task sort order** - Oldest first (work through backlog) or newest first (recent context)?
7. **Show completed tasks** - On tasks screen or hide until flush?
8. **Drive sync method** - Desktop app, rclone, or API?
9. **Gemini API fallback** - Build direct query path alongside NotebookLM?

---

## Next Steps

1. Finalize open questions
2. Create `brainlogger-deploy` repo with Postgres + Tiltfile
3. Create `brainlogger-backend` repo with schema migrations + API
4. Create `brainlogger-frontend` repo with React + Vite scaffold
5. Build capture and tasks endpoints (backend)
6. Build capture and tasks UI (frontend)
7. Implement flush cycle
8. Set up Drive sync
9. Test full flow: capture → flush → NotebookLM sync → query
