// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_RESULT_TEST"
//   project_version: "v0.1.0"
//   purpose: "Prove the GameAssist result envelope discriminates success from failure."
//   order: ["construct", "assert"]
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
//     [GAMEASSIST_RESULT_TEST]/
//     `-- [GAMEASSIST_RESULT_TEST:CASES]
// --- prose banner ---
// Contract tests for ok/err helpers. They refuse to claim Foundry verification.

import { describe, expect, it } from "vitest";
import { err, ok } from "../src/core/result";

// ============================================================================
// [GAMEASSIST_RESULT_TEST:CASES] BEGIN
// Section Title: Result envelope cases
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_RESULT_TEST",
//   area: "CASES",
//   title: "Result cases",
//   guarantees: ["ok and err remain a discriminated union."],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// These tests lock the envelope shape used by lifecycle and registry.
// -----------------------------------------------------------------------------
describe("result envelope", () => {
  it("marks success with ok true and data", () => {
    expect(ok({ id: "demo-beacon" })).toEqual({
      ok: true,
      data: { id: "demo-beacon" }
    });
  });

  it("omits data on failure when none is provided", () => {
    expect(err("NOT_FOUND")).toEqual({ ok: false, error: "NOT_FOUND" });
  });
});
// --- Notes & Comments ---
// Changed (v0.1.0): add result envelope contract tests.
// [GAMEASSIST_RESULT_TEST:CASES] END
// ============================================================================
