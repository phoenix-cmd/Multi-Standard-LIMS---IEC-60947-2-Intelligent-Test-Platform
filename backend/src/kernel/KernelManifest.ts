export interface KernelServiceDescriptor {
  name: string;
  version: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  dependencies: string[];
  description: string;
}

export class KernelManifest {
  private static instance: KernelManifest;
  private services: Map<string, KernelServiceDescriptor> = new Map();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): KernelManifest {
    if (!KernelManifest.instance) {
      KernelManifest.instance = new KernelManifest();
    }
    return KernelManifest.instance;
  }

  private registerDefaults() {
    this.registerService({
      name: 'Identity',
      version: '1.0.0',
      status: 'healthy',
      dependencies: ['Database'],
      description: 'Argon2 authentication, JWT session validation, and RBAC matrix enforcement.',
    });
    this.registerService({
      name: 'EventBus',
      version: '1.0.0',
      status: 'healthy',
      dependencies: ['Database', 'Redis'],
      description: 'Typed domain event dispatcher and Transactional Outbox pattern processor.',
    });
    this.registerService({
      name: 'CQRS',
      version: '1.0.0',
      status: 'healthy',
      dependencies: ['Database'],
      description: 'Command/Query bus and read projection manager.',
    });
    this.registerService({
      name: 'RulesEngine',
      version: '1.0.0',
      status: 'healthy',
      dependencies: [],
      description: 'Deterministic rule evaluation and AST formula calculation engine.',
    });
    this.registerService({
      name: 'AIOrchestrator',
      version: '1.0.0',
      status: 'healthy',
      dependencies: [],
      description: 'Centralized model routing, prompt management, and citation engine.',
    });
    this.registerService({
      name: 'KnowledgeGraph',
      version: '1.0.0',
      status: 'healthy',
      dependencies: ['Database'],
      description: 'Relational knowledge graph reasoning and EQL query evaluation.',
    });
    this.registerService({
      name: 'TimeMachineReplay',
      version: '1.0.0',
      status: 'healthy',
      dependencies: ['Database', 'EventBus'],
      description: 'Historical sample lifecycle replay and oscillograph playback.',
    });
    this.registerService({
      name: 'PluginManager',
      version: '1.0.0',
      status: 'healthy',
      dependencies: ['Database'],
      description: 'Standard plugin migration SDK and rule set registration.',
    });
  }

  public registerService(descriptor: KernelServiceDescriptor): void {
    this.services.set(descriptor.name, descriptor);
  }

  public getManifest(): KernelServiceDescriptor[] {
    return Array.from(this.services.values());
  }

  public validateStartup(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const available = new Set(this.services.keys());

    for (const service of this.services.values()) {
      for (const dep of service.dependencies) {
        if (dep !== 'Database' && dep !== 'Redis' && !available.has(dep)) {
          errors.push(`Kernel service '${service.name}' missing dependency '${dep}'`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
