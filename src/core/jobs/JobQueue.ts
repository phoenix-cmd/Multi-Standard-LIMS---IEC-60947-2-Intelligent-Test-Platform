import { v4 as uuidv4 } from 'uuid';

export interface BackgroundJob {
  id: string;
  type: 'executive_brief' | 'cache_warm' | 'calibration_check' | 'predictive_analysis';
  status: 'queued' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

export class JobQueue {
  private _jobs: BackgroundJob[] = [];
  private _listeners: Set<() => void> = new Set();

  subscribe(cb: () => void) {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _notify() {
    this._listeners.forEach((cb) => cb());
  }

  getJobs(): BackgroundJob[] {
    return [...this._jobs];
  }

  enqueue(type: BackgroundJob['type'], worker: () => Promise<any>): BackgroundJob {
    const job: BackgroundJob = {
      id: uuidv4(),
      type,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };
    this._jobs.unshift(job);
    this._notify();

    setTimeout(async () => {
      job.status = 'running';
      this._notify();
      try {
        job.result = await worker();
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
      } catch (err: any) {
        job.status = 'failed';
        job.error = err?.message || 'Unknown error';
      }
      this._notify();
    }, 100);

    return job;
  }
}

export const globalJobQueue = new JobQueue();
