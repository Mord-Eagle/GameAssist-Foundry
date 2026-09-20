// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_EVENTS_TEST"
//   project_version: "v0.1.0"
//   purpose: "Prove in-process event delivery, idempotency, subscriber isolation, and privacy filtering."
//   order: ["publish", "subscribe", "dedupe", "privacy", "health"]
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
//     [GAMEASSIST_EVENTS_TEST]/
//     `-- [GAMEASSIST_EVENTS_TEST:CASES]
// --- prose banner ---
// Event bus and runtime health tests. They do not boot Foundry.

import { describe, expect, it } from "vitest";
import { evaluateDnd5eCapabilities } from "../src/adapters/dnd5e/capabilities";
import { POLICY } from "../src/core/constants";
import { createDiagnosticBuffer } from "../src/core/diagnostics";
import { EVENT_TYPES, createEventBus } from "../src/core/events";
import { createMemoryHost } from "../src/core/host";
import { createGameAssistRuntime } from "../src/core/package";
import { createDemoBeacon, DEMO_BEACON_ID } from "../src/features/demo-beacon";
import { err } from "../src/core/result";
import type { FeatureDefinition } from "../src/core/registry";

// ============================================================================
// [GAMEASSIST_EVENTS_TEST:CASES] BEGIN
// Section Title: Event bus and health cases
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_EVENTS_TEST",
//   area: "CASES",
//   title: "Event cases",
//   guarantees: ["Delivery, isolation, privacy, and health derivation are covered."],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// The bus is tested without Foundry. Runtime cases prove lifecycle and demo
// beacon publish foundation events.
// -----------------------------------------------------------------------------

describe("event bus", () => {
  it("delivers matching subscribers synchronously and then wildcards", () => {
    const bus = createEventBus({ now: () => 10 });
    const seen: string[] = [];
    bus.subscribe(EVENT_TYPES.lifecycleReady, (event) => {
      seen.push(`ready:${event.id}`);
    });
    bus.subscribe("*", (event) => {
      seen.push(`wild:${event.type}`);
    });
    const published = bus.publish({
      id: "ready-1",
      type: EVENT_TYPES.lifecycleReady,
      payload: { phase: "ready" }
    });
    expect(published.ok).toBe(true);
    expect(seen).toEqual(["ready:ready-1", `wild:${EVENT_TYPES.lifecycleReady}`]);
  });

  it("does not re-deliver a duplicate id of the same type", () => {
    const bus = createEventBus({ now: () => 10 });
    let count = 0;
    bus.subscribe(EVENT_TYPES.featureStarted, () => {
      count += 1;
    });
    const request = {
      id: "feat-1",
      type: EVENT_TYPES.featureStarted,
      payload: { featureId: "demo-beacon" }
    };
    const first = bus.publish(request);
    const second = bus.publish(request);
    expect(first).toEqual(second);
    expect(count).toBe(1);
  });

  it("rejects reuse of an event id with a different type", () => {
    const bus = createEventBus({ now: () => 10 });
    bus.publish({
      id: "shared",
      type: EVENT_TYPES.featureStarted,
      payload: { featureId: "demo-beacon" }
    });
    const result = bus.publish({
      id: "shared",
      type: EVENT_TYPES.featureStopped,
      payload: { featureId: "demo-beacon" }
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("CONFLICT");
  });

  it("rejects unregistered types", () => {
    const bus = createEventBus();
    const result = bus.publish({ type: "gameassist.health.changed" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("INVALID_ARGUMENT");
  });

  it("isolates a throwing subscriber so others still run", () => {
    const diagnostics = createDiagnosticBuffer(() => 1);
    const bus = createEventBus({ diagnostics, now: () => 1 });
    const seen: string[] = [];
    bus.subscribe(EVENT_TYPES.lifecycleReady, () => {
      throw new Error("boom");
    });
    bus.subscribe(EVENT_TYPES.lifecycleReady, () => {
      seen.push("second");
    });
    const published = bus.publish({
      type: EVENT_TYPES.lifecycleReady,
      payload: { phase: "ready" }
    });
    expect(published.ok).toBe(true);
    expect(seen).toEqual(["second"]);
    expect(
      diagnostics.failures().some((event) => event.code === "events.subscriber.failed")
    ).toBe(true);
  });

  it("omits gm-visibility events from the default list", () => {
    const bus = createEventBus({ now: () => 5 });
    const registered = bus.registerType({
      type: "gameassist.test.secret",
      visibility: "gm"
    });
    expect(registered.ok).toBe(true);
    bus.publish({
      id: "secret-1",
      type: "gameassist.test.secret",
      payload: { code: "ok" }
    });
    bus.publish({
      id: "ready-2",
      type: EVENT_TYPES.lifecycleReady,
      payload: { phase: "ready" }
    });
    expect(bus.list().map((event) => event.id)).toEqual(["ready-2"]);
    expect(bus.list({ includePrivileged: true }).map((event) => event.id)).toEqual([
      "secret-1",
      "ready-2"
    ]);
  });

  it("returns copies so callers cannot mutate stored history", () => {
    const bus = createEventBus({ now: () => 3 });
    bus.publish({
      id: "copy-1",
      type: EVENT_TYPES.lifecycleReady,
      payload: { phase: "ready" }
    });
    const listed = bus.list();
    const event = listed[0];
    if (event) event.payload = { phase: "mutated" };
    expect(bus.list()[0]?.payload.phase).toBe("ready");
  });

  it("evicts the oldest events once capacity is exceeded", () => {
    const bus = createEventBus({ now: () => 1 });
    for (let index = 0; index < POLICY.eventHistoryCapacity + 3; index += 1) {
      bus.publish({
        id: `evict-${index}`,
        type: EVENT_TYPES.lifecycleReady,
        payload: { phase: "ready" }
      });
    }
    const listed = bus.list();
    expect(listed).toHaveLength(POLICY.eventHistoryCapacity);
    expect(listed[0]?.id).toBe("evict-3");
  });

  it("unsubscribes so later publishes are ignored", () => {
    const bus = createEventBus({ now: () => 1 });
    let count = 0;
    const stop = bus.subscribe(EVENT_TYPES.lifecycleReady, () => {
      count += 1;
    });
    bus.publish({ type: EVENT_TYPES.lifecycleReady, payload: { phase: "ready" } });
    stop();
    bus.publish({ type: EVENT_TYPES.lifecycleReady, payload: { phase: "ready" } });
    expect(count).toBe(1);
  });
});

describe("runtime events and health", () => {
  it("publishes ready and demo-beacon started once", () => {
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({
      host,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    runtime.bind();
    host.emit("init");
    host.emit("ready");
    host.emit("ready");
    const types = runtime.events.list().map((event) => event.type);
    expect(types.filter((type) => type === EVENT_TYPES.lifecycleReady)).toHaveLength(1);
    expect(types).toContain(EVENT_TYPES.featureStarted);
    const started = runtime.events
      .list()
      .find((event) => event.type === EVENT_TYPES.featureStarted);
    expect(started?.payload.featureId).toBe(DEMO_BEACON_ID);
    expect(runtime.health().status).toBe("healthy");
    expect(runtime.health().phase).toBe("ready");
  });

  it("reports degraded health when a feature fails to start", () => {
    const failing: FeatureDefinition = {
      id: "boom",
      title: "Boom",
      description: "Fails",
      enabledByDefault: true,
      onStart: () => err("INTERNAL")
    };
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({ host, features: [failing] });
    runtime.bind();
    host.emit("init");
    host.emit("ready");
    const health = runtime.health();
    expect(health.status).toBe("degraded");
    expect(health.failedFeatureIds).toEqual(["boom"]);
    expect(
      runtime.events.list().some((event) => event.type === EVENT_TYPES.featureFailed)
    ).toBe(true);
  });

  it("reports unavailable health before ready and after teardown", () => {
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({
      host,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    expect(runtime.health().status).toBe("unavailable");
    runtime.bind();
    host.emit("init");
    expect(runtime.health().status).toBe("unavailable");
    host.emit("ready");
    expect(runtime.health().status).toBe("healthy");
    runtime.unbind();
    expect(runtime.health().status).toBe("unavailable");
    expect(
      runtime.events.list().some((event) => event.type === EVENT_TYPES.lifecycleStopped)
    ).toBe(true);
  });

  it("degrades ready health for an incompatible system without stopping the shell", () => {
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({
      host,
      readEnvironment: () => ({
        foundryGeneration: 14,
        foundryBuild: 367,
        systemId: "pf2e",
        systemVersion: "1.0.0"
      }),
      evaluateSystem: evaluateDnd5eCapabilities,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    runtime.bind();
    host.emit("init");
    host.emit("ready");
    const health = runtime.health();
    expect(health.status).toBe("degraded");
    expect(health.incompatibleCapabilityIds).toContain("system");
    const beacon = runtime.registry.snapshot(DEMO_BEACON_ID);
    expect(beacon.ok && beacon.data.status).toBe("started");
  });

  it("does not treat unknown capabilities as degraded health", () => {
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({
      host,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    runtime.bind();
    host.emit("init");
    host.emit("ready");
    expect(runtime.health().status).toBe("healthy");
    expect(runtime.health().incompatibleCapabilityIds).toEqual([]);
  });
});

describe("event catalog", () => {
  it("does not let a publisher override catalog visibility", () => {
    const bus = createEventBus({ now: () => 1 });
    bus.registerType({ type: "gameassist.test.secret", visibility: "gm" });
    bus.publish({
      id: "hidden",
      type: "gameassist.test.secret",
      payload: { code: "ok" }
    });
    expect(bus.list()).toEqual([]);
    expect(bus.list({ includePrivileged: true })[0]?.visibility).toBe("gm");
  });

  it("rejects invalid event ids", () => {
    const bus = createEventBus();
    const result = bus.publish({
      id: "bad id",
      type: EVENT_TYPES.lifecycleReady,
      payload: { phase: "ready" }
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("INVALID_ARGUMENT");
  });
});
// --- Notes & Comments ---
// Changed (v0.1.0): add event bus, privacy, and health contract tests.
// [GAMEASSIST_EVENTS_TEST:CASES] END
// ============================================================================
