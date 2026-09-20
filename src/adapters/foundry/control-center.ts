// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST_FOUNDRY_CONTROL_CENTER"
//   project_version: "v0.1.0"
//   purpose: "Adapt Control Center to Foundry Application V2 and a restricted settings menu without putting view policy in the adapter."
//   order: ["detect", "register", "render"]
//   applicability:
//     runtime: "foundry_client"
//     artifact: "source"
//     host_contracts: ["Foundry ApplicationV2", "Foundry game.settings"]
//   data_class: "Internal"
//   ai_data: "none"
//   refusals:
//     - "Never throw when Application V2 is missing."
//     - "Never open Control Center for a non-GM."
//   observability:
//     mode: "local_diagnostics"
//     logs: "bounded register failures"
//     metrics: []
//     spans: []
//   compatibility:
//     foundry: { minimum: "14", verified: "14.367" }
//   lifecycle:
//     registers: ["init"]
//     disposes: []
//   policy:
//     notes_ref: "[GAMEASSIST_FOUNDRY_CONTROL_CENTER:ADAPTER]"
//   variances: []
//   canonical_tree: |
//     [GAMEASSIST_FOUNDRY_CONTROL_CENTER]/
//     `-- [GAMEASSIST_FOUNDRY_CONTROL_CENTER:ADAPTER]
// --- prose banner ---
// This adapter hosts Control Center in Foundry. It refuses to invent a window
// when Application V2 is absent and refuses to localize by embedding English.

import { MODULE_ID } from "../../core/constants";
import type { DiagnosticSink } from "../../core/diagnostics";
import type { PackageHost } from "../../core/host";
import { CONTROL_CENTER_KEYS, type ControlCenter } from "../../ui/control-center";

// ============================================================================
// [GAMEASSIST_FOUNDRY_CONTROL_CENTER:ADAPTER] BEGIN
// Section Title: Foundry Application V2 host
// -----------------------------------------------------------------------------
// mechsuit_section: {
//   codename: "GAMEASSIST_FOUNDRY_CONTROL_CENTER",
//   area: "ADAPTER",
//   title: "Foundry Control Center adapter",
//   guarantees: [
//     "registerMenu is restricted to GMs.",
//     "Missing Application V2 leaves the presenter usable."
//   ],
//   provides: ["bindFoundryControlCenter", "detectFoundryApplicationApi"],
//   seams: ["foundry.applications.api", "game.settings.registerMenu"],
//   last_updated_version: "v0.1.0",
//   lifecycle: "active"
// }
// -----------------------------------------------------------------------------
// Narrative
// Detection is lazy so Node tests can import this file. The settings menu is
// the first GM entry. Click handlers re-query the presenter so the window does
// not cache health.
// -----------------------------------------------------------------------------

interface FoundryApplicationApi {
  ApplicationV2: new (...args: unknown[]) => Record<string, unknown>;
  HandlebarsApplicationMixin: (
    base: new (...args: unknown[]) => Record<string, unknown>
  ) => new (...args: unknown[]) => Record<string, unknown>;
}

interface FoundryClickTarget {
  getAttribute(name: string): string | null;
}

interface FoundryClickEvent {
  preventDefault(): void;
  currentTarget: FoundryClickTarget | null;
}

interface FoundryRoot {
  querySelectorAll(selector: string): Iterable<{
    addEventListener(type: "click", listener: (event: FoundryClickEvent) => void): void;
  }>;
}

interface FoundrySettings {
  registerMenu(
    namespace: string,
    key: string,
    options: {
      name: string;
      label: string;
      hint: string;
      icon: string;
      type: unknown;
      restricted: boolean;
    }
  ): void;
}

interface FoundryControlCenterBindings {
  host: PackageHost;
  controlCenter: ControlCenter;
  diagnostics?: DiagnosticSink;
  applications?: FoundryApplicationApi;
  settings?: FoundrySettings;
}

/**
 * Detects Foundry Application V2 without throwing in Node.
 */
export function detectFoundryApplicationApi(): FoundryApplicationApi | undefined {
  const foundry = (
    globalThis as {
      foundry?: {
        applications?: {
          api?: {
            ApplicationV2?: FoundryApplicationApi["ApplicationV2"];
            HandlebarsApplicationMixin?: FoundryApplicationApi["HandlebarsApplicationMixin"];
          };
        };
      };
    }
  ).foundry;
  const api = foundry?.applications?.api;
  if (
    api &&
    typeof api.ApplicationV2 === "function" &&
    typeof api.HandlebarsApplicationMixin === "function"
  ) {
    return {
      ApplicationV2: api.ApplicationV2,
      HandlebarsApplicationMixin: api.HandlebarsApplicationMixin
    };
  }
  return undefined;
}

function detectFoundrySettings(): FoundrySettings | undefined {
  const game = (globalThis as { game?: { settings?: FoundrySettings } }).game;
  if (game?.settings && typeof game.settings.registerMenu === "function") {
    return game.settings;
  }
  return undefined;
}

function createApplicationClass(
  api: FoundryApplicationApi,
  controlCenter: ControlCenter
): unknown {
  const Base = api.HandlebarsApplicationMixin(api.ApplicationV2);

  class GameAssistControlCenter extends Base {
    static DEFAULT_OPTIONS = {
      id: "gameassist-control-center",
      classes: ["gameassist", "gameassist-control-center"],
      tag: "div",
      window: {
        title: CONTROL_CENTER_KEYS.title,
        icon: "fas fa-toolbox",
        resizable: true
      },
      position: { width: 560, height: "auto" }
    };

    static PARTS = {
      body: {
        template: `modules/${MODULE_ID}/templates/control-center.hbs`
      }
    };

    async _prepareContext(): Promise<Record<string, unknown>> {
      const view = controlCenter.view();
      if (!view.ok) {
        return { allowed: false, deniedKey: CONTROL_CENTER_KEYS.denied };
      }
      return { allowed: true, ...view.data };
    }

    _onRender(context: unknown, options: unknown): void {
      const parent = Object.getPrototypeOf(GameAssistControlCenter.prototype) as {
        _onRender?: (context: unknown, options: unknown) => void;
      };
      parent._onRender?.call(this, context, options);
      const root = (this as { element?: FoundryRoot }).element;
      if (!root || typeof root.querySelectorAll !== "function") return;
      const buttons = root.querySelectorAll("[data-gameassist-feature]");
      for (const button of buttons) {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          const target = event.currentTarget;
          const id = target?.getAttribute("data-gameassist-feature");
          const next = target?.getAttribute("data-gameassist-enabled") === "false";
          if (!id) return;
          controlCenter.setFeatureEnabled(id, next);
          const renderable = this as { render?: (force?: boolean) => unknown };
          renderable.render?.(true);
        });
      }
    }
  }

  return GameAssistControlCenter;
}

/**
 * Registers the GM-only Control Center settings menu at init.
 *
 * @returns Unsubscribe for the init handler. Safe to call more than once.
 */
export function bindFoundryControlCenter(
  options: FoundryControlCenterBindings
): () => void {
  let registered = false;
  const register = (): void => {
    if (registered) return;
    const api = options.applications ?? detectFoundryApplicationApi();
    const settings = options.settings ?? detectFoundrySettings();
    if (!api || !settings) return;
    try {
      const ApplicationClass = createApplicationClass(api, options.controlCenter);
      settings.registerMenu(MODULE_ID, "controlCenter", {
        name: "GAMEASSIST.ControlCenter.MenuName",
        label: "GAMEASSIST.ControlCenter.Open",
        hint: "GAMEASSIST.ControlCenter.Hint",
        icon: "fas fa-toolbox",
        type: ApplicationClass,
        restricted: true
      });
      registered = true;
    } catch {
      options.diagnostics?.record({
        level: "warning",
        code: "control-center.register.failed",
        message: "Foundry settings menu for Control Center could not be registered."
      });
    }
  };

  return options.host.on("init", register);
}
// --- Notes & Comments ---
// Changed (v0.1.0): add the Application V2 Control Center adapter.
// Decision log:
//   CHOICE: settings menu entry - ALT: scene control button; REJECTED: scene
//   controls are not the beginner path for package health.
//   CHOICE: no Application V1 fallback - ALT: dual hierarchy; REJECTED: v14
//   baseline already provides V2.
// [GAMEASSIST_FOUNDRY_CONTROL_CENTER:ADAPTER] END
// ============================================================================
