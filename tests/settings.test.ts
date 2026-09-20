// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_SETTINGS_TEST"
//   project_version: "v0.1.0"
//   purpose: "Prove settings registration, 0-to-1 migration, enablement persistence, and preservation of unknown keys."
//   order: ["register", "migrate", "hydrate", "persist", "restart"]
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
//     [GAMEASSIST_SETTINGS_TEST]/
//     `-- [GAMEASSIST_SETTINGS_TEST:CASES]
// --- prose banner ---
// Settings contract tests using memory storage. They do not boot Foundry.

import { describe, expect, it } from "vitest";
import { createMemoryHost } from "../src/core/host";
import { createGameAssistRuntime } from "../src/core/package";
import {
  createMemorySettingsStorage,
  createSettingsService,
  SETTING_KEYS,
  SETTINGS_SCHEMA_VERSION
} from "../src/core/settings";
import { createDemoBeacon, DEMO_BEACON_ID } from "../src/features/demo-beacon";
import { createFeatureRegistry } from "../src/core/registry";

// ============================================================================
// [GAMEASSIST_SETTINGS_TEST:CASES] BEGIN
// Section Title: Settings and migration cases
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_SETTINGS_TEST",
//   area: "CASES",
//   title: "Settings cases",
//   guarantees: ["Migration, preservation, hydration, and restart are covered."],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Shared memory storage is the stand-in for a Foundry world settings store.
// -----------------------------------------------------------------------------

describe("settings service", () => {
  it("registers then migrates schema 0 to 1", () => {
    const storage = createMemorySettingsStorage();
    const settings = createSettingsService({ storage });
    expect(settings.register().ok).toBe(true);
    const migrated = settings.migrate();
    expect(migrated.ok).toBe(true);
    if (migrated.ok) {
      expect(migrated.data.from).toBe(0);
      expect(migrated.data.to).toBe(SETTINGS_SCHEMA_VERSION);
    }
    expect(storage.get(SETTING_KEYS.schemaVersion)).toEqual({
      ok: true,
      data: SETTINGS_SCHEMA_VERSION
    });
    expect(storage.get(SETTING_KEYS.featureEnablement)).toEqual({
      ok: true,
      data: {}
    });
  });

  it("does not write enabledByDefault for untouched features", () => {
    const storage = createMemorySettingsStorage();
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({
      host,
      storage,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    runtime.bind();
    host.emit("init");
    host.emit("ready");
    expect(storage.get(SETTING_KEYS.featureEnablement)).toEqual({
      ok: true,
      data: {}
    });
    const beacon = runtime.registry.snapshot(DEMO_BEACON_ID);
    expect(beacon.ok && beacon.data.enabled).toBe(true);
    expect(beacon.ok && beacon.data.status).toBe("started");
  });

  it("preserves unknown feature ids when persisting one toggle", () => {
    const storage = createMemorySettingsStorage({
      [SETTING_KEYS.schemaVersion]: 1,
      [SETTING_KEYS.featureEnablement]: { "retired-module": false }
    });
    const settings = createSettingsService({ storage });
    settings.register();
    settings.migrate();
    expect(settings.persistFeatureEnablement(DEMO_BEACON_ID, false).ok).toBe(true);
    expect(storage.get(SETTING_KEYS.featureEnablement)).toEqual({
      ok: true,
      data: { "retired-module": false, [DEMO_BEACON_ID]: false }
    });
  });

  it("skips non-boolean stored values without overwriting them", () => {
    const storage = createMemorySettingsStorage({
      [SETTING_KEYS.schemaVersion]: 1,
      [SETTING_KEYS.featureEnablement]: { [DEMO_BEACON_ID]: "nope" }
    });
    const registry = createFeatureRegistry();
    registry.register(createDemoBeacon({ record() {} }));
    const settings = createSettingsService({ storage });
    settings.register();
    settings.applyFeatureEnablement(registry);
    const applied = registry.snapshot(DEMO_BEACON_ID);
    expect(applied.ok && applied.data.enabled).toBe(true);
    expect(storage.get(SETTING_KEYS.featureEnablement)).toEqual({
      ok: true,
      data: { [DEMO_BEACON_ID]: "nope" }
    });
  });

  it("refuses to overwrite a malformed enablement map", () => {
    const storage = createMemorySettingsStorage({
      [SETTING_KEYS.schemaVersion]: 1,
      [SETTING_KEYS.featureEnablement]: "bad"
    });
    const settings = createSettingsService({ storage });
    settings.register();
    const persisted = settings.persistFeatureEnablement(DEMO_BEACON_ID, false);
    expect(persisted.ok).toBe(false);
    if (!persisted.ok) expect(persisted.error).toBe("UNPROCESSABLE");
    expect(storage.get(SETTING_KEYS.featureEnablement)).toEqual({
      ok: true,
      data: "bad"
    });
  });

  it("does not downgrade a newer schema version", () => {
    const storage = createMemorySettingsStorage({
      [SETTING_KEYS.schemaVersion]: 99,
      [SETTING_KEYS.featureEnablement]: { [DEMO_BEACON_ID]: false }
    });
    const settings = createSettingsService({ storage });
    settings.register();
    const migrated = settings.migrate();
    expect(migrated.ok && migrated.data.to).toBe(99);
    expect(storage.get(SETTING_KEYS.schemaVersion)).toEqual({ ok: true, data: 99 });
  });
});

describe("settings hydration across restart", () => {
  it("restores a disabled demo beacon on a new runtime with the same storage", () => {
    const storage = createMemorySettingsStorage();
    const host = createMemoryHost();
    const first = createGameAssistRuntime({
      host,
      storage,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    first.bind();
    host.emit("init");
    host.emit("ready");
    expect(first.setFeatureEnabled(DEMO_BEACON_ID, false).ok).toBe(true);
    const disabled = first.registry.snapshot(DEMO_BEACON_ID);
    expect(disabled.ok && disabled.data.status).toBe("stopped");
    first.unbind();

    const secondHost = createMemoryHost();
    const second = createGameAssistRuntime({
      host: secondHost,
      storage,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    second.bind();
    secondHost.emit("init");
    secondHost.emit("ready");
    const beacon = second.registry.snapshot(DEMO_BEACON_ID);
    expect(beacon.ok && beacon.data.enabled).toBe(false);
    expect(beacon.ok && beacon.data.status).toBe("registered");
  });

  it("duplicate init does not clobber saved enablement", () => {
    const storage = createMemorySettingsStorage();
    const host = createMemoryHost();
    const runtime = createGameAssistRuntime({
      host,
      storage,
      features: (diagnostics) => [createDemoBeacon(diagnostics)]
    });
    runtime.bind();
    host.emit("init");
    runtime.setFeatureEnabled(DEMO_BEACON_ID, false);
    host.emit("init");
    expect(storage.get(SETTING_KEYS.featureEnablement)).toEqual({
      ok: true,
      data: { [DEMO_BEACON_ID]: false }
    });
    const beacon = runtime.registry.snapshot(DEMO_BEACON_ID);
    expect(beacon.ok && beacon.data.enabled).toBe(false);
  });
});
// --- Notes & Comments ---
// Changed (v0.1.0): add settings migration and restart-preservation tests.
// [GAMEASSIST_SETTINGS_TEST:CASES] END
// ============================================================================
