/**
 * Service de monétisation avec publicités et marketplace
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AdCampaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  category: 'skill' | 'content' | 'premium' | 'partner';
  targetAudience: string[];
  budget: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate: number;
  endDate: number;
  active: boolean;
}

export interface AdImpression {
  id: string;
  campaignId: string;
  userId: string;
  timestamp: number;
  duration: number; // en ms
  clicked: boolean;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  category: 'course' | 'template' | 'resource' | 'coaching';
  price: number;
  currency: string;
  creatorId: string;
  rating: number; // 0-5
  reviews: number;
  downloads: number;
  imageUrl: string;
  previewUrl?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Purchase {
  id: string;
  userId: string;
  itemId: string;
  itemTitle: string;
  price: number;
  currency: string;
  paymentMethod: 'credit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  timestamp: number;
  receiptUrl?: string;
}

export interface UserPurchases {
  userId: string;
  items: string[]; // itemIds
  totalSpent: number;
  purchaseCount: number;
  lastPurchase?: number;
}

export interface Revenue {
  date: string;
  adRevenue: number;
  marketplaceRevenue: number;
  premiumRevenue: number;
  totalRevenue: number;
}

export interface RevenueShare {
  creatorId: string;
  itemId: string;
  totalRevenue: number;
  creatorShare: number;
  platformShare: number;
  lastPayout?: number;
}

/**
 * Crée une campagne publicitaire
 */
export function createAdCampaign(
  title: string,
  description: string,
  imageUrl: string,
  targetUrl: string,
  category: 'skill' | 'content' | 'premium' | 'partner' = 'partner',
  budget: number = 100
): AdCampaign {
  return {
    id: `ad-${Date.now()}`,
    title,
    description,
    imageUrl,
    targetUrl,
    category,
    targetAudience: [],
    budget,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    startDate: Date.now(),
    endDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 jours
    active: true,
  };
}

/**
 * Enregistre une impression publicitaire
 */
export async function recordAdImpression(
  campaignId: string,
  userId: string,
  duration: number
): Promise<void> {
  try {
    const impression: AdImpression = {
      id: `imp-${Date.now()}`,
      campaignId,
      userId,
      timestamp: Date.now(),
      duration,
      clicked: false,
    };

    const impressions = await getAdImpressions(campaignId);
    impressions.push(impression);

    await AsyncStorage.setItem(
      `adImpressions-${campaignId}`,
      JSON.stringify(impressions)
    );
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'impression:', error);
  }
}

/**
 * Récupère les impressions d'une campagne
 */
export async function getAdImpressions(campaignId: string): Promise<AdImpression[]> {
  try {
    const stored = await AsyncStorage.getItem(`adImpressions-${campaignId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des impressions:', error);
    return [];
  }
}

/**
 * Calcule les statistiques d'une campagne
 */
export async function getAdStats(campaignId: string): Promise<{
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
}> {
  const impressions = await getAdImpressions(campaignId);
  const clicks = impressions.filter(i => i.clicked).length;
  const conversions = Math.floor(clicks * 0.1); // Estimation

  return {
    impressions: impressions.length,
    clicks,
    ctr: impressions.length > 0 ? (clicks / impressions.length) * 100 : 0,
    conversions,
    conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
  };
}

/**
 * Crée un article de marketplace
 */
export function createMarketplaceItem(
  title: string,
  description: string,
  category: 'course' | 'template' | 'resource' | 'coaching',
  price: number,
  creatorId: string,
  imageUrl: string
): MarketplaceItem {
  return {
    id: `item-${Date.now()}`,
    title,
    description,
    category,
    price,
    currency: 'USD',
    creatorId,
    rating: 0,
    reviews: 0,
    downloads: 0,
    imageUrl,
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Crée un achat
 */
export function createPurchase(
  userId: string,
  itemId: string,
  itemTitle: string,
  price: number,
  paymentMethod: 'credit_card' | 'paypal' | 'apple_pay' | 'google_pay' = 'credit_card'
): Purchase {
  return {
    id: `purchase-${Date.now()}`,
    userId,
    itemId,
    itemTitle,
    price,
    currency: 'USD',
    paymentMethod,
    status: 'pending',
    timestamp: Date.now(),
  };
}

/**
 * Enregistre un achat
 */
export async function recordPurchase(purchase: Purchase): Promise<void> {
  try {
    // Mettre à jour l'achat
    await AsyncStorage.setItem(`purchase-${purchase.id}`, JSON.stringify(purchase));

    // Mettre à jour les achats de l'utilisateur
    const userPurchases = await getUserPurchases(purchase.userId);
    if (!userPurchases.items.includes(purchase.itemId)) {
      userPurchases.items.push(purchase.itemId);
    }
    userPurchases.totalSpent += purchase.price;
    userPurchases.purchaseCount++;
    userPurchases.lastPurchase = Date.now();

    await AsyncStorage.setItem(
      `userPurchases-${purchase.userId}`,
      JSON.stringify(userPurchases)
    );
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'achat:', error);
  }
}

/**
 * Récupère les achats d'un utilisateur
 */
export async function getUserPurchases(userId: string): Promise<UserPurchases> {
  try {
    const stored = await AsyncStorage.getItem(`userPurchases-${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      userId,
      items: [],
      totalSpent: 0,
      purchaseCount: 0,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des achats:', error);
    return {
      userId,
      items: [],
      totalSpent: 0,
      purchaseCount: 0,
    };
  }
}

/**
 * Calcule les revenus
 */
export async function calculateRevenue(date: string): Promise<Revenue> {
  try {
    // Récupérer toutes les impressions et achats du jour
    const keys = await AsyncStorage.getAllKeys();

    let adRevenue = 0;
    let marketplaceRevenue = 0;
    let premiumRevenue = 0;

    // Simuler le calcul des revenus
    // En production, faire des requêtes à la base de données

    return {
      date,
      adRevenue,
      marketplaceRevenue,
      premiumRevenue,
      totalRevenue: adRevenue + marketplaceRevenue + premiumRevenue,
    };
  } catch (error) {
    console.error('Erreur lors du calcul des revenus:', error);
    return {
      date,
      adRevenue: 0,
      marketplaceRevenue: 0,
      premiumRevenue: 0,
      totalRevenue: 0,
    };
  }
}

/**
 * Crée un partage de revenus
 */
export function createRevenueShare(
  creatorId: string,
  itemId: string,
  totalRevenue: number,
  creatorPercentage: number = 0.7 // 70% au créateur
): RevenueShare {
  const creatorShare = totalRevenue * creatorPercentage;
  const platformShare = totalRevenue * (1 - creatorPercentage);

  return {
    creatorId,
    itemId,
    totalRevenue,
    creatorShare,
    platformShare,
  };
}

/**
 * Enregistre un partage de revenus
 */
export async function recordRevenueShare(share: RevenueShare): Promise<void> {
  try {
    const key = `revenueShare-${share.creatorId}-${share.itemId}`;
    await AsyncStorage.setItem(key, JSON.stringify(share));
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du partage de revenus:', error);
  }
}

/**
 * Récupère les partages de revenus d'un créateur
 */
export async function getCreatorRevenueShares(creatorId: string): Promise<RevenueShare[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const creatorKeys = keys.filter(k => k.startsWith(`revenueShare-${creatorId}`));

    const shares: RevenueShare[] = [];
    for (const key of creatorKeys) {
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        shares.push(JSON.parse(stored));
      }
    }

    return shares;
  } catch (error) {
    console.error('Erreur lors de la récupération des partages de revenus:', error);
    return [];
  }
}

/**
 * Calcule les revenus totaux d'un créateur
 */
export async function getCreatorTotalRevenue(creatorId: string): Promise<number> {
  const shares = await getCreatorRevenueShares(creatorId);
  return shares.reduce((sum, share) => sum + share.creatorShare, 0);
}

/**
 * Sauvegarde les articles de marketplace
 */
export async function saveMarketplaceItems(items: MarketplaceItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem('marketplaceItems', JSON.stringify(items));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des articles:', error);
  }
}

/**
 * Récupère les articles de marketplace
 */
export async function getMarketplaceItems(): Promise<MarketplaceItem[]> {
  try {
    const stored = await AsyncStorage.getItem('marketplaceItems');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    return [];
  }
}

/**
 * Recherche des articles de marketplace
 */
export async function searchMarketplaceItems(
  query: string,
  category?: string
): Promise<MarketplaceItem[]> {
  const items = await getMarketplaceItems();

  return items.filter(item => {
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

    const matchesCategory = !category || item.category === category;

    return matchesQuery && matchesCategory;
  });
}
