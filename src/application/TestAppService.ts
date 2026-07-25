import type { ClauseResult, TestRun } from '../types';
import { globalSampleRepository } from '../domain/repositories/InMemoryRepositories';
import { globalEventBus } from '../core/events/EventBus';
import { globalStandardPluginRegistry } from '../standards/StandardPluginRegistry';

export class TestAppService {
  async executeTestRun(sampleId: string, run: TestRun): Promise<boolean> {
    const sample = await globalSampleRepository.findById(sampleId);
    if (!sample) return false;

    sample.testRuns.push(run);
    const hasFail = run.clauseResults.some((c) => c.verdict === 'FAIL');
    run.verdict = hasFail ? 'FAIL' : 'PASS';

    await globalSampleRepository.save(sample);

    run.clauseResults.forEach((cr) => {
      globalEventBus.emit('TestCompleted', {
        sampleId,
        reportNo: sample.reportNo,
        clauseId: cr.clauseId,
        verdict: cr.verdict,
        measuredValue: cr.measuredValue,
        unit: cr.unit,
        timestamp: new Date().toISOString(),
      });

      if (cr.verdict === 'FAIL') {
        globalEventBus.emit('ClauseFailed', {
          sampleId,
          clauseId: cr.clauseId,
          rootCause: cr.message,
          componentId: 'terminalR',
        });
      }
    });

    return true;
  }
}

export const testAppService = new TestAppService();
