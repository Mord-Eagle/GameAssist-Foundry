# GameAssist Component Design Record

## Record Identity

- **Component:** Package lifecycle and feature registry
- **Type:** Core service
- **Status:** Implementing
- **Owner decision date:** 2026-09-20
- **Planned project version:** 0.1.0
- **Related roadmap phase:** Phase 1 item 1
- **Decision record path:** `docs/design/LIFECYCLE-AND-REGISTRY.md`

## Table Problem

A GM installing GameAssist needs one package that starts cleanly, enables only
the features they want, and can be disabled without leaving stray listeners or
half-started modules. Developers need a registration and teardown contract that
survives reloads, repeated init, and a failed feature without taking the rest
of the package down.

## Purpose and Intent

Own package initialization order, feature registration, enable/disable,
readiness, teardown, and restart safety. Translate Foundry's synchronous
`init` and `ready` notifications into GameAssist phase changes. Keep feature
modules independently startable so one failure cannot prevent unrelated
features from reaching a healthy state.

## Non-Goals

- Persisting enable/disable across restarts (settings and migration service).
- Detecting `dnd5e` version capabilities (capability adapter).
- Privileged GM actions or sockets (authority service).
- Semantic event bus or Control Center UI.
- Replacing Foundry's module enable checkbox or avoiding a Foundry reload when
  the whole package is toggled.
- A frozen public API on `game.gameAssist`.

## Roll20 Lessons

### Preserve

- Modular features that can be turned off independently.
- Startup that degrades a failed module without disabling the toolkit.
- Explicit readiness rather than hidden global side effects.

### Reconsider

- Chat-command and menu-driven module loading.
- Roll20 sheet-worker and sandbox timing assumptions.
- Treating "the sandbox restarted" as the only teardown path.

### Retire

- Roll20 command syntax as a lifecycle contract.
- Any assumption that host hooks will await asynchronous GameAssist work.

## Native Foundry and dnd5e Capabilities

- Foundry package `init`, `setup`, and `ready` Hooks (synchronous notifications).
- Foundry module enable/disable, which currently implies a world reload.
- Foundry `module.json` `esmodules` loading.
- Foundry settings registration timing (`init`) — consumed later by the
  settings service, not in this component's first slice.

`dnd5e` APIs are not required for lifecycle itself.

## Ecosystem Review

| Package | Overlap | Benefit | Cost or risk | Decision |
| --- | --- | --- | --- | --- |
| Foundry core module loader | Owns package enable and script load | Native install/enable path | Reload on package toggle | Coexist; do not replace |
| libWrapper | Hook wrapping | Not needed for init/ready | Extra dependency | No action |
| socketlib | Socket helper | Authority phase, not lifecycle | Extra dependency | No action |

## User Workflows

### Beginner GM

Enable GameAssist in Foundry's module list and load a world. The package
registers, starts enabled features, and does not mutate actors, items, or
combat. The demo beacon only records a local diagnostic that startup occurred.

### Player

No player-facing control in this slice. Players must not receive GM-only
diagnostic detail.

### Power User

Inspect local diagnostics and feature snapshots through tests or a later
Control Center. Feature enable/disable persistence is intentionally absent
until the settings service exists.

## State and Ownership

| Data or mutation | Reads | Writes | Authority | Persistence | Cleanup owner |
| --- | --- | --- | --- | --- | --- |
| Lifecycle phase | Coordinator | Coordinator | Local client runtime | Session only | Coordinator teardown |
| Feature registration table | Registry | Registry | Package runtime | Session only | Registry stop/teardown |
| Feature enabled flag | Registry | Registry (in memory) | Package runtime | Session only; settings later | Registry |
| Diagnostic buffer | Diagnostics | Diagnostics | Local, privacy-aware | Session only, bounded | Buffer clear / teardown |
| Foundry Documents | None | None | n/a | n/a | n/a |
| Foundry Hook subscriptions | Host adapter | Host adapter | Local client | Session only | Unsubscribe on unbind |

## Permissions and Privacy

- Who may view the feature? Any connected client may run the package runtime.
  This slice has no GM-only UI.
- Who may request each action? Foundry fires `init`/`ready`. Tests call the
  coordinator directly.
- Which client performs privileged work? None. No shared-world mutations.
- What information must remain GM-only? Diagnostic messages must not include
  hidden actor data, secret rolls, or user-authored text.
- How are hidden Actors, tokens, rolls, targets, and settings protected? This
  component does not read them.

## Dependencies and Interoperability

### Required

- Foundry Hooks, only at the host adapter boundary.
- Feature definitions supplied by the composition root.

### Optional

None in this slice. Missing Foundry Hooks (unit tests or accidental Node
import) disable host binding and report a local diagnostic instead of throwing
through the page.

### Prohibited or Conflicting

- Feature modules importing other feature modules.
- Core importing a feature's internals except via `FeatureDefinition`.
- Writing Documents, settings, or flags.
- Assigning a public `game.gameAssist` API.
- External telemetry.

## Capability Contract

- **Supported:** Phase changes, registration, isolated start/stop, bounded
  local diagnostics.
- **Unavailable:** Foundry host binding when `Hooks` is missing.
- **Unknown:** Live Foundry reload and module-toggle behavior until tested in
  a Foundry world.
- **Incompatible:** Calling `ready` before `init` returns `UNAVAILABLE` and
  does not start features.

## Lifecycle and Recovery

1. Composition root creates diagnostics, registry, coordinator, and features.
2. Host adapter subscribes to `init` and `ready`.
3. `init`: register features exactly once per generation; phase becomes `init`.
4. `ready`: start enabled features; a single feature failure is isolated;
   phase becomes `ready` even if some features failed.
5. Teardown/unbind: stop started features, unsubscribe host handlers, phase
   becomes `stopped`.
6. A later `init` after `stopped` begins a new generation. Failed and stopped
   features return to `registered` so they may retry; an in-flight started
   feature is left untouched.
7. Duplicate `init` or `ready` without teardown is idempotent.
8. `onStart`/`onRegister`/`onStop` throwing is converted to `INTERNAL`.
9. `onStop` runs only for features that reached `started`, so failed starts
   must clean up themselves before returning failure.

## UX Structure

No Control Center in this slice. The only user-visible Foundry surface is the
module listing itself. Diagnostics may appear in the browser console as
bounded, code-owned messages.

## Diagnostics

- Named codes such as `lifecycle.init`, `lifecycle.ready`,
  `lifecycle.teardown`, `feature.register.failed`, `feature.start.failed`.
- Bounded in-memory buffer (capacity 50).
- Optional console mirroring of the same code-owned messages.
- No user-controlled text, secrets, or Document contents.
- Failure language tells maintainers which feature failed and that other
  features continued.

## Migration and Compatibility

- No persisted schema.
- Foundry 14 `init`/`ready` timing is assumed.
- Hook callbacks are synchronous; GameAssist must not expect Foundry to await
  returned promises.

## Acceptance Criteria

### Success Paths

- [x] A package with one harmless demo feature registers on `init` and starts
      on `ready`.
- [x] Disabled features are not started.
- [x] Teardown stops started features and is safe to call twice.
- [x] Restart after teardown registers and starts again.

### Failure and Recovery

- [x] Invalid feature id is rejected.
- [x] Duplicate feature id is rejected.
- [x] Missing Foundry host does not throw during unit tests.
- [ ] Permission denial — not applicable; no privileged mutations.
- [x] Duplicate init/ready do not double-start features.
- [x] One feature start failure leaves other features started.
- [x] Disable, re-enable, reload, and restart are represented by teardown plus
      a new init/ready generation. Live Foundry reload remains unverified.

### Privacy and Multi-Client

- [x] No GM-only data is collected.
- [x] No player notices are emitted.
- [x] No privileged mutations.
- [ ] Responsible-GM changes — deferred to the authority service.

### Verification Layers

- [x] Static and type checks
- [x] Automated unit or contract checks
- [ ] Integration harness checks
- [ ] Live Foundry smoke checks
- [ ] Full acceptance checks where required

## Approved Decisions

- Foundry Hooks are a thin adapter. Phase policy lives in the coordinator.
- Feature modules register through a definition object, not by importing core
  internals in reverse.
- Enablement in this slice is in-memory and defaults to each feature's
  `enabledByDefault`. Persistence waits for the settings service.
- The first feature is `demo-beacon`: local diagnostics only, no Document
  writes.
- No public Foundry API object is exported onto `game`.
- Result envelopes are used at GameAssist service boundaries. Hook callbacks
  return void because Foundry does not use a GameAssist envelope there.

## Deferred Decisions

- Settings-backed enable/disable and schema migration.
- `setup` Hook usage.
- Control Center health view.
- Capability snapshot for Foundry/`dnd5e` versions.
- Whether disable of a single feature at runtime (without package reload)
  should be a GM-facing control before Control Center exists.

## Rejected Alternatives

- Registering features by scanning a folder at runtime — hidden coupling and
  harder tests.
- Letting features subscribe to Foundry Hooks directly for package lifecycle —
  duplicates teardown responsibility.
- Starting features during `init` — world Documents are not reliably ready.
- A global singleton imported everywhere — harder to test and to reset.

## Open Questions

- Should a later settings service treat `enabledByDefault` as a one-time
  initial value or as a fallback whenever saved state is missing?
- Does live Foundry ever invoke module teardown without reloading the world?
  If it does, unbind must be wired to that Hook once identified.

## Change Notes

- 2026-09-20 - Opened the lifecycle and registry record and began the first
  testable implementation of Phase 1 item 1.
