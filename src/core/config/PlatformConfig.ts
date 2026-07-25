export type DeploymentProfile = 'development' | 'demo' | 'standalone_lab' | 'enterprise' | 'cloud';

export interface PlatformConfigData {
  laboratoryName: string;
  accreditationNumber: string;
  activeProfile: DeploymentProfile;
  activeStandardId: string;
  enableAI: boolean;
  enableDigitalTwin: boolean;
  enable3DViewer: boolean;
  enableWorkflowDesigner: boolean;
  enableAnalytics: boolean;
  enableInvestigationWorkspace: boolean;
  autoSaveIntervalMs: number;
}

export const DEFAULT_PLATFORM_CONFIG: PlatformConfigData = {
  laboratoryName: 'Havells Central MCCB Testing Laboratory',
  accreditationNumber: 'NABL TC-8842 / IEC CB Scheme Lab 042',
  activeProfile: 'enterprise',
  activeStandardId: 'iec60947-2',
  enableAI: true,
  enableDigitalTwin: true,
  enable3DViewer: true,
  enableWorkflowDesigner: true,
  enableAnalytics: true,
  enableInvestigationWorkspace: true,
  autoSaveIntervalMs: 5000,
};

export class PlatformConfig {
  private _config: PlatformConfigData = { ...DEFAULT_PLATFORM_CONFIG };

  getConfig(): PlatformConfigData {
    return { ...this._config };
  }

  updateConfig(patch: Partial<PlatformConfigData>) {
    this._config = { ...this._config, ...patch };
  }
}

export const globalPlatformConfig = new PlatformConfig();
