export interface CachedEntry<T = any> {
  key: string
  etag: string
  data: T
  timestamp: number
}

class CacheManager {
  private prefix = 'xfzt_etag_cache_'
  private memoryCache: Map<string, CachedEntry> = new Map()

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          const raw = localStorage.getItem(key)
          if (raw) {
            const entry: CachedEntry = JSON.parse(raw)
            this.memoryCache.set(entry.key, entry)
          }
        }
      }
    } catch (e) {
      console.warn('ETag cache init failed', e)
    }
  }

  public get<T = any>(key: string): CachedEntry<T> | undefined {
    return this.memoryCache.get(key)
  }

  public getEtag(key: string): string | undefined {
    const entry = this.memoryCache.get(key)
    return entry?.etag
  }

  public set<T = any>(key: string, etag: string, data: T): void {
    const entry: CachedEntry<T> = {
      key,
      etag,
      data,
      timestamp: Date.now()
    }
    this.memoryCache.set(key, entry)
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(entry))
    } catch (e) {
      console.warn('LocalStorage save failed (quota?)', e)
    }
  }

  public delete(key: string): void {
    this.memoryCache.delete(key)
    try {
      localStorage.removeItem(this.prefix + key)
    } catch (e) {}
  }

  public clearAll(): void {
    this.memoryCache.clear()
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(this.prefix)) keysToRemove.push(k)
      }
      keysToRemove.forEach(k => localStorage.removeItem(k))
    } catch (e) {}
  }

  public getAllEntries(): CachedEntry[] {
    return Array.from(this.memoryCache.values())
  }
}

export const etagCache = new CacheManager()
