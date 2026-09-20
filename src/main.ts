// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_MAIN"
//   project_version: "v0.1.0"
//   purpose: "Foundry package entrypoint that binds GameAssist lifecycle to host Hooks and registers the demonstration feature."
//   order: ["detect-host", "compose", "bind"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: ["Foundry Hooks"]
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never assign a public game.gameAssist API."
//     - "Never throw during module evaluation if Foundry Hooks are missing."
//     - "Never put feature business rules in this file."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded host-unavailable and bind messages"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//     systems: ["dnd5e"]
//   lifecycle:
//     registers: ["init", "ready"]
//     disposes: ["hook subscriptions"]
//   policy:
//     notes_ref: "[GAMEASSIST_MAIN:ENTRY]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_MAIN]/
//     `-- [GAMEASSIST_MAIN:ENTRY]
// --- prose banner ---
// Foundry loads this module through module.json esmodules. The file detects
// Hooks, composes the runtime, and binds init/ready. It refuses a public
// game.gameAssist API and refuses to throw when imported outside Foundry.

import { evaluateDnd5eCapabilities } from "./adapters/dnd5e/capabilities";
import { readFoundryEnvironment } from "./adapters/foundry/environment";
import { createFoundrySettingsStorage } from "./adapters/foundry/settings-storage";
import { createFoundryHost } from "./core/host";
import { createGameAssistRuntime } from "./core/package";
import { createDemoBeacon } from "./features/demo-beacon";

// ============================================================================
// [GAMEASSIST_MAIN:ENTRY] BEGIN
// Section Title: Foundry entry binding
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_MAIN",
//   area: "ENTRY",
//   title: "Foundry entry",
//   guarantees: ["Module evaluation is safe in Node tests.", "Foundry loads bind init and ready."],
//   seams: ["module.json esmodules", "Hooks.on"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// The entrypoint is intentionally small. Feature rules live in feature
// factories. Host absence is reported through console diagnostics when a
// console exists, then the module stays inert.
// -----------------------------------------------------------------------------

/**
 * Binds GameAssist to Foundry when Hooks are available.
 *
 * @returns True when host handlers were bound.
 *
 * Side effects: subscribes to Foundry init and ready when present.
 */
export function activateGameAssist(): boolean {
  const host = createFoundryHost();
  if (!host) {
    // WHY: unit tests and Node tooling may import compiled graphs. Throwing
    // here would turn a missing host into a hard load failure.
    const consoleLike = (globalThis as { console?: { info: (message: string) => void } }).console;
    consoleLike?.info(
      "[gameassist] info lifecycle.host.unavailable: Foundry Hooks are not available; GameAssist stayed inert."
    );
    return false;
  }

  const runtime = createGameAssistRuntime({
    host,
    storage: createFoundrySettingsStorage(),
    readEnvironment: readFoundryEnvironment,
    evaluateSystem: evaluateDnd5eCapabilities,
    features: (diagnostics) => [createDemoBeacon(diagnostics)]
  });
  runtime.bind();
  return true;
}

activateGameAssist();
// --- Notes & Comments ---
// Changed (v0.1.0): add the Foundry package entrypoint for the lifecycle shell.
// Decision log:
//   CHOICE: auto-activate on evaluation - ALT: wait for an explicit call;
//   REJECTED: Foundry esmodules are evaluation-driven and have no other boot
//   hook owned by GameAssist.
// [GAMEASSIST_MAIN:ENTRY] END
// ============================================================================
