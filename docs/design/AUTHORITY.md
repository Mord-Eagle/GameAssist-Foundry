# GameAssist Component Design Record

## Record Identity

- **Component:** Authority and privileged-action service
- **Type:** Core service
- **Status:** Implementing
- **Owner decision date:** 2026-09-20
- **Planned project version:** 0.1.0
- **Related roadmap phase:** Phase 1 item 4
- **Decision record path:** `docs/design/AUTHORITY.md`

## Table Problem

Players can see some Foundry objects that they must not be allowed to change.
Later GameAssist features will apply conditions, HP, and combat mutations.
Without one authority owner, each feature will invent its own GM check, trust
socket payloads, or run the same privileged write on every connected client.

## Purpose and Intent

Decide who may request an action, which active GM may execute privileged work,
how requests are correlated and deduplicated, and how stale or failed requests
are reported. Client visibility is not mutation authority. Foundry sockets, when
added, carry requests; they do not replace these rules.

## Non-Goals

- Enabling `module.json` `socket` in this slice (no consumer yet).
- Implementing condition, HP, or combat mutations.
- Replacing Foundry's own permission checks on Documents.
- A public authority API on `game.gameAssist`.
- Trusting a payload field that claims the sender is a GM.

## Roll20 Lessons

### Preserve

- Privileged writes run once, on an authoritative GM client.
- Players can request; they do not execute world mutations.
- Failed or duplicate requests must not apply twice.

### Reconsider

- Chat-command GM detection as the authority signal.

### Retire

- Believing the requesting client about its own role.

## Native Foundry and dnd5e Capabilities

- `game.user`, `game.userId`, `game.users`, `user.isGM`, `user.active`
- Foundry Document permission levels (used later by domain services)
- Foundry module sockets (`module.gameassist`) — deferred until a feature
  needs cross-client requests

`dnd5e` is not required for authority itself.

## Ecosystem Review

| Package | Overlap | Benefit | Cost or risk | Decision |
| --- | --- | --- | --- | --- |
| Foundry users and isGM | Role and activity | Native GM signal | Must recheck, never cache | Coexist |
| socketlib | Socket helper | None until sockets exist | Extra dependency | No action |

## User Workflows

### Beginner GM

No new UI. World setting changes remain GM work. When a later feature asks the
table to apply a privileged action, the active GM client executes it.

### Player

A player may submit a request (later UI). They receive a refusal if they try to
execute a world mutation. Refusal text does not include other users' private
data.

### Power User

Retryable operations supply a stable `operationId`. Duplicates return the first
decision.

## State and Ownership

| Data or mutation | Reads | Writes | Authority | Persistence | Cleanup owner |
| --- | --- | --- | --- | --- | --- |
| User id, isGM, active | User directory adapter | None | Foundry | Host | n/a |
| Request ledger | Authority service | Authority service | Local runtime | Session only | Bounded eviction |
| World settings toggle | Settings service | Settings service after GM check | GM | World setting | Settings |

## Permissions and Privacy

- Who may view the feature? Authority decisions are not shown to players as a
  debug dump.
- Who may request each action? Any identified user may *request*. Only an
  active GM may be selected as executor.
- Which client performs privileged work? The selected responsible GM.
- What information must remain GM-only? Request payloads are not copied into
  diagnostics. Player-facing failures name the refusal, not other users.
- How are hidden Actors protected? This service does not read Documents.

## Dependencies and Interoperability

### Required

- A `UserDirectory` port for current user and the user list.

### Optional

- Sockets. Local authorize still works. Missing sockets disable only
  cross-client request transport.

### Prohibited or Conflicting

- Trusting `requestedBy` as proof of GM.
- Executing a privileged write on every client that hears a Hook.
- Logging request payloads.

## Capability Contract

- **supported:** Directory returned at least one user record.
- **unavailable:** No active GM to execute privileged work.
- **unknown:** No current user id (Node tests without a directory identity).
- **incompatible:** Not used; authority is host-user based, not system based.

## Lifecycle and Recovery

1. Directory is read on every authorize and world-mutation check. No cached
   isGM.
2. Missing current user: world-mutation checks are skipped so identity-less
   tests still run; authorize requires `requestedBy`.
3. No active GM: `UNAVAILABLE`. The package shell still loads.
4. Duplicate `operationId` with the same type returns the stored decision.
5. Duplicate `operationId` with a different type is `CONFLICT`.
6. `createdAt` older than `staleRequestMs` is `UNPROCESSABLE`.
7. Future `createdAt` beyond a small skew is `INVALID_ARGUMENT`.
8. Teardown does not persist the ledger.

## UX Structure

No Control Center widget. Later request UIs will show the structured refusal.

## Diagnostics

- `authority.denied`
- `authority.stale`
- `authority.duplicate`
- `authority.no-gm`
- Messages include operation type and error code, never payload contents.

## Migration and Compatibility

- No persisted schema.
- Socket protocol is not defined in this slice.
- Foundry `user.isGM` is the GM signal, including Assistant GMs.

## Acceptance Criteria

### Success Paths

- [x] Active requesting GM is selected as executor.
- [x] Player request is authorized for an active GM executor.
- [x] Duplicate operation id is idempotent.
- [x] World setting toggle is forbidden for a player identity.

### Failure and Recovery

- [x] Invalid operation id or type is rejected.
- [x] No active GM returns UNAVAILABLE.
- [x] Stale createdAt is rejected.
- [x] Duplicate id with different type is CONFLICT.
- [x] Client-supplied GM claim is ignored; directory isGM wins.

### Privacy and Multi-Client

- [x] Diagnostics omit payloads.
- [x] Player notices are not emitted.
- [x] Privileged decision is recorded once per operation id.
- [x] Responsible GM is re-read from the directory each call.

### Verification Layers

- [x] Static and type checks
- [x] Automated unit or contract checks
- [ ] Integration harness checks
- [ ] Live Foundry smoke checks
- [ ] Full acceptance checks where required

## Approved Decisions

- Sockets stay disabled in `module.json` until a feature needs them.
- `requestedBy` is a correlation id, not a role claim.
- Responsible GM: requesting user if they are an active GM, otherwise a
  stable first active GM by id sort.
- World setting writes go through a GM check when a current user is known.
- Stale policy is reject.

## Deferred Decisions

- Socket payload schema and `module.gameassist` event name.
- Assistant GM vs full GM distinctions beyond Foundry `isGM`.
- Per-Document permission checks (domain services).
- Responsible-GM handoff while an in-flight mutation is running.

## Rejected Alternatives

- Enabling sockets now for completeness — no consumer, extra surface.
- First-come Hook execution on every client — duplicate world writes.
- Caching isGM at bind time — stale after role or connection changes.

## Open Questions

- Should Assistant GMs be excluded from some GameAssist mutations later, or
  is Foundry `isGM` always enough?

## Change Notes

- 2026-09-20 - Opened the authority record and began the first implementation
  of Phase 1 item 4.
