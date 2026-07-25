import type { Sample, SampleLifecycleState } from '../types';
import { globalSampleRepository } from '../domain/repositories/InMemoryRepositories';
import { globalEventBus } from '../core/events/EventBus';

export class SampleAppService {
  async getSamples(): Promise<Sample[]> {
    return globalSampleRepository.findAll();
  }

  async getSample(id: string): Promise<Sample | null> {
    return globalSampleRepository.findById(id);
  }

  async updateLifecycle(sampleId: string, state: SampleLifecycleState, notes?: string): Promise<Sample | null> {
    const sample = await globalSampleRepository.findById(sampleId);
    if (!sample) return null;

    sample.lifecycleState = state;
    sample.lifecycleHistory.push({
      state,
      timestamp: new Date().toISOString(),
      user: 'AppService',
      notes,
    });

    await globalSampleRepository.save(sample);
    globalEventBus.emit('SampleLifecycleUpdated', { sampleId, state, notes });
    return sample;
  }
}

export const sampleAppService = new SampleAppService();
