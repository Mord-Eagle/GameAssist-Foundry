# GameAssist-Foundry Compatibility Record

**Status:** Foundation baseline

**Last updated:** 2026-08-31

This document records the environment GameAssist is designed and tested
against, likely overlap with Foundry and third-party packages, and the evidence
required before making compatibility claims.

## Status Vocabulary

- **Baseline:** The locked environment used for current development.
- **Verified:** Tested successfully through the relevant acceptance checks.
- **Candidate:** Worth evaluating; not installed, required, or promised.
- **Optional integration:** Supported only when present and compatible.
- **Conflict:** Known to compete for the same behavior or state.
- **Unsupported:** Deliberately outside the current contract.
- **Unknown:** Not tested or not exposed reliably enough to claim.

## Initial Development Baseline

| Component | Baseline | Evidence status |
| --- | --- | --- |
| Foundry VTT | Version 14 Stable, Build 367 | Owner-confirmed installation |
| Game system | Dungeons & Dragons Fifth Edition 5.3.3 | Owner-confirmed installation |
| Host | Foundry desktop on Windows | Owner-confirmed installation |
| Server configuration | Foundry defaults; no custom server configuration | Owner-confirmed |
| Add-on modules | No current v14 add-on modules enabled; two legacy v11 module folders remain on disk | Owner-confirmed and locally inventoried |
| Custom compendia | None created or installed | Owner-confirmed |
| GameAssist | Planned 0.1.0 foundation | Not implemented |

The local Foundry user-data path is intentionally not published in this
repository. Development guidance will use Foundry's `{userData}` placeholder.

This baseline does not yet establish a public minimum or verified range.
Compatibility expands only after targeted evidence exists.

## Planned Test Environments

1. **GameAssist Development** - Rapid development with GameAssist and only the
   minimum tools needed to inspect behavior.
2. **GameAssist Acceptance** - Clean world using the locked Foundry and
   `dnd5e` baseline, disposable Actors, and controlled GM/player accounts.
3. **Campaign Template** - Prepared only after release gates pass; never used as
   the sole proof that a feature works.

Tests involving privacy or authority require at least one GM and one non-GM
user. Tests involving responsible-GM behavior require multiple connected
clients when that behavior is implemented.

## Observed Local Inventory

Read-only inspection confirmed:

- The installed `dnd5e` manifest reports v5.3.3, minimum Foundry 13.347, and
  publisher verification for Foundry 14.
- 5e Spellblock Importer v1.2.1 remains on disk with a declared maximum of
  Foundry v11.
- Universal Battlemap Importer v3.0.0 remains on disk with a declared maximum
  of Foundry v11.
- One legacy campaign world reports Foundry v11.315 and `dnd5e` v3.1.2.

The two legacy module folders are not part of the v14 GameAssist baseline and
must remain disabled during development and acceptance. Their removal or
migration is separate campaign housekeeping and is not implied by this record.

## Compatibility Principles

- Foundry and `dnd5e` native behavior is evaluated before custom automation.
- Current package listings are discovery evidence, not proof of interoperability.
- GameAssist starts with no required third-party add-on module.
- An optional dependency must be declared, capability-checked, and isolated.
- A missing optional dependency disables only the integration that needs it.
- Overlap is discussed with the owner during the relevant component design
  review before GameAssist duplicates, integrates, or declines that behavior.
- Compatibility claims include exact versions and the behavior actually tested.
- Upgrading Foundry, `dnd5e`, or an integration candidate requires a focused
  compatibility review before changing the locked acceptance baseline.

## Native Capabilities to Prefer

The design reviews begin with these Foundry and `dnd5e` facilities:

- Foundry Documents, permissions, settings, Hooks, applications, sockets,
  status effects, Active Effects, Combat, Combatants, and compendium packs.
- `dnd5e` Actors, Items, activities, rolls, damage and healing workflows,
  initiative, rests, effects, requests, and system compendium browser.
- Core module relationships for required, recommended, and conflicting
  packages.

Native availability does not automatically eliminate GameAssist. It changes
the question from "Can we build this?" to "What additional workflow would be
meaningfully better?"

## Ecosystem Evaluation Queue

The following packages are candidates for evaluation during the named design
reviews. They are not dependencies or endorsements.

| Package | Relevant review | Current listing evidence | Initial posture |
| --- | --- | --- | --- |
| [DFreds Convenient Effects](https://foundryvtt.com/packages/dfreds-convenient-effects) | ConditionAssist and EffectAssist | Foundry v14 build available; prebuilt D&D effects and an API | Compare before building an effect catalog or effect browser. |
| [Automated Conditions 5e](https://foundryvtt.com/packages/automated-conditions-5e) | ConditionAssist, EffectAssist, AttackAssist | Verified by its author for Foundry 14.367; automates condition influence on rolls | High-priority overlap review for mechanical conditions and auras. |
| [Custom D&D 5e](https://foundryvtt.com/packages/custom-dnd5e) | ConditionAssist, HealthService, TokenAssist, NPCAssist | Foundry v14 listing; includes Bloodied, Dead, condition, token, and travel-related controls | Evaluate individual features; avoid broad dependency unless value is compelling. |
| [Dynamic Active Effects](https://foundryvtt.com/packages/dae) | EffectService and EffectAssist | Foundry v14 build exists, but its listing warns v14 compatibility is still new | Consider only where native Active Effects cannot express an approved need. |
| [Midi-QOL](https://foundryvtt.com/packages/midi-qol) | AttackAssist, HealAssist, CritAssist | Foundry v14 build exists, with new-v14 caution from its listing | Treat as optional automation ecosystem, not GameAssist's default foundation. |
| [Corn's Combat Reminders](https://foundryvtt.com/packages/corns-combat-reminders) | CombatAssist and HealthService | Verified on Foundry v14 and `dnd5e` 5.3.3; reminders include turns, rolls, health, and rests | Compare before implementing reminders or trigger infrastructure. |
| [Combat Stats](https://foundryvtt.com/packages/combat-stats) | NPCAssist and combat reporting | Foundry v14 and `dnd5e` listing; records damage, healing, kills, and encounter summaries | Compare before rebuilding encounter statistics or summaries. |
| [Simple Calendar Reborn](https://foundryvtt.com/packages/foundryvtt-simple-calendar-reborn) | Future AlmanacAssist | Foundry v14; custom calendars, seasons, moons, Hooks, and API | Primary free calendar/timekeeping candidate for AlmanacAssist evaluation. |
| [Simple Timekeeping & Calendar](https://foundryvtt.com/packages/simple-timekeeping) | Future AlmanacAssist | Foundry v14; commercial time, calendar, weather, moon, and lighting tools | Compare UX and ownership when AlmanacAssist design begins. |

Every component review will refresh its relevant entries. A package can move
from candidate to optional integration, conflict, or no-action only after that
focused assessment.

## Compendium Strategy

The official free `dnd5e` system includes SRD system compendia and a compendium
browser. Official premium D&D content is also available separately through the
Foundry ecosystem. GameAssist should use supported UUIDs, Documents, and
compendium discovery rather than copying content into its own data.

Foundry supports:

- **System compendia** supplied by `dnd5e`, including SRD material.
- **Module compendia** supplied by add-on or premium content packages.
- **World compendia** created for one campaign.
- **GameAssist compendia** only if we later create original or properly licensed
  reusable configuration content.

Initial recommendation:

1. Use the `dnd5e` SRD compendia while building and testing generic workflows.
2. Do not make commercial content a GameAssist requirement.
3. Let adapters discover compatible Items, Actors, effects, and tables across
   enabled system, module, and world compendia when a feature needs content.
4. Keep campaign-specific homebrew in world compendia or a separate content
   module so GameAssist upgrades do not overwrite it.
5. Evaluate a GameAssist configuration compendium only when a reviewed feature
   demonstrates a real need.

## Module Review Requirement

Each GameAssist service or module design record must include:

- Native Foundry and `dnd5e` behavior that already addresses the need.
- Current third-party packages with meaningful overlap.
- Benefits and costs of using, integrating, coexisting with, or replacing each
  relevant candidate.
- Required, recommended, conflict, and no-relationship conclusions.
- The behavior available when every optional package is absent.
- Exact versions used for any interoperability acceptance test.

This keeps the ecosystem review local to the feature being designed instead of
installing a large automation stack before we know why it is needed.

## Current Claims and Limitations

- No GameAssist source package is installable yet.
- No GameAssist feature has passed live Foundry acceptance testing.
- No third-party package is required, recommended by the manifest, or declared
  compatible yet.
- Foundry 14.367 and `dnd5e` 5.3.3 are the locked development baseline, not a
  published compatibility range.
- The live Foundry directory has received a read-only inventory; feature and
  interoperability behavior remain untested.
- Broader Foundry versions, later `dnd5e` versions, browsers, hosting modes, and
  non-`dnd5e` systems remain unknown until tested.

## Baseline Change Procedure

Before changing the baseline:

1. Record the proposed Foundry, system, and relevant module versions.
2. Review upstream release notes and changed public contracts.
3. Run local automated checks.
4. Run the affected Foundry acceptance checks in a clean world.
5. Recheck permissions, privacy, restart behavior, migrations, and optional
   integrations.
6. Update this record and the changelog with the evidence level achieved.

An available update is not automatically an approved development baseline.

