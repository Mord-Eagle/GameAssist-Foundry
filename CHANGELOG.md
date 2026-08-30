# Changelog

This is the living historical ledger for GameAssist-Foundry. It records notable
changes to released code, project structure, compatibility, documentation, and
user-visible behavior.

## Ledger Policy

- Add new release entries; do not rewrite published release history.
- Put current work under `Unreleased` until a release is published.
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

- Established the GameAssist-Foundry repository for the Foundry VTT edition of
  GameAssist.
- Added MECHSUITS v1.5.2 as preserved historical project guidance.
- Added MECHSUITS v1.6.0 as the universal structural and documentation core.
- Added the Foundry VTT v1.0.0 additive MECHSUITS profile for Foundry-specific
  lifecycle, Document, authority, privacy, UI, and game-system contracts.
- Added a proprietary MECHSUITS notice that separates the standard from the
  repository's open-source license.
- Added this append-only changelog and the living project roadmap.

### Documentation

- Defined file-touch `project_version` semantics, collision-safe codename
  derivation, project architecture records, controlled runtime variances, and
  grouped sidecars.
- Strengthened requirements for section narratives, JSDoc/TSDoc or language
  equivalents, purposeful inline notes, and Notes & Comments footers.

### Known Limitations

- No installable Foundry module release has been published yet.


