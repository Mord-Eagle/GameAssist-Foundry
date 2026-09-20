// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_AUTHORITY_TEST"
//   project_version: "v0.1.0"
//   purpose: "Prove GM selection, player refusals, idempotency, and stale-request rejection."
//   order: ["authorize", "dedupe", "stale", "settings-gate"]
//   applicability:
//     runtime: "node_tooling"
//     artifact: "test"
//     host_contracts: ["Vitest"]
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never treat these checks as live Foundry evidence."
//   observability:
//     mode: "none"
//     logs: "none"
//     metrics: []
//     spans: []
//   canonical_tree: |
//     [GAMEASSIST_AUTHORITY_TEST]/
//     `-- [GAMEASSIST_AUTHORITY_TEST:CASES]
// --- prose banner ---
// Authority contract tests with a memory user directory. They do not boot Foundry.

import { describe, expect, it } from "vitest";
import {
  createAuthorityService,
  createMemoryUserDirectory
} from "../src/core/authority";
import { POLICY } from "../src/core/constants";
import { createMemoryHost } from "../src/core/host";
import { createGameAssistRuntime } from "../src/core/package";
import { createDemoBeacon, DEMO_BEACON_ID } from "../src/features/demo-beacon";

// ============================================================================
// [GAMEASSIST_AUTHORITY_TEST:CASES] BEGIN
// Section Title: Authority cases
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_AUTHORITY_TEST",
//   area: "CASES",
//   title: "Authority cases",
//   guarantees: ["GM selection, idempotency, stale reject, and player setting denial are covered."],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Users are injected. Role claims in the request are impossible because the
// request type has no isGM field.
// -----------------------------------------------------------------------------

const gm = { id: "gm-1", isGM: true, active: true };
const gm2 = { id: "gm-2", isGM: true, active: true };
const player = { id: "player-1", isGM: false, active: true };

describe("authority service", () => {
  it("selects the requesting active GM as executor", () => {
    const directory = createMemoryUserDirectory({
      currentUserId: gm2.id,
      users: [gm, gm2, player]
    });
    const authority = createAuthorityService({ directory, now: () => 10_000 });
    const result = authority.authorize({
      operationId: "op-gm",
      type: "demo.action",
      requestedBy: gm2.id,
      createdAt: 10_000
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.executorId).toBe(gm2.id);
  });

  it("assigns an active GM when a player requests privileged work", () => {
    const directory = createMemoryUserDirectory({
      currentUserId: player.id,
      users: [gm, player]
    });
    const authority = createAuthorityService({ directory, now: () => 10_000 });
    const result = authority.authorize({
      operationId: "op-player",
      type: "demo.action",
      requestedBy: player.id,
      createdAt: 10_000
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.executorId).toBe(gm.id);
  });

  it("returns UNAVAILABLE when no active GM exists", () => {
    const directory = createMemoryUserDirectory({
      currentUserId: player.id,
      users: [{ ...gm, active: false }, player]
    });
    const authority = createAuthorityService({ directory, now: () => 10_000 });
    const result = authority.authorize({
      operationId: "op-nogm",
      type: "demo.action",
      requestedBy: player.id,
      createdAt: 10_000
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("UNAVAILABLE");
  });

  it("is idempotent for the same operation id and type", () => {
    const directory = createMemoryUserDirectory({ users: [gm, player] });
    const authority = createAuthorityService({ directory, now: () => 10_000 });
    const request = {
      operationId: "op-dup",
      type: "demo.action",
      requestedBy: player.id,
      createdAt: 10_000
    };
    const first = authority.authorize(request);
    directory.setUsers([player]);
    const second = authority.authorize(request);
    expect(first).toEqual(second);
    expect(first.ok).toBe(true);
  });

  it("rejects reuse of an operation id with a different type", () => {
    const directory = createMemoryUserDirectory({ users: [gm] });
    const authority = createAuthorityService({ directory, now: () => 10_000 });
    authority.authorize({
      operationId: "op-conflict",
      type: "demo.action",
      requestedBy: gm.id,
      createdAt: 10_000
    });
    const result = authority.authorize({
      operationId: "op-conflict",
      type: "other.action",
      requestedBy: gm.id,
      createdAt: 10_000
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("CONFLICT");
  });

  it("rejects stale requests", () => {
    const directory = createMemoryUserDirectory({ users: [gm] });
    const now = 100_000;
    const authority = createAuthorityService({ directory, now: () => now });
    const result = authority.authorize({
      operationId: "op-stale",
      type: "demo.action",
      requestedBy: gm.id,
      createdAt: now - POLICY.staleRequestMs - 1
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("UNPROCESSABLE");
  });

  it("does not treat a disconnected GM as an executor after a directory update", () => {
    const directory = createMemoryUserDirectory({ users: [gm] });
    const authority = createAuthorityService({ directory, now: () => 10_000 });
    directory.setUsers([{ ...gm, isGM: false, active: true }]);
    const result = authority.authorize({
      operationId: "op-role-change",
      type: "demo.action",
      requestedBy: gm.id,
      createdAt: 10_000
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("UNAVAILABLE");
  });
});

describe("world setting gate", () => {
  it("forbids a player from changing feature enablement", () => {
    const host = createMemoryHost();
    const directory = createMemoryUserDirectory({
      currentUserId: player.id,
      users: [gm, player]
    });
    const runtime = createGameAssistRuntime({
      host,
      userDirectory: directory,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    runtime.bind();
    host.emit("init");
    const result = runtime.setFeatureEnabled(DEMO_BEACON_ID, false);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("FORBIDDEN");
    const beacon = runtime.registry.snapshot(DEMO_BEACON_ID);
    expect(beacon.ok && beacon.data.enabled).toBe(true);
  });

  it("allows an active GM to change feature enablement", () => {
    const host = createMemoryHost();
    const directory = createMemoryUserDirectory({
      currentUserId: gm.id,
      users: [gm, player]
    });
    const runtime = createGameAssistRuntime({
      host,
      userDirectory: directory,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    runtime.bind();
    host.emit("init");
    const result = runtime.setFeatureEnabled(DEMO_BEACON_ID, false);
    expect(result.ok).toBe(true);
    const beacon = runtime.registry.snapshot(DEMO_BEACON_ID);
    expect(beacon.ok && beacon.data.enabled).toBe(false);
  });
});
// --- Notes & Comments ---
// Changed (v0.1.0): add authority and world-setting gate tests.
// [GAMEASSIST_AUTHORITY_TEST:CASES] END
// ============================================================================
