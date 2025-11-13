<!-- Sync Impact Report
Version change: N/A → 1.0.0
List of modified principles: N/A (initial creation)
Added sections: All sections added
Removed sections: None
Templates requiring updates: plan-template.md ✅ updated
Follow-up TODOs: Set RATIFICATION_DATE when known
-->
# Speckit Constitution

## Core Principles

### I. Library-First
Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries

### II. CLI Interface
Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats

### III. Test-First (NON-NEGOTIABLE)
TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced

### IV. Integration Testing
Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas

### V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity
Text I/O ensures debuggability; Structured logging required; MAJOR.MINOR.BUILD format for versioning; Start simple, YAGNI principles

## Additional Constraints
Technology stack requirements: Python 3.8+ for CLI tools; Compliance standards: Open source licensing (MIT/Apache); Deployment policies: Local execution primarily, containerized if needed for distribution

## Development Workflow
Code review requirements: All PRs must be reviewed by at least one maintainer; Testing gates: CI must pass all unit and integration tests; Deployment approval process: Automated merge to main branch after review

## Governance
Constitution supersedes all other practices; Amendments require documentation, approval, and migration plan; All PRs/reviews must verify compliance with constitution principles; Complexity must be justified against simplicity principle; Use development guidelines for runtime guidance

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date unknown, to be set upon confirmation | **Last Amended**: 2025-11-13
