import type { StandardPlugin } from './api/StandardPlugin';
import { IEC60947_2_Plugin } from './plugins/IEC60947_2_Plugin';
import { UL489_Plugin } from './plugins/UL489_Plugin';

export class StandardPluginRegistry {
  private _plugins: Map<string, StandardPlugin> = new Map();
  private _activePluginId: string = 'iec60947-2';

  constructor() {
    this.registerPlugin(IEC60947_2_Plugin);
    this.registerPlugin(UL489_Plugin);
  }

  registerPlugin(plugin: StandardPlugin) {
    this._plugins.set(plugin.metadata.id, plugin);
  }

  getPlugin(id: string): StandardPlugin | undefined {
    return this._plugins.get(id);
  }

  getActivePlugin(): StandardPlugin {
    return this._plugins.get(this._activePluginId) ?? IEC60947_2_Plugin;
  }

  setActivePluginId(id: string) {
    if (this._plugins.has(id)) {
      this._activePluginId = id;
    }
  }

  getAllPlugins(): StandardPlugin[] {
    return Array.from(this._plugins.values());
  }
}

export const globalStandardPluginRegistry = new StandardPluginRegistry();
