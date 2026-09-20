// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_DIAGNOSTICS_TEST"
//   project_version: "v0.1.0"
//   purpose: "Prove the diagnostic buffer bounds capacity and copies events."
//   order: ["record", "evict", "copy"]
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
//     [GAMEASSIST_DIAGNOSTICS_TEST]/
//     `-- [GAMEASSIST_DIAGNOSTICS_TEST:CASES]
// --- prose banner ---
// Diagnostic buffer tests. They refuse to claim live Foundry verification.

import { describe, expect, it } from "vitest";
import { POLICY } from "../src/core/constants";
import { createDiagnosticBuffer } from "../src/core/diagnostics";

// ============================================================================
// [GAMEASSIST_DIAGNOSTICS_TEST:CASES] BEGIN
// Section Title: Diagnostic buffer cases
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_DIAGNOSTICS_TEST",
//   area: "CASES",
//   title: "Buffer cases",
//   guarantees: ["Capacity eviction and snapshot isolation hold."],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// A fake clock keeps timestamps deterministic.
// -----------------------------------------------------------------------------
describe("diagnostic buffer", () => {
  it("evicts the oldest events once capacity is exceeded", () => {
    let now = 1_000;
    const buffer = createDiagnosticBuffer(() => now);
    for (let index = 0; index < POLICY.diagnosticCapacity + 5; index += 1) {
      now += 1;
      buffer.record({
        level: "info",
        code: "tick",
        message: String(index)
      });
    }
    const events = buffer.list();
    expect(events).toHaveLength(POLICY.diagnosticCapacity);
    expect(events[0]?.message).toBe("5");
  });

  it("returns copies so callers cannot mutate stored history", () => {
    const buffer = createDiagnosticBuffer(() => 42);
    buffer.record({ level: "info", code: "lifecycle.init", message: "init" });
    const first = buffer.list();
    const event = first[0];
    if (event) event.message = "mutated";
    expect(buffer.list()[0]?.message).toBe("init");
  });
});
// --- Notes & Comments ---
// Changed (v0.1.0): add diagnostic buffer contract tests.
// [GAMEASSIST_DIAGNOSTICS_TEST:CASES] END
// ============================================================================
