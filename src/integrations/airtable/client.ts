import { AirtableListResponse, CacheEntry } from './types';

interface AirtableClientConfig {
  baseId: string;
  apiToken: string;
  timeoutMs?: number;
  maxRetries?: number;
  cacheTTL?: number;
}

interface FetchOptions {
  cacheTTL?: number;
  maxRetries?: number;
}

export class AirtableClient {
  private baseId: string;
  private apiToken: string;
  private timeoutMs: number;
  private maxRetries: number;
  private defaultCacheTTL: number;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();

  constructor(config: AirtableClientConfig) {
    this.baseId = config.baseId;
    this.apiToken = config.apiToken;
    this.timeoutMs = config.timeoutMs ?? 10000;
    this.maxRetries = config.maxRetries ?? 3;
    this.defaultCacheTTL = config.cacheTTL ?? 300; // 5 minutes default
  }

  private getCacheKey(table: string, params?: Record<string, string>): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${table}:${paramStr}`;
  }

  private isCacheValid(entry: CacheEntry<any>): boolean {
    const now = Date.now();
    return now - entry.timestamp < entry.ttl * 1000;
  }

  private async fetchWithRetry(
    url: string,
    options: { maxRetries?: number } = {}
  ): Promise<Response> {
    const maxRetries = options.maxRetries ?? this.maxRetries;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('retry-after') ?? '1', 10);
          if (attempt < maxRetries) {
            const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          }
        }

        if (response.ok) {
          return response;
        }

        if (response.status >= 500 || response.status === 408) {
          if (attempt < maxRetries) {
            const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          }
        }

        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt === maxRetries) break;

        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    throw lastError ?? new Error('Unknown fetch error');
  }

  async fetchRecords<T>(
    table: string,
    params?: Record<string, string>,
    options: FetchOptions = {}
  ): Promise<any[]> {
    const cacheKey = this.getCacheKey(table, params);

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log(`[Airtable] Cache hit for ${table}`);
      return cached.data;
    }

    // Check if request already in flight
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`[Airtable] Deduplicating request for ${table}`);
      return this.pendingRequests.get(cacheKey)!;
    }

    // Make request
    const promise = (async () => {
      try {
        const url = new URL(`https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(table)}`);

        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
          });
        }

        const response = await this.fetchWithRetry(url.toString(), {
          maxRetries: options.maxRetries,
        });

        const data = (await response.json()) as AirtableListResponse<T>;
        const records = data.records || [];

        // Store in cache
        const ttl = options.cacheTTL ?? this.defaultCacheTTL;
        this.cache.set(cacheKey, {
          data: records,
          timestamp: Date.now(),
          ttl,
        });

        console.log(`[Airtable] Fetched ${records.length} records from ${table}`);
        return records;
      } finally {
        this.pendingRequests.delete(cacheKey);
      }
    })();

    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  clearCache(table?: string): void {
    if (table) {
      const keysToDelete = Array.from(this.cache.keys()).filter((k) =>
        k.startsWith(`${table}:`)
      );
      keysToDelete.forEach((k) => this.cache.delete(k));
      console.log(`[Airtable] Cleared cache for ${table}`);
    } else {
      this.cache.clear();
      console.log('[Airtable] Cleared all cache');
    }
  }

  getCacheStats(): { size: number; entries: number } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.values()).reduce(
        (sum, entry) => sum + (Array.isArray(entry.data) ? entry.data.length : 1),
        0
      ),
    };
  }
}
