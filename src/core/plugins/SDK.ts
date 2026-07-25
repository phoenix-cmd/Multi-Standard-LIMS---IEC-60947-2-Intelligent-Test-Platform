import type { StandardPlugin } from '../../standards/api/StandardPlugin';

export class PlatformSDK {
  private _registeredPlugins: Map<string, StandardPlugin> = new Map();

  registerStandard(plugin: StandardPlugin) {
    this._registeredPlugins.set(plugin.metadata.id, plugin);
    console.log(`[SDK] Registered Standard Plugin: ${plugin.metadata.name} (${plugin.metadata.id})`);
  }

  getPlugin(id: string): StandardPlugin | undefined {
    return this._registeredPlugins.get(id);
  }

  getAllPlugins(): StandardPlugin[] {
    return Array.from(this._registeredPlugins.values());
  }
}

export const globalSDK = new PlatformSDK();
