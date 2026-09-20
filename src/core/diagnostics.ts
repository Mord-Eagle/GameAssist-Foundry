// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_DIAGNOSTICS"
//   project_version: "v0.1.0"
//   purpose: "Retain bounded local diagnostics and derive package health without external telemetry."
//   order: ["validate", "record", "evict", "assess"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: []
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never send diagnostics to an external service."
//     - "Never record secrets, hidden actor data, or user-authored text."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded in-memory history"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//   policy:
//     notes_ref: "[GAMEASSIST_CONSTANTS:POLICY]"
//   state:
//     persistent: []
//     transient: ["diagnostic ring buffer"]
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_DIAGNOSTICS]/
//     |-- [GAMEASSIST_DIAGNOSTICS:BUFFER]
//     `-- [GAMEASSIST_DIAGNOSTICS:HEALTH]
// --- prose banner ---
// This buffer stores code-owned evidence locally and derives package health
// from current feature and capability status. It refuses external telemetry
// and refuses to store user-authored content.

import { POLICY } from "./constants";

// ============================================================================
// [GAMEASSIST_DIAGNOSTICS:BUFFER] BEGIN
// Section Title: Bounded local diagnostic buffer
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_DIAGNOSTICS",
//   area: "BUFFER",
//   title: "Diagnostic buffer",
//   guarantees: ["Capacity is bounded.", "Recorded events are copies, not caller-owned objects."],
//   provides: ["DiagnosticSink", "DiagnosticBuffer", "createDiagnosticBuffer"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Events use wall-clock milliseconds because maintainers read them as "when",
// not as durations. failures() is the inspectable error subset for Control
// Center and tests; it does not itself decide package health.
// -----------------------------------------------------------------------------

/**
 * Local diagnostic event. Messages must be code-owned, not user-supplied.
 */
export interface DiagnosticEvent {
  level: "info" | "warning" | "error";
  code: string;
  message: string;
  featureId?: string;
  /** Wall-clock milliseconds since Unix epoch. */
  at: number;
}

/**
 * Write-only diagnostic port used by core services.
 */
export interface DiagnosticSink {
  /**
   * Records one local diagnostic event.
   *
   * @param event - Code-owned event. Callers must not pass secrets or
   * user-authored text.
   */
  record(event: Omit<DiagnosticEvent, "at"> & { at?: number }): void;
}

/**
 * Inspectable diagnostic history used by tests and later Control Center views.
 */
export interface DiagnosticBuffer extends DiagnosticSink {
  /** Returns a copy of retained events, oldest first. */
  list(): DiagnosticEvent[];
  /** Returns a copy of error-level events, oldest first. */
  failures(): DiagnosticEvent[];
  /** Drops retained events. Does not emit telemetry. */
  clear(): void;
}

/**
 * Creates a session-scoped ring buffer.
 *
 * @param now - Optional wall-clock seam for tests.
 */
export function createDiagnosticBuffer(
  now: () => number = Date.now
): DiagnosticBuffer {
  const events: DiagnosticEvent[] = [];

  const copies = (filter?: (event: DiagnosticEvent) => boolean): DiagnosticEvent[] =>
    events.filter(filter ?? (() => true)).map((event) => ({ ...event }));

  return {
    record(event) {
      const next: DiagnosticEvent = {
        level: event.level,
        code: event.code,
        message: event.message,
        at: event.at ?? now()
      };
      if (event.featureId !== undefined) {
        next.featureId = event.featureId;
      }
      events.push(next);
      // INVARIANT: capacity never exceeds POLICY.diagnosticCapacity.
      if (events.length > POLICY.diagnosticCapacity) {
        events.shift();
      }
    },
    list() {
      return copies();
    },
    failures() {
      return copies((event) => event.level === "error");
    },
    clear() {
      events.length = 0;
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): add a bounded diagnostic buffer and inspectable failures().
// Decision log:
//   CHOICE: in-memory ring buffer - ALT: console only; REJECTED: tests need
//   inspectable history without scraping stdout.
// [GAMEASSIST_DIAGNOSTICS:BUFFER] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_DIAGNOSTICS:HEALTH] BEGIN
// Section Title: Package health snapshot
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_DIAGNOSTICS",
//   area: "HEALTH",
//   title: "Package health",
//   guarantees: [
//     "Unknown capabilities do not degrade health.",
//     "Historical diagnostic errors do not degrade health after recovery."
//   ],
//   provides: ["PackageHealth", "assessPackageHealth"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Health is derived from the current lifecycle phase, feature statuses, and
// incompatible capability reports. Old error diagnostics remain inspectable
// through failures() without keeping a recovered package degraded.
// -----------------------------------------------------------------------------

/**
 * Package serving status derived from current runtime facts.
 */
export type PackageHealthStatus = "healthy" | "degraded" | "unavailable";

/**
 * Inspectable health snapshot. Ids are code-owned.
 */
export interface PackageHealth {
  status: PackageHealthStatus;
  phase: "idle" | "init" | "ready" | "stopped";
  failedFeatureIds: string[];
  incompatibleCapabilityIds: string[];
  failureCount: number;
  /** Wall-clock milliseconds since Unix epoch. */
  at: number;
}

/**
 * Derives package health from current snapshots.
 *
 * @param input.phase - Lifecycle phase.
 * @param input.features - Current feature statuses.
 * @param input.capabilities - Optional capability reports.
 * @param input.failureCount - Error-level diagnostic count for inspection.
 * @param input.at - Assessment time.
 */
export function assessPackageHealth(input: {
  phase: PackageHealth["phase"];
  features: ReadonlyArray<{ id: string; status: string }>;
  capabilities?: { reports: ReadonlyArray<{ id: string; status: string }> };
  failureCount: number;
  at: number;
}): PackageHealth {
  const failedFeatureIds = input.features
    .filter((feature) => feature.status === "failed")
    .map((feature) => feature.id);
  const incompatibleCapabilityIds = (input.capabilities?.reports ?? [])
    .filter((report) => report.status === "incompatible")
    .map((report) => report.id);
  let status: PackageHealthStatus = "healthy";
  if (input.phase !== "ready") {
    status = "unavailable";
  } else if (failedFeatureIds.length > 0 || incompatibleCapabilityIds.length > 0) {
    status = "degraded";
  }
  return {
    status,
    phase: input.phase,
    failedFeatureIds: [...failedFeatureIds],
    incompatibleCapabilityIds: [...incompatibleCapabilityIds],
    failureCount: input.failureCount,
    at: input.at
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): add package health assessment for Control Center consumers.
// Decision log:
//   CHOICE: unknown capabilities do not degrade - ALT: treat unknown as
//   degraded; REJECTED: Node tests and deferred probes would look unhealthy.
// [GAMEASSIST_DIAGNOSTICS:HEALTH] END
// ============================================================================
