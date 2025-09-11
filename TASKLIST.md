# FabricAgent — Task List (Working Plan)

This file tracks the concrete work items derived from `todo.md` and the tasks-template. It’s structured for quick pickup in a new session and mirrors the repo layout (frontend lives in `src/`).

Legend

- [x] Done • [ ] Pending • [P] Parallelizable

Quick Commands

- Install: `make install`
- Dev server: `make dev` (open <http://localhost:5173>)
- Build: `make build`
- Preview build: `make preview`
- Validate: `make validate` • Verify: `make verify`

Environment

- Help center (in-app Help iframe): set `VITE_HELP_CENTER_URL` (preferred) or `VITE_HELP_URL` at build time.
- Static Help page: `src/public/help/index.html` (served at `/help`).

Progress Snapshot

- Completed in this branch:
  - T013, T015, T016, T018
- Pending/next up: T014 (Suggestions UI), then T017, T019–T023, T020 favorites, etc.

## Phase 3.1: Setup

- [x] T001 Create `src/components/search/SearchSuggestions.tsx` and `src/hooks/useSuggestions.ts` scaffolds for query suggestions and keyboard navigation.
- [x] T002 Extend synonyms and pillar constants in `src/constants.ts` (add `PILLAR_DESCRIPTIONS` for `career-soft-skills`).
- [x] T003 [P] Add localStorage helpers `src/utils/storage.ts` for favorites, view counts, and ratings (get/set/toggle with namespaced keys).
- [x] T004 [P] Add lightweight focus trap util `src/utils/focusTrap.ts` (trap within container; return release function).
- [x] T005 [P] Create onboarding scaffold `src/components/ui/Onboarding.tsx` (dismissible “Get Started” callout).

## Phase 3.2: Tests First (TDD)

- [ ] T006 [P] Unit tests for advanced search parsing and synonyms expansion in `src/tests/search.spec.ts`.
- [ ] T007 [P] Unit tests for suggestion ranking (prefix, tag, synonym, recency) in `src/tests/suggest.spec.ts`.
- [ ] T008 [P] E2E test: suggestions show/keyboard selection inserts query in `src/tests-e2e/search-suggestions.spec.ts`.
- [ ] T009 [P] E2E test: deep link `/?id=<promptId>` opens details modal in `src/tests-e2e/share-deeplink.spec.ts`.
- [ ] T010 [P] E2E test: modal focus trap + Esc to close in `src/tests-e2e/accessibility-modal.spec.ts`.
- [ ] T011 [P] E2E test: zero-results renders helpful suggestions + top categories in `src/tests-e2e/zero-results.spec.ts`.
- [ ] T012 [P] Unit tests for favorites storage API in `src/tests/favorites.spec.ts`.

## Phase 3.3: Core Implementation

- [x] T013 Implement suggestion engine in `src/utils/suggest.ts` (derive from names, tags, pillars, synonyms, recent queries).
- [x] T014 Wire suggestions UI into `src/components/filters/FilterBar.tsx` (dropdown under input; arrow keys; Enter to accept; mouse select).
- [x] T015 Integrate `SEARCH_SYNONYMS` in `src/utils/search.ts` (expand tokens pre-parse; de‑dup) and extend `extractHighlightTokens`.
- [x] T016 Add ‘Career & Soft‑Skills’ pillar: update `src/constants.ts` (colors/aliases); ensure `PillarBadge` supports it.
- [x] T017 Update grouped pillars in `src/components/sections/CatalogueSection.tsx` to include “Career & Soft‑Skills”.
- [x] T018 Add sort control (Relevance | Newest | Name) in `src/components/filters/FilterBar.tsx`; implement `scorePrompt()` in `src/utils/search.ts`; apply sort in `src/components/sections/CatalogueSection.tsx`.
- [ ] T019 Add “Related prompts” in details modal (`src/components/tables/PromptDetailsModal.tsx`) based on shared tags/pillars; show up to 5.
- [x] T019 Add “Related prompts” in details modal (`src/components/tables/PromptDetailsModal.tsx`) based on shared tags/pillars; show up to 5.
- [x] T020 Favorites: add star toggle in `src/components/tables/PromptTable.tsx` and `src/components/tables/PromptDetailsModal.tsx`; persist via `utils/storage`; add “Favorites” quick filter chip in `src/components/filters/FilterBar.tsx`.
- [x] T021 Enhance details: render `few_shots` (Examples) and “Tips” sections in `src/components/tables/PromptDetailsModal.tsx` (collapsible).
- [x] T022 Zero‑results UX: replace plain text in `src/components/tables/PromptTable.tsx` with suggestion panel (synonyms, top tags, link to Help); CTAs to clear filters/view favorites.
- [x] T023 Pillar/tag tooltips: use `title` attribute or small tooltip in `src/components/ui/PillarBadge.tsx` with descriptions from `PILLAR_DESCRIPTIONS`.
- [x] T024 Explain Any(OR)/All(AND): add info icon with tooltip next to mode toggle in `src/components/filters/FilterBar.tsx`.
- [x] T025 Keyboard/AT: use `utils/focusTrap` in modal; add “Skip to content” in header; add `id="main-content"` on `<main>` in `src/App.tsx`; ensure focus return.
- [ ] T026 Mobile filters: add `src/components/filters/MobileFilterDrawer.tsx` (off‑canvas) and expose toggle in `FilterBar.tsx` for `sm` breakpoints.
- [x] T027 Onboarding/about: render `Onboarding` in `CatalogueSection` top area (dismissible via storage flag).
- [x] T028 Popularity metrics: increment view count on modal open; show “Trending” badge; enable “Most Viewed” sort.
- [x] T029 Share prompt: “Copy link” in modal; in `src/App.tsx` read `id` query and open modal when data ready.
- [x] T030 Tag filter: extend `FilterState` with `tags: string[]`; compute all tags in `CatalogueSection`; add tag multi‑select chips.
- [x] T031 Advanced search help: add tooltip/inline hint near search input with AND/OR/NOT examples and field qualifiers.
- [ ] T032 New/Updated badges: compute from `created_at`/`updated_at` and render in `PromptTable`.
- [x] T033 Feedback widget: 1–5 rating + comment in modal; store per‑id in `utils/storage`; show local average.

## Phase 3.4: Integration

- [x] T034 Connect favorites filter into query pipeline in `CatalogueSection` and display count badge in `FilterBar`.
- [x] T035 Hook suggestions into zero‑results panel and “did you mean” prompts in `CatalogueSection`.
- [x] T036 Tie popularity metrics to “Most Viewed” sort in `CatalogueSection` via `utils/storage`.
- [x] T037 Ensure deep‑link open runs after data load in `src/App.tsx` (effect watches query + data readiness).

## Phase 3.5: Polish

- [ ] T038 [P] Unit tests for `scorePrompt()` and new sort modes in `src/tests/search-scoring.spec.ts`.
- [ ] T039 [P] E2E tests for favorites persistence + filter in `src/tests-e2e/favorites.spec.ts`.
- [ ] T040 [P] E2E a11y sweep for filter drawer + tooltips in `src/tests-e2e/a11y-filters.spec.ts`.
- [ ] T041 [P] Update docs: `README.md` (search syntax, favorites, sharing) and `src/public/help/index.html` quick tips.
- [ ] T042 Performance: cache suggestions/scoring; verify <200ms render for ~1k items in `src/tests/perf-suggestions.spec.ts`.
- [ ] T043 Remove duplication and run `make build` sanity; ensure a11y isn’t regressed.

## Fun & Delight

- [x] T044 Easter egg — “It Depends” button in header with donation link and local click counter. Env override: `VITE_DONATION_URL`.

## Dependencies

- Tests (T006–T012) before implementation (T013–T033).
- T013/T014/T015/T016 block T018.
- T020 blocks T034; T029 blocks T037; T025/T026 block T040; T028 blocks T036.

## Next Suggested Steps

1) T014: Implement Suggestions UI under the search bar in `FilterBar.tsx` using `utils/suggest` and keyboard navigation.
2) T017: Add the “Career & Soft‑Skills” group to the grouped pillar rendering.
3) T019/T020: Related prompts + Favorites infra to unlock follow‑on UX (T034, T036).

---
Maintainers: Keep this list updated as tasks are completed. Push to `main` to trigger Azure deployment.
