# GameAssist Component Design Record

Use this template for every proposed core service, domain service, feature
module, adapter, UI subsystem, or optional integration before production
implementation.

Delete instructional prompts only after their decisions have been captured.
Unknowns remain explicit rather than being silently filled with assumptions.

## Record Identity

- **Component:**
- **Type:** Core service / Domain service / Feature module / Adapter / UI /
  Optional integration
- **Status:** Proposed / Discussing / Approved / Implementing / Verifying /
  Completed / Deferred / Retired
- **Owner decision date:**
- **Planned project version:**
- **Related roadmap phase:**
- **Decision record path:**

## Table Problem

Who needs this component, what happens at the table today, and what practical
problem should improve?

## Purpose and Intent

State the durable product purpose independently of the old implementation.

## Non-Goals

Name behavior this component will not own. Include tempting adjacent features
that would blur responsibility or create unnecessary scope.

## Roll20 Lessons

### Preserve

Which user needs, safeguards, workflows, or design lessons remain valuable?

### Reconsider

Which behaviors existed because of Roll20 limitations, legacy dependencies,
chat-command UX, incomplete data, or prior implementation compromises?

### Retire

Which behaviors should not return?

## Native Foundry and dnd5e Capabilities

List the supported native Documents, Hooks, applications, settings, system
actions, rolls, effects, or UI that already address the problem.

## Ecosystem Review

| Package | Overlap | Benefit | Cost or risk | Decision |
| --- | --- | --- | --- | --- |
| | | | | Evaluate / Integrate / Coexist / Conflict / No action |

Record exact versions when evidence becomes version-specific.

## User Workflows

### Beginner GM

Describe the shortest common path and what the GM sees.

### Player

Describe player access, confirmations, privacy, and failure messages.

### Power User

Describe deeper settings, bulk actions, APIs, or diagnostics without crowding
the primary workflow.

## State and Ownership

| Data or mutation | Reads | Writes | Authority | Persistence | Cleanup owner |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

Separate observed facts from inferred causes. Name the owner for every mutation.

## Permissions and Privacy

- Who may view the feature?
- Who may request each action?
- Which client performs privileged work?
- What information must remain GM-only?
- How are hidden Actors, tokens, rolls, targets, and settings protected?

## Dependencies and Interoperability

### Required

List only dependencies without which the component has no meaningful primary
behavior.

### Optional

For each optional dependency, state the extra behavior and the clean fallback.

### Prohibited or Conflicting

Identify competing writers, unsafe combinations, or private APIs that must not
be used.

## Capability Contract

Define how supported, unavailable, unknown, and incompatible capabilities are
detected and communicated.

## Lifecycle and Recovery

Address initialization, enable/disable, teardown, reload, world restart,
duplicate registration, stale requests, disconnected clients, failed writes,
partial transactions, and repair.

## UX Structure

List the primary entry point, common actions, settings, help, status, recovery,
and advanced views. Keep ordinary interaction compact.

## Diagnostics

Define useful local evidence, privacy limits, expected error language, and the
next step offered after failure. Avoid external telemetry unless separately
approved.

## Migration and Compatibility

Describe saved-state schema, versioning, migration, legacy import decisions,
and exact Foundry/`dnd5e` assumptions.

## Acceptance Criteria

### Success Paths

- [ ]

### Failure and Recovery

- [ ] Invalid input
- [ ] Missing capability or optional dependency
- [ ] Permission denial
- [ ] Stale or duplicated request
- [ ] Partial failure or failed write
- [ ] Disable, re-enable, reload, and restart

### Privacy and Multi-Client

- [ ] GM-only data remains private
- [ ] Player notices reach only appropriate users
- [ ] Privileged mutations execute once
- [ ] Responsible-GM changes do not duplicate or lose work

### Verification Layers

- [ ] Static and type checks
- [ ] Automated unit or contract checks
- [ ] Integration harness checks
- [ ] Live Foundry smoke checks
- [ ] Full acceptance checks where required

## Approved Decisions

Record owner-approved behavior and architecture here. Do not mix it with
assistant narration or unresolved speculation.

## Deferred Decisions

Keep plausible later work visible with the condition that should bring it back
into scope.

## Rejected Alternatives

Record material alternatives and why they were declined so the same debate
does not recur without new evidence.

## Open Questions

Ask only questions whose answers can materially change implementation.

## Change Notes

Add dated notes when the approved design changes. Preserve prior reasoning or
link to a superseding decision rather than silently rewriting history.

