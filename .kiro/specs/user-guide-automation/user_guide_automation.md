User Guide Automation
---------------------

Implements a lightweight, vendor-neutral pipeline that discovers reports and semantic models, builds a page/visual inventory and semantic dictionary, proposes DAX hygiene updates, and synthesizes a publishable user guide.

Quick start:

- Run on current repo: `make userguide`
- Run on sample fixture: `make userguide-sample`
- CI-friendly run: `make userguide-ci-validate`
- HTTP API: `make api` (then GET `/health`, `/status?report=<Name>&base=<repo>`, `/metrics?report=<Name>&base=<repo>`)

Outputs (adjacent to report directory):

- `page_visual_helper.txt`
- `data-dictionary.txt`
- `dax_updates.csv` (optional, only when suggestions exist)
- `dimMetadata-template.csv`
- `semantic-guide.md`
- `User Guide_v1.1.md`

Notes:

- TMDL parsing is conservative and schema-oriented; it captures table/column/measure definitions sufficient for dictionary generation.
- PBIP `definition.json` parsing supports common `sections.visualContainers` and a simplified `pages[*].visuals[*]` shape.
- The pipeline validates headers and cross-references and degrades gracefully when certain assets are missing.

Configuration:

- Optional `user_guide_automation.json` at repo root:
  - `{ "output_strategy": "adjacent", "centralized_output_dir": null, "parallelism": 2 }`
- Or pass `--config <path>` to CLI.

CI/CD:

- Validate absence of binary `.pbix` files: `python -m scripts.user_guide_automation.cli --repo . --validate-no-pbix`
- End-to-end CI stage: `python -m scripts.user_guide_automation.ci_validate`

Error handling and recovery:

- Each agent failure is recorded in `<Report>.Report/automation_status.json`; pipeline continues with next agents where possible.
- Metrics emitted to `<Report>.Report/automation_metrics.json`.

Docker:

- Build: `docker build -t userguide-automation .`
- Run API: `docker run -p 8089:8089 userguide-automation`
