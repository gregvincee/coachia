/**
 * Service de synchronisation offline-first
 * Permet à l'app de fonctionner sans connexion et de synchroniser les données
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: string;
  resourceId: string;
  data: Record<string, any>;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  retryCount: number;
  error?: string;
}

export interface SyncQueue {
  operations: SyncOperation[];
  lastSyncTime: number;
  syncInProgress: boolean;
}

export interface OfflineData {
  [key: string]: any;
}

class OfflineSyncManager {
  private queue: SyncOperation[] = [];
  private lastSyncTime: number = 0;
  private syncInProgress: boolean = false;
  private maxRetries: number = 3;
  private syncInterval: number = 30000; // 30 secondes
  private isOnline: boolean = true;

  constructor() {
    this.initializeNetworkListener();
    this.loadQueue();
  }

  /**
   * Initialise l'écoute de la connectivité réseau
   */
  private initializeNetworkListener(): void {
    // Simuler la connectivité (en production, utiliser @react-native-community/netinfo)
    this.isOnline = true;
  }

  /**
   * Ajoute une opération à la queue
   */
  addOperation(
    type: 'create' | 'update' | 'delete',
    resource: string,
    resourceId: string,
    data: Record<string, any>
  ): void {
    const operation: SyncOperation = {
      id: `op-${Date.now()}`,
      type,
      resource,
      resourceId,
      data,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    this.queue.push(operation);
    this.saveQueue();

    // Essayer de synchroniser immédiatement si en ligne
    if (this.isOnline) {
      this.syncQueue();
    }
  }

  /**
   * Synchronise la queue avec le serveur
   */
  async syncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;

    try {
      const pendingOps = this.queue.filter(op => op.status === 'pending');

      for (const op of pendingOps) {
        try {
          await this.syncOperation(op);
          op.status = 'synced';
        } catch (error) {
          op.retryCount++;
          if (op.retryCount >= this.maxRetries) {
            op.status = 'failed';
            op.error = String(error);
          }
        }
      }

      this.lastSyncTime = Date.now();
      this.saveQueue();

      // Nettoyer les opérations synced
      this.queue = this.queue.filter(op => op.status !== 'synced');
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Synchronise une opération individuelle
   */
  private async syncOperation(op: SyncOperation): Promise<void> {
    // Simuler l'envoi au serveur
    console.log(`Syncing ${op.type} ${op.resource}/${op.resourceId}`);

    // En production, faire un appel API réel
    // const response = await fetch(`/api/${op.resource}/${op.resourceId}`, {
    //   method: op.type === 'delete' ? 'DELETE' : op.type === 'create' ? 'POST' : 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(op.data),
    // });

    // if (!response.ok) {
    //   throw new Error(`Sync failed: ${response.statusText}`);
    // }
  }

  /**
   * Charge la queue depuis le stockage
   */
  private async loadQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('syncQueue');
      if (stored) {
        const data: SyncQueue = JSON.parse(stored);
        this.queue = data.operations;
        this.lastSyncTime = data.lastSyncTime;
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la queue:', error);
    }
  }

  /**
   * Sauvegarde la queue
   */
  private async saveQueue(): Promise<void> {
    try {
      const data: SyncQueue = {
        operations: this.queue,
        lastSyncTime: this.lastSyncTime,
        syncInProgress: this.syncInProgress,
      };
      await AsyncStorage.setItem('syncQueue', JSON.stringify(data));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la queue:', error);
    }
  }

  /**
   * Obtient le statut de synchronisation
   */
  getStatus(): { isOnline: boolean; pendingOps: number; syncInProgress: boolean } {
    return {
      isOnline: this.isOnline,
      pendingOps: this.queue.filter(op => op.status === 'pending').length,
      syncInProgress: this.syncInProgress,
    };
  }

  /**
   * Obtient la queue
   */
  getQueue(): SyncOperation[] {
    return [...this.queue];
  }

  /**
   * Vide la queue
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }
}

// Instance globale
const syncManager = new OfflineSyncManager();

/**
 * Ajoute une opération à la queue de synchronisation
 */
export function addSyncOperation(
  type: 'create' | 'update' | 'delete',
  resource: string,
  resourceId: string,
  data: Record<string, any>
): void {
  syncManager.addOperation(type, resource, resourceId, data);
}

/**
 * Synchronise manuellement la queue
 */
export async function syncOfflineQueue(): Promise<void> {
  await syncManager.syncQueue();
}

/**
 * Obtient le statut de synchronisation
 */
export function getSyncStatus(): { isOnline: boolean; pendingOps: number; syncInProgress: boolean } {
  return syncManager.getStatus();
}

/**
 * Obtient la queue de synchronisation
 */
export function getSyncQueue(): SyncOperation[] {
  return syncManager.getQueue();
}

/**
 * Vide la queue de synchronisation
 */
export async function clearSyncQueue(): Promise<void> {
  await syncManager.clearQueue();
}

/**
 * Service de stockage offline-first
 */
export class OfflineStore {
  private prefix: string;

  constructor(prefix: string = 'offline') {
    this.prefix = prefix;
  }

  /**
   * Sauvegarde une donnée localement
   */
  async set(key: string, value: any, syncToServer: boolean = true): Promise<void> {
    try {
      const fullKey = `${this.prefix}:${key}`;
      await AsyncStorage.setItem(fullKey, JSON.stringify(value));

      if (syncToServer) {
        addSyncOperation('update', this.prefix, key, value);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde offline:', error);
    }
  }

  /**
   * Récupère une donnée localement
   */
  async get(key: string): Promise<any | null> {
    try {
      const fullKey = `${this.prefix}:${key}`;
      const stored = await AsyncStorage.getItem(fullKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération offline:', error);
      return null;
    }
  }

  /**
   * Supprime une donnée localement
   */
  async delete(key: string, syncToServer: boolean = true): Promise<void> {
    try {
      const fullKey = `${this.prefix}:${key}`;
      await AsyncStorage.removeItem(fullKey);

      if (syncToServer) {
        addSyncOperation('delete', this.prefix, key, {});
      }
    } catch (error) {
      console.error('Erreur lors de la suppression offline:', error);
    }
  }

  /**
   * Récupère toutes les données
   */
  async getAll(): Promise<Record<string, any>> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const prefixedKeys = keys.filter(k => k.startsWith(`${this.prefix}:`));

      const data: Record<string, any> = {};
      for (const key of prefixedKeys) {
        const cleanKey = key.replace(`${this.prefix}:`, '');
        const value = await AsyncStorage.getItem(key);
        if (value) {
          data[cleanKey] = JSON.parse(value);
        }
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de toutes les données:', error);
      return {};
    }
  }

  /**
   * Vide le store
   */
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const prefixedKeys = keys.filter(k => k.startsWith(`${this.prefix}:`));
      await AsyncStorage.multiRemove(prefixedKeys);
    } catch (error) {
      console.error('Erreur lors du nettoyage du store:', error);
    }
  }
}

/**
 * Hook pour écouter les changements de connectivité
 */
export async function onConnectivityChange(callback: (isOnline: boolean) => void): Promise<void> {
  // Simuler les changements de connectivité (en production, utiliser @react-native-community/netinfo)
  callback(true);
}

/**
 * Obtient le statut de la connectivité
 */
export async function getConnectivityStatus(): Promise<boolean> {
  // Simuler le statut de connectivité (en production, utiliser @react-native-community/netinfo)
  return true;
}
