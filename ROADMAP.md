# GameAssist-Foundry Roadmap

This roadmap describes the intended direction of GameAssist-Foundry. It is a
living planning document, not a release promise. Priorities may change when
Foundry compatibility, user value, testing, or project resources justify it.

## Roadmap Policy

- Update this document as scope, order, or feasibility changes.
- Explain material direction changes rather than silently deleting their
  context.
- Keep the three most recent completed release milestones in `Recently
  Completed`.
- Move older completed milestones to `docs/ROADMAP-HISTORY.md` when that record
  is created; do not erase them.
- Keep deferred work visible when it remains a plausible future direction.
- Mark speculative ideas as `Exploratory` rather than presenting them as
  committed features.
- Use these states consistently: `Planned`, `In Progress`, `Blocked`,
  `Deferred`, `Exploratory`, and `Completed`.

---

## Current Direction

Build GameAssist-Foundry as a native Foundry VTT module rather than a literal
port of the Roll20 script. Preserve the useful GameAssist product philosophy:
modular features, beginner-first controls, strong privacy, optional
interoperability, explicit capabilities, safe state ownership, and unusually
good in-source documentation.

The Roll20 edition is the behavior reference and design history. Foundry's
supported APIs, Documents, Hooks, settings, sheets, applications, and native
workflows remain the implementation authority.

## Foundation Milestone

**Status:** In Progress

- Finalize MECHSUITS v1.6.0 universal core and Foundry VTT profile.
- Establish `ARCHITECTURE.md` with project tree, active profile registry,
  codename registry, module boundaries, and dependency direction.
- Establish the Foundry package manifest, TypeScript/build strategy, test
  strategy, localization structure, templates, styles, and generated-output
  policy.
- Define supported Foundry, D&D 5e system, browser, and Node tooling versions.
- Build the core lifecycle, settings, diagnostics, capability detection,
  migrations, authority, and module registry.
- Produce a minimal installable module that can enable, disable, and report the
  health of one harmless demonstration feature.

## Product-Mapping Milestone

**Status:** Planned

- Inventory each Roll20 GameAssist service and module by user value rather than
  by source-code similarity.
- Classify each behavior as `Foundry Native`, `Adapt`, `Rebuild`, `Defer`, or
  `Retire`.
- Identify which features belong in core services, independent modules, system
  adapters, or optional interoperability layers.
- Record privacy, authority, state, migration, and sheet-capability needs for
  every proposed module.
- Choose the first production vertical slice based on value, feasibility, and
  the amount of native Foundry behavior it can reuse.

## First Production Milestone

**Status:** Planned

- Build one complete module from settings through UI, persistence, permissions,
  restart behavior, automated verification, and Foundry acceptance checks.
- Use that vertical slice to prove the module architecture and documentation
  patterns before multiplying them across the package.
- Publish installation, configuration, compatibility, limitations, and test
  guidance that describes only verified behavior.

## Candidate Module Waves

The order below is provisional until the product-mapping milestone is complete.

### Native-First Utilities

**Status:** Exploratory

- Welcome and session-start presentation.
- Navigation, settings, help, and module health.
- Condition and marker workflows that add value beyond native Active Effects.
- NPC identity, HP, reporting, and encounter-history tools where Foundry does
  not already provide an equivalent workflow.

### Combat and Character Workflows

**Status:** Exploratory

- Initiative and combat assistance that extends rather than replaces Foundry's
  Combat Tracker.
- Concentration, effects, healing, and attacks built around supported `dnd5e`
  capabilities.
- Explicit 2014 and 2024 capability handling without pretending parity where
  the system exposes different data or workflows.

### Campaign and Almanac Workflows

**Status:** Exploratory

- Calendar, climate, weather, travel, and environment tools evaluated against
  established Foundry modules before custom implementation.
- Optional integrations that remain isolated from unrelated GameAssist
  modules.
- Saved campaign locations and GM-facing generation palettes only where they
  provide clear value beyond existing Foundry tools.

## Deferred

**Status:** Deferred

- Exact feature parity with the Roll20 edition.
- A simultaneous Roll20 and Foundry development track.
- External telemetry or hosted GameAssist services.
- Broad support for game systems other than `dnd5e` before the Foundry
  architecture and first production module are proven.
- Reimplementation of native Foundry behavior solely to preserve a Roll20
  interaction pattern.

## Recently Completed

No versioned GameAssist-Foundry release has been completed yet. When releases
begin, this section will retain the three most recent completed milestones with
their version, date, outcome, and important limitations.


