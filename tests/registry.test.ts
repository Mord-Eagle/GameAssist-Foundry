// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_REGISTRY_TEST"
//   project_version: "v0.1.0"
//   purpose: "Prove feature registration, isolation, enablement, and idempotent stop."
//   order: ["register", "start", "fail", "stop"]
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
//     [GAMEASSIST_REGISTRY_TEST]/
//     `-- [GAMEASSIST_REGISTRY_TEST:CASES]
// --- prose banner ---
// Registry contract tests. They refuse to claim live Foundry verification.

import { describe, expect, it } from "vitest";
import { createDiagnosticBuffer } from "../src/core/diagnostics";
import {
  createFeatureRegistry,
  type FeatureDefinition
} from "../src/core/registry";
import { err, ok } from "../src/core/result";

// ============================================================================
// [GAMEASSIST_REGISTRY_TEST:CASES] BEGIN
// Section Title: Feature registry cases
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_REGISTRY_TEST",
//   area: "CASES",
//   title: "Registry cases",
//   guarantees: ["Invalid ids, duplicates, isolation, and disablement are covered."],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Helpers build features with optional start/stop behavior so cases stay small.
// -----------------------------------------------------------------------------

function feature(
  id: string,
  overrides: Partial<FeatureDefinition> = {}
): FeatureDefinition {
  return {
    id,
    title: id,
    description: id,
    enabledByDefault: true,
    ...overrides
  };
}

describe("feature registry", () => {
  it("rejects an invalid feature id", () => {
    const registry = createFeatureRegistry();
    const result = registry.register(feature("Nope"));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("INVALID_ARGUMENT");
  });

  it("rejects a duplicate feature id", () => {
    const registry = createFeatureRegistry();
    expect(registry.register(feature("alpha")).ok).toBe(true);
    const duplicate = registry.register(feature("alpha"));
    expect(duplicate.ok).toBe(false);
    if (!duplicate.ok) expect(duplicate.error).toBe("CONFLICT");
  });

  it("does not start a disabled feature", () => {
    const registry = createFeatureRegistry();
    registry.register(feature("quiet", { enabledByDefault: false }));
    registry.invokeRegister();
    registry.startEnabled();
    const snapshot = registry.snapshot("quiet");
    expect(snapshot.ok).toBe(true);
    if (snapshot.ok) {
      expect(snapshot.data.enabled).toBe(false);
      expect(snapshot.data.status).toBe("registered");
    }
  });

  it("continues starting other features when one start fails", () => {
    const diagnostics = createDiagnosticBuffer();
    const registry = createFeatureRegistry(diagnostics);
    registry.register(
      feature("boom", {
        onStart: () => err("INTERNAL", { message: "boom" })
      })
    );
    registry.register(
      feature("steady", {
        onStart: () => ok(undefined)
      })
    );
    registry.invokeRegister();
    registry.startEnabled();
    const boom = registry.snapshot("boom");
    const steady = registry.snapshot("steady");
    expect(boom.ok && boom.data.status).toBe("failed");
    expect(steady.ok && steady.data.status).toBe("started");
    expect(diagnostics.list().some((event) => event.code === "feature.start.failed")).toBe(
      true
    );
  });

  it("does not call onStop after a failed start", () => {
    let stopped = 0;
    const registry = createFeatureRegistry();
    registry.register(
      feature("boom", {
        onStart: () => err("INTERNAL"),
        onStop: () => {
          stopped += 1;
          return ok(undefined);
        }
      })
    );
    registry.invokeRegister();
    registry.startEnabled();
    registry.stopAll();
    expect(stopped).toBe(0);
    const snapshot = registry.snapshot("boom");
    expect(snapshot.ok && snapshot.data.status).toBe("failed");
  });

  it("captures thrown start callbacks as INTERNAL and keeps siblings healthy", () => {
    const registry = createFeatureRegistry();
    registry.register(
      feature("throws", {
        onStart: () => {
          throw new Error("nope");
        }
      })
    );
    registry.register(feature("ok-feature"));
    registry.startEnabled();
    const thrown = registry.snapshot("throws");
    const healthy = registry.snapshot("ok-feature");
    expect(thrown.ok && thrown.data.status).toBe("failed");
    expect(healthy.ok && healthy.data.status).toBe("started");
  });

  it("stopAll is safe to call twice", () => {
    const registry = createFeatureRegistry();
    registry.register(feature("steady"));
    registry.startEnabled();
    expect(registry.stopAll().ok).toBe(true);
    expect(registry.stopAll().ok).toBe(true);
    const snapshot = registry.snapshot("steady");
    expect(snapshot.ok && snapshot.data.status).toBe("stopped");
  });
});
// --- Notes & Comments ---
// Changed (v0.1.0): add feature registry contract tests.
// [GAMEASSIST_REGISTRY_TEST:CASES] END
// ============================================================================
