// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_HOST"
//   project_version: "v0.1.0"
//   purpose: "Adapt Foundry lifecycle Hooks into a testable host port without putting phase policy in the adapter."
//   order: ["detect", "subscribe", "diagnose", "unsubscribe"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: ["Foundry Hooks"]
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never assume Foundry awaits Hook callbacks."
//     - "Never send diagnostics to an external service."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded console mirroring of code-owned messages"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//   lifecycle:
//     registers: ["init", "ready"]
//     disposes: ["hook subscriptions"]
//   policy:
//     notes_ref: "[GAMEASSIST_HOST:POLICY]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_HOST]/
//     |-- [GAMEASSIST_HOST:POLICY]
//     |-- [GAMEASSIST_HOST:DOMAIN]
//     `-- [GAMEASSIST_HOST:ADAPTERS]
//         |-- [GAMEASSIST_HOST:ADAPTERS:MEMORY]
//         `-- [GAMEASSIST_HOST:ADAPTERS:FOUNDRY]
// --- prose banner ---
// This file owns the host port and two adapters: an in-memory fake for tests
// and a thin Foundry Hooks adapter. It refuses to put enablement policy in the
// adapter and refuses to assume Foundry awaits callbacks.

import type { DiagnosticEvent } from "./diagnostics";

// ============================================================================
// [GAMEASSIST_HOST:POLICY] BEGIN
// Section Title: Host-adapter policy
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_HOST",
//   area: "POLICY",
//   title: "Host-adapter policy",
//   guarantees: ["Only init and ready are subscribed in this slice."],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// setup is deferred until a feature needs cross-package registration that is
// unsafe at init and unnecessary at ready.
// -----------------------------------------------------------------------------
export type HostHook = "init" | "ready";
// --- Notes & Comments ---
// Changed (v0.1.0): limit the first host adapter to init and ready.
// [GAMEASSIST_HOST:POLICY] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_HOST:DOMAIN] BEGIN
// Section Title: Package host port
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_HOST",
//   area: "DOMAIN",
//   title: "Package host port",
//   guarantees: ["Core services can subscribe, unsubscribe, and diagnose without importing Foundry."],
//   provides: ["PackageHost"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// The port is synchronous because Foundry Hooks are synchronous notifications.
// Returning a promise from a handler is allowed by JavaScript but is not a
// GameAssist contract: Foundry will not wait.
// -----------------------------------------------------------------------------

/**
 * Host capabilities required by the lifecycle coordinator.
 */
export interface PackageHost {
  /**
   * Subscribes to a lifecycle hook.
   *
   * @returns Unsubscribe function. Safe to call more than once.
   */
  on(hook: HostHook, handler: () => void): () => void;
  /**
   * Mirrors a code-owned diagnostic to the host-local sink.
   *
   * PRIVACY: event.message must already be free of user-authored text.
   */
  diagnose(event: DiagnosticEvent): void;
}

interface FoundryHooks {
  on(event: string, fn: (...args: unknown[]) => unknown): number;
  off(event: string, fn: (...args: unknown[]) => unknown): void;
}
// --- Notes & Comments ---
// Changed (v0.1.0): define the PackageHost port used by tests and Foundry.
// [GAMEASSIST_HOST:DOMAIN] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_HOST:ADAPTERS] BEGIN
// Section Title: Host adapters
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_HOST",
//   area: "ADAPTERS",
//   title: "Host adapters",
//   guarantees: ["Memory and Foundry adapters satisfy PackageHost."],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Children implement the port. The Foundry adapter detects Hooks at bind time
// rather than at module evaluation so tests can import this file in Node.
// -----------------------------------------------------------------------------

// ============================================================================
// [GAMEASSIST_HOST:ADAPTERS:MEMORY] BEGIN
// Section Title: In-memory host for tests
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_HOST",
//   area: "ADAPTERS:MEMORY",
//   title: "Memory host",
//   guarantees: ["Tests can emit init and ready without Foundry."],
//   provides: ["MemoryHost", "createMemoryHost"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// The memory host records diagnostics and lets tests fire hooks in a chosen
// order, including illegal orders, so coordinator refusals can be proven.
// -----------------------------------------------------------------------------

/**
 * Test host that can emit Foundry-like lifecycle notifications.
 */
export interface MemoryHost extends PackageHost {
  readonly diagnostics: DiagnosticEvent[];
  emit(hook: HostHook): void;
}

/**
 * Creates an in-memory host for contract tests.
 */
export function createMemoryHost(): MemoryHost {
  const listeners: Record<HostHook, Set<() => void>> = {
    init: new Set(),
    ready: new Set()
  };
  const diagnostics: DiagnosticEvent[] = [];

  return {
    diagnostics,
    on(hook, handler) {
      listeners[hook].add(handler);
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        listeners[hook].delete(handler);
      };
    },
    diagnose(event) {
      diagnostics.push({ ...event });
    },
    emit(hook) {
      for (const handler of [...listeners[hook]]) {
        handler();
      }
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): add the in-memory host used by lifecycle contract tests.
// [GAMEASSIST_HOST:ADAPTERS:MEMORY] END
// ============================================================================

// ============================================================================
// [GAMEASSIST_HOST:ADAPTERS:FOUNDRY] BEGIN
// Section Title: Foundry Hooks adapter
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_HOST",
//   area: "ADAPTERS:FOUNDRY",
//   title: "Foundry host",
//   guarantees: ["Subscribes with Hooks.on and returns an unsubscribe that calls Hooks.off."],
//   provides: ["createFoundryHost", "detectFoundryHooks"],
//   seams: ["Hooks.on", "Hooks.off", "console"],
//   risks: ["Foundry module disable usually reloads the world, so unsubscribe may never run in production."],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// The adapter is thin: it does not decide when GameAssist is ready. Console
// mirroring uses code-owned strings only. Missing Hooks is a detectable
// unavailability, not an exception thrown through Foundry's loader.
// -----------------------------------------------------------------------------

/**
 * Detects Foundry's global Hooks object without throwing in Node.
 */
export function detectFoundryHooks(): FoundryHooks | undefined {
  const candidate = (globalThis as { Hooks?: FoundryHooks }).Hooks;
  if (
    candidate &&
    typeof candidate.on === "function" &&
    typeof candidate.off === "function"
  ) {
    return candidate;
  }
  return undefined;
}

/**
 * Creates a Foundry host adapter.
 *
 * @param hooks - Optional Hooks object. Tests may inject a fake.
 * @returns A PackageHost, or undefined when Foundry Hooks are unavailable.
 */
export function createFoundryHost(hooks: FoundryHooks | undefined = detectFoundryHooks()): PackageHost | undefined {
  if (!hooks) return undefined;

  return {
    on(hook, handler) {
      // COMPAT: Foundry Hook callbacks must return native values. This handler
      // returns void; it must not return a GameAssist Result envelope.
      const wrapped = (): void => {
        handler();
      };
      hooks.on(hook, wrapped);
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        hooks.off(hook, wrapped);
      };
    },
    diagnose(event) {
      const line = `[gameassist] ${event.level} ${event.code}: ${event.message}`;
      const consoleLike = (
        globalThis as {
          console?: {
            info: (message: string) => void;
            warn: (message: string) => void;
            error: (message: string) => void;
          };
        }
      ).console;
      if (!consoleLike) return;
      if (event.level === "error") {
        consoleLike.error(line);
      } else if (event.level === "warning") {
        consoleLike.warn(line);
      } else {
        consoleLike.info(line);
      }
    }
  };
}
// --- Notes & Comments ---
// Changed (v0.1.0): add the Foundry Hooks adapter with duplicate-safe unsubscribe.
// [GAMEASSIST_HOST:ADAPTERS:FOUNDRY] END
// ============================================================================

// --- Notes & Comments ---
// Changed (v0.1.0): group memory and Foundry adapters behind one host port.
// [GAMEASSIST_HOST:ADAPTERS] END
// ============================================================================
