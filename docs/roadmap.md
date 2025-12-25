# BrainLogger Roadmap

This roadmap orders development from the "Data Foundation" up to the "User Experience" and finally the "AI Integration" (Flush cycle).

## Phase 1: Foundation (Backend Core)
**Goal:** Establish the data model and API surface.

- [ ] **Database Schema**
    - [ ] Define `LogEntry` entity (Id, UserId, Timestamp, Type, Content, CompletedAt)
    - [ ] Create EF Core Migrations
    - [ ] Update `postgres.yaml` to ensure persistence
- [ ] **API Scaffold**
    - [ ] `POST /api/log` (Stubbed)
    - [ ] `GET /api/tasks` (Stubbed)
    - [ ] `POST /api/flush` (Stubbed)

## Phase 2: The Loop (Frontend Capture)
**Goal:** Enable the "Capture" friction-free workflow. This is the primary user interaction.

- [ ] **Capture UI**
    - [ ] Create `CaptureForm` component
    - [ ] Implement Type Picker (Task, Idea, Note, Wait)
    - [ ] Connect to `POST /api/log`
- [ ] **Task List UI**
    - [ ] Create `TaskList` component
    - [ ] Display `type='task'` entries
    - [ ] Implement "Mark Done" (Opt-in completion)

## Phase 3: The Brain (Flush Cycle)
**Goal:** Implement the "Forget Freely" promise by offloading to Markdown/NotebookLM.

- [ ] **Markdown Generator**
    - [ ] Implement `MarkdownService` to group entries by date
    - [ ] Format: Header stats, daily grouping, checkbox state
- [ ] **Flush Logic**
    - [ ] `POST /api/flush` implementation
    - [ ] Preview endpoint: `GET /api/flush/preview`
    - [ ] Transactional wipe (`DELETE FROM Logs`)
- [ ] **Export Sync**
    - [ ] Local file write (`/data/export`)
    - [ ] Google Drive Sync (rclone or API)

## Phase 4: Refinement & Polish
**Goal:** Make it smooth and enjoyable.

- [ ] **UI Polish**
    - [ ] Keyboard shortcuts (`Cmd+Enter` to submit)
    - [ ] Micro-interactions (Success fade-out)
    - [ ] Dark mode / Theme alignment
- [ ] **Scheduler**
    - [ ] Implement BackgroundService for auto-flush (Weekly)
- [ ] **Deployment**
    - [ ] Verify K8s volume persistence
    - [ ] Hardening (Env vars for secrets)

## Future / Icebox
- [ ] Voice Capture (Whisper)
- [ ] Multi-user Auth (currently single user assumed per DB)
- [ ] PWA Manifest
