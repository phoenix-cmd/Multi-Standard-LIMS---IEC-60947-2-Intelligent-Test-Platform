export interface AnalyticsQuery {
  metric: 'pass-rate' | 'failure-rate' | 'throughput' | 'clause-duration' | 'equipment-health' | 'engineer-productivity';
  groupBy?: 'clause' | 'month' | 'engineer' | 'equipment' | 'product';
  interval?: 'daily' | 'monthly' | 'yearly';
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
  filter?: Record<string, any>;
}

export interface QueryResult<T = any> {
  metric: string;
  timestamp: string;
  cached: boolean;
  data: T;
  summaryText?: string;
}

export class QueryEngine {
  private _cache: Map<string, { result: any; expiresAt: number }> = new Map();
  private _ttlMs = 30000; // 30s cache TTL

  async executeQuery<T = any>(query: AnalyticsQuery, fetcher: () => Promise<T> | T): Promise<QueryResult<T>> {
    const key = JSON.stringify(query);
    const now = Date.now();
    const hit = this._cache.get(key);

    if (hit && hit.expiresAt > now) {
      return {
        metric: query.metric,
        timestamp: new Date().toISOString(),
        cached: true,
        data: hit.result,
      };
    }

    const fresh = await fetcher();
    this._cache.set(key, { result: fresh, expiresAt: now + this._ttlMs });

    return {
      metric: query.metric,
      timestamp: new Date().toISOString(),
      cached: false,
      data: fresh,
    };
  }

  clearCache(): void {
    this._cache.clear();
  }
}

export const globalQueryEngine = new QueryEngine();
