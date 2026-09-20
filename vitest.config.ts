// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_VITEST_CONFIG"
//   project_version: "v0.1.0"
//   purpose: "Configure Node unit tests for GameAssist core services without booting Foundry."
//   order: ["include", "environment"]
//   applicability:
//     runtime: "node_tooling"
//     artifact: "source"
//     host_contracts: ["Vitest"]
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never treat passing unit tests as live Foundry evidence."
//   observability:
//     mode: "none"
//     logs: "none"
//     metrics: []
//     spans: []
//   compatibility:
//     node: { minimum: "20" }
//   policy:
//     notes_ref: "[GAMEASSIST_VITEST_CONFIG:POLICY]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_VITEST_CONFIG]/
//     |-- [GAMEASSIST_VITEST_CONFIG:POLICY]
//     `-- [GAMEASSIST_VITEST_CONFIG:CONFIG]
// --- prose banner ---
// This file tells Vitest to run tests/ as Node contract checks. It refuses to
// present those checks as proof of live Foundry behavior.

import { defineConfig } from "vitest/config";

// ============================================================================
// [GAMEASSIST_VITEST_CONFIG:POLICY] BEGIN
// Section Title: Test-runner tunables
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_VITEST_CONFIG",
//   area: "POLICY",
//   title: "Test-runner tunables",
//   guarantees: ["Unit tests stay inside tests/ and the Node environment."],
//   provides: ["TEST_POLICY"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Keep the first harness small. Browser and Foundry environments are deferred
// until an acceptance world exists.
// -----------------------------------------------------------------------------
const TEST_POLICY = {
  include: ["tests/**/*.test.ts"],
  environment: "node"
} as const;
// --- Notes & Comments ---
// Changed (v0.1.0): establish the Node-only Vitest policy for foundation tests.
// [GAMEASSIST_VITEST_CONFIG:POLICY] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_VITEST_CONFIG:CONFIG] BEGIN
// Section Title: Vitest configuration export
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_VITEST_CONFIG",
//   area: "CONFIG",
//   title: "Vitest configuration",
//   guarantees: ["Exports a Vitest config that honors TEST_POLICY."],
//   depends_on: ["[GAMEASSIST_VITEST_CONFIG:POLICY]"],
//   seams: ["vitest.config.ts default export"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Vitest reads this default export. No Foundry globals are installed.
// -----------------------------------------------------------------------------
export default defineConfig({
  test: {
    include: [...TEST_POLICY.include],
    environment: TEST_POLICY.environment
  }
});
// --- Notes & Comments ---
// Changed (v0.1.0): add the foundation Vitest config.
// Decision log:
//   CHOICE: Node environment - ALT: happy-dom or jsdom; REJECTED: no DOM
//   behavior exists in the first core services.
// [GAMEASSIST_VITEST_CONFIG:CONFIG] END
// ============================================================================
