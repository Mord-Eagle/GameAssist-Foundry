# GameAssist Component Design Record

## Record Identity

- **Component:** Capability and `dnd5e` adapter layer
- **Type:** Adapter / Core service
- **Status:** Implementing
- **Owner decision date:** 2026-09-20
- **Planned project version:** 0.1.0
- **Related roadmap phase:** Phase 1 item 3
- **Decision record path:** `docs/design/CAPABILITY-AND-DND5E-ADAPTER.md`

## Table Problem

Later GameAssist features will need actor, item, combat, effect, roll, rest,
and health access. If those paths are read from feature modules, every
`dnd5e` version bump becomes a scavenger hunt and missing APIs get replaced
with invented fallbacks. GMs also need an honest answer when a world is not
the locked baseline.

## Purpose and Intent

Detect Foundry and `dnd5e` surfaces through version-aware adapters. Report
supported, unavailable, unknown, or incompatible. Never invent actor, item,
or combat data. Keep private system paths out of feature modules. Provide a
capability snapshot the lifecycle can record and Control Center can later
display.

## Non-Goals

- Implementing HealthService, EffectAssist, rest automation, or attack flow.
- Reading `actor.system.attributes.hp` or other private `dnd5e` document
  paths in this slice.
- Claiming a published compatibility range. The locked baseline remains
  Foundry 14.367 and `dnd5e` 5.3.3 as a development target, not verified
  acceptance.
- A public `game.gameAssist.capabilities` API.
- Supporting systems other than `dnd5e`.

## Roll20 Lessons

### Preserve

- Explicit "this system/API is not available" instead of silent no-ops.
- Version awareness before touching character data.

### Reconsider

- Sheet-worker attribute paths as the integration contract.

### Retire

- Guessing 5e data shape from labels or chat output.

## Native Foundry and dnd5e Capabilities

- `game.release.generation` and `game.release.build`
- `game.system.id` and `game.system.version`
- Document collections: `game.actors`, `game.items`, `game.combats`
- `CONFIG.ActiveEffect`
- `CONFIG.DND5E` when the official system is active

Native availability of a collection is not proof that GameAssist health or
rest logic is implemented.

## Ecosystem Review

| Package | Overlap | Benefit | Cost or risk | Decision |
| --- | --- | --- | --- | --- |
| Official `dnd5e` 5.3.3 | System contract | Baseline integration surface | Versioned private data | Coexist; access only through this adapter |
| Midi-QOL / DAE / Convenient Effects | Automation overlap | None for capability detection | Hard dependency | No action |

## User Workflows

### Beginner GM

Load a `dnd5e` world. GameAssist records a local capability snapshot. No extra
UI in this slice. Demo Beacon still starts; missing later APIs do not disable
the package shell.

### Player

No player-facing capability UI. Diagnostics stay local and code-owned.

### Power User

Inspect `runtime.capabilities.snapshot()` in tests or a later Control Center
health view. Status values are `supported`, `unavailable`, `unknown`, or
`incompatible`.

## State and Ownership

| Data or mutation | Reads | Writes | Authority | Persistence | Cleanup owner |
| --- | --- | --- | --- | --- | --- |
| Foundry release | Environment adapter | None | Foundry | None | n/a |
| System id/version | Environment adapter | None | `dnd5e` / Foundry | None | n/a |
| Capability snapshot | Capability service | Capability service | Local runtime | Session only | Refresh / teardown |
| Actor/Item/Combat documents | None in this slice | None | Foundry | n/a | n/a |

## Permissions and Privacy

- Who may view the feature? Capability status is not secret, but diagnostics
  must not include actor names, hp, or hidden tokens.
- Who may request each action? Lifecycle refreshes at init/ready. Tests call
  `refresh` directly.
- Which client performs privileged work? None. Read-only detection.
- What information must remain GM-only? No Document contents are read.
- How are hidden Actors protected? This slice does not enumerate world
  Documents.

## Dependencies and Interoperability

### Required

- None for the package shell to load. Capability reporting degrades to
  `unknown` when Foundry `game` is absent.

### Optional

- Official `dnd5e`. Another system is `incompatible` for GameAssist system
  features; the package shell still runs.

### Prohibited or Conflicting

- Feature modules importing `CONFIG.DND5E` or `actor.system` paths.
- Inventing HP, rest, or roll results when a probe is `unknown`.
- Treating `unknown` as `supported`.

## Capability Contract

- **supported:** Host surface detected and generation/system id is usable.
- **unavailable:** Expected object is missing (no actors collection, no
  `CONFIG.DND5E` in a `dnd5e` world).
- **unknown:** Cannot verify from this environment, or the owning GameAssist
  service has not yet defined the probe (health, rest, rolls).
- **incompatible:** Foundry generation below 14, or `game.system.id` is not
  `dnd5e`.

Foundry generation greater than 14 is `unknown`, not `incompatible`. There is
no evidence yet.

## Lifecycle and Recovery

1. Environment is read lazily at refresh time, not at esmodule evaluation.
2. `init` refreshes identity (Foundry + system).
3. `ready` refreshes again so collections that appear with the world are
   visible.
4. Missing `game` yields `unknown` reports, not thrown errors.
5. Incompatible system does not prevent lifecycle, settings, or demo-beacon.
6. Teardown does not persist capability state.

## UX Structure

No Control Center widget yet. Diagnostics record foundry and system status
codes only.

## Diagnostics

- `capability.refresh`
- Messages name report id and status. No Document data.
- Health/rest/rolls stay `unknown` with detail that the owning service is not
  implemented.

## Migration and Compatibility

- No persisted schema.
- Locked development baseline: Foundry generation 14, build 367, `dnd5e`
  5.3.3. Detection is not acceptance evidence.
- `dnd5e` health/rest/roll/effect *workflows* are not probed via private
  data paths in this slice.

## Acceptance Criteria

### Success Paths

- [x] Baseline-shaped environment reports Foundry and `dnd5e` as supported.
- [x] Document collections report supported when present.
- [x] Snapshot is readable from the runtime after ready.

### Failure and Recovery

- [x] Absent environment reports unknown rather than throwing.
- [x] Non-`dnd5e` system is incompatible for system reports.
- [x] Foundry generation below 14 is incompatible.
- [x] Health/rest/rolls remain unknown on a supported `dnd5e` world.
- [x] Incompatible system does not stop demo-beacon.

### Privacy and Multi-Client

- [x] No actor contents in diagnostics.
- [x] No player notices.
- [x] No privileged mutations.

### Verification Layers

- [x] Static and type checks
- [x] Automated unit or contract checks
- [ ] Integration harness checks
- [ ] Live Foundry smoke checks
- [ ] Full acceptance checks where required

## Approved Decisions

- Capability status vocabulary is `supported` | `unavailable` | `unknown` |
  `incompatible`.
- Private `dnd5e` document paths wait for the owning domain service.
- Core does not import `dnd5e` adapters; `package.ts` composes them.
- The package still starts when the system is incompatible.
- Generation > 14 is unknown.

## Deferred Decisions

- Version-aware HP, rest, activity, and roll readers (HealthService,
  HealAssist, AttackAssist).
- Distinguishing 2014 vs 2024 `dnd5e` rules.
- Control Center capability view.
- Optional-module probes (Midi-QOL, Convenient Effects).

## Rejected Alternatives

- Features reading `actor.system` directly — scatters version risk.
- Treating missing probes as supported with empty defaults — invents data.
- Hard-failing the package when `dnd5e` is absent — violates independent
  shell startup.

## Open Questions

- When HealthService lands, should an unused HP schema on `dnd5e` 5.3.3 be
  `supported` after a documented probe, or remain `unknown` until a live
  actor is inspected?

## Change Notes

- 2026-09-20 - Opened the capability and `dnd5e` adapter record and began
  the first detection-only implementation.
