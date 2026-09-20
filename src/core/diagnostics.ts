// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_DIAGNOSTICS"
//   project_version: "v0.1.0"
//   purpose: "Retain a bounded, privacy-aware local diagnostic history for foundation lifecycle events."
//   order: ["validate", "record", "evict"]
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
//     `-- [GAMEASSIST_DIAGNOSTICS:BUFFER]
// --- prose banner ---
// This provisional buffer stores code-owned lifecycle evidence locally. It
// refuses external telemetry and refuses to store user-authored content.

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
//   lifecycle: "experimental"
// }
// -----------------------------------------------------------------------------
// Narrative
// The later diagnostics service will replace this buffer. The first slice needs
// inspectable startup evidence without pretending that service already exists.
// Events use wall-clock milliseconds because maintainers read them as "when",
// not as durations.
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
      return events.map((event) => ({ ...event }));
    },
    clear() {
      events.length = 0;
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): add a provisional bounded diagnostic buffer for lifecycle
// evidence. Experimental until the diagnostics service design lands.
// Decision log:
//   CHOICE: in-memory ring buffer - ALT: console only; REJECTED: tests need
//   inspectable history without scraping stdout.
// [GAMEASSIST_DIAGNOSTICS:BUFFER] END
// ============================================================================
