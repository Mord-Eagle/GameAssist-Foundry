# GameAssist-Foundry Architecture

**Status:** Foundation design record

**Planned package version:** 0.1.0

**Last updated:** 2026-08-31

This document records the project-level architecture of GameAssist-Foundry.
It governs package boundaries, dependency direction, state ownership, active
MECHSUITS profiles, and the decisions that must precede implementation. It does
not claim that planned source files or services already exist.

## Governing Records

- `MECHSUITS v1.6.0.md` is the universal structural and documentation standard.
- `MECHSUITS Profile - Foundry VTT v1.0.0.md` is the active Foundry runtime
  profile.
- `MECHSUITS-NOTICE.md` governs use of the proprietary MECHSUITS specification.
- `ROADMAP.md` establishes development order and design-review gates.
- `COMPATIBILITY.md` records supported baselines, ecosystem overlap, and test
  evidence.
- `CHANGELOG.md` is the append-only project ledger.

## Owner-Approved Direction

1. GameAssist-Foundry is one installable package with focused internal services
   and independently configurable feature modules.
2. The Foundry edition is a redesign informed by the Roll20 edition, not a
   direct port of its code, architecture, menus, commands, or compromises.
3. Each service and feature module receives an owner-facing design review
   before production implementation.
4. Foundry and the official `dnd5e` system remain authoritative for their
   native Documents and workflows.
5. AlmanacAssist will be a separate optional package designed later. Neither
   package will require the other for primary behavior.
6. Third-party modules are optional candidates. GameAssist will evaluate them
   before reproducing their behavior, but will not acquire a hard dependency
   without an explicit owner decision.

## System Context

```text
+----------------------- Foundry VTT v14 ------------------------+
| Core Documents | Hooks | Applications | Settings | Module Socket |
+-----------------------------+----------------------------------+
                              |
+-------------------- Official dnd5e v5.3.3 ---------------------+
| Actors | Items | Activities | Rolls | Effects | Combat | Rest   |
+-----------------------------+----------------------------------+
                              |
                    +---------v----------+
                    | GameAssist Package |
                    +---------+----------+
                              |
         +--------------------+--------------------+
         |                    |                    |
  +------v-------+     +------v-------+     +------v-------+
  | Core Services|     | Feature Mods |     | UI and Help  |
  +------+-------+     +------+-------+     +------+-------+
         |                    |                    |
         +--------------------+--------------------+
                              |
                    +---------v----------+
                    | Optional Adapters  |
                    +--------------------+
```

GameAssist uses supported host and system contracts through version-aware
adapters. Feature modules do not scatter private `dnd5e` data paths or direct
socket protocols throughout the package.

## Package Boundaries

### GameAssist

GameAssist owns its settings, migrations, diagnostics, UI, semantic events,
and the state explicitly created by enabled GameAssist features. It may observe
native Documents and request authorized native mutations. It does not claim
ownership of every Actor, Item, Active Effect, token, or Combat change it sees.

### AlmanacAssist

AlmanacAssist is outside this package. A future integration may consume a
narrow time-provider or semantic-event contract, but GameAssist must remain
fully usable when AlmanacAssist is absent or disabled.

### Third-Party Modules

Third-party integrations live behind explicit adapters. Feature modules do not
import optional packages directly. Missing, disabled, or incompatible optional
packages disable only the affected integration and produce a useful capability
status.

## Planned Layers

### Entrypoint

The package entrypoint participates in Foundry lifecycle Hooks and delegates to
the lifecycle coordinator. It contains no feature-specific business rules.

### Core

Core owns package lifecycle, feature registration, settings, migrations,
authority, semantic events, diagnostics, and capability reporting. Core must
not depend on a feature module.

### Adapters

Adapters translate supported Foundry and `dnd5e` contracts into stable internal
capabilities. Version-specific or optional-package knowledge belongs here.
Adapters report unavailable or unverifiable capabilities instead of inventing
fallback data.

### Services

Services own reusable domain behavior and mutation categories that genuinely
serve more than one feature. A service is not created merely to make the tree
look symmetrical. Its design review must identify real shared ownership or
complexity.

### Features

Feature modules deliver independently configurable user workflows. They may
depend on approved core services and domain services, but not directly on
another feature module. Optional interoperability is negotiated through a
small contract or semantic event.

### UI

The UI layer owns the Control Center, navigation, settings views, help, and
shared presentation components. It presents capability and failure information
without exposing private GM data to unauthorized users.

### Integrations

Integrations adapt optional packages or cross-feature capabilities. They are
never hidden hard dependencies.

## Dependency Direction

```text
Foundry and dnd5e contracts
            |
         adapters
            |
     core and services
            |
         features
            |
          UI views

optional package -> integration adapter -> approved service or feature seam
```

Rules:

- Core never imports a feature module.
- Services never depend on UI views.
- Feature modules do not mutate another feature module's saved state.
- Feature modules do not directly call another feature module's internals.
- UI may request behavior through public internal contracts; it does not own
  domain mutations.
- Optional integrations point inward through adapters rather than spreading
  package checks throughout the codebase.
- Circular dependencies are architectural failures, not build-tool problems.

## Provisional Source Tree

This tree is a planning boundary, not a requirement to create every folder
before it has useful content.

```text
GameAssist-Foundry/
|-- module.json
|-- package.json
|-- tsconfig.json
|-- src/
|   |-- main.ts
|   |-- core/
|   |-- adapters/
|   |   |-- foundry/
|   |   `-- dnd5e/
|   |-- services/
|   |-- features/
|   |-- integrations/
|   `-- ui/
|-- templates/
|-- styles/
|-- lang/
|-- tests/
|-- scripts/
|-- docs/
|   `-- design/
`-- dist/                         generated; not hand-edited
```

The final build and test tools remain a Phase 1 design decision. Source files
will be organized by responsibility rather than forced into empty ceremonial
directories.

## Lifecycle Boundary

Foundry's `init`, `setup`, and `ready` Hooks are synchronous notifications.
GameAssist must not assume Foundry awaits asynchronous Hook callbacks. The
exact registration, startup, enable/disable, teardown, and recovery contract
will be decided in the package-lifecycle design session before implementation.

At minimum, the design must address:

- One-time registration versus disposable runtime resources.
- Safe repeated enable, disable, reload, and world restart behavior.
- Settings registration before settings access.
- Capability checks after required host and system contracts are available.
- Failure isolation so one feature does not prevent unrelated features from
  reaching a healthy state.
- Stale callbacks, duplicate listeners, socket requests, and responsible-GM
  changes.

## State Ownership

| State category | Initial authority | GameAssist posture |
| --- | --- | --- |
| Foundry Documents | Foundry | Use supported Document operations and permissions. |
| D&D Actor and Item data | `dnd5e` | Access through the version-aware adapter. |
| Combat and Combatants | Foundry | Extend native combat; do not replace it. |
| Statuses and Active Effects | Foundry and `dnd5e` | Track only GameAssist ownership needed for safe cleanup. |
| Package settings | GameAssist core | Validate, migrate, preserve, and expose through settings. |
| Feature state | Owning feature or service | Namespace, version, migrate, and never edit across boundaries. |
| Diagnostics | GameAssist core | Keep local and privacy-aware; no external telemetry. |
| Optional integration state | Integration adapter | Keep isolated from unrelated feature state. |

Detailed ownership is approved during each component's design gate. Observed
facts are not automatically treated as proof of cause.

## Authority and Privacy

Client visibility is not mutation authority. A future authority service must
decide who may request an action, which active GM may perform privileged work,
how requests are correlated and deduplicated, and how stale or failed requests
are reported.

The package must not expose hidden Actors, secret rolls, GM-only settings,
private targets, or privileged diagnostics to players. Socket transport does
not weaken these requirements.

## Semantic Events

GameAssist may publish narrowly defined semantic events such as a verified
health transition or approved turn progression. These events describe meaning,
not raw Hook traffic. They do not imply that Foundry will await subscribers.

An event contract must define payload, authority, privacy, ordering,
idempotency, and failure behavior before it becomes a dependency.

## Public API Policy

No broad public `game.gameAssist` API is frozen during foundation development.
Internal contracts will be proven by real features first. A later public API
must be deliberately small, documented, versioned, permission-aware, and based
on known consumers.

## Compendium Policy

GameAssist does not require a custom compendium for the package shell. The
official `dnd5e` system already supplies SRD compendia, and Foundry supports
system, module, and world compendium packs.

GameAssist may later ship original or properly licensed configuration content
when a feature genuinely benefits from reusable Items, effects, tables, or
Journals. Copyrighted rules text or commercial content will not be copied into
GameAssist. Campaign-specific content belongs in a world or a separate content
package unless its design is intentionally general.

## Generated Output

- `src/`, documentation, templates, styles, localization, and tests are
  hand-authored sources.
- `dist/` and packaged archives are generated outputs.
- Generated files are not edited manually.
- The release process must prove that generated artifacts match the source and
  manifest before publication.

## Codename Registry

No production source files exist yet, so no source codename is assigned merely
to populate this table. Add each source file when it is created and retain its
owner-authoritative codename across moves unless the owner approves a rename.

| Codename | Path | Responsibility | Lifecycle | Prior path |
| --- | --- | --- | --- | --- |
| _None assigned_ | _No source file yet_ | _Foundation planning_ | _N/A_ | _N/A_ |

Fallback codenames will be deterministically derived from project plus filename
and checked for collisions as required by MECHSUITS v1.6.0.

## Component Decision Records

Every service and feature discussion will create or update a record under
`docs/design/` using `COMPONENT-DESIGN-TEMPLATE.md`. A record distinguishes:

- Owner-approved behavior.
- Provisional implementation choices.
- Deferred or rejected behavior.
- Foundry-native behavior being reused.
- Third-party overlap and integration decisions.
- Verification evidence and unresolved questions.

The decision record protects intent without turning a provisional code detail
into permanent doctrine.

## Foundation Decisions Still Open

- Build and bundling tool.
- Automated test runner and Foundry test harness strategy.
- Local development deployment method into the Foundry module directory.
- Exact lifecycle and feature-registration contract.
- Settings schema and migration mechanics.
- Authority and socket protocol.
- Minimum supported Foundry build after compatibility evidence exists.
- Whether any initial compendium pack adds enough value to justify ownership.

These are the subjects of Phase 0 and Phase 1. They are not silently decided by
the first implementation patch.

