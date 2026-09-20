# GameAssist Component Design Record

## Record Identity

- **Component:** Settings and migration service
- **Type:** Core service
- **Status:** Implementing
- **Owner decision date:** 2026-09-20
- **Planned project version:** 0.1.0
- **Related roadmap phase:** Phase 1 item 2
- **Decision record path:** `docs/design/SETTINGS-AND-MIGRATION.md`

## Table Problem

GMs need GameAssist feature choices to survive a world reload. Without a
settings owner, enablement is session-only and later features will each invent
their own persistence. That produces competing writers and silent data loss.

## Purpose and Intent

Own GameAssist world and client settings: registration, defaults, validation,
schema versions, preservation of unknown keys, documented repair, and
migration. Feature enablement is the first persisted contract. Foundry
`game.settings` is the storage mechanism, not the policy owner.

## Non-Goals

- Control Center or Foundry Configure Settings UI for every flag (`config`
  stays false until a reviewed UI exists).
- Document flags, actor flags, or journal-backed configuration.
- Importing Roll20 GameAssist state.
- Authority checks beyond what Foundry already enforces on world settings.
- A public settings API on `game.gameAssist`.

## Roll20 Lessons

### Preserve

- Module options persist with the campaign, not the browser tab.
- Independent feature toggles.
- Do not wipe unrecognized keys just because this version does not use them.

### Reconsider

- Chat commands as the settings UI.
- One undifferentiated blob of module state with no schema version.

### Retire

- Roll20 state keys and menu IDs as Foundry setting names.

## Native Foundry and dnd5e Capabilities

- `game.settings.register` during `init`, before any get/set.
- World scope for shared GM-owned configuration.
- Client scope for personal display preferences (none in this slice).
- Foundry's own Configure Settings UI, unused here because `config` is false.

`dnd5e` is not required for this service.

## Ecosystem Review

| Package | Overlap | Benefit | Cost or risk | Decision |
| --- | --- | --- | --- | --- |
| Foundry `game.settings` | Persistence and GM write rules | Native storage | `set` may return a Promise | Coexist; adapter owns the seam |
| libWrapper | None | None | Extra dependency | No action |

## User Workflows

### Beginner GM

Enable GameAssist and load the world. Demo Beacon starts by default. A later
Control Center will expose toggles. Until then, persisted enablement is applied
automatically on init.

### Player

Players do not change world settings. They receive no settings diagnostics.

### Power User

Schema version and the feature-enablement map are world settings under the
`gameassist` namespace, hidden from the default config menu.

## State and Ownership

| Data or mutation | Reads | Writes | Authority | Persistence | Cleanup owner |
| --- | --- | --- | --- | --- | --- |
| `schemaVersion` | Settings service | Settings service | World / GM via Foundry | World setting | Settings service |
| `featureEnablement` map | Settings service | Settings service | World / GM via Foundry | World setting | Settings service |
| Feature enabled flag | Registry | Registry (memory) | Package runtime | Session; hydrated from settings at init | Registry |
| Unknown keys in the map | Settings service | Preserved, never deleted | World | World setting | Settings service |

## Permissions and Privacy

- Who may view the feature? World settings are GM-visible through Foundry.
  This slice does not render them to players.
- Who may request each action? Foundry enforces world-setting writes.
- Which client performs privileged work? Foundry's settings stack.
- What information must remain GM-only? No hidden-actor data is stored.
- How are hidden Actors, tokens, rolls, targets, and settings protected? This
  service does not read Documents.

## Dependencies and Interoperability

### Required

- A `SettingsStorage` port. Foundry `game.settings` in production; memory
  storage in tests.

### Optional

If storage is unavailable at init, GameAssist continues with in-memory
defaults and records a local diagnostic. Persistence is the degraded
capability, not the whole package.

### Prohibited or Conflicting

- Feature modules writing `game.settings` directly.
- Deleting unknown keys because this version does not recognize them.
- Overwriting malformed values without a documented repair.
- Storing user-authored secrets or hidden actor data in settings.

## Capability Contract

- **Supported:** register, migrate 0→1, read/write the enablement map, hydrate
  the registry, preserve unknown keys.
- **Unavailable:** missing `game.settings` at init; memory defaults used.
- **Unknown:** a schemaVersion newer than this package. Warn, do not
  downgrade, still read recognized keys when they are valid.
- **Incompatible:** `featureEnablement` that is not a plain object. Warn, do
  not overwrite, hydrate from defaults only.

## Lifecycle and Recovery

1. `init`: register settings, then migrate, then hydrate enablement, then
   feature `onRegister`.
2. Duplicate init does not re-run migration as a second writer of defaults.
3. Teardown does not erase world settings.
4. A new runtime sharing the same storage hydrates the same enablement.
5. Foundry `settings.set` may complete asynchronously. The adapter treats a
   thrown error as failure; an accepted Promise is not claimed as a confirmed
   disk write.
6. `enabledByDefault` is the fallback when a feature id is absent from the
   saved map. Absence is not filled in automatically, so a later default
   change still applies to untouched features.

## UX Structure

No settings window in this slice. Control Center is Phase 1 item 6.

## Diagnostics

- `settings.register.failed`
- `settings.migrate.unknown-version`
- `settings.migrate.malformed`
- `settings.enablement.invalid-value`
- `settings.persist.failed`

Messages are code-owned. No setting values that could contain user text are
logged; only keys and types.

## Migration and Compatibility

- Independent settings schema version: `1`.
- Version `0` or missing: uninitialized. Migration writes `schemaVersion: 1`
  and, if `featureEnablement` is missing, writes `{}`.
- Valid existing maps are kept as-is.
- No Roll20 import path.
- Foundry 14 `game.settings` is the intended production store.

## Acceptance Criteria

### Success Paths

- [x] Settings register during init before get/set.
- [x] Schema migrates from 0 to 1.
- [x] Missing feature ids use `enabledByDefault`.
- [x] Explicit enablement survives a new runtime on the same storage.
- [x] Unknown feature ids in the saved map are preserved.

### Failure and Recovery

- [x] Invalid enablement values are skipped and not overwritten.
- [x] Non-object enablement map is not overwritten.
- [x] Missing storage degrades to memory defaults.
- [ ] Permission denial — Foundry enforces world writes; not simulated as a
      live GM session in this slice.
- [x] Duplicate init does not clobber saved enablement.
- [x] Teardown then a new init on the same storage restores enablement.

### Privacy and Multi-Client

- [x] No GM-only Document data is stored.
- [x] No player notices.
- [ ] Privileged mutations execute once — Foundry settings stack; not a
      GameAssist socket protocol.
- [ ] Responsible-GM changes — deferred to authority.

### Verification Layers

- [x] Static and type checks
- [x] Automated unit or contract checks
- [ ] Integration harness checks
- [ ] Live Foundry smoke checks
- [ ] Full acceptance checks where required

## Approved Decisions

- World settings under namespace `gameassist`.
- `enabledByDefault` is a fallback for missing keys, not a one-time write.
- Unknown keys are preserved.
- Malformed values are warned and left in storage.
- Registry remains the in-memory enablement owner; settings hydrates and
  persists. Registry does not import Foundry.
- No `config: true` entries until Control Center.

## Deferred Decisions

- Client-scoped display preferences.
- Configure Settings / Control Center presentation.
- Repair UI for malformed stored maps.
- Migrating feature-owned state blobs other than enablement.

## Rejected Alternatives

- One unversioned JSON blob setting — cannot migrate safely.
- Writing every default on first init — later default changes could not apply
  to untouched features.
- Deleting unknown keys — loses state for temporarily disabled modules.

## Open Questions

- Should disabling a feature while the package is already `ready` stop that
  feature immediately, or wait for the next generation? This slice persists
  the flag and updates memory; immediate stop/start is included when the
  coordinator is `ready` so enablement is not a lie.

## Change Notes

- 2026-09-20 - Opened the settings and migration record and began the first
  implementation of Phase 1 item 2.
