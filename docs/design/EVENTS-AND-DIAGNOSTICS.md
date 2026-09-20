# GameAssist Component Design Record

## Record Identity

- **Component:** Semantic event and diagnostics services
- **Type:** Core service
- **Status:** Implementing
- **Owner decision date:** 2026-09-20
- **Planned project version:** 0.1.0
- **Related roadmap phase:** Phase 1 item 5
- **Decision record path:** `docs/design/EVENTS-AND-DIAGNOSTICS.md`

## Table Problem

Later features will need to tell each other that something *meant* something —
a feature started, a health change was verified, a turn advanced — without
coupling those features together or treating Foundry Hooks as a workflow
engine. GMs also need inspectable local failure evidence. The Phase 1 buffer
already stores lifecycle codes; it is not yet a health report or an event
contract.

## Purpose and Intent

Own GameAssist event meaning separately from Foundry Hook traffic. Deliver
events synchronously in-process, isolate subscriber failures, keep a bounded
local history, and produce a package health snapshot plus inspectable
error-level diagnostics. Privacy rules apply to event payloads and diagnostic
messages. Foundry does not await GameAssist subscribers.

## Non-Goals

- Emitting GameAssist events through `Hooks.call` / `Hooks.callAll`.
- A public `game.gameAssist.events` API.
- Domain events for health, combat, conditions, or rolls (owning services
  register those types later).
- External telemetry, chat output, or socket fan-out.
- Control Center UI (Phase 1 item 6 consumes these contracts).
- Awaiting promises returned by subscribers.

## Roll20 Lessons

### Preserve

- Structured, code-owned failure evidence rather than silent no-ops.
- Event meaning owned by GameAssist, not by chat parse order.

### Reconsider

- Chat as the integration bus.

### Retire

- Scraping Foundry Hook argument bags as if they were GameAssist contracts.

## Native Foundry and dnd5e Capabilities

- Foundry `Hooks` remain host lifecycle notifications (`init`, `ready`).
- Foundry console is already the host diagnostic mirror.
- `dnd5e` is not required for the event bus or health snapshot.

## Ecosystem Review

| Package | Overlap | Benefit | Cost or risk | Decision |
| --- | --- | --- | --- | --- |
| Foundry Hooks | Notification bus | Host lifecycle only | Easy to treat as awaitable | Coexist; do not wrap as GameAssist events |
| socketlib | Cross-client events | None until sockets exist | Extra dependency | No action |

## User Workflows

### Beginner GM

No new UI. Loading the world still starts Demo Beacon. Health is `healthy`
when the package is ready and no feature has failed. Later Control Center
will show this snapshot.

### Player

No player-facing event stream or diagnostic dump. `gm` visibility events are
omitted from default `list()` results.

### Power User

Inspect `runtime.events.list()`, `runtime.diagnostics.failures()`, and
`runtime.health()` in tests or a later Control Center view.

## State and Ownership

| Data or mutation | Reads | Writes | Authority | Persistence | Cleanup owner |
| --- | --- | --- | --- | --- | --- |
| Event type catalog | Event bus | Event bus | Local runtime | Session | Bounded |
| Event history | Event bus | Event bus | Local runtime | Session | Capacity eviction |
| Diagnostic buffer | Diagnostics | Core services | Local runtime | Session | Capacity eviction |
| Package health | Runtime | Derived | Local runtime | None | Recalculated |

## Permissions and Privacy

- Who may view the feature? Public events may be listed without a GM check.
  Privileged events require `includePrivileged`. Diagnostics stay local.
- Who may request each action? Core services publish foundation events.
  Features do not publish directly in this slice.
- Which client performs privileged work? None. In-process only.
- What information must remain GM-only? Event payloads are flat code-owned
  fields. No actor names, HP, hidden tokens, user-authored text, or request
  payloads. Visibility is owned by the type catalog, not the publisher.
- How are hidden Actors protected? This slice does not read Documents.

## Dependencies and Interoperability

### Required

- Diagnostic sink for subscriber isolation evidence.

### Optional

- Lifecycle and registry publish foundation events when an event bus is
  supplied. Tests may omit the bus.

### Prohibited or Conflicting

- `Hooks.call("gameassist.*")` as the GameAssist contract.
- Subscriber A depending on Foundry awaiting subscriber B.
- Logging user-authored text or Document contents.
- Treating unknown capability reports as health failures.

## Capability Contract

- **supported:** Event bus is in process and foundation types are registered.
- **unavailable:** Package phase is not `ready` (health status).
- **unknown:** Not used for the bus itself.
- **incompatible:** Host/system incompatibility degrades health when ready;
  it does not disable the bus.

## Lifecycle and Recovery

1. The bus is created with the runtime. Foundation types are pre-registered.
2. `ready` publishes `gameassist.lifecycle.ready` once per generation.
3. Feature start/stop/fail publish matching feature events.
4. `teardown` from init/ready publishes `gameassist.lifecycle.stopped`.
5. Duplicate event ids with the same type are idempotent (no re-delivery).
6. Duplicate event ids with a different type are `CONFLICT`.
7. Unknown types are `INVALID_ARGUMENT`.
8. Subscriber throws are isolated; other subscribers still run; publish is
   still `ok`.
9. History is not persisted across teardown. Capacity eviction drops oldest.
10. Restart publishes a new ready event with a new id.

## UX Structure

No Control Center widget. Health and failures are the data that widget will
read.

## Diagnostics

- `events.subscriber.failed` — a subscriber threw; type named, no payload.
- `events.publish.failed` — a well-formed foundation publish was refused.
- Existing lifecycle, feature, authority, and capability codes remain.
- `diagnostics.failures()` returns error-level events only.

## Migration and Compatibility

- No persisted schema.
- Event types are a session catalog. Domain types are registered by their
  owning service in later slices.
- Foundry Hook names are not GameAssist event types.

## Acceptance Criteria

### Success Paths

- [x] Ready publishes `gameassist.lifecycle.ready` once.
- [x] Demo Beacon start publishes `gameassist.feature.started`.
- [x] Matching subscribers run synchronously.
- [x] Ready with no failed features is `healthy`.

### Failure and Recovery

- [x] Invalid id or type is rejected.
- [x] Unknown type is rejected.
- [x] Duplicate id with different type is CONFLICT.
- [x] Duplicate id with same type does not re-deliver.
- [x] Subscriber throw does not block other subscribers.
- [x] Failed feature makes health `degraded`.
- [x] Idle or stopped health is `unavailable`.
- [x] Incompatible host/system degrades ready health.
- [x] Unknown capabilities do not degrade health.

### Privacy and Multi-Client

- [x] Default list omits `gm` visibility events.
- [x] Publisher cannot override type visibility.
- [x] Payloads are flat code-owned fields.
- [x] No Foundry Hook emission.
- [x] No player notices.

### Verification Layers

- [x] Static and type checks
- [x] Automated unit or contract checks
- [ ] Integration harness checks
- [ ] Live Foundry smoke checks
- [ ] Full acceptance checks where required

## Approved Decisions

- GameAssist events are in-process only. Foundry Hooks stay host
  notifications.
- Type visibility is catalog-owned. Publishers cannot change it.
- Foundation event types: `gameassist.lifecycle.ready`,
  `gameassist.lifecycle.stopped`, `gameassist.feature.started`,
  `gameassist.feature.stopped`, `gameassist.feature.failed`.
- Health: `unavailable` when not ready, `degraded` when a feature failed or a
  capability is incompatible, otherwise `healthy`.
- Unknown capability reports do not degrade health.
- Historical diagnostic errors do not degrade health after a successful
  restart; current feature status does.
- Subscriber exceptions are isolated.

## Deferred Decisions

- Domain event types (health, combat, conditions, rolls).
- Emitting a Foundry Hook *in addition to* a GameAssist event for third-party
  modules.
- Cross-client event transport (sockets).
- Control Center health view.
- Trace identifiers on every event.

## Rejected Alternatives

- Wrapping `Hooks.call` as the GameAssist bus — Foundry will not await, and
  Hook argument bags are not a versioned contract.
- Chat as the event log — privacy and parse fragility.
- Treating every diagnostic warning as degraded health — noisy and untrue
  after recovery.

## Open Questions

- When HealthService lands, should verified HP transitions be `public` with
  no numeric payload, or `gm` with a bounded code-owned summary?

## Change Notes

- 2026-09-20 - Opened the events and diagnostics record and began the first
  implementation of Phase 1 item 5.
