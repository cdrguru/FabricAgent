# Executive Briefing: FabricAgent

> Provenance: This briefing summarizes an AI‑generated video created with Google Notebook (NotebookLM) to introduce FabricAgent. It is not meeting minutes. The video and this document were produced from project materials in this repository to provide an executive‑level overview.

## What FabricAgent Is

- Governed prompt catalog and explorer for Microsoft Fabric and Power BI.
- React single‑page app (Vite) that lets users browse, search, and filter a curated set of prompts with provenance, tags, and links to source material.
- Includes two main sources today: prompts derived from Guy in a Cube videos (GIAC) and a set of curated “workforce” prompts for common roles and tasks.
- Public demo: <https://fabricprompts.com/>

## What the Video Covers

- Problem framing: teams need consistent, governed prompts for Fabric/Power BI work.
- Guided tour of the UI: Catalogue (with GIAC filtering and badges), Workforce library, Workflow/DAG visualization, and Help.
- How GIAC prompts link back to YouTube sources to preserve context and credibility.
- Quick start: cloning the repo, running `npm install` and `npm run dev`, and opening `http://localhost:5173/`.
- How to contribute new prompts and pass basic validations before submitting a PR.

## How It Works (At a Glance)

- Frontend only in this repo: static assets served by Vite; no backend services required to run locally.
- Data is loaded from JSON under `src/public` (e.g., prompts, DAG metadata, schemas).
- The “Help” URL is environment‑driven so docs can be hosted separately.
- A separate content pipeline may be used to curate prompts from external sources (e.g., GIAC transcripts). That pipeline is not part of this frontend, but its outputs are included as structured JSON.

## Value for Teams

- Standardizes high‑quality prompts so analysts and developers don’t start from scratch.
- Improves discoverability via filters (source, pillars/tags, search) and visual indicators.
- Encourages governance through schema, consistency, and visible provenance.
- Reduces drift by anchoring prompts to trusted source material (e.g., GIAC videos).

## What’s Not in Scope (This Repo)

- Not a general‑purpose chatbot; it’s a prompt explorer and library.
- Does not connect to your tenant data or require Fabric capacity to run locally.
- Does not include the upstream ingestion/summary pipeline; only the curated results.

## Getting Started

1) Prereqs: Node.js 18+ and npm.
2) Install: `npm install` (from `src/`).
3) Dev: `npm run dev` then open `http://localhost:5173/`.
4) Build: `npm run build` then `npm run preview`.
See `README.md` for deployment details (Azure OIDC) and repo variables.

## Governance and Contributions

- Prompts are structured objects with IDs, descriptions, and tags to ensure auditability.
- Contributions follow a lightweight PR flow with validation checks; see `CONTRIBUTING.md` and `SECURITY.md`.

## Open Issues & Risks

- Pilot and adoption plan: Define owners, timeline, and success criteria for rollout.
- Maintainer/reviewer policy: Clarify human review standards beyond automated checks.
- Safety and quality ops: Establish periodic audits and incident handling.
- Environment integration: Document steps for hosting and change management in enterprise contexts.
- Data governance: Confirm data handling, retention, and compliance requirements for any future ingestion.

## Quick Links

- Live demo: <https://fabricprompts.com/>
- Executive briefing video (hosted): <https://fabricprompts.com/Executive_Briefing.mp4>
- Executive briefing video (local dev): <http://localhost:5173/Executive_Briefing.mp4>
- Repo overview: `README.md`
- Contributing: `CONTRIBUTING.md`
- Security: `SECURITY.md`
