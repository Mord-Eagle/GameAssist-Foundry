# Changelog

This is the living historical ledger for GameAssist-Foundry. It records notable
changes to released code, project structure, compatibility, documentation, and
user-visible behavior.

## Ledger Policy

- Add new release entries; do not rewrite published release history.
- Put current work under `Unreleased` until a release is published.
- Date every entry using ISO `YYYY-MM-DD`. Published release headings include
  their release date; each `Unreleased` bullet begins with its own change date.
- Preserve accurate prior entries even when the implementation later changes.
- Correct a material historical error with a dated correction note rather than
  silently replacing the original account.
- Keep internal conversation and assistant narration out of release entries.
- Distinguish implemented, locally verified, Foundry-tested, experimental, and
  deferred work when that distinction matters.
- Link issues or decisions when they explain a user-visible change or an
  important compatibility choice.

The newest release appears first. Within a release, use only the categories
that apply: `Added`, `Changed`, `Fixed`, `Deprecated`, `Removed`, `Security`,
`Documentation`, and `Known Limitations`.

---

## Unreleased

### Added

- 2026-08-31 - Added the project architecture record, compatibility and
  ecosystem-overlap record, and reusable component design-review template for
  service-by-service and module-by-module development.
- 2026-08-31 - Added the maintainer development workflow for secure GitHub
  authorization, branch handling, Foundry deployment boundaries, and recovery.
- 2026-08-29 - Established the GameAssist-Foundry repository for the Foundry
  VTT edition of GameAssist.
- 2026-08-29 - Added MECHSUITS v1.5.2 as deprecated historical guidance;
  MECHSUITS v1.6.0 and its approved profiles govern current repository work.
- 2026-08-29 - Added MECHSUITS v1.6.0 as the universal structural and
  documentation core.
- 2026-08-29 - Added the Foundry VTT v1.0.0 additive MECHSUITS profile for
  Foundry-specific lifecycle, Document, authority, privacy, UI, and game-system
  contracts.
- 2026-08-29 - Added a proprietary MECHSUITS notice that separates the standard
  from the repository's open-source license.
- 2026-08-29 - Added this append-only changelog and the living project roadmap.

### Documentation

- 2026-08-31 - Locked the initial development baseline to Foundry VTT Version
  14 Stable, Build 367 with the official `dnd5e` system v5.3.3; separated the
  future AlmanacAssist package from GameAssist's implementation path; and
  documented native-first module and compendium evaluation.
- 2026-08-31 - Recorded the read-only Foundry inventory and excluded two legacy
  Foundry v11 module folders and one legacy v11 world from the v14 development
  and acceptance baseline.
- 2026-08-30 - Rebuilt the project roadmap around owner-approved design gates
  for every service and module, a native-first Foundry implementation order,
  explicit state and authority ownership, and a separate optional
  AlmanacAssist package boundary.
- 2026-08-29 - Defined file-touch `project_version` semantics, collision-safe
  codename derivation, project architecture records, controlled runtime
  variances, and grouped sidecars.
- 2026-08-29 - Strengthened requirements for section narratives, JSDoc/TSDoc or
  language equivalents, purposeful inline notes, and Notes & Comments footers.
- 2026-08-29 - Required ISO date stamps for every changelog entry.
- 2026-08-29 - Clarified the constitutional and procedural order of artifact
  classification, standardized class and specialized-profile terminology,
  aligned changelog and roadmap obligations with the compliance checklist, and
  removed remaining campaign-specific language from the universal standard.

### Known Limitations

- 2026-08-29 - No installable Foundry module release has been published yet.

