# GameAssist Component Design Record

## Record Identity

- **Component:** Control Center and navigation shell
- **Type:** UI
- **Status:** Implementing
- **Owner decision date:** 2026-09-20
- **Planned project version:** 0.1.0
- **Related roadmap phase:** Phase 1 item 6
- **Decision record path:** `docs/design/CONTROL-CENTER.md`

## Table Problem

A GM enabling GameAssist needs one compact place to see whether the package is
healthy, which features are on, what Foundry/`dnd5e` capabilities were
detected, and what to do after a failure. Without that shell, diagnostics stay
in the console and feature enablement has no beginner-facing control.

## Purpose and Intent

Provide a GM-only Control Center: health, feature enablement, capability
status, inspectable failures, and a next recovery action. Navigation stays one
window with sections, not a maze of apps. User-facing copy lives in Foundry
localization. The presenter is testable without Foundry; Application V2 is a
thin adapter.

## Non-Goals

- Player-facing Control Center.
- A public `game.gameAssist` API or debug console dump.
- Condition, HP, combat, or effect workflows.
- Client-scoped display preferences.
- Scene-control buttons, token HUD, or chat commands.
- Restyling native Foundry chrome.
- Live Foundry verification in this slice.

## Roll20 Lessons

### Preserve

- One GM entry for module status and toggles.
- Failure text that says what to do next.

### Reconsider

- Chat-command configuration.

### Retire

- A wall of power-user debug controls as the first screen.

## Native Foundry and dnd5e Capabilities

- `game.settings.registerMenu` with `restricted: true`
- Application V2 + HandlebarsApplicationMixin
- Foundry localization (`lang/en.json`)
- Foundry module styles

`dnd5e` is displayed as capability reports; Control Center does not read
system Documents.

## Ecosystem Review

| Package | Overlap | Benefit | Cost or risk | Decision |
| --- | --- | --- | --- | --- |
| Foundry Settings Config | GM entry | Native, restricted menu | Another window | Coexist; menu opens Control Center |
| Foundry Application V2 | Window host | Supported UI API | Versioned render internals | Coexist behind an adapter |

## User Workflows

### Beginner GM

Module Settings → GameAssist → Open Control Center. See health, toggle Demo
Beacon, read capability status, and follow the recovery line if something is
wrong.

### Player

No menu. Opening is refused. No failure list, capability dump, or feature
toggles.

### Power User

The Failures section lists error-level diagnostic codes. Advanced filters and
export wait for DebugTools disposition.

## State and Ownership

| Data or mutation | Reads | Writes | Authority | Persistence | Cleanup owner |
| --- | --- | --- | --- | --- | --- |
| Control Center view | Presenter | None | GM | None | Close window |
| Feature enablement | Registry | Runtime `setFeatureEnabled` | GM | World setting | Settings |
| Health / capabilities / failures | Core services | None | GM | Session | Bounded buffers |

## Permissions and Privacy

- Who may view the feature? Active GMs, via `canViewPrivilegedDiagnostics`.
- Who may request each action? The same GM check; world toggles reuse the
  authority gate on `setFeatureEnabled`.
- Which client performs privileged work? The local GM client.
- What information must remain GM-only? Diagnostic failures, capability
  details, and feature status. Players get no view model.
- How are hidden Actors protected? This UI does not read Documents.

## Dependencies and Interoperability

### Required

- Runtime health, registry, capabilities, diagnostics, and authority.

### Optional

- Foundry Application V2. Missing APIs leave the presenter usable in tests;
  the adapter stays inert.

### Prohibited or Conflicting

- Assigning `game.gameAssist`.
- Showing Control Center to players because a client can import the module.
- Triple-stash of untrusted text in Handlebars.

## Capability Contract

- **supported:** Application V2 and `registerMenu` detected.
- **unavailable:** Foundry UI APIs missing (Node tests); presenter still works.
- **unknown:** Not used.
- **incompatible:** Not used; host incompatibility is shown as health
  `degraded`.

## Lifecycle and Recovery

1. Presenter is created with the runtime after composition.
2. Adapter registers a restricted settings menu at `init`.
3. Window render reads a fresh view; it does not cache health.
4. Feature toggles go through `runtime.setFeatureEnabled` (persist + start/stop).
5. Missing Application V2: no window, no throw.
6. Player open: `FORBIDDEN`, no view payload.
7. Teardown: Foundry reload drops the window; presenter holds no timers.

## UX Structure

- **Entry:** Module settings menu (GM only).
- **Primary:** Health + recovery line, then feature toggles.
- **Secondary:** Capability list, failure list, short help.
- **Advanced:** Deferred.

## Diagnostics

- `control-center.denied`
- `control-center.register.failed`
- Failures shown in the UI are existing error-level diagnostic codes.

## Migration and Compatibility

- No new persisted schema.
- Application V2 is the Foundry 14 window host. No Application V1 fallback.
- Localization keys live under `GAMEASSIST.ControlCenter`.

## Acceptance Criteria

### Success Paths

- [x] GM view includes health, features, capabilities, and recovery.
- [x] GM can toggle a feature through the presenter.
- [x] Recovery key reflects unavailable / degraded / healthy.

### Failure and Recovery

- [x] Missing user is UNAUTHORIZED.
- [x] Player is FORBIDDEN and receives no view model.
- [x] Missing Application V2 does not throw.
- [x] Failed feature appears in health and the failures list.

### Privacy and Multi-Client

- [x] Player cannot read failures through the presenter.
- [x] No Document contents in the view.
- [x] Feature enablement still uses the world-setting GM gate.

### Verification Layers

- [x] Static and type checks
- [x] Automated unit or contract checks
- [ ] Integration harness checks
- [ ] Live Foundry smoke checks
- [ ] Full acceptance checks where required

## Approved Decisions

- Control Center is core UI, not a toggleable feature module.
- One window with sections; settings menu is the first entry.
- Presenter is Foundry-free; Application V2 is an adapter.
- All Control Center chrome is localized.
- Players get no view model, not an empty shell.

## Deferred Decisions

- Scene control / hotbar entry.
- Client-scoped Control Center display preferences.
- DebugTools as a separate module versus a deeper view.
- Exporting diagnostics.
- Per-feature settings pages.

## Rejected Alternatives

- `game.gameAssist.open()` as the GM entry — public API policy.
- Chat commands for enablement — not beginner-first and not Foundry-native.
- Showing players a redacted Control Center — still a leak surface.

## Open Questions

- Should later production features add their own Control Center sections, or
  only links to feature-owned applications?

## Change Notes

- 2026-09-20 - Opened the Control Center record and began the first
  implementation of Phase 1 item 6.
