// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_CONTROL_CENTER"
//   project_version: "v0.1.0"
//   purpose: "Own the GM-only Control Center view model: health, features, capabilities, failures, and recovery."
//   order: ["authorize", "compose", "mutate"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: []
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never return a view model to a non-GM."
//     - "Never include Document contents or user-authored text."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded open refusals"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//   authority:
//     model: "active authorized GM for shared world mutations"
//   policy:
//     notes_ref: "[GAMEASSIST_CONTROL_CENTER:POLICY]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_CONTROL_CENTER]/
//     |-- [GAMEASSIST_CONTROL_CENTER:POLICY]
//     `-- [GAMEASSIST_CONTROL_CENTER:SERVICE]
// --- prose banner ---
// This presenter is the only composer of Control Center view data. It refuses
// to leak diagnostics to players and refuses to talk to Foundry Applications.

import type { DiagnosticSink, PackageHealth } from "../core/diagnostics";
import type { GameAssistRuntime } from "../core/package";
import { err, ok, type Result } from "../core/result";

// ============================================================================
// [GAMEASSIST_CONTROL_CENTER:POLICY] BEGIN
// Section Title: Localization key vocabulary
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_CONTROL_CENTER",
//   area: "POLICY",
//   title: "Control Center keys",
//   guarantees: ["View chrome is localization keys, not embedded English."],
//   provides: ["CONTROL_CENTER_KEYS"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Keys stay under GAMEASSIST.ControlCenter so lang/en.json remains the copy
// owner. Recovery keys are chosen from health, not from diagnostic text.
// -----------------------------------------------------------------------------

export const CONTROL_CENTER_KEYS = {
  title: "GAMEASSIST.ControlCenter.Title",
  denied: "GAMEASSIST.ControlCenter.Denied",
  recoveryNone: "GAMEASSIST.ControlCenter.Recovery.None",
  recoveryWaitReady: "GAMEASSIST.ControlCenter.Recovery.WaitReady",
  recoveryReload: "GAMEASSIST.ControlCenter.Recovery.Reload",
  recoveryRetryFeature: "GAMEASSIST.ControlCenter.Recovery.RetryFeature",
  recoveryCheckSystem: "GAMEASSIST.ControlCenter.Recovery.CheckSystem"
} as const;
// --- Notes & Comments ---
// Changed (v0.1.0): lock Control Center localization key ids.
// [GAMEASSIST_CONTROL_CENTER:POLICY] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_CONTROL_CENTER:SERVICE] BEGIN
// Section Title: Control Center presenter
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_CONTROL_CENTER",
//   area: "SERVICE",
//   title: "Control Center presenter",
//   guarantees: [
//     "Non-GM callers receive FORBIDDEN with no view payload.",
//     "Feature toggles reuse runtime.setFeatureEnabled."
//   ],
//   provides: ["ControlCenter", "ControlCenterView", "createControlCenter"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// currentUserId is re-read every call. Role comes from authority, not from the
// window that asked. The view is a snapshot; the adapter re-queries on render.
// -----------------------------------------------------------------------------

export interface ControlCenterFeatureView {
  id: string;
  title: string;
  enabled: boolean;
  status: string;
}

export interface ControlCenterCapabilityView {
  id: string;
  status: string;
  detail: string;
}

export interface ControlCenterFailureView {
  code: string;
  message: string;
  at: number;
  featureId?: string;
}

/**
 * GM-only Control Center snapshot. Strings other than feature titles are keys.
 */
export interface ControlCenterView {
  titleKey: string;
  health: PackageHealth;
  healthStatusKey: string;
  recoveryKey: string;
  features: ControlCenterFeatureView[];
  capabilities: ControlCenterCapabilityView[];
  failures: ControlCenterFailureView[];
}

export interface ControlCenter {
  view(): Result<ControlCenterView>;
  setFeatureEnabled(id: string, enabled: boolean): Result<ControlCenterView>;
}

function recoveryKey(health: PackageHealth): string {
  if (health.phase === "stopped") return CONTROL_CENTER_KEYS.recoveryReload;
  if (health.phase !== "ready") return CONTROL_CENTER_KEYS.recoveryWaitReady;
  if (health.status === "healthy") return CONTROL_CENTER_KEYS.recoveryNone;
  if (health.failedFeatureIds.length > 0) return CONTROL_CENTER_KEYS.recoveryRetryFeature;
  if (health.incompatibleCapabilityIds.length > 0) {
    return CONTROL_CENTER_KEYS.recoveryCheckSystem;
  }
  return CONTROL_CENTER_KEYS.recoveryNone;
}

/**
 * Creates the Foundry-free Control Center presenter.
 *
 * @param options.runtime - Composed GameAssist runtime.
 * @param options.currentUserId - Live user id reader. Must re-read each call.
 * @param options.diagnostics - Optional sink for open refusals.
 */
export function createControlCenter(options: {
  runtime: GameAssistRuntime;
  currentUserId: () => string | undefined;
  diagnostics?: DiagnosticSink;
}): ControlCenter {
  const { runtime } = options;

  const authorize = (): Result<string> => {
    const userId = options.currentUserId();
    if (!userId) return err("UNAUTHORIZED", { reason: "no current user" });
    if (!runtime.authority.canViewPrivilegedDiagnostics(userId)) {
      options.diagnostics?.record({
        level: "warning",
        code: "control-center.denied",
        message: "Control Center refused a non-GM viewer."
      });
      return err("FORBIDDEN", { reason: "not a GM" });
    }
    return ok(userId);
  };

  const snapshot = (): ControlCenterView => {
    const health = runtime.health();
    const capabilities = runtime.capabilities.snapshot();
    return {
      titleKey: CONTROL_CENTER_KEYS.title,
      health,
      healthStatusKey: `GAMEASSIST.ControlCenter.Health.${health.status}`,
      recoveryKey: recoveryKey(health),
      features: runtime.registry.snapshots().map((feature) => ({
        id: feature.id,
        title: feature.title,
        enabled: feature.enabled,
        status: feature.status
      })),
      capabilities: capabilities.reports.map((report) => ({
        id: report.id,
        status: report.status,
        detail: report.detail
      })),
      failures: runtime.diagnostics.failures().map((event) => ({
        code: event.code,
        message: event.message,
        at: event.at,
        ...(event.featureId ? { featureId: event.featureId } : {})
      }))
    };
  };

  return {
    view() {
      const allowed = authorize();
      if (!allowed.ok) return allowed;
      return ok(snapshot());
    },
    setFeatureEnabled(id, enabled) {
      const allowed = authorize();
      if (!allowed.ok) return allowed;
      const updated = runtime.setFeatureEnabled(id, enabled);
      if (!updated.ok) return updated;
      return ok(snapshot());
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): add the GM-only Control Center presenter.
// Decision log:
//   CHOICE: no view payload on FORBIDDEN - ALT: empty shell; REJECTED: still a
//   leak surface for capability and feature lists.
// [GAMEASSIST_CONTROL_CENTER:SERVICE] END
// ============================================================================
