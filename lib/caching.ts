/**
 * Service de caching et optimisation de performance
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number; // Time to live en ms
  size: number; // en bytes
}

export interface CacheStats {
  totalSize: number;
  entryCount: number;
  hitRate: number;
  missRate: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private hits: number = 0;
  private misses: number = 0;
  private maxSize: number = 10 * 1024 * 1024; // 10 MB

  /**
   * Ajoute une entrée au cache
   */
  set<T>(key: string, value: T, ttl: number = 60 * 60 * 1000): void {
    const size = JSON.stringify(value).length;

    if (size > this.maxSize) {
      console.warn(`Cache entry too large: ${size} bytes`);
      return;
    }

    // Nettoyer si nécessaire
    if (this.getTotalSize() + size > this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      key,
      value,
      timestamp: Date.now(),
      ttl,
      size,
    });
  }

  /**
   * Récupère une entrée du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Vérifier l'expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  /**
   * Supprime une entrée
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Vide le cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Obtient les statistiques du cache
   */
  getStats(): CacheStats {
    const totalSize = this.getTotalSize();
    const entryCount = this.cache.size;
    const totalRequests = this.hits + this.misses;

    return {
      totalSize,
      entryCount,
      hitRate: totalRequests > 0 ? this.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.misses / totalRequests : 0,
    };
  }

  /**
   * Obtient la taille totale du cache
   */
  private getTotalSize(): number {
    return Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
  }

  /**
   * Supprime l'entrée la plus ancienne
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

// Instance globale du cache
const cacheManager = new CacheManager();

/**
 * Ajoute une entrée au cache
 */
export function setCached<T>(key: string, value: T, ttl?: number): void {
  cacheManager.set(key, value, ttl);
}

/**
 * Récupère une entrée du cache
 */
export function getCached<T>(key: string): T | null {
  return cacheManager.get<T>(key);
}

/**
 * Supprime une entrée du cache
 */
export function deleteCached(key: string): void {
  cacheManager.delete(key);
}

/**
 * Vide le cache
 */
export function clearCache(): void {
  cacheManager.clear();
}

/**
 * Obtient les statistiques du cache
 */
export function getCacheStats(): CacheStats {
  return cacheManager.getStats();
}

/**
 * Récupère ou calcule une valeur avec cache
 */
export async function getCachedOrCompute<T>(
  key: string,
  compute: () => Promise<T>,
  ttl: number = 60 * 60 * 1000
): Promise<T> {
  // Vérifier le cache en mémoire
  const cached = getCached<T>(key);
  if (cached) {
    return cached;
  }

  // Calculer la valeur
  const value = await compute();

  // Mettre en cache
  setCached(key, value, ttl);

  return value;
}

/**
 * Service de stockage persistant avec cache
 */
export class PersistentCache {
  private prefix: string;

  constructor(prefix: string = 'cache') {
    this.prefix = prefix;
  }

  /**
   * Sauvegarde une valeur
   */
  async set<T>(key: string, value: T, ttl: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        key,
        value,
        timestamp: Date.now(),
        ttl,
        size: JSON.stringify(value).length,
      };

      const fullKey = `${this.prefix}:${key}`;
      await AsyncStorage.setItem(fullKey, JSON.stringify(entry));

      // Aussi mettre en cache en mémoire
      setCached(key, value, ttl);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde en cache persistant:', error);
    }
  }

  /**
   * Récupère une valeur
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Vérifier le cache en mémoire d'abord
      const cached = getCached<T>(key);
      if (cached) {
        return cached;
      }

      // Vérifier le stockage persistant
      const fullKey = `${this.prefix}:${key}`;
      const stored = await AsyncStorage.getItem(fullKey);

      if (!stored) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(stored);

      // Vérifier l'expiration
      if (Date.now() - entry.timestamp > entry.ttl) {
        await AsyncStorage.removeItem(fullKey);
        return null;
      }

      // Restaurer en cache en mémoire
      setCached(key, entry.value, entry.ttl);

      return entry.value;
    } catch (error) {
      console.error('Erreur lors de la récupération du cache persistant:', error);
      return null;
    }
  }

  /**
   * Supprime une valeur
   */
  async delete(key: string): Promise<void> {
    try {
      const fullKey = `${this.prefix}:${key}`;
      await AsyncStorage.removeItem(fullKey);
      deleteCached(key);
    } catch (error) {
      console.error('Erreur lors de la suppression du cache persistant:', error);
    }
  }

  /**
   * Vide le cache
   */
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const prefixedKeys = keys.filter(k => k.startsWith(`${this.prefix}:`));
      await AsyncStorage.multiRemove(prefixedKeys);
      clearCache();
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache persistant:', error);
    }
  }
}

/**
 * Optimisation des images
 */
export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
}

export async function optimizeImageUrl(
  url: string,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    format = 'webp',
  } = options;

  // Utiliser un service d'optimisation d'images (ex: Cloudinary, Imgix)
  const params = new URLSearchParams({
    w: String(maxWidth),
    h: String(maxHeight),
    q: String(Math.round(quality * 100)),
    f: format,
  });

  return `${url}?${params.toString()}`;
}

/**
 * Pagination virtuelle pour les listes
 */
export interface VirtualizationConfig {
  itemHeight: number;
  visibleItems: number;
  bufferSize: number; // Items à charger avant/après
}

export function calculateVisibleRange(
  scrollOffset: number,
  config: VirtualizationConfig
): { start: number; end: number } {
  const { itemHeight, visibleItems, bufferSize } = config;

  const start = Math.max(0, Math.floor(scrollOffset / itemHeight) - bufferSize);
  const end = start + visibleItems + bufferSize * 2;

  return { start, end };
}

/**
 * Debounce pour les recherches
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      if (timeout) clearTimeout(timeout);
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle pour les événements fréquents
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
