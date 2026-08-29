# MECHSUITS v1.6.0

**Mord Eagle Coding Hierarchy, Structure, Using Incrementally Tailored Sections**

Copyright (c) 2026 Mord Eagle. All rights reserved.

MECHSUITS is a proprietary specification owned by Mord Eagle. It is not
licensed under the MIT License that applies to the surrounding GameAssist
source code. Contributors may read and apply this specification when working
on a project expressly authorized by Mord Eagle. No permission is granted to
copy, adapt, redistribute, or adopt MECHSUITS for another project without
permission. Permission requests are welcome.

MECHSUITS exists to make code safe to understand, change, test, and maintain.
It does that through visible structure, explicit contracts, teaching
commentary, stable identifiers, disciplined boundaries, and durable decision
history. It must strengthen working software rather than force software into a
shape that is wrong for its runtime.

RFC 2119 terms apply. `MUST`, `MUST NOT`, `REQUIRED`, `SHOULD`, `SHOULD NOT`,
and `MAY` carry their usual normative meanings.

> **Assistant contract:** Treat this document as one unified standard. Do not
> claim that an artifact is MECHSUITS-compliant without applying the complete
> checklist in Section 18. Examples teach the governing concept; they are not
> permission to impose an irrelevant server, browser, transport, or framework
> pattern on a different runtime.

---

## 1. Purpose and Governing Philosophy

MECHSUITS protects five things:

1. **Comprehension:** A future maintainer can discover what a file and section
   do, why they exist, what they depend on, and what they refuse to do.
2. **Change safety:** A maintainer can replace a complete section without
   guessing where scattered snippets belong or silently losing neighboring
   behavior.
3. **Contract truth:** Banners, trees, section metadata, public surfaces,
   lifecycle order, state ownership, and documentation describe the code that
   actually exists.
4. **Institutional memory:** Meaningful decisions, alternatives, risks,
   migrations, and prior notes survive routine maintenance.
5. **Practical fitness:** The standard adapts to the host runtime and artifact
   type. It never requires a construct that would break a native callback,
   corrupt generated output, invent useless telemetry, or make stable code
   worse merely to resemble an example.

The governing questions are:

- Why is this rule here?
- What design risk does it control?
- What intent must survive if the literal form cannot apply?
- What is the narrowest adaptation that preserves that intent?
- How do we prove that an adaptation is not becoming an unreviewed escape?

Optimization means preserving safety, clarity, and maintainability with the
least unnecessary complexity. Convenience alone is not a reason to bypass a
rule. Literal compliance that produces broken or hostile code is also not
compliance.

### 1.1 What v1.6.0 changes

Version 1.6.0 preserves the v1.5.x hierarchy and documentation guarantees while
adding:

- Runtime and artifact applicability profiles.
- Native-contract precedence for host hooks and callbacks.
- Controlled variances with compensating controls.
- A collision-safe codename derivation algorithm.
- File-touch project-version semantics for multi-file repositories.
- Capability-scaled observability instead of server-only assumptions.
- Grouped sidecars for related non-commentable artifacts.
- Explicit Foundry VTT client, hook, document, settings, socket, and build rules.
- A project-level architecture registry that complements file-scoped trees.
- Clear separation between hand-authored source and generated distribution
  output.

---

## 2. Applicability Before Implementation

Every artifact MUST be classified before MECHSUITS rules are applied. The
classification determines how the standard is expressed, not whether the
standard matters.

### 2.1 Runtime profiles

Use one primary runtime profile and any necessary secondary profile:

- `foundry_client`: Code executed inside the Foundry VTT browser client.
- `browser_client`: Framework-independent browser code.
- `node_tooling`: Build, test, packaging, migration, or release tooling run by
  Node.js outside the shipped client runtime.
- `node_service`: A long-running Node.js service with server transports.
- `library`: Reusable code whose caller owns lifecycle and presentation.
- `cli`: A command-line interface.
- `worker`: A worker or background execution context.
- `static_only`: Data with no executable runtime.

Do not infer that Node.js is available merely because TypeScript or a bundler
is used. Build-time Node.js and shipped browser runtime are separate profiles.

### 2.2 Artifact profiles

Classify each artifact as one of:

- `source`: Hand-authored executable source.
- `test`: Hand-authored verification code.
- `manifest`: Machine-readable configuration such as `module.json`.
- `localization`: Translation or localization data.
- `template`: Handlebars, HTML, or another presentation template.
- `style`: CSS, SCSS, or another style source.
- `content`: Hand-authored compendium or package content.
- `generated`: Reproducible build output.
- `vendored`: Third-party material preserved under its own license.
- `documentation`: Human-facing project material.

### 2.3 Applicability declaration

Every executable file banner MUST declare its runtime and artifact profiles.
Non-commentable artifacts MUST be covered by a sidecar that declares them.

Example:

```ts
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: ["Foundry Hooks", "ApplicationV2"]
```

### 2.4 Native-contract precedence

When a host API requires a specific function signature, return value, timing,
mutation path, or lifecycle, that native contract takes precedence over a
generic MECHSUITS example. The file MUST document the native contract and
preserve the MECHSUITS intent through validation, naming, commentary, tests,
and a narrow boundary.

Native-contract precedence is adaptation, not exemption. It MUST NOT be used
to avoid documentation, validation, safety, or testing that remains possible.

### 2.5 Adding a code-specific profile

When several artifacts share a runtime whose native contracts are not
adequately covered, create an owner-approved code-specific profile instead of
accumulating repeated variances. A profile MUST define:

- Runtime and artifact scope.
- Native lifecycle and callback contracts.
- Required and optional banner capability blocks.
- Processing-order expectations.
- Result and error behavior.
- State, authority, privacy, and concurrency concerns.
- Applicable observability modes.
- Sidecar and generated-output treatment.
- Required verification.
- Which generic rules are adapted and how their design intent is preserved.

A profile MAY strengthen MECHSUITS for its runtime. It MUST NOT weaken stable
identifiers, truthful banners and trees, framed ownership, decision history,
data safety, or the controlled-variance requirements. New profiles require
explicit Mord Eagle approval and become part of the unified standard rather
than informal local custom.

---

## 3. Controlled Variances and Non-Abusable Escape

MECHSUITS permits a variance only when the literal rule is not applicable or
would materially harm correctness, host compatibility, security,
maintainability, or generated-source integrity.

### 3.1 Variance classes

- `ADAPTED`: The rule applies, but its implementation must match the runtime.
- `NOT_APPLICABLE`: The governed capability does not exist in this artifact.
- `EXTERNAL_OWNER`: A generated, vendored, or host-owned contract cannot be
  changed here.
- `TEMPORARY`: A bounded deviation is required and has a review or removal
  target.

### 3.2 Required variance record

Every variance MUST identify:

- `rule`: The MECHSUITS rule being varied.
- `class`: One of the variance classes above.
- `reason`: The concrete incompatibility or absence.
- `preserved_intent`: The design purpose that remains protected.
- `compensating_control`: The code, test, sidecar, or review that replaces the
  literal mechanism.
- `scope`: The smallest file, section, or artifact set affected.
- `review`: The condition that would cause the variance to be reconsidered.

Example:

```ts
//   variances:
//     - rule: "uniform result envelope"
//       class: "ADAPTED"
//       reason: "Foundry preUpdateActor hooks use false to cancel an update."
//       preserved_intent: "Stable, documented failure behavior at the edge."
//       compensating_control: "Validate before the hook result and test false cancellation."
//       scope: "[GAMEASSIST_ACTOR_HOOKS:HOOKS:PRE_UPDATE]"
//       review: "Revisit if Foundry changes the hook contract."
```

### 3.3 Variance refusal

The following are never valid variance reasons:

- The comments are inconvenient.
- The file is small.
- The rule was forgotten until late in the change.
- The implementation would look cleaner without the history.
- A framework already handles some behavior but the boundary has not been
  identified or tested.
- The author does not want to update an inaccurate banner or tree.

Repeated variances for the same reason SHOULD trigger a runtime or artifact
profile improvement rather than permanent repetition.

---

## 4. Codenames, Derivation, Stability, and Registry

The codename is an owner-authoritative, file-local identifier used in tags,
trees, logs, tests, decision history, and search workflows.

### 4.1 Identifier literalism

If a codename already exists, copy it exactly. Do not change case, separators,
pluralization, or wording to make it look more consistent. A codename change is
MEANINGFUL and requires explicit owner approval, migration notes, and search
guidance.

Codenames and tag segments MUST use ASCII letters, digits, or underscores and
MUST NOT contain whitespace.

### 4.2 Explicit names take precedence

An owner-provided codename always overrides derivation. Use derivation only for
a new file that has no declared codename and no owner-provided name.

### 4.3 Collision-safe fallback derivation

For a new file:

1. Normalize the project root folder as `PROJECT`.
2. Normalize the file basename without extension as `BASENAME`.
3. Begin with `{PROJECT}_{BASENAME}`.
4. If the basename is generic in its location or the candidate collides with a
   registered codename, prepend the shortest meaningful parent-folder path
   needed to describe and distinguish the file.
5. Ignore purely structural folders such as `src`, `lib`, `scripts`, `module`,
   `modules`, `test`, and `tests` unless the owner has declared one meaningful
   in that project.
6. If meaningful folders still cannot produce an unambiguous name, stop and
   request an owner-provided codename. Never append arbitrary counters or hash
   fragments.

Examples:

```text
Hawk/server.ts
  -> HAWK_SERVER

Falcon/main.ts
  -> FALCON_MAIN

GameAssist-Foundry/src/core/index.ts
  -> GAMEASSIST_FOUNDRY_CORE_INDEX

GameAssist-Foundry/src/modules/effect/index.ts
  -> GAMEASSIST_FOUNDRY_EFFECT_INDEX

GameAssist-Foundry/src/modules/effect/settings.ts
  -> GAMEASSIST_FOUNDRY_EFFECT_SETTINGS
```

Common generic basenames include `index`, `main`, `entry`, `settings`,
`constants`, `config`, `types`, `utils`, `hooks`, `api`, and `service`. This
list is guidance, not an exhaustive trigger; semantic ambiguity governs.

### 4.4 Codename registry

Multi-file projects MUST keep a project-level codename registry in
`ARCHITECTURE.md`, `CODENAMES.md`, or another owner-designated document. The
registry records codename, path, responsibility, lifecycle, and any prior path.

Assistants MUST check the registry before assigning a fallback codename.

### 4.5 Rename stability

Moving or renaming a file does not change its codename. Update the registry and
record the move while preserving the identifier.

---

## 5. File Banner and Version Semantics

Every hand-authored executable source file MUST begin with a MECHSUITS banner
and a short prose paragraph.

### 5.1 Meaning of `project_version`

The banner's `project_version` records the project release in which that file
was most recently edited. It is file-touch provenance, not a demand that every
file display the latest package release.

- When a code file is edited for release `vX.Y.Z`, update that file's banner to
  `project_version: "vX.Y.Z"`.
- An untouched file retains its earlier value.
- Do not touch unrelated files merely to update their banner version.
- The package manifest remains authoritative for the currently distributed
  package version.
- Section `last_updated_version` has separate meaningful-change semantics
  defined in Section 14.

This deliberately allows a maintainer to see that a file last changed in
`v0.2.6` while the package is currently `v0.7.9`.

### 5.2 Required banner fields

```ts
// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_FOUNDRY_EFFECT_HOOKS"
//   project_version: "vX.Y.Z"
//   purpose: "One paragraph naming the guarantee and non-goals."
//   order: ["validate", "authorize", "apply", "observe"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: ["Foundry Hooks"]
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never mutate Foundry document source data directly."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded and redacted"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14" }
//     systems: ["dnd5e"]
//   policy:
//     notes_ref: "[GAMEASSIST_FOUNDRY_EFFECT_HOOKS:POLICY]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_FOUNDRY_EFFECT_HOOKS]/
//     |-- [GAMEASSIST_FOUNDRY_EFFECT_HOOKS:POLICY]
//     `-- [GAMEASSIST_FOUNDRY_EFFECT_HOOKS:HOOKS]
//         `-- [GAMEASSIST_FOUNDRY_EFFECT_HOOKS:HOOKS:READY]
// --- prose banner ---
// Restate the guarantee, order, last file-touch version, runtime, and at least
// one refusal in plain language.
```

Fields that are genuinely inapplicable MAY be omitted only when the runtime
profile says they are optional or a valid variance records why. Do not fill a
banner with fictional metrics, transports, secrets, or performance claims.

### 5.2.1 Profile-specific capability blocks

The base banner stays uniform while capability blocks describe the runtime that
actually exists. A capability block is REQUIRED when its capability exists and
omitted when it does not.

Examples include:

```ts
//   lifecycle:
//     registers: ["init", "ready"]
//     disposes: ["timers", "socket handlers"]
//   state:
//     persistent: ["world settings", "namespaced flags"]
//     transient: ["client session cache"]
//     migrations: "[CODENAME:STATE:MIGRATIONS]"
//   authority:
//     model: "active GM for world mutations"
//     stale_operation_policy: "reject"
//   performance:
//     hot_paths: ["updateCombat hook"]
//     budgets: ["no full-world scan in a high-frequency hook"]
```

For a Node service, the corresponding applicable blocks may include:

```ts
//   env:
//     required: ["PORT"]
//     optional: ["HOST"]
//     secrets: ["DB_URL"]
//   concurrency:
//     model: "optimistic"
//     idempotency: "Idempotency-Key for state-changing requests"
//   transport_map:
//     http: { "INVALID_ARGUMENT": 400, "NOT_FOUND": 404, "INTERNAL": 500 }
//   performance:
//     throughput_rps: 100
//     latency_p99_ms: 150
```

For Node tooling, useful blocks may instead describe input files, output files,
overwrite refusal, deterministic build behavior, and exit codes. The governing
rule is truthful capability coverage, not identical fields across unrelated
runtimes.

### 5.3 File-scoped canonical tree

The banner tree MUST describe only sections physically present in that file.
It MUST match their exact tags and nesting. A project-level architecture tree
belongs in project documentation, not in a file banner.

Use ASCII tree characters in banners and machine-inspected documentation.

---

## 6. Framed Sections and Physical Hierarchy

Use exact paired tags:

```text
[CODENAME:AREA(:SUB)*] BEGIN
[CODENAME:AREA(:SUB)*] END
```

Tags appear on their own comment lines. The human title follows `BEGIN`.

### 6.1 Proper nesting

If a child exists, every parent MUST exist and physically wrap the child. A
parent cannot close before its child begins. Siblings cannot interleave.
Overlapping ranges are valid only when one tag is a strict ancestor of the
other.

### 6.2 Required section metadata

Each section MUST include:

```ts
// mechsuit_section: {
//   codename: "GAMEASSIST_FOUNDRY_EFFECT_HOOKS",
//   area: "HOOKS:READY",
//   title: "Ready lifecycle binding",
//   guarantees: ["Registers the effect runtime exactly once."],
//   depends_on: ["[GAMEASSIST_FOUNDRY_EFFECT_HOOKS:POLICY]"],
//   provides: ["registerEffectReadyHook"],
//   seams: ["Hooks.once('ready')"],
//   risks: ["Duplicate registration after hot reload."],
//   last_updated_version: "vX.Y.Z",
//   lifecycle: "active"
// }
```

`provides`, `seams`, `risks`, observability fields, independent versions, and
deprecation data are required when relevant and omitted when not relevant.
Never retain empty placeholders merely to make sections look symmetrical.

### 6.2.1 Lifecycle and deprecation

Use one lifecycle value:

- `active`: Normal supported evolution.
- `experimental`: Deliberately incomplete or under evaluation; limitations and
  stability expectations MUST be stated.
- `deprecated`: Still present for compatibility but has a preferred
  replacement.
- `frozen`: Intentionally stable; permitted changes are narrowly defined.

A deprecated section MUST include `deprecation.since` and
`deprecation.replacement`, and SHOULD include `deprecation.removal_target` when
removal is actually planned. A frozen section MUST state why it is frozen and
what maintenance remains permitted. Experimental code MUST NOT be described as
fully supported in public documentation.

### 6.2.2 Independent versions

Independent versions MAY track a state schema, migration counter, protocol, or
other contract that changes independently of the project release. They are
additive and never replace `project_version` or `last_updated_version`.

- Keep them under `independent_versions`.
- New keys SHOULD use explicit names ending in `_version`, such as
  `state_schema_version` or `socket_protocol_version`.
- Values are integers or clearly scoped strings.
- A bare section field named `version` is prohibited because its meaning is
  ambiguous.
- Existing owner-authoritative keys are preserved unless an explicit migration
  is approved; do not rename them merely to satisfy preferred style.

### 6.3 Required narrative

The narrative explains:

- Purpose and responsibility.
- How the section composes with neighbors.
- Inputs, outputs, ownership, and side effects.
- Host contracts and lifecycle position.
- Important invariants, refusals, and failure behavior.
- Why the chosen boundary exists.

### 6.4 Required footer

Every section, including a wrapper with no direct code, ends with a concise
`Notes & Comments` footer immediately before `END`.

Use:

```text
Changed (vX.Y.Z): <meaningful behavior or contract change and rationale>.
```

or:

```text
Maintenance (vX.Y.Z, no semantic change): <mechanical or explanatory work>.
```

Where needed, include `Decision log`, `Prior notes`, `Rollback`, `Future seam`,
or `DANGER` entries. Preserve accurate prior commentary.

### 6.5 Section size and file design

MECHSUITS does not prefer giant files. Use cohesive files whose responsibilities
can be understood independently. A section may be a wrapper, a focused unit,
or a subsection, but sections MUST follow real code ownership rather than
arbitrary line-count targets.

Do not split code only to create more tags. Do not combine modules merely to
place them under one tree.

---

## 7. Teaching Commentary and Decision Memory

Comments teach what cannot be safely inferred from syntax.

### 7.1 Docblocks

Validators, normalizers, migrations, public APIs, state writers, host adapters,
and business rules SHOULD explain:

- Context.
- Inputs and accepted shapes.
- Outputs and native return contracts.
- Invariants.
- Failure modes.
- Permission and privacy effects.
- Edge cases.
- Design reason.

### 7.2 Inline notes

Use these sparingly and intentionally:

- `CHOICE:` Why this implementation was selected.
- `ALT:` A materially plausible alternative.
- `REJECTED:` Why the alternative was not selected.
- `DANGER:` A hazardous or surprising operation and its containment.
- `WHY:` A short explanation for a non-obvious line.
- `EXEMPT:` A local policy exception that meets Section 3.

Do not narrate obvious assignments or restate function names.

When a design decision has real, consequential alternatives, document up to
three useful patterns or options and recommend one. Do not manufacture three
choices as ritual or busywork. When only one approach fits the host contract,
state that approach directly.

### 7.3 Preserve useful history

Do not delete accurate prior notes merely because an implementation changed.
Move durable context into the footer. Remove or correct commentary that became
false, while recording why it was superseded.

Public README material describes user-visible behavior. Internal decision
history remains in source comments, architecture records, ADRs, and developer
documentation.

---

## 8. Processing Order as a Runtime Contract

The banner MUST declare the order that matters for its runtime. Implement and
test that order where an ordering failure could change behavior.

### 8.1 Profile examples

- `foundry_client`: registration, `init`, `setup`, `ready`, canvas-specific
  hooks, teardown or reload handling as applicable.
- `browser_client`: parse, validate, authorize, mutate, render, notify.
- `node_tooling`: parse arguments, validate, load, transform, write, verify.
- `node_service`: middleware, routes, static assets, fallback, errors,
  listeners where applicable.
- `cli`: parse, validate, execute, report, exit.
- `library`: validate, normalize, calculate, return.

These are examples, not mandatory sequences. Declare the actual sequence.

### 8.2 Order proof

Provide a focused test or documented proof when order is behaviorally
significant. Prefer testing named boundaries and observable outcomes over
implementation line positions.

---

## 9. Results, Errors, and Native Callback Contracts

Uniform result envelopes remain valuable at boundaries owned by the project:

```ts
type Success<T> = { ok: true; data: T; meta: { traceId: string } };
type Failure<E extends string = string> = {
  ok: false;
  error: E;
  data?: unknown;
  meta: { traceId: string };
};
```

Use a stable project-specific error vocabulary. The prior general set remains
recommended when applicable:

```text
INVALID_ARGUMENT, NOT_FOUND, CONFLICT, UNAUTHORIZED, FORBIDDEN,
UNPROCESSABLE, RATE_LIMITED, TIMEOUT, UNAVAILABLE, INTERNAL
```

Domain-specific codes MAY be added when they produce a real recovery path.

### 9.1 Where envelopes belong

Envelopes SHOULD be used for:

- Public GameAssist APIs.
- Service-to-service boundaries owned by GameAssist.
- Socket requests and responses.
- Migration and transaction outcomes.
- Complex operations presented to UI controllers.
- Diagnostic operations where correlation materially helps.

### 9.2 Where native contracts prevail

Do not wrap values when the host requires a specific return contract. Examples
include Foundry hook callbacks, render handlers, event listeners, comparators,
and framework predicates.

At those boundaries:

1. Validate and normalize before domain application.
2. Return exactly what the host expects.
3. Send structured failures through an owned diagnostic or UI boundary.
4. Document and test the host behavior.
5. Record an `ADAPTED` variance only when the profile does not already define
   the native behavior.

### 9.3 Trace identifiers

Trace identifiers are required only when operations cross meaningful
asynchronous, socket, transaction, or diagnostic boundaries. Do not manufacture
trace IDs for trivial pure helpers or every UI click.

---

## 10. Policy Governance and Tunables

Behavioral knobs belong in a discoverable policy or settings owner. Avoid magic
numbers and duplicated defaults.

Use the mechanism appropriate to the runtime:

- Compile-time constants for invariant technical limits.
- Foundry settings for configurable world or client behavior.
- A module policy object for internal defaults and bounds.
- User-editable content documents only when users are intended to own that
  content.

Every setting declares:

- Scope: world, client, user, actor, scene, or project.
- Default and valid range.
- Permission to change it.
- Migration behavior.
- Effect on existing data.
- UI location when user-facing.

Changing a default or meaning is MEANINGFUL. Record old value, new value,
rationale, compatibility effect, and rollback when practical.

An inline constant may use `EXEMPT` only when centralization would reduce
clarity or falsely imply configurability.

---

## 11. Observability Scaled to Capability

Observability exists to make failures explainable and behavior verifiable. It
must not create surveillance, useless noise, privacy leaks, or fictional
operational claims.

### 11.1 Modes

- `none`: Pure or static artifact with no meaningful runtime observation.
- `local_diagnostics`: Redacted console output, bounded local history, or GM
  diagnostic UI.
- `structured_local`: Structured logs and counters retained locally.
- `host_integrated`: Uses an existing host diagnostic facility.
- `external_telemetry`: Sends data outside the host and therefore requires
  explicit owner design, user disclosure, consent, redaction, and retention
  policy.

GameAssist for Foundry defaults to `local_diagnostics`. External telemetry is
forbidden unless Mord Eagle explicitly authorizes it and the user-facing
privacy design is completed.

### 11.2 Applicable signals

Choose only signals that answer a real support or safety question:

- Named lifecycle transitions.
- Bounded error and warning history.
- Module health and capability detection.
- Migration results.
- Operation durations for genuinely expensive paths.
- Counts of retries, rejected stale actions, or failed writes.
- Correlation IDs for sockets or multi-step transactions.

Do not add request throughput, server spans, or metrics merely because an
example contains them.

### 11.3 Required discipline

- Logs identify the emitting codename or section.
- User-controlled content is redacted or bounded before logging.
- Secrets and private GM data are never logged to player-visible surfaces.
- High-frequency hooks avoid unbounded logging.
- Labels and dimensions remain low-cardinality.
- Declared signals actually exist in code or are omitted.

A `NOT_APPLICABLE` observability variance is valid for pure helpers, static
data, templates, styles, and similar artifacts when the sidecar explains how
their behavior is verified instead.

---

## 12. Time, Scheduling, and Determinism

Distinguish time sources explicitly:

- Wall-clock time for real timestamps.
- Monotonic time for durations and performance.
- Host world time for fictional or simulation time.
- User locale for human display only.

Foundry code MUST distinguish `game.time.worldTime` or the current supported
world-time API from `Date.now()` and monotonic timing. Never infer fictional
time from elapsed real time unless the feature explicitly promises that link.

Timers document:

- Ownership and cancellation.
- Restart and reload behavior.
- Stale callback protection.
- Multi-client authority.
- Pause behavior.
- Whether state is persistent or session-only.

Machine timestamps use an unambiguous UTC representation. Human-facing dates
use the campaign or user display policy. Randomized behavior that affects
persistent state SHOULD expose a testable random seam.

---

## 13. Ports, Adapters, and Platform Boundaries

Keep domain rules independent when doing so removes real platform coupling.
Adapters translate Foundry, game-system, storage, socket, or UI contracts into
canonical GameAssist shapes.

Useful Foundry boundaries include:

- Core Foundry document access.
- Official `dnd5e` system capabilities.
- Settings and flags.
- Socket authority.
- Application and dialog presentation.
- Combat tracker access.
- Active Effects and item workflows.
- Calendar or world-time providers.

Do not wrap every Foundry object merely to satisfy a pattern. Add an adapter
when it protects the domain from unstable/private APIs, supports more than one
system, enables focused tests, or centralizes permission and mutation safety.

Canonical domain code MUST NOT mutate Foundry `_source` data directly. Use
supported Document operations through the owning adapter.

Capability detection is preferred over assumptions. Missing optional
capabilities disable only the affected feature and produce a useful next step.

---

## 14. Foundry VTT Application Profile

This section is normative for GameAssist-Foundry source unless a narrower
owner-approved profile supersedes it.

### 14.1 Runtime and language

- Shipped runtime code is browser-compatible ESM.
- TypeScript MAY be used as authored source and compiled to JavaScript.
- Node.js MAY be used for build and test tooling but MUST NOT leak Node-only
  APIs into shipped client code.
- Imports MUST follow the selected build strategy consistently.
- Private or undocumented Foundry and game-system internals require a DANGER
  note, compatibility guard, and focused test or must be avoided.

### 14.2 Lifecycle

Files declare which Foundry lifecycle hooks they use and why. Registration
MUST be idempotent where reload, module toggling, or repeated setup can occur.

Use the earliest lifecycle that safely provides the required capability. Do
not access world documents before they are ready merely to centralize setup.
Do not defer static registration until `ready` without a reason.

Teardown-owned resources such as observers, timers, sockets, and temporary UI
handlers MUST have an explicit disposal or reactivation strategy.

### 14.3 Hooks

- Preserve the exact native hook signature and return contract.
- Keep hook adapters thin; move substantial rules into testable services.
- Validate permissions and document availability.
- Prevent duplicate registration.
- Avoid expensive full-world scans in high-frequency hooks.
- Document whether the hook runs on every client, only the initiating client,
  or under GM authority.
- Prevent repeated clients from applying the same world mutation.

### 14.4 Documents and state

- Use supported Document creation, update, and deletion methods.
- Never silently overwrite user-authored fields.
- Namespace flags and settings under the stable module ID.
- Preserve valid state during migrations.
- Warn about unknown state instead of deleting it automatically.
- Batch compatible writes where that improves consistency and performance.
- Treat UUIDs and Document references as potentially stale.
- Revalidate permissions and existence immediately before a write.

### 14.5 World, client, and user scope

Every persisted value declares its scope. GM configuration normally belongs in
world settings. Personal display preferences normally belong in client
settings. Actor, Item, Token, Scene, and Combat data belong only where their
ownership semantics justify it.

Do not use a world setting as a convenient dumping ground for transient state.

### 14.6 Sockets and multi-client authority

- Validate all received payloads.
- Never trust a client-supplied permission claim.
- Declare the authoritative client or GM-selection rule.
- Use operation identifiers for retryable world mutations.
- Reject stale or duplicate operations safely.
- Keep GM-only data out of player responses and logs.
- Degrade clearly when no eligible GM authority is available.

### 14.7 UI and accessibility

- Prefer supported Foundry application and rendering APIs.
- Keep common actions visible and advanced controls organized behind deliberate
  navigation.
- Preserve keyboard access, readable labels, and understandable failure text.
- Every failure explains what happened and the next useful action.
- Do not expose internal diagnostics in ordinary player-facing UI.
- Rendered content MUST escape or sanitize user-controlled text at the correct
  boundary.

### 14.8 Game-system integration

- Isolate `dnd5e`-specific logic behind a capability or system adapter.
- Prefer supported system APIs and document schemas.
- Distinguish 2014 and 2024 rules capabilities instead of guessing from names.
- Do not redistribute non-SRD rules text or purchased content.
- Optional system-specific features MUST NOT prevent unrelated GameAssist
  modules from loading.

### 14.9 Module independence and interoperability

- Each GameAssist module declares required core services and optional peers.
- Optional interoperability may depend on another module, but both modules
  remain independently useful unless the dependency is fundamental and
  declared.
- Disabling a shared service disables only dependent features and clearly
  reports the consequence.
- Prefer native Foundry behavior when it already meets the user need.
- Never replace native tracker, sheet, effect, or document behavior without a
  clear user benefit and an explicit setting or contract.

---

## 15. Updating Code and Whole-Section Replacement

### 15.1 Non-invasive compliance

MECHSUITS is not permission to rename identifiers, reformat unrelated code,
rewrite stable modules, or perform aesthetic cleanup. Change the smallest
relevant section and directly affected contracts.

### 15.2 Whole-section delivery

When code is delivered for a human to insert, return each complete affected
frame from `BEGIN` through `END`, including metadata, narrative, code, and
footer. Do not provide a sequence of line-number-dependent snippets whose
positions become invalid after earlier edits.

When an automated tool edits the repository directly, it MAY apply a precise
patch inside a section. The resulting file MUST still contain the complete,
accurate frame. Human-facing explanations identify the affected sections, not
fragile old line numbers.

### 15.3 Replacement granularity

Replace the smallest complete section or subsection whose implementation or
contract changes. Replace an ancestor only when its guarantees, order,
narrative, risks, dependencies, or tree become inaccurate.

### 15.4 Meaningful Change Rule

A section change is MEANINGFUL when a reasonable user, caller, dependent
section, operator, or test can observe a changed behavior, contract, state,
permission, privacy effect, timing, resource profile, or diagnostic surface.

For a meaningful change:

1. Set `last_updated_version` to the current file `project_version`.
2. Add `Changed (vX.Y.Z)` to the footer.
3. Record rationale, compatibility effect, trade-offs, migration, and rollback
   when relevant.

For a non-meaningful change:

1. Leave `last_updated_version` unchanged.
2. Add `Maintenance (vX.Y.Z, no semantic change)` to the footer.

The file banner `project_version` is updated for either kind of file edit.

Meaningful changes include:

- Public APIs, hook effects, commands, settings, schemas, and validation.
- Defaults, branching, side effects, retries, timers, and ordering.
- Permissions, privacy, redaction, authority, or ownership.
- Logging fields, health results, and diagnostic behavior.
- Performance characteristics that alter practical operation.
- Dependency or capability changes.
- State migrations and persistence behavior.

Comment clarification, formatting, and proven behavior-preserving refactors are
normally maintenance changes.

### 15.5 Snippet exception

A human-delivered snippet is allowed only for:

- A one-line safety fix that changes no structure.
- A single-value policy change.
- A grammar or comment correction.

State `Snippet exception invoked`, explain why it qualifies, and ensure it
cannot alter tags, nesting, or the canonical tree.

---

## 16. Non-Commentable, Generated, Vendored, and Presentation Artifacts

### 16.1 Sidecar purpose

Sidecars preserve decisions where full in-file commentary is invalid,
destructive, or hostile to the artifact format. A sidecar is not a dumping
ground and not an excuse to leave the artifact unexplained.

### 16.2 Grouped sidecars

Related artifacts MAY share one sidecar when they have the same owner,
generation path, lifecycle, and design contract. The sidecar MUST list every
covered path or an exact bounded pattern.

Recommended examples:

```text
__mechsuit__/manifests.md
__mechsuit__/localization.md
__mechsuit__/templates.md
__mechsuit__/styles.md
__mechsuit__/packs.md
__mechsuit__/build-output.md
```

Do not create one sidecar per tiny localization or template file unless it has
independent decisions that justify one.

### 16.3 Sidecar requirements

A sidecar records:

- A compact MECHSUITS banner with codename, project version, purpose,
  applicability, refusals, and a file-scoped canonical tree.
- Covered artifacts.
- Runtime and artifact profiles.
- Source of truth.
- Ownership and purpose.
- Schema or format contract.
- Validation or build command.
- Regeneration instructions where applicable.
- Editing refusal for generated or vendored output.
- Decisions and prior notes.
- Applicable licenses.

The sidecar MUST organize materially distinct contracts into framed sections
with paired BEGIN and END tags, metadata, narrative, and Notes & Comments.
Tiny artifact groups MAY use one wrapper section when further subdivision would
not reveal any additional ownership or contract boundary.

If a hand-authored artifact is under 100 lines, including its current content
in the sidecar is recommended only when doing so materially improves review.
It is not required duplication.

### 16.4 Generated distribution output

Generated `dist/` output does not wear a full in-file MECHSUITS structure unless
the generator intentionally emits it. The authored source and build sidecar are
authoritative. Generated output SHOULD contain only a minimal generated-file
notice when the format and build permit it.

Never manually fix generated output while leaving its source broken.

### 16.5 Vendored material

Do not rewrite third-party source to impose MECHSUITS. Preserve upstream files,
licenses, and notices. Document why the dependency exists, its version, source,
update process, and containment in the vendored sidecar.

### 16.6 Templates, styles, and localization

Apply MECHSUITS through stable naming, bounded ownership, comments where the
format safely permits them, sidecars, visual verification, localization-key
validation, accessibility checks, and source-to-render traceability. Do not
fill presentation files with server-oriented metadata.

---

## 17. Security, Privacy, and Data Posture

Every executable banner declares the highest data class the file is expected
to handle:

- `Public`
- `Internal`
- `Confidential`
- `Restricted`

The banner also declares AI-data posture:

- `none`
- `internal_redacted`
- `restricted_disallowed`

These fields describe project handling rules; they do not authorize data
collection or transmission.

### 17.1 Required refusals

Refusals are owner-authored policy. Assistants do not add, remove, or strengthen
them without authorization. At minimum, code honors applicable refusals such
as:

- Never log credentials, access keys, or private tokens.
- Never reveal GM-only information to players.
- Never send campaign data to an external service without explicit design and
  consent.
- Never trust client-provided authority.
- Never silently overwrite user-authored data.

Only include refusals that the owner has adopted for the project or section.

### 17.2 New sinks

Every new log, socket payload, external request, exported file, error detail,
or rendered diagnostic is evaluated for permissions, privacy, retention, and
redaction. Record the decision in the nearest owning section.

### 17.3 Foundry privacy boundaries

- Hidden tokens, unrevealed actors, private rolls, secret effects, and GM notes
  stay private.
- Player notifications go only to authorized users.
- Client-side presence does not imply player authorization.
- User-controlled HTML and text are sanitized or escaped.
- Diagnostic exports state what they contain before creation.

---

## 18. Compliance Checklist

An artifact is MECHSUITS v1.6.0 compliant only when all applicable items pass:

### Identity and applicability

- The runtime and artifact profiles are declared.
- Existing identifiers are preserved literally.
- The codename is owner-provided or collision-safely derived.
- The project codename registry is current.
- Every variance is narrow, justified, compensated, and reviewable.

### File truth

- Every hand-authored executable file begins with a complete banner and prose
  summary.
- `project_version` identifies the release in which that file was last edited.
- Untouched files were not churned merely for a package version bump.
- The file-scoped canonical tree matches exact tags and nesting.
- The banner contains no invented secrets, metrics, transports, or claims.

### Sections

- BEGIN and END tags are paired and ASCII.
- Every child has physically wrapping parents.
- Siblings do not overlap or interleave.
- Every section has metadata, narrative, and a footer.
- `last_updated_version` follows the Meaningful Change Rule.
- Accurate prior notes remain available.
- Dependencies, seams, risks, lifecycle, and ownership are truthful.

### Runtime fitness

- Native host signatures and return contracts are preserved.
- Processing and lifecycle order are declared and implemented.
- Inputs are validated and normalized at owned boundaries.
- Domain code does not depend on unstable platform details without an adapter
  or documented reason.
- Policy and user settings have clear ownership and scope.
- Time sources, timers, and authority are explicit where applicable.
- Missing optional capabilities fail narrowly.

### Foundry safety

- Hook registration is bounded and duplicate-safe.
- Document writes use supported APIs.
- Settings and flags use stable namespaces and migrations.
- Multi-client mutations have an authority and stale-operation strategy.
- GM-only data remains private.
- UI failures provide a useful next step.
- Game-system assumptions are capability-checked.

### Observability and security

- Observability matches a real support need and the declared mode.
- High-frequency paths do not create unbounded logs or metrics.
- Declared signals exist or are omitted.
- Data classification, refusals, permissions, and redaction are honored.
- External telemetry is absent unless explicitly authorized and disclosed.

### Artifacts and delivery

- Non-commentable artifacts are covered by precise sidecars.
- Grouped sidecars have bounded path coverage.
- Generated output identifies its source of truth and is not manually edited.
- Vendored code and licenses remain intact.
- Human-delivered code uses whole-section replacement unless a valid snippet
  exception is declared.
- The final diff contains no accidental deletions or unrelated cleanup.

Partial compliance is non-compliance when a full compliance claim is made.
An honest statement such as `MECHSUITS structure added; full audit pending` is
permitted when verification is incomplete.

---

## 19. Assistant Operating Instructions

Before editing:

1. Inspect repository, branch, status, surrounding code, architecture records,
   codenames, current project version, and relevant documentation.
2. Classify runtime and artifact profiles.
3. Read the complete banner and affected section frames.
4. Identify native host contracts and directly affected dependencies.
5. Decide whether any variance is genuinely required.

While editing:

1. Change the smallest relevant section and directly affected contracts.
2. Preserve identifiers, behavior, comments, and public surfaces unless change
   is intentional.
3. Update the edited file's `project_version`.
4. Apply meaningful or maintenance section-version rules accurately.
5. Keep the canonical tree synchronized when tags change.
6. Preserve native runtime compatibility over resemblance to an example.
7. Add comments that teach, not comments that narrate syntax.
8. Keep public documentation free of internal implementation narration.

After editing:

1. Run profile-appropriate syntax, type, unit, integration, packaging, and
   structural checks.
2. Verify lifecycle, invalid input, permissions, privacy, stale state, restart,
   and missing capability behavior where relevant.
3. Inspect the final diff for lost code, commands, aliases, comments, and
   documentation.
4. Confirm generated artifacts and manifests match their source of truth.
5. Do not claim live-host verification from local tests.
6. Do not claim MECHSUITS compliance until Section 18 passes.

Assistants MUST NOT treat examples as mandatory architecture, defaults as
overrides of existing values, recommendations as implicit MUSTs, or variance as
a shortcut around careful work.

---

## Appendix A. Canonical Framed Section

```ts
// ============================================================================
// [CODENAME:AREA(:SUB)*] BEGIN
// Section Title: <Human title>
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "CODENAME",
//   area: "AREA(:SUB)*",
//   title: "<short title>",
//   guarantees: ["<promise>"],
//   depends_on: ["[CODENAME:OTHER]"],
//   provides: ["<symbols or capability>"],
//   seams: ["<host or project boundary>"],
//   risks: ["<known limitation>"],
//   last_updated_version: "vX.Y.Z",
//   independent_versions: { state_schema_version: 1 },
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Explain responsibility, composition, native contracts, invariants, failure
// behavior, side effects, ownership, and why this boundary exists.
// -----------------------------------------------------------------------------
// <implementation>
// --- Notes & Comments ---
// Changed (vX.Y.Z): <change and rationale>.
// Decision log:
//   CHOICE: <choice> - ALT: <alternative>; REJECTED: <reason>.
// Prior notes:
//   <durable earlier context>
// [CODENAME:AREA(:SUB)*] END
// ============================================================================
```

Optional fields are removed when inapplicable. Never leave fake placeholders
in production source.

---

## Appendix B. Foundry Hook Adapter Example

```ts
// ============================================================================
// [GAMEASSIST_FOUNDRY_ACTOR_HOOKS:HOOKS:PRE_UPDATE] BEGIN
// Section Title: Validate actor updates before Foundry applies them
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_FOUNDRY_ACTOR_HOOKS",
//   area: "HOOKS:PRE_UPDATE",
//   title: "Pre-update actor adapter",
//   guarantees: ["Preserves Foundry's false-to-cancel contract."],
//   depends_on: ["[GAMEASSIST_FOUNDRY_ACTOR_HOOKS:DOMAIN:VALIDATION]"],
//   seams: ["Hooks.on('preUpdateActor')"],
//   risks: ["Runs on multiple clients when authority is not checked."],
//   last_updated_version: "vX.Y.Z",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// This thin adapter converts the native hook inputs into a canonical validation
// request. It deliberately returns Foundry's native boolean rather than a
// GameAssist result envelope. Structured details stay in the owned diagnostic
// service and are shown only to an authorized user.
// -----------------------------------------------------------------------------
function onPreUpdateActor(actor, changes, options, userId) {
  const result = validateActorUpdate({ actor, changes, options, userId });
  if (result.ok) return undefined;

  diagnostics.record(result.error);
  return false;
}
// --- Notes & Comments ---
// Changed (vX.Y.Z): add native cancellation adapter and authority-safe diagnostics.
// [GAMEASSIST_FOUNDRY_ACTOR_HOOKS:HOOKS:PRE_UPDATE] END
// ============================================================================
```

---

## Appendix C. Grouped Sidecar Shape

```text
# Template Sidecar

<!-- --- MECHSUITS BANNER (YAML) ---
mechsuit:
  codename: "GAMEASSIST_FOUNDRY_TEMPLATES"
  project_version: "vX.Y.Z"
  purpose: "Own the contracts for GameAssist Handlebars templates."
  applicability:
    runtime: "foundry_client"
    artifact: "template"
    host_contracts: ["Foundry template rendering"]
  data_class: "Internal"
  ai_data: "none"
  refusals:
    - "Never render unescaped user-controlled markup."
  canonical_tree: |
    [GAMEASSIST_FOUNDRY_TEMPLATES]/
    `-- [GAMEASSIST_FOUNDRY_TEMPLATES:TEMPLATES]
        |-- [GAMEASSIST_FOUNDRY_TEMPLATES:TEMPLATES:APPS]
        `-- [GAMEASSIST_FOUNDRY_TEMPLATES:TEMPLATES:PARTIALS]
--- prose banner ---
This sidecar owns template rendering, accessibility, and escaping contracts.
It refuses to render unescaped user-controlled markup.
-->

<!-- ========================================================================
[GAMEASSIST_FOUNDRY_TEMPLATES:TEMPLATES] BEGIN
Section Title: GameAssist Handlebars templates
-----------------------------------------------------------------------------
mechsuit_section:
  codename: "GAMEASSIST_FOUNDRY_TEMPLATES"
  area: "TEMPLATES"
  title: "Template contracts"
  guarantees:
    - "Covered templates share rendering, localization, and accessibility rules."
  last_updated_version: "vX.Y.Z"
  lifecycle: "active"
-----------------------------------------------------------------------------
Covered artifacts:
- `templates/apps/**/*.hbs`
- `templates/partials/**/*.hbs`

Source of truth: the listed Handlebars files
Validation: template compilation plus rendered UI checks
Ownership: GameAssist presentation layer

[GAMEASSIST_FOUNDRY_TEMPLATES:TEMPLATES:APPS] BEGIN
Section Title: Application templates
...
Notes & Comments:
Changed (vX.Y.Z): establish the application-template contract.
[GAMEASSIST_FOUNDRY_TEMPLATES:TEMPLATES:APPS] END

[GAMEASSIST_FOUNDRY_TEMPLATES:TEMPLATES:PARTIALS] BEGIN
Section Title: Shared partials
...
Notes & Comments:
Changed (vX.Y.Z): establish shared-partial ownership.
[GAMEASSIST_FOUNDRY_TEMPLATES:TEMPLATES:PARTIALS] END

Notes & Comments:
Decision log:
- CHOICE: one bounded sidecar over one sidecar per template.
[GAMEASSIST_FOUNDRY_TEMPLATES:TEMPLATES] END
======================================================================== -->
```

---

## Appendix D. Project Architecture Record

The project-level architecture document SHOULD contain:

```text
Project: GameAssist-Foundry
Package ID: gameassist
Current package version: <from module.json>

Core services
|-- lifecycle
|-- settings
|-- diagnostics
|-- capabilities
`-- module registry

Modules
|-- AlmanacAssist
|-- CombatAssist
|-- ConditionAssist
`-- <additional modules>

Codename registry
| Codename | Current path | Responsibility | Lifecycle | Prior path |
```

The architecture record explains cross-file and cross-module structure. It
does not replace any file's canonical tree.

---

## Appendix E. Profile Selection Summary

| Artifact | Full banner | Framed sections | Sidecar | Native contract |
|---|---:|---:|---:|---:|
| Foundry TypeScript/JavaScript source | Yes | Yes | Optional | Required |
| Node build/test source | Yes | Yes | Optional | Required |
| Focused test source | Yes | Proportional | Optional | Test framework |
| `module.json` / `package.json` | No | No | Yes | JSON schema |
| Localization JSON | No | No | Grouped | Foundry localization |
| Handlebars templates | No | Only if useful | Grouped | Template engine |
| CSS/SCSS | Proportional comments | Only if useful | Grouped | CSS cascade |
| Generated `dist/` | No | No | Build sidecar | Generated output |
| Vendored third-party code | No | No | Vendor sidecar | Upstream contract |
| Public documentation | No | Document structure | No | Reader needs |

`Proportional` never means undocumented. It means the artifact's native format
and grouped sidecar carry the MECHSUITS design intent more effectively than a
server-shaped code banner would.

---

## Final Principle

MECHSUITS is successful when a future maintainer can understand the system,
locate responsibility, replace a complete unit safely, preserve user data,
respect the host runtime, diagnose failures, and know why the code was built
that way. It has failed when its literal form makes correct code harder to
write, hides the runtime's real contract, or creates documentation that is
larger but less truthful.

Preserve the armor. Tailor it to the wearer.

