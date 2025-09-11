# Requirements Document

## Introduction

This feature implements an automated user guide generation system for Fabric/Power BI repositories. The system discovers report and semantic model pairs, analyzes their structure and content, and produces comprehensive, publish-ready user guides through a multi-agent orchestration workflow. The solution is vendor-neutral and works with PBIP/TMDL assets without requiring external dependencies.

## Requirements

### Requirement 1

**User Story:** As a BI developer, I want to automatically generate user guides for my Power BI reports and semantic models, so that I can maintain up-to-date documentation without manual effort.

#### Acceptance Criteria

1. WHEN a repository contains reports in `reports/<ReportName>.Report/definition.json` format THEN the system SHALL discover all report definitions
2. WHEN a repository contains semantic models in `semantic_models/<ModelName>.SemanticModel/definition/**/*.tmdl` format THEN the system SHALL discover all semantic model definitions
3. WHEN multiple reports are present THEN the system SHALL process each report independently
4. WHEN matching semantic models to reports THEN the system SHALL select the model with the highest measure/column reference overlap
5. IF no semantic model matches by name proximity THEN the system SHALL select based on field usage analysis

### Requirement 2

**User Story:** As a documentation maintainer, I want the system to extract complete visual inventories from reports, so that the generated guides accurately reflect the actual report structure.

#### Acceptance Criteria

1. WHEN processing a report definition THEN the system SHALL enumerate all pages in display order
2. WHEN processing each visual THEN the system SHALL capture VisualName, VisualType, and all binding roles (Axis, Legend, Values, Tooltip, Group, Filters)
3. WHEN localized captions are available in cultures/en-US.tmdl THEN the system SHALL use caption names over technical names
4. WHEN visuals have no bound fields THEN the system SHALL include one row with FieldOrMeasure=None and BindingRole=None
5. WHEN drillthrough targets, tooltip pages, or bookmarks exist THEN the system SHALL capture these in the Extra field

### Requirement 3

**User Story:** As a data analyst, I want a canonical dictionary of all tables, columns, and measures, so that I can understand the complete data model structure and available metrics.

#### Acceptance Criteria

1. WHEN processing TMDL files THEN the system SHALL extract all tables, columns, and measures
2. WHEN localized captions exist THEN the system SHALL prioritize caption names over technical names
3. WHEN processing measures THEN the system SHALL include full DAX expressions
4. WHEN data types and format strings exist THEN the system SHALL include them in the dictionary
5. WHEN duration or unit-specific fields are detected THEN the system SHALL add appropriate unit guidance in Notes

### Requirement 4

**User Story:** As a BI architect, I want automated DAX hygiene suggestions, so that I can maintain consistent and clean measure definitions across my models.

#### Acceptance Criteria

1. WHEN duplicate or near-duplicate KPI names are detected THEN the system SHALL flag them for review
2. WHEN unit mismatches are found THEN the system SHALL highlight inconsistencies
3. WHEN proposing name changes THEN the system SHALL only suggest unambiguous improvements
4. WHEN proposing logic changes THEN the system SHALL cite concrete defects in the original DAX
5. WHEN generating suggestions THEN the system SHALL ensure no name collisions occur

### Requirement 5

**User Story:** As a data governance specialist, I want dimension metadata templates generated, so that I can maintain proper glossaries and lineage documentation.

#### Acceptance Criteria

1. WHEN processing table definitions THEN the system SHALL identify dimension-like tables (dim* prefix, small cardinality, or 1-side relationships)
2. WHEN processing dimension columns THEN the system SHALL capture data types and mark key columns
3. WHEN relationships are discoverable THEN the system SHALL add relationship hints
4. WHEN excluding fact tables THEN the system SHALL only include relationship information
5. WHEN generating templates THEN the system SHALL not invent descriptions

### Requirement 6

**User Story:** As a business user, I want semantic guides that explain the model structure and key metrics, so that I can understand how to use the data effectively.

#### Acceptance Criteria

1. WHEN generating semantic guides THEN the system SHALL summarize model areas, grains, and core relationships
2. WHEN mapping personas to pages THEN the system SHALL use exact names from the visual inventory
3. WHEN describing KPIs THEN the system SHALL use exact measure names from the dictionary
4. WHEN DAX updates are available THEN the system SHALL apply naming overrides consistently
5. WHEN referencing measures or pages THEN the system SHALL ensure all references exist in source data

### Requirement 7

**User Story:** As a documentation publisher, I want complete, publish-ready user guides generated, so that I can distribute accurate documentation to end users without manual editing.

#### Acceptance Criteria

1. WHEN generating final guides THEN the system SHALL use exact names from all input files with DAX update overrides applied
2. WHEN describing units THEN the system SHALL be explicit and consistent (e.g., seconds vs HH:MM:SS)
3. WHEN Microsoft-specific features are not present THEN the system SHALL list them in "Not Implemented" appendix with rationale
4. WHEN generating table of contents THEN the system SHALL align to page order in the report
5. WHEN creating appendices THEN the system SHALL include page/visual/field inventory, glossary, and not implemented features
6. WHEN versioning guides THEN the system SHALL set Version=1.1, Last Updated=YYYY-MM-DD, and include change log
7. WHEN completing guides THEN the system SHALL ensure zero placeholders remain in main body

### Requirement 8

**User Story:** As a DevOps engineer, I want the system to integrate with CI/CD pipelines, so that documentation stays synchronized with code changes automatically.

#### Acceptance Criteria

1. WHEN orchestrating the workflow THEN the system SHALL discover all report directories and match semantic models
2. WHEN validating outputs THEN the system SHALL verify presence of required files (page_visual_helper.txt, data-dictionary.txt, dimMetadata-template.csv)
3. WHEN DAX updates exist THEN the system SHALL check for name collisions and uniqueness
4. WHEN committing changes THEN the system SHALL create feature branches and open pull requests
5. WHEN running CI validations THEN the system SHALL ensure schema and safety validations pass
6. WHEN adding files THEN the system SHALL only include .pbip/TMDL and documentation files, never .pbix files

### Requirement 9

**User Story:** As a system administrator, I want configurable output locations, so that I can organize documentation according to our repository structure standards.

#### Acceptance Criteria

1. WHEN no output directory is specified THEN the system SHALL place guides next to reports by default
2. WHEN docs/guides/ directory is preferred THEN the system SHALL support centralized documentation location
3. WHEN processing multiple reports THEN the system SHALL maintain consistent output structure
4. WHEN generating file paths THEN the system SHALL use exact repo-relative paths without external dependencies
5. WHEN creating output files THEN the system SHALL use UTF-8 encoding and appropriate delimiters

### Requirement 10

**User Story:** As a quality assurance analyst, I want comprehensive validation and error handling, so that the system produces reliable outputs and fails gracefully when issues occur.

#### Acceptance Criteria

1. WHEN input files are missing or malformed THEN the system SHALL provide clear error messages
2. WHEN name pairing between reports and models is ambiguous THEN the system SHALL resolve using binding analysis and measure references
3. WHEN localized captions are missing THEN the system SHALL fall back to technical names without inventing display text
4. WHEN mixed repository structures are encountered THEN the system SHALL adapt discovery logic appropriately
5. WHEN validation failures occur THEN the system SHALL prevent publication and report specific issues