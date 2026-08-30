# MECHSUITS Profile - Foundry VTT v1.0.0

**Additive specialized runtime profile for MECHSUITS v1.6.0**

Copyright (c) 2026 Mord Eagle. All rights reserved.

This profile is proprietary and may be read and applied only to projects
expressly authorized by Mord Eagle. It extends MECHSUITS v1.6.0; it does not
replace, weaken, or reinterpret the universal structural constitution.

---

## 1. Governing Relationship

This profile governs Foundry VTT runtime behavior for GameAssist-Foundry and
other owner-authorized Foundry projects. MECHSUITS v1.6.0 remains authoritative
for identifiers, codenames, banners, canonical trees, framed hierarchy,
section metadata, narratives, doc comments, inline notes, footers, historical
preservation, sidecars, and human-delivered whole-section replacement.

If a rule in this profile appears to conflict with Section 1.1 of the core,
the core governs and this profile must be corrected. Native Foundry contracts
adapt implementation behavior, never the protected structural model.

## 2. Applicability

Use these runtime classes where applicable:

- `foundry_client`: browser ESM loaded by Foundry VTT.
- `node_tooling`: build, test, packaging, migration, or release tooling.
- `worker`: a project-owned worker that is not part of the Foundry client.
- `static_only`: manifests, localization, templates, styles, packs, or data.

Use the core artifact classes without renaming them. A file that is authored
in TypeScript but shipped as browser JavaScript declares `foundry_client`, not
`node_tooling`. Build-time Node.js does not make Node APIs available at runtime.

## 3. Foundry Capability Block

Executable Foundry source adds truthful applicable fields such as:

```ts
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: ["Foundry Hooks", "Foundry Documents"]
//   compatibility:
//     foundry: { minimum: "<manifest minimum>", verified: "<verified major>" }
//     systems: ["dnd5e"]
//   lifecycle:
//     registers: ["init", "ready"]
//     disposes: ["timers", "socket handlers"]
//   state:
//     persistent: ["world settings", "namespaced flags"]
//     transient: ["client session cache"]
//     migrations: "[CODENAME:STATE:MIGRATIONS]"
//   authority:
//     model: "active authorized GM for shared world mutations"
//     stale_operation_policy: "reject"
//   performance:
//     hot_paths: ["updateCombat hook"]
//     budgets: ["no full-world scan in a high-frequency hook"]
```

Omit capabilities that do not exist. Do not invent hooks, telemetry, system
support, permissions, lifecycle phases, or performance measurements.

## 4. Runtime and Build Separation

- Shipped runtime code MUST be browser-compatible ESM.
- TypeScript MAY be the authored source and compile to JavaScript.
- Node.js MAY support build and test tooling but MUST NOT leak Node-only APIs
  into shipped client code.
- Imports MUST follow the chosen build strategy consistently.
- Generated output identifies its source and MUST NOT be edited by hand.
- Private or undocumented Foundry or system internals require a `DANGER` or
  `COMPAT` note, a capability guard, and focused verification, or must be
  avoided.

## 5. Foundry Lifecycle

Each file declares the lifecycle phases it owns and why. Use the earliest hook
that safely exposes the required capability.

- `init`: registration, settings, sheets, helpers, and static configuration
  that Foundry permits at initialization.
- `setup`: cross-module or system setup that requires initialized packages.
- `ready`: world Documents, users, scenes, and runtime state that require a
  ready world.
- Canvas hooks: canvas-dependent behavior only.
- Teardown or reactivation: observers, timers, sockets, temporary UI handlers,
  and other disposable resources.

Registration MUST be duplicate-safe when reloads, toggles, tests, or repeated
setup can occur. A module that tears down disposable resources must explicitly
restore them when re-enabled or require and clearly communicate a reload.

## 6. Hooks and Native Contracts

- Preserve exact Hook signatures, timing, and return values.
- Keep Hook adapters thin and move substantial rules into testable services.
- Validate permissions, capabilities, and Document availability.
- Document whether a Hook runs on every client, the initiating client, or an
  authoritative client.
- Prevent multiple clients from applying the same shared-world mutation.
- Avoid full-world scans and unbounded diagnostics in high-frequency Hooks.
- Treat Hook ordering as a contract when it affects behavior.

Hook callbacks that cancel with `false`, return `undefined`, or require another
native value MUST return that value directly. Project result envelopes belong
behind the adapter, not around the Hook contract.

## 7. Documents, Settings, Flags, and State

- Use supported Document create, update, and delete operations.
- Never mutate `_source` directly.
- Revalidate existence and permission immediately before a write.
- Treat UUIDs and Document references as potentially stale.
- Never silently overwrite user-authored fields.
- Batch compatible writes when that improves consistency and performance.
- Namespace settings and flags under the stable module ID.
- Preserve valid state during migrations.
- Repair known malformed state only when the repair is safe and documented.
- Warn about unknown state instead of deleting it automatically.

Every persisted value declares its scope:

- World settings for shared GM-owned configuration.
- Client settings for personal display preferences.
- User flags for justified user-owned state.
- Actor, Item, Token, Scene, Combat, or other Document data only when its
  ownership semantics justify that location.
- Transient caches stay out of persistent settings unless restart survival is
  a stated requirement.

## 8. Sockets and Authority

- Validate every received payload.
- Never trust client-supplied authority or permission claims.
- Declare how the authoritative GM or client is selected.
- Use operation identifiers for retryable shared-world mutations.
- Reject stale or duplicate operations safely.
- Recheck authority immediately before committing a mutation.
- Keep GM-only data out of player responses, UI, and diagnostics.
- Degrade only the affected feature when no eligible authority exists.

## 9. Privacy and Security

Hidden tokens, unrevealed Actors, private rolls, secret effects, GM notes, and
unpublished requests remain private. Client-side availability does not imply
player authorization. Player notices go only to the player or controller who
should receive them.

Rendered content MUST escape or sanitize user-controlled text at the correct
boundary. Diagnostic exports state what they contain before creation. External
telemetry is forbidden unless Mord Eagle explicitly authorizes its design and
the user-facing disclosure, consent, redaction, and retention rules exist.

## 10. UI, UX, and Accessibility

- Prefer supported Foundry Application, ApplicationV2, dialog, form, and
  rendering APIs for the target Foundry version.
- Put the common action first and organize advanced controls behind deliberate
  navigation.
- Keep ordinary interfaces compact.
- Preserve keyboard use, readable labels, focus behavior, and understandable
  failure text.
- Every failure explains what happened and gives the next useful action.
- Keep developer diagnostics out of ordinary player-facing UI.
- Use Foundry localization rather than embedding user-facing prose throughout
  implementation code.

## 11. Game-System Integration

- Isolate `dnd5e` and other system-specific behavior behind capability or
  system adapters.
- Prefer supported system APIs and schemas.
- Distinguish 2014 and 2024 D&D capabilities instead of guessing from labels.
- Represent unsupported or unverifiable capabilities honestly.
- Do not redistribute non-SRD rules text or purchased content.
- A missing optional system capability disables only the affected feature.
- System-specific failures must not prevent unrelated modules from loading.

## 12. Module Independence and Interoperability

- Each module declares required core services and optional module peers.
- Optional interoperability may depend on another module without making both
  modules generally dependent on each other.
- Disabling a shared service disables only dependent features and explains the
  consequence.
- Prefer native Foundry behavior when it already solves the problem well.
- Do not replace native tracker, sheet, effect, item, or Document behavior
  without clear user value and an explicit contract or setting.

## 13. Time and Scheduling

Distinguish:

- Foundry world time through the supported `game.time` interface.
- Wall-clock time for real timestamps.
- Monotonic time for durations and performance measurements.
- User locale for display only.

Do not infer fictional time from real elapsed time unless the feature promises
that relationship. Timers document owner, cancellation, reload behavior,
pause behavior, stale callback protection, authority, and persistence.

## 14. Observability

The default GameAssist-Foundry mode is `local_diagnostics` unless project
policy selects a narrower mode. Diagnostics are bounded, redacted, and scoped
to authorized users.

Useful signals include lifecycle transitions, module health, capability
detection, migration results, failed writes, retries, and rejected stale
operations. Do not add external metrics, spans, or telemetry merely because a
library supports them.

## 15. Documentation Requirements

The core Section 7 applies in full. In Foundry source, JSDoc or TSDoc is
REQUIRED for:

- Public APIs and module integration surfaces.
- Hook callbacks and lifecycle registration.
- Document readers, writers, migrations, and transactions.
- Socket requests, responses, and authority selectors.
- Settings registration and configuration migrations.
- System adapters and capability detection.
- Timers, queues, retry logic, and stale-operation handling.

Doc comments identify Hook timing, native return contracts, Document side
effects, permission requirements, client authority, stale references, and
privacy implications where relevant. Inline `WHY`, `INVARIANT`, `ORDER`,
`OWNERSHIP`, `COMPAT`, `PRIVACY`, and `DANGER` notes preserve decisions that a
future maintainer cannot reliably infer from syntax.

## 16. Artifact and Sidecar Rules

The following commonly require sidecars or grouped coverage:

- `module.json` and `package.json`.
- Localization JSON.
- Handlebars or other presentation templates.
- CSS and SCSS.
- Compendium source and generated packs.
- Generated `dist/` output.
- Build and release configuration.

Sidecars identify exact paths, ownership, source of truth, generation method,
validation, localization/accessibility requirements, and safe edit procedure.

## 17. Foundry Compliance Checklist

An artifact using this profile must pass the universal checklist and all
applicable items below:

- `foundry_client` and authored/build profiles are truthfully separated.
- Browser runtime source contains no accidental Node-only dependency.
- Lifecycle registration is declared, correctly timed, and duplicate-safe.
- Disposable resources have teardown and reactivation behavior.
- Hook signatures and native returns are preserved.
- High-frequency Hooks avoid unbounded scans and logging.
- Document writes use supported APIs and never mutate `_source`.
- Permissions and stale references are revalidated before writes.
- Settings and flags use stable namespaces and correct scope.
- State migrations preserve valid configuration and warn about unknown data.
- Shared mutations have authority, idempotency, and stale-operation rules.
- GM-only and hidden information remains private.
- UI is localized, accessible, compact, and recovery-oriented.
- System assumptions are capability-checked and isolated.
- World time, real time, and monotonic time are not conflated.
- Required JSDoc/TSDoc and inline decision notes are present and accurate.
- Foundry manifests, templates, localization, styles, and generated output have
  adequate sidecar coverage.

## Appendix A. Foundry Hook Example

```ts
// ============================================================================
// [GAMEASSIST_ACTOR_HOOKS:HOOKS:PRE_UPDATE] BEGIN
// Section Title: Validate actor updates before Foundry applies them
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_ACTOR_HOOKS",
//   area: "HOOKS:PRE_UPDATE",
//   title: "Pre-update Actor adapter",
//   guarantees: ["Preserves Foundry's false-to-cancel contract."],
//   depends_on: ["[GAMEASSIST_ACTOR_HOOKS:DOMAIN:VALIDATION]"],
//   seams: ["Hooks.on('preUpdateActor')"],
//   risks: ["Runs on multiple clients unless authority is bounded."],
//   last_updated_version: "vX.Y.Z",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// This thin adapter converts Foundry Hook inputs into an owned validation
// request. It returns Foundry's native cancellation value. Diagnostic detail
// remains private to an authorized GM.
// -----------------------------------------------------------------------------
/**
 * Validates an Actor update at Foundry's pre-update boundary.
 *
 * @param {Actor} actor Actor Foundry intends to update.
 * @param {object} changes Proposed update payload.
 * @param {object} options Foundry update options and operation context.
 * @param {string} userId User that initiated the update.
 * @returns {false|undefined} False cancels; undefined permits the update.
 * @sideEffects Records a bounded GM-only diagnostic on refusal.
 */
function onPreUpdateActor(actor, changes, options, userId) {
  const result = validateActorUpdate({ actor, changes, options, userId });
  if (result.ok) return undefined;

  diagnostics.recordForGm(result.error);
  return false;
}
// --- Notes & Comments ---
// Changed (vX.Y.Z): added the native cancellation adapter.
// INVARIANT: Never wrap this Hook return in a project result envelope.
// PRIVACY: Validation detail is restricted to authorized GMs.
// [GAMEASSIST_ACTOR_HOOKS:HOOKS:PRE_UPDATE] END
// ============================================================================
```

---

## Final Principle

This profile succeeds when Foundry-native code remains structurally truthful,
well taught, safe across clients, respectful of Documents and permissions, and
easy to revisit months later. Foundry compatibility is not permission to
discard MECHSUITS structure, and MECHSUITS structure is not permission to
distort Foundry's contracts.

