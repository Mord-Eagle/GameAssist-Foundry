# MECHSUITS v1.6.0

**Mord Eagle Coding Hierarchy, Structure, Using Incrementally Tailored Sections**

Copyright (c) 2026 Mord Eagle. All rights reserved.

MECHSUITS is a proprietary specification owned by Mord Eagle. It is not
licensed under any open-source license that may apply to a surrounding
repository. Contributors may read and apply this specification when working
on a project expressly authorized by Mord Eagle. No permission is granted to
copy, adapt, redistribute, or adopt MECHSUITS for another project without
permission. Permission requests are welcome.

MECHSUITS exists to make code safe to understand, change, test, and maintain.
It does that through visible structure, explicit contracts, teaching
commentary, stable identifiers, disciplined boundaries, and durable decision
history. Structural truth and preservation are its primary doctrine. Runtime
adaptation exists only to express that doctrine without breaking the software
being governed.

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
5. **Practical fitness:** Runtime-specific rules adapt implementation details
   without weakening the universal structure, documentation, preservation, or
   change-safety requirements.

The governing questions are:

- Why is this rule here?
- What design risk does it control?
- What intent must survive if the literal form cannot apply?
- What is the narrowest adaptation that preserves that intent?
- How do we prove that an adaptation is not becoming an unreviewed escape?

Structural rules are applied first. Applicability profiles then determine how
runtime-dependent rules are expressed. Convenience alone is not a reason to
bypass a rule. Literal use of a runtime example that breaks the host contract
is not compliance, but neither is invoking runtime adaptability to escape the
MECHSUITS structure.

### 1.1 Universal structural constitution

The following requirements are protected and cannot be waived by a runtime
profile or ordinary variance:

- Owner-authoritative identifiers and stable codenames.
- A truthful file banner and file-touch `project_version`.
- An exact file-scoped canonical tree.
- Paired, physically nested BEGIN and END frames.
- Section metadata, narrative, and Notes & Comments footers.
- Doc comments and purposeful inline notes where Section 7 requires them.
- Meaningful-change tracking and preservation of accurate prior history.
- Whole-section delivery when a human must place supplied code.
- Sidecar equivalents for artifacts that cannot carry the structure directly.
- A final structural audit before any compliance claim.

The only alternate expression of a protected rule is the one explicitly
defined by this standard, such as a sidecar for non-commentable JSON. An
alternate expression preserves the requirement; it does not exempt the
artifact from it.

### 1.2 What v1.6.0 changes

Version 1.6.0 preserves the v1.5.x hierarchy and documentation guarantees while
adding:

- Runtime and artifact applicability profiles.
- Native-contract precedence for host hooks and callbacks.
- Controlled variances with compensating controls.
- A collision-safe codename derivation algorithm.
- File-touch project-version semantics for multi-file repositories.
- Capability-scaled observability instead of server-only assumptions.
- Grouped sidecars for related non-commentable artifacts.
- A profile system for host- and runtime-specific rule sets.
- A project-level architecture registry that complements file-scoped trees.
- Clear separation between hand-authored source and generated distribution
  output.
- Stronger doc-comment, inline-note, footer, changelog, and roadmap governance.

---

## 2. Applicability After Structural Classification

Every artifact MUST receive the universal structural treatment that its native
format permits. It is then classified so runtime-dependent rules can be
expressed correctly. Classification never determines whether MECHSUITS
structure matters; it determines where that structure lives and how behavioral
contracts are implemented.

### 2.1 Runtime profiles

Use one primary runtime profile and any necessary secondary profile. Common
universal profiles include:

- `browser_client`: Framework-independent browser code.
- `node_tooling`: Build, test, packaging, migration, or release tooling run by
  Node.js outside the shipped client runtime.
- `node_service`: A long-running Node.js service with server transports.
- `library`: Reusable code whose caller owns lifecycle and presentation.
- `cli`: A command-line interface.
- `worker`: A worker or background execution context.
- `static_only`: Data with no executable runtime.

Host-specific profiles such as `foundry_client`, `ios_app`, `embedded_device`,
or `barcode_scanner` belong in separately approved profile documents. Their
absence from this list does not make MECHSUITS inapplicable.

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
//     runtime: "browser_client"
//     artifact: "source"
//     host_contracts: ["DOM Events", "Web Components"]
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

A profile MAY strengthen MECHSUITS for its runtime. It MUST NOT weaken any item
in Section 1.1. New profiles require explicit Mord Eagle approval and become an
additive part of the unified standard rather than informal local custom.

---

## 3. Controlled Variances and Non-Abusable Escape

MECHSUITS permits a variance only when the literal rule is not applicable or
would materially harm correctness, host compatibility, security,
maintainability, or generated-source integrity.

Variances apply only to runtime-dependent implementation rules. They cannot
waive Section 1.1. Where a format cannot carry the protected structure, the
required sidecar or other standard-defined equivalent is mandatory.

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
//       reason: "The host before-update callback uses false to cancel an update."
//       preserved_intent: "Stable, documented failure behavior at the edge."
//       compensating_control: "Validate before returning and test false cancellation."
//       scope: "[ATLAS_RECORD_EVENTS:EVENTS:BEFORE_UPDATE]"
//       review: "Revisit if the host changes the callback contract."
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

Atlas/src/core/index.ts
  -> ATLAS_CORE_INDEX

Atlas/src/features/search/index.ts
  -> ATLAS_SEARCH_INDEX

Atlas/src/features/search/settings.ts
  -> ATLAS_SEARCH_SETTINGS
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
  defined in Section 15.

This deliberately allows a maintainer to see that a file last changed in
`v0.2.6` while the package is currently `v0.7.9`.

### 5.2 Required banner fields

```ts
// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "ATLAS_SEARCH_SERVICE"
//   project_version: "vX.Y.Z"
//   purpose: "One paragraph naming the guarantee and non-goals."
//   order: ["validate", "authorize", "apply", "observe"]
//   applicability:
//     runtime: "browser_client"
//     artifact: "source"
//     host_contracts: ["DOM Events"]
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never overwrite user-authored records without confirmation."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded and redacted"
//     metrics: []
//     spans: []
//   compatibility:
//     browsers: { minimum: "project support matrix", verified: "current CI" }
//   policy:
//     notes_ref: "[ATLAS_SEARCH_SERVICE:POLICY]"
//   variances: []
//   canonical_tree: |
//     [ATLAS_SEARCH_SERVICE]/
//     |-- [ATLAS_SEARCH_SERVICE:POLICY]
//     `-- [ATLAS_SEARCH_SERVICE:EVENTS]
//         `-- [ATLAS_SEARCH_SERVICE:EVENTS:READY]
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
//     model: "authenticated owner for persistent mutations"
//     stale_operation_policy: "reject"
//   performance:
//     hot_paths: ["input event"]
//     budgets: ["no full-dataset scan on each keystroke"]
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
//   codename: "ATLAS_SEARCH_SERVICE",
//   area: "LIFECYCLE:READY",
//   title: "Ready lifecycle binding",
//   guarantees: ["Registers the search runtime exactly once."],
//   depends_on: ["[ATLAS_SEARCH_SERVICE:POLICY]"],
//   provides: ["registerSearchRuntime"],
//   seams: ["host.onReady"],
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

Comments teach what cannot be safely inferred from syntax and preserve why the
code has its present shape. MECHSUITS uses a documentation stack; no one layer
is expected to carry every kind of knowledge.

### 7.1 Documentation stack

1. **File banner:** File purpose, order, runtime, compatibility, refusals, and
   file-touch provenance.
2. **Canonical tree and frames:** Physical ownership and navigable hierarchy.
3. **Section metadata and narrative:** Section-level contracts, composition,
   dependencies, seams, risks, and invariants.
4. **Doc comments:** Symbol-level contracts for functions, classes, interfaces,
   hooks, services, and state operations.
5. **Inline notes:** Local reasons, invariants, hazards, and branch-specific
   knowledge placed beside the relevant code.
6. **Notes & Comments footer:** Durable change history, choices, trade-offs,
   rollback information, future seams, and prior notes.
7. **Project records:** Architecture, changelog, roadmap, ADRs, and public
   documentation at their proper scope.

These layers work in concert. A thorough footer does not excuse a missing
function contract. A JSDoc block does not excuse an inaccurate section
narrative. Project documentation does not replace local reasoning beside the
code it governs.

### 7.2 Doc comments and docstrings

Use the host language's standard documentation form: JSDoc or TSDoc for
JavaScript and TypeScript, docstrings for Python, documentation comments for
Swift, XML documentation for C#, or the closest established equivalent.

Doc comments are REQUIRED for:

- Exported or public functions, classes, services, and extension APIs.
- Host hooks, callbacks, delegates, event handlers, and lifecycle entry points.
- Validators, normalizers, parsers, serializers, and migration functions.
- State writers, transactions, destructive operations, and ownership changes.
- Permission, authority, privacy, or security decisions.
- Timers, retries, queues, sockets, asynchronous workflows, and idempotent
  operations.
- Business rules and algorithms whose purpose or invariants are not obvious.
- Compatibility adapters and uses of private or unstable host behavior.

Doc comments are recommended for substantial internal helpers. They MAY be
omitted for a trivial private helper when its name, types, implementation, and
surrounding section make its complete contract genuinely obvious.

An applicable doc comment explains:

- Purpose and context.
- Parameters and accepted forms without mechanically repeating static types.
- Return value and any native host return contract.
- Thrown errors, failure results, cancellation, or refusal behavior.
- Side effects and state ownership.
- Permissions, authority, and privacy effects.
- Lifecycle and ordering requirements.
- Idempotency, retry, or stale-operation behavior where applicable.
- Important invariants and edge cases.
- The design reason when the symbol's existence or shape is not self-evident.
- A concise example when correct use would otherwise be easy to misunderstand.

Example:

```ts
/**
 * Applies a validated record request through the authoritative data owner.
 *
 * The request must already contain canonical record identifiers. This
 * operation revalidates permissions and record existence immediately before
 * writing because menu submissions can become stale while awaiting a user.
 *
 * @param request - Canonical record update prepared by the UI adapter.
 * @returns A stable operation result; retries with the same operation ID are
 * idempotent.
 * @throws Never for an expected permission or stale-record refusal; those
 * are returned as structured failures.
 *
 * Side effects: may update host-owned records and project-owned metadata.
 * Authority: only the owning user or designated executor may write.
 */
async function applyRecord(request: RecordRequest): Promise<RecordResult> {
  // Implementation belongs inside the owning framed section.
}
```

Do not produce ceremonial docblocks that merely restate a function name or
copy every type into prose. Documentation must add understanding.

### 7.3 Inline notes

Use inline notes generously where they preserve non-obvious reasoning, while
avoiding narration of routine syntax. Useful prefixes include:

- `CHOICE:` Why this implementation was selected.
- `ALT:` A materially plausible alternative.
- `REJECTED:` Why the alternative was not selected.
- `DANGER:` A hazardous or surprising operation and its containment.
- `WHY:` A short explanation for a non-obvious line.
- `INVARIANT:` A condition that surrounding logic depends upon.
- `OWNERSHIP:` Which layer or actor may mutate the value.
- `COMPAT:` A host, platform, or version-specific reason.
- `PRIVACY:` Why information is withheld, redacted, or scoped.
- `ORDER:` Why this operation must precede or follow another.
- `EXEMPT:` A local policy exception that meets Section 3.

Place the note as close as practical to the line or branch it explains. A
future maintainer should not have to search a distant document to understand a
surprising local decision.

Comments are expected around non-obvious branches, compatibility workarounds,
state-repair logic, stale-operation checks, permissions, rollback paths,
cross-module seams, and intentionally absent behavior.

When a design decision has real, consequential alternatives, document up to
three useful patterns or options and recommend one. Do not manufacture three
choices as ritual or busywork. When only one approach fits the host contract,
state that approach directly.

### 7.4 Behavior-change recording rule

When a new section is introduced or behavior changes, the change MUST be
recorded in the same edit:

- The section footer records the durable historical change.
- A required doc comment is created or updated for every affected contract or
  behavior-bearing symbol.
- An inline note is added or updated where the reason, invariant, risk, or
  compatibility constraint would not otherwise be apparent locally.
- Project changelog, roadmap, architecture, and public documentation are
  updated when their respective scope is affected.

Minor mechanical edits do not require new explanation at every line. They do
require a Maintenance footer entry when the framed section itself is edited.

An inaccurate comment is a defect. Update or supersede it in the same change
that invalidates it.

### 7.5 Footer depth

Footers SHOULD be plentiful enough to reconstruct the important evolution of a
section. They record:

- What changed and why.
- User-visible or dependent-contract effects.
- Alternatives considered and rejected.
- Trade-offs and known limitations.
- Migration, rollback, and repair information.
- Compatibility assumptions.
- Future seams that were intentionally left open.
- Accurate prior notes retained from earlier revisions.

Do not collapse years of useful history into `updated code`. Do not preserve
false notes merely because they are old; mark them superseded and explain the
replacement.

### 7.6 Preserve useful history

Do not delete accurate prior notes merely because an implementation changed.
Move durable context into the footer. Remove or correct commentary that became
false, while recording why it was superseded.

Open work markers such as `TODO`, `FIXME`, or `DANGER` MUST identify the reason,
owner or issue when known, and the condition for removal. They cannot serve as
a substitute for an issue, footer note, or documented limitation.

Public README material describes user-visible behavior. Internal decision
history remains in source comments, architecture records, ADRs, and developer
documentation.

### 7.7 Changelog and roadmap governance

A multi-file project SHOULD maintain both records unless the owner explicitly
declares them inapplicable:

- `CHANGELOG.md` is an append-only historical ledger. New releases add entries;
  published history is not silently rewritten. Material factual corrections
  are added as dated correction notes. Every entry MUST carry an unambiguous
  ISO `YYYY-MM-DD` date; published release headings MUST include their release
  date, while each item under `Unreleased` carries its own change date. Entries
  describe actual changes and distinguish implementation, verification,
  testing, experimentation, and known limitations when relevant.
- `ROADMAP.md` is a living planning document. It MAY be reorganized as
  priorities change, but material changes of direction retain enough rationale
  to explain what changed. It keeps at least the three most recent completed
  release milestones or moves older milestones to a maintained roadmap-history
  record.

Neither document contains internal conversation, assistant narration, or
speculative claims presented as completed work. The changelog protects what
happened; the roadmap explains what may happen next and preserves recent
planning context.

---

## 8. Processing Order as a Runtime Contract

The banner MUST declare the order that matters for its runtime. Implement and
test that order where an ordering failure could change behavior.

### 8.1 Profile examples

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

- Public project APIs.
- Service-to-service boundaries owned by the project.
- Socket requests and responses.
- Migration and transaction outcomes.
- Complex operations presented to UI controllers.
- Diagnostic operations where correlation materially helps.

### 9.2 Where native contracts prevail

Do not wrap values when the host requires a specific return contract. Examples
include host lifecycle callbacks, render handlers, event listeners,
comparators, and framework predicates.

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
- Host settings for configurable shared or personal behavior.
- A module policy object for internal defaults and bounds.
- User-editable content documents only when users are intended to own that
  content.

Every setting declares:

- Scope: project, installation, account, user, session, record, device, or the
  profile-specific equivalent.
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
- `local_diagnostics`: Redacted console output, bounded local history, or a
  restricted diagnostic UI.
- `structured_local`: Structured logs and counters retained locally.
- `host_integrated`: Uses an existing host diagnostic facility.
- `external_telemetry`: Sends data outside the host and therefore requires
  explicit owner design, user disclosure, consent, redaction, and retention
  policy.

An approved runtime profile or project policy selects the default mode.
External telemetry is forbidden unless Mord Eagle explicitly authorizes it
and the user-facing privacy design is completed.

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
- Secrets and restricted data are never logged to unauthorized surfaces.
- High-frequency paths avoid unbounded logging.
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

The active runtime profile MUST name any host simulation-time source and keep
it distinct from wall-clock and monotonic time. Never infer fictional or
simulated time from elapsed real time unless the feature explicitly promises
that link.

Timers document:

- Ownership and cancellation.
- Restart and reload behavior.
- Stale callback protection.
- Multi-client, multi-process, or device authority where applicable.
- Pause behavior.
- Whether state is persistent or session-only.

Machine timestamps use an unambiguous UTC representation. Human-facing dates
use the campaign or user display policy. Randomized behavior that affects
persistent state SHOULD expose a testable random seam.

---

## 13. Ports, Adapters, and Platform Boundaries

Keep domain rules independent when doing so removes real platform coupling.
Adapters translate host-platform, storage, transport, UI, device, or plugin
contracts into canonical project shapes.

Useful boundaries may include:

- Host-owned records or documents.
- Database, filesystem, or device access.
- Settings and persisted preferences.
- Network or inter-process authority.
- Application and dialog presentation.
- Hardware sensors, scanners, cameras, or peripherals.
- Simulation-time, calendar, or scheduling providers.

Do not wrap every host object merely to satisfy a pattern. Add an adapter when
it protects the domain from unstable/private APIs, supports more than one
host, enables focused tests, or centralizes permission and mutation safety.

Canonical domain code MUST NOT bypass a host's supported mutation mechanisms.
Use the owning adapter or supported host operation.

Capability detection is preferred over assumptions. Missing optional
capabilities disable only the affected feature and produce a useful next step.

---

## 14. Runtime Profile Contract

The universal standard governs structure, identity, documentation, history,
and safe modification. A separately approved runtime profile adds the native
behavioral rules needed by a host, framework, platform, language, or artifact
family.

### 14.1 Additive relationship

A runtime profile MUST:

- Cite the MECHSUITS core version it extends.
- Define its scope and how an artifact declares applicability.
- Preserve every protected requirement in Section 1.1.
- Identify native lifecycle, callback, mutation, authority, privacy, timing,
  and disposal contracts.
- Define any profile-specific banner capability blocks and sidecars.
- Provide profile-specific examples without pretending they are universal.
- Supply an additional compliance checklist.

A profile MAY strengthen a universal requirement or select among choices the
core deliberately leaves open. It MUST NOT rename identifiers, loosen trees or
frames, erase history, reduce documentation duties, or turn a protected rule
into a variance.

### 14.2 Precedence

When an approved profile and a generic behavioral example differ, the profile
governs that runtime. When a profile appears to conflict with Section 1.1, the
universal structural constitution governs and the profile must be corrected.

### 14.3 Profile registry

Projects MUST list their active profiles and versions in `ARCHITECTURE.md` or
another owner-designated architecture record. An artifact using no specialized
profile remains subject to the universal runtime and artifact classification.

The Foundry VTT rules for GameAssist-Foundry are maintained in
`MECHSUITS Profile - Foundry VTT v1.0.0.md`. Future profiles for mobile apps,
web services, embedded systems, scanners, or other environments follow the
same additive model.

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
- Never reveal restricted information to unauthorized users.
- Never send campaign data to an external service without explicit design and
  consent.
- Never trust client-provided authority.
- Never silently overwrite user-authored data.

Only include refusals that the owner has adopted for the project or section.

### 17.2 New sinks

Every new log, socket payload, external request, exported file, error detail,
or rendered diagnostic is evaluated for permissions, privacy, retention, and
redaction. Record the decision in the nearest owning section.

### 17.3 Host privacy boundaries

- Private records, hidden state, unpublished content, and restricted notes stay
  private.
- Notifications go only to authorized recipients.
- Client-side possession or visibility does not imply authorization.
- User-controlled markup and text are sanitized or escaped.
- Diagnostic exports state what they contain before creation.

---

## 18. Compliance Checklist

An artifact is MECHSUITS v1.6.0 compliant only when all applicable items pass.
Structural truth is checked first because runtime fitness cannot compensate for
a false tree, unstable identity, missing history, or undocumented behavior.

### Structural constitution

- Existing identifiers are preserved literally.
- The codename is owner-provided or collision-safely derived.
- The project codename registry is current.
- The file-scoped canonical tree matches exact tags, order, and nesting.
- BEGIN and END frames are complete, paired, and physically nested.
- Section metadata, narrative, doc comments, purposeful inline notes, and
  Notes & Comments footers satisfy Sections 6 and 7.
- Existing decision history remains available unless intentionally superseded.
- Human-delivered changes use whole-section replacement where required.
- No profile or variance weakens a protected Section 1.1 requirement.

### Identity and applicability

- The runtime and artifact profiles are declared.
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
- Public/exported and behaviorally significant symbols have accurate doc
  comments or the language-equivalent documentation form.
- Non-obvious choices, invariants, compatibility constraints, and hazards have
  nearby inline notes.

### Runtime fitness

- Native host signatures and return contracts are preserved.
- Processing and lifecycle order are declared and implemented.
- Inputs are validated and normalized at owned boundaries.
- Domain code does not depend on unstable platform details without an adapter
  or documented reason.
- Policy and user settings have clear ownership and scope.
- Time sources, timers, and authority are explicit where applicable.
- Missing optional capabilities fail narrowly.

### Profile compliance

- Every active profile is listed in the project architecture record.
- The artifact passes the active profile's additional checklist.
- Native host contracts are documented without displacing protected structure.
- Profile-specific security, privacy, authority, and compatibility rules pass.

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
- The changelog preserves published history and records affected notable work.
- The roadmap reflects current direction and retains recent completed
  milestones or links to their historical record.
- The final diff contains no accidental deletions or unrelated cleanup.

Partial compliance is non-compliance when a full compliance claim is made.
An honest statement such as `MECHSUITS structure added; full audit pending` is
permitted when verification is incomplete.

---

## 19. Assistant Operating Instructions

Before editing:

1. Inspect repository, branch, status, surrounding code, architecture records,
   codenames, current project version, and relevant documentation.
2. Audit the universal structural constitution: identity, tree, frames,
   documentation, history, and delivery boundaries.
3. Classify runtime and artifact profiles.
4. Read the complete banner and affected section frames.
5. Identify native host contracts and directly affected dependencies.
6. Decide whether any runtime variance is genuinely required.

While editing:

1. Change the smallest relevant section and directly affected contracts.
2. Preserve identifiers, behavior, comments, and public surfaces unless change
   is intentional.
3. Update the edited file's `project_version`.
4. Apply meaningful or maintenance section-version rules accurately.
5. Keep the canonical tree synchronized when tags change.
6. Preserve native runtime compatibility over resemblance to an example.
7. Add or update doc comments for affected public or behaviorally significant
   symbols.
8. Add comments that teach purpose, decisions, risks, and invariants rather
   than narrating syntax.
9. Record every new section or behavioral change in the appropriate section
   footer and project record.
10. Keep public documentation free of internal implementation narration.

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

## Appendix B. Native Callback Adapter Example

```ts
// ============================================================================
// [ATLAS_RECORD_EVENTS:EVENTS:BEFORE_UPDATE] BEGIN
// Section Title: Validate records before the host applies an update
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "ATLAS_RECORD_EVENTS",
//   area: "EVENTS:BEFORE_UPDATE",
//   title: "Pre-update record adapter",
//   guarantees: ["Preserves the host's false-to-cancel contract."],
//   depends_on: ["[ATLAS_RECORD_EVENTS:DOMAIN:VALIDATION]"],
//   seams: ["host.onBeforeUpdate"],
//   risks: ["May run more than once when the host retries an update."],
//   last_updated_version: "vX.Y.Z",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// This thin adapter converts native callback inputs into a canonical validation
// request. It deliberately returns the host's native boolean rather than a
// project result envelope. Structured details stay in the owned diagnostic
// service and are shown only to an authorized user.
// -----------------------------------------------------------------------------
/**
 * Validates one host-owned record update without changing the callback's
 * required return contract.
 *
 * @param {HostRecord} record Record the host intends to update.
 * @param {Record<string, unknown>} changes Proposed field changes.
 * @param {HostUpdateContext} context Permission and retry context.
 * @returns {false|undefined} False cancels the update; undefined permits it.
 * @sideEffects Records a bounded diagnostic for an authorized maintainer.
 */
function onBeforeUpdate(record, changes, context) {
  const result = validateRecordUpdate({ record, changes, context });
  if (result.ok) return undefined;

  diagnostics.record(result.error);
  return false;
}
// --- Notes & Comments ---
// Changed (vX.Y.Z): add native cancellation adapter and restricted diagnostics.
// [ATLAS_RECORD_EVENTS:EVENTS:BEFORE_UPDATE] END
// ============================================================================
```

---

## Appendix C. Grouped Sidecar Shape

```text
# Presentation Sidecar

<!-- --- MECHSUITS BANNER (YAML) ---
mechsuit:
  codename: "ATLAS_TEMPLATES"
  project_version: "vX.Y.Z"
  purpose: "Own the contracts for project presentation templates."
  applicability:
    runtime: "browser_client"
    artifact: "template"
    host_contracts: ["project template rendering"]
  data_class: "Internal"
  ai_data: "none"
  refusals:
    - "Never render unescaped user-controlled markup."
  canonical_tree: |
    [ATLAS_TEMPLATES]/
    `-- [ATLAS_TEMPLATES:TEMPLATES]
        |-- [ATLAS_TEMPLATES:TEMPLATES:VIEWS]
        `-- [ATLAS_TEMPLATES:TEMPLATES:PARTIALS]
--- prose banner ---
This sidecar owns template rendering, accessibility, and escaping contracts.
It refuses to render unescaped user-controlled markup.
-->

<!-- ========================================================================
[ATLAS_TEMPLATES:TEMPLATES] BEGIN
Section Title: Project presentation templates
-----------------------------------------------------------------------------
mechsuit_section:
  codename: "ATLAS_TEMPLATES"
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
Ownership: project presentation layer

[ATLAS_TEMPLATES:TEMPLATES:VIEWS] BEGIN
Section Title: View templates
...
Notes & Comments:
Changed (vX.Y.Z): establish the application-template contract.
[ATLAS_TEMPLATES:TEMPLATES:VIEWS] END

[ATLAS_TEMPLATES:TEMPLATES:PARTIALS] BEGIN
Section Title: Shared partials
...
Notes & Comments:
Changed (vX.Y.Z): establish shared-partial ownership.
[ATLAS_TEMPLATES:TEMPLATES:PARTIALS] END

Notes & Comments:
Decision log:
- CHOICE: one bounded sidecar over one sidecar per template.
[ATLAS_TEMPLATES:TEMPLATES] END
======================================================================== -->
```

---

## Appendix D. Project Architecture Record

The project-level architecture document SHOULD contain:

```text
Project: Atlas
Package ID: atlas
Current package version: <from the authoritative manifest>

Core services
|-- lifecycle
|-- settings
|-- diagnostics
|-- capabilities
`-- module registry

Features
|-- Search
|-- Import
|-- Reports
`-- <additional features>

Codename registry
| Codename | Current path | Responsibility | Lifecycle | Prior path |
```

The architecture record explains cross-file and cross-module structure. It
does not replace any file's canonical tree.

---

## Appendix E. Profile Selection Summary

| Artifact | Full banner | Framed sections | Sidecar | Native contract |
|---|---:|---:|---:|---:|
| TypeScript/JavaScript source | Yes | Yes | Optional | Host/framework |
| Node build/test source | Yes | Yes | Optional | Required |
| Focused test source | Yes | Proportional | Optional | Test framework |
| JSON manifest / package metadata | No | No | Yes | Applicable schema |
| Localization data | No | No | Grouped | Localization system |
| Presentation templates | No | Only if useful | Grouped | Template engine |
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

