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

## Owner Decisions

The following decisions govern the present roadmap:

- GameAssist-Foundry will be one installable GameAssist package containing
  focused internal services and independently configurable feature modules.
- The Foundry edition will be designed for Foundry rather than translated
  line-for-line from the Roll20 edition.
- The Roll20 edition is design history and evidence of user needs. Its current
  implementation is not presumed to be the best Foundry implementation.
- Every proposed service and module will receive an owner-facing design review
  before implementation. That review will revisit purpose, intent, boundaries,
  desired behavior, and Foundry-native opportunities instead of inheriting old
  compromises by default.
- AlmanacAssist will be redesigned later as a separate, optional installable
  package. Neither GameAssist nor AlmanacAssist will require the other for its
  primary behavior.
- Optional interoperability may connect otherwise independent modules or
  packages, but every prerequisite and unavailable behavior must be explicit.

## Product Direction

Build a native Foundry VTT module that preserves the strongest GameAssist
principles: modular features, beginner-first controls, strong privacy,
optional interoperability, explicit capabilities, safe state ownership, and
unusually good in-source documentation.

Foundry's supported APIs, Documents, Hooks, settings, applications, and native
workflows are the implementation authority. The official `dnd5e` system is a
versioned integration surface, not an assumed stable data layout. The initial
implementation baseline is Foundry VTT v14 and the current compatible `dnd5e`
5.3.x line; exact supported versions will be locked and recorded before the
first executable milestone.

GameAssist should extend native Foundry behavior where it adds clear table
value. It should not rebuild a native feature merely to preserve a Roll20
command, menu, workaround, or internal architecture.

## Design Principles

1. **Begin with the table problem.** Define what the GM or player needs before
   choosing a service, Hook, Document, setting, or UI.
2. **Use native Foundry behavior first.** Extend the Combat Tracker, statuses,
   Active Effects, Documents, rolls, and system actions instead of competing
   with them.
3. **Give each mutation one owner.** A service or module must clearly own each
   category of GameAssist-managed state. Observers do not silently become
   competing writers.
4. **Keep modules independently useful.** Shared services may support several
   modules, but an unavailable optional feature must not disable unrelated
   behavior.
5. **Make capability claims explicit.** Detect supported Foundry and `dnd5e`
   behavior and report unavailable or unverifiable results instead of guessing.
6. **Design authority and privacy before convenience.** GM-only data, hidden
   actors, secret rolls, and privileged mutations remain private and
   permission-checked across clients.
7. **Prefer compact, beginner-first interaction.** Common actions stay near the
   surface; technical detail and uncommon controls remain available without
   dominating ordinary use.
8. **Preserve lessons, not accidental limitations.** A Roll20 behavior survives
   only when it still serves the product intent in Foundry.

---

## Component Design Gate

No production service or module begins as a blind port. Before implementation,
we will review that component together and record the approved answers to the
following questions in the appropriate architecture or decision record:

1. What user problem does this component solve, and for whom?
2. What is its purpose, design intent, and explicit non-goals?
3. Which Roll20 behaviors are valuable lessons, and which were platform
   workarounds or compromises?
4. Which Foundry or `dnd5e` capabilities already solve part or all of the
   problem?
5. What state does the component read, own, create, change, and remove?
6. Which service, module, or native Foundry feature is authoritative for each
   mutation?
7. What permissions, privacy boundaries, socket requests, and GM authority are
   required?
8. What dependencies are essential, and which integrations must remain
   optional?
9. What does the beginner-facing workflow look like? What power-user controls
   belong behind settings or deeper views?
10. What capability failures, stale state, restarts, migrations, and recovery
    paths must be handled?
11. What local checks, automated tests, Foundry checks, and acceptance evidence
    establish that the component is ready?

An approved design does not freeze every implementation detail. It establishes
the behavior and ownership boundaries that code must honor. If implementation
reveals a material conflict, the decision returns to review instead of being
quietly changed in code.

## Definition of Ready

A component is ready for implementation when:

- Its design gate has been discussed and its material decisions recorded.
- Native Foundry behavior and likely module overlap have been evaluated.
- Its ownership, dependency direction, capability boundary, and privacy model
  are understood.
- Its first useful user workflow and acceptance criteria are specific enough to
  test.
- Any intentionally deferred behavior is named without being presented as
  implemented.

## Definition of Done

A component is complete only when its approved workflow is implemented through
settings, UI, persistence, permissions, restart behavior, migration behavior,
failure recovery, documentation, and relevant automated and live Foundry
checks. Local validation is not presented as proof of live Foundry behavior.

---

## Execution Roadmap

The order below is intentional but may change after a design review exposes a
better dependency sequence. Each numbered service or module receives its own
design discussion before code is written.

### Phase 0: Architecture and Compatibility Record

**Status:** In Progress

- Establish `ARCHITECTURE.md` with the project tree, active MECHSUITS profiles,
  codename registry, package boundaries, dependency direction, ownership map,
  and generated-output policy.
- Establish a compatibility and overlap matrix covering supported Foundry and
  `dnd5e` versions, native Foundry features, likely third-party overlap, and the
  policy for optional integrations.
- Define the development, acceptance, and campaign-template worlds and record
  their locked package versions.
- Decide the TypeScript, build, localization, template, style, test, manifest,
  packaging, and release-validation strategy.
- Separate public package contracts from internal implementation surfaces; do
  not freeze a broad public API before real consumers establish its value.

### Phase 1: Foundational Services and Package Shell

**Status:** Planned

Review and implement these foundations in order:

1. **Package lifecycle and feature registry** - Initialization order, module
   registration, enable/disable behavior, readiness, teardown, and restart
   safety.
2. **Settings and migration service** - World and client settings, defaults,
   validation, schema versions, preservation, repair, and rollback boundaries.
3. **Capability and `dnd5e` adapter layer** - Version-aware access to supported
   actor, item, roll, rest, health, effect, and combat behavior without
   scattering system paths through feature modules.
4. **Authority and privileged-action service** - Permission checks, responsible
   GM selection, request correlation, deduplication, stale-request handling,
   privacy, and failure reporting. Foundry sockets carry requests; they do not
   replace GameAssist authority rules.
5. **Semantic event and diagnostics services** - Stable GameAssist event
   meanings, structured local diagnostics, health reporting, and inspectable
   failure evidence. Foundry Hooks remain synchronous notification points;
   asynchronous workflows must not depend on Foundry awaiting Hook callbacks.
6. **Control Center and navigation shell** - Compact GM entry point, module
   settings, help, capability status, recovery, and consistent navigation.

This phase ends with a minimal installable package that can register one
harmless demonstration feature, persist a setting, survive a restart, report
its capability state, and disable cleanly.

### Phase 2: Condition Vertical Slice

**Status:** Planned

7. **Status and condition ownership design** - Decide whether a shared service
   is justified, how native statuses and Active Effects divide responsibility,
   and how external edits are preserved.
8. **ConditionAssist** - Redesign condition reference, application, removal,
   announcements, player access, custom conditions, and GM controls around
   Foundry-native status and effect workflows.

ConditionAssist is the first production vertical slice because it can exercise
settings, permissions, GM requests, UI, persistence, native Documents,
optional player actions, diagnostics, and restart behavior without requiring
the entire combat and action stack.

### Phase 3: Health and Character State

**Status:** Planned

9. **HealthService** - Define authoritative health observations and writes,
   temporary HP, supported damage and healing evidence, actor/token
   relationships, privacy, idempotency, and semantic health events.
10. **ConcentrationAssist** - Redesign concentration ownership, checks,
    conditions, supported damage prompts, player and GM controls, and cleanup
    against native `dnd5e` behavior.
11. **HPAssist** - Determine what useful HP initialization remains after
    Foundry prototype tokens, actor data, and system workflows are considered.
12. **NPCAssist** - Redesign NPC identity, naming, health cues, encounter
    history, reports, and audits without assuming Roll20 token-bar behavior.

HealAssist is intentionally held for the later action-workflow phase so health
mutation is not designed before spell, item, roll, and resource behavior is
understood.

### Phase 4: Initiative and Combat

**Status:** Planned

13. **Combat and turn service** - Define semantic turn and round progression,
    safe observer behavior, retained encounter state, timers, held actions,
    recovery, and the boundary with Foundry's Combat Documents.
14. **InitiativeAssist** - Redesign character discovery, initiative requests,
    roll options, NPC privacy, group rerolls, and supported system initiative
    around the native Combat Tracker.
15. **CombatAssist** - Redesign turn controls, reminders, player completion,
    previous-turn recovery, timers, round counters, and optional module
    interoperability without replacing Foundry's tracker.

### Phase 5: Effects, Healing, Attacks, and Critical Results

**Status:** Planned

16. **Effect and rule-projection service** - Define Active Effect ownership,
    source and recipient relationships, concentration links, durations,
    external edits, cleanup, repair, and version-aware `dnd5e` changes.
17. **EffectAssist** - Redesign the effect catalog and player/GM application
    workflows around approved effects rather than carrying forward the Roll20
    catalog or its limitations automatically.
18. **HealAssist** - Redesign supported healing actions, resource use, target
    selection, normal and maximum results, review policy, and verified health
    application using native system actions where possible.
19. **AttackAssist** - Decide whether guided attacks add enough value beyond
    native sheets and targeting, then define any supported roll, target, hit,
    damage, and resource boundaries explicitly.
20. **CritAssist** - Redesign natural-result observation, confirmation options,
    campaign tables, privacy, and supported roll workflows around Foundry chat
    and `dnd5e` roll data.

These components share system-action questions, but they remain separately
toggleable. Shared services exist to prevent competing ownership, not to turn
the modules into one inseparable feature.

### Phase 6: Token and Session Utilities

**Status:** Planned

21. **TokenAssist** - Inventory Foundry's native token controls first, then
    retain only guided bulk actions, reusable workflows, reports, or safety
    features that provide meaningful value beyond the Token configuration UI.
22. **WelcomeAssist** - Redesign session greetings, preview, timing, privacy,
    and readiness behavior using Foundry's lifecycle and UI.
23. **DebugTools disposition** - Decide whether diagnostics remain a separate
    power-user module or become a protected view over core diagnostics. Debug
    mutations must remain explicit, reversible where possible, and isolated
    from ordinary GM controls.
24. **ConfigUI disposition** - Complete the transition from a Roll20 module to
    the Foundry Control Center and settings architecture; do not preserve it as
    a nominal module unless the design review finds an independent purpose.

### Phase 7: Campaign-Ready GameAssist Release

**Status:** Planned

- Complete focused regression, permissions, privacy, restart, migration,
  malformed-state, missing-capability, stale-action, and multi-client checks.
- Verify the supported Foundry and `dnd5e` version matrix in live Foundry.
- Confirm that optional integrations fail locally without disabling unrelated
  modules.
- Publish installation, configuration, compatibility, limitations, and
  acceptance guidance that describes only verified behavior.
- Prepare a campaign-template world only after the package itself has passed
  its release gates.

The exact first campaign-ready module set will be chosen after the Condition,
Health, and Combat design reviews. A module is not included merely because a
Roll20 version existed.

---

## Separate AlmanacAssist Package

**Status:** Deferred

AlmanacAssist is not an internal GameAssist module and is not on the critical
path for the first GameAssist-Foundry release. It will be redesigned as a
separate, optional Foundry package when the core campaign tools are stable.

Its future design process will:

- Begin from GM needs for time, calendars, locations, climate, weather,
  environments, travel, rests, and campaign presentation rather than porting
  the Roll20 engine.
- Evaluate established Foundry calendar and timekeeping packages before
  deciding what AlmanacAssist should own.
- Define a narrow, optional time-provider and semantic-event contract for
  interoperability with GameAssist.
- Avoid hard dependencies in either direction. Missing AlmanacAssist support
  disables only the specific integration that needs it.
- Preserve the possibility of saved locations, campaign palettes, travel
  context, and world-generation assistance without promising their old data
  model or UI.
- Receive its own architecture, roadmap, compatibility policy, release gates,
  and MECHSUITS records when development begins.

Whether AlmanacAssist uses a separate repository will be recorded when its
package work begins; its separate installable-package boundary is already
decided.

## Optional Integrations

**Status:** Exploratory

- Calendar and time-provider integrations for the future AlmanacAssist package.
- Compatibility adapters for popular automation or effect modules only where
  concrete user value justifies the maintenance cost.
- A deliberately small public GameAssist API after internal contracts have
  proven stable and real consumers are known.
- Inter-module features that declare their prerequisites and degrade cleanly
  when either module is disabled.

## Deferred

**Status:** Deferred

- Exact feature parity with the Roll20 edition.
- A simultaneous Roll20 and Foundry development track.
- Building AlmanacAssist before the primary GameAssist campaign workflows are
  stable.
- Hard dependencies on optional automation, effects, calendar, weather, or
  socket-helper packages.
- External telemetry or hosted GameAssist services.
- Broad support for game systems other than `dnd5e` before the Foundry
  architecture and first production modules are proven.
- Reimplementation of native Foundry behavior solely to preserve a Roll20
  interaction pattern.

## Recently Completed

No versioned GameAssist-Foundry release has been completed yet. When releases
begin, this section will retain the three most recent completed milestones with
their version, date, outcome, and important limitations.

