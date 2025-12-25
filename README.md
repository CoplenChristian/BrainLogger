# BrainLogger

> A capture-first logging system for ADHD brains. Buffer locally, flush to NotebookLM, forget freely.

## Overview
BrainLogger is an experiment in "frictionless capture". It's designed to invert the typical PKM model:
- **Capture** is the only priority.
- **Organisation** is delegated to AI (NotebookLM).
- **Storage** is ephemeral (flush and forget).

## Tech Stack
- **Backend**: .NET 8 WebAPI (Postgres/EF Core)
- **Frontend**: React + Vite + TypeScript (Vanilla CSS)
- **Deployment**: Kubernetes (Tilt for dev)

## Development Setup

### Prerequisites
- Docker & Kubernetes (Desktop)
- Tilt (for orchestration)
- Node.js 18+
- .NET 8 SDK

### Running Locally
1. Start the stack with Tilt:
   ```bash
   tilt up
   ```
   
2. Or run manually:
   - **Backend**:
     ```bash
     cd brainlogger-backend
     dotnet run
     ```
   - **Frontend**:
     ```bash
     cd brainlogger-frontend
     npm run dev
     ```

## Project Status
See [Roadmap](docs/roadmap.md) for details.
- [x] Phase 1: Backend Foundation
- [x] Phase 2: Frontend Capture Loop
- [ ] Phase 3: Flush Cycle
