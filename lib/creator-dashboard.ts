/**
 * Service du dashboard créateur
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  CreatorProfile,
  CreatorContent,
  CreatorStats,
  CreatorSale,
  CreatorPayout,
  CreatorReview,
  CreatorAnalytics,
  CreatorNotification,
  CreatorSettings,
} from './types-creator';

class CreatorDashboardManager {
  /**
   * Crée un profil créateur
   */
  async createCreatorProfile(
    userId: string,
    name: string,
    bio: string,
    specialties: string[]
  ): Promise<CreatorProfile> {
    const profile: CreatorProfile = {
      id: `creator-${Date.now()}`,
      userId,
      name,
      bio,
      avatar: '',
      specialties,
      rating: 0,
      reviewCount: 0,
      followerCount: 0,
      totalEarnings: 0,
      joinedDate: Date.now(),
      verified: false,
    };

    await AsyncStorage.setItem(`creatorProfile-${userId}`, JSON.stringify(profile));
    return profile;
  }

  /**
   * Récupère le profil créateur
   */
  async getCreatorProfile(userId: string): Promise<CreatorProfile | null> {
    try {
      const stored = await AsyncStorage.getItem(`creatorProfile-${userId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil créateur:', error);
      return null;
    }
  }

  /**
   * Met à jour le profil créateur
   */
  async updateCreatorProfile(userId: string, updates: Partial<CreatorProfile>): Promise<void> {
    try {
      const profile = await this.getCreatorProfile(userId);
      if (profile) {
        const updated = { ...profile, ...updates };
        await AsyncStorage.setItem(`creatorProfile-${userId}`, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil créateur:', error);
    }
  }

  /**
   * Crée un contenu
   */
  async createContent(
    creatorId: string,
    title: string,
    description: string,
    category: 'course' | 'template' | 'resource' | 'coaching',
    price: number,
    imageUrl: string,
    level: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ): Promise<CreatorContent> {
    const content: CreatorContent = {
      id: `content-${Date.now()}`,
      creatorId,
      title,
      description,
      category,
      price,
      currency: 'USD',
      imageUrl,
      level,
      tags: [],
      published: false,
      views: 0,
      sales: 0,
      rating: 0,
      reviews: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await AsyncStorage.setItem(`content-${content.id}`, JSON.stringify(content));
    return content;
  }

  /**
   * Récupère le contenu d'un créateur
   */
  async getCreatorContent(creatorId: string): Promise<CreatorContent[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const contentKeys = keys.filter(k => k.startsWith('content-'));

      const contents: CreatorContent[] = [];
      for (const key of contentKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const content = JSON.parse(stored);
          if (content.creatorId === creatorId) {
            contents.push(content);
          }
        }
      }

      return contents;
    } catch (error) {
      console.error('Erreur lors de la récupération du contenu:', error);
      return [];
    }
  }

  /**
   * Publie un contenu
   */
  async publishContent(contentId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`content-${contentId}`);
      if (stored) {
        const content = JSON.parse(stored);
        content.published = true;
        content.lastPublishedAt = Date.now();
        await AsyncStorage.setItem(`content-${contentId}`, JSON.stringify(content));
      }
    } catch (error) {
      console.error('Erreur lors de la publication du contenu:', error);
    }
  }

  /**
   * Récupère les statistiques du créateur
   */
  async getCreatorStats(creatorId: string): Promise<CreatorStats> {
    try {
      const contents = await this.getCreatorContent(creatorId);
      const sales = await this.getCreatorSales(creatorId);

      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
      const totalViews = contents.reduce((sum, content) => sum + content.views, 0);
      const averageRating =
        contents.length > 0
          ? contents.reduce((sum, content) => sum + content.rating, 0) / contents.length
          : 0;

      const thisMonth = new Date();
      const thisMonthSales = sales.filter(
        sale =>
          new Date(sale.timestamp).getMonth() === thisMonth.getMonth() &&
          new Date(sale.timestamp).getFullYear() === thisMonth.getFullYear()
      );

      return {
        creatorId,
        totalSales,
        totalRevenue,
        totalViews,
        totalFollowers: 0,
        averageRating,
        conversionRate: totalViews > 0 ? (totalSales / totalViews) * 100 : 0,
        thisMonthRevenue: thisMonthSales.reduce((sum, sale) => sum + sale.amount, 0),
        thisMonthSales: thisMonthSales.length,
        topContent: contents.sort((a, b) => b.sales - a.sales).slice(0, 5),
        recentSales: sales.slice(-10),
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        creatorId,
        totalSales: 0,
        totalRevenue: 0,
        totalViews: 0,
        totalFollowers: 0,
        averageRating: 0,
        conversionRate: 0,
        thisMonthRevenue: 0,
        thisMonthSales: 0,
        topContent: [],
        recentSales: [],
      };
    }
  }

  /**
   * Récupère les ventes du créateur
   */
  async getCreatorSales(creatorId: string): Promise<CreatorSale[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const saleKeys = keys.filter(k => k.startsWith('sale-'));

      const sales: CreatorSale[] = [];
      for (const key of saleKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const sale = JSON.parse(stored);
          // Vérifier si le contenu appartient au créateur
          const content = await AsyncStorage.getItem(`content-${sale.contentId}`);
          if (content) {
            const parsedContent = JSON.parse(content);
            if (parsedContent.creatorId === creatorId) {
              sales.push(sale);
            }
          }
        }
      }

      return sales;
    } catch (error) {
      console.error('Erreur lors de la récupération des ventes:', error);
      return [];
    }
  }

  /**
   * Crée une demande de paiement
   */
  async requestPayout(
    creatorId: string,
    amount: number,
    bankAccount: string
  ): Promise<CreatorPayout> {
    const payout: CreatorPayout = {
      id: `payout-${Date.now()}`,
      creatorId,
      amount,
      currency: 'USD',
      period: new Date().toISOString().slice(0, 7),
      status: 'pending',
      bankAccount,
      requestedAt: Date.now(),
    };

    await AsyncStorage.setItem(`payout-${payout.id}`, JSON.stringify(payout));
    return payout;
  }

  /**
   * Récupère les paiements du créateur
   */
  async getCreatorPayouts(creatorId: string): Promise<CreatorPayout[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const payoutKeys = keys.filter(k => k.startsWith('payout-'));

      const payouts: CreatorPayout[] = [];
      for (const key of payoutKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const payout = JSON.parse(stored);
          if (payout.creatorId === creatorId) {
            payouts.push(payout);
          }
        }
      }

      return payouts;
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements:', error);
      return [];
    }
  }

  /**
   * Ajoute un avis
   */
  async addReview(
    contentId: string,
    buyerId: string,
    buyerName: string,
    rating: number,
    comment: string
  ): Promise<CreatorReview> {
    const review: CreatorReview = {
      id: `review-${Date.now()}`,
      contentId,
      buyerId,
      buyerName,
      rating,
      comment,
      helpful: 0,
      createdAt: Date.now(),
    };

    await AsyncStorage.setItem(`review-${review.id}`, JSON.stringify(review));

    // Mettre à jour la note du contenu
    const content = await AsyncStorage.getItem(`content-${contentId}`);
    if (content) {
      const parsedContent = JSON.parse(content);
      const reviews = await this.getContentReviews(contentId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0) + rating;
      parsedContent.rating = totalRating / (reviews.length + 1);
      parsedContent.reviews = reviews.length + 1;
      await AsyncStorage.setItem(`content-${contentId}`, JSON.stringify(parsedContent));
    }

    return review;
  }

  /**
   * Récupère les avis d'un contenu
   */
  async getContentReviews(contentId: string): Promise<CreatorReview[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const reviewKeys = keys.filter(k => k.startsWith('review-'));

      const reviews: CreatorReview[] = [];
      for (const key of reviewKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const review = JSON.parse(stored);
          if (review.contentId === contentId) {
            reviews.push(review);
          }
        }
      }

      return reviews;
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
      return [];
    }
  }

  /**
   * Crée une notification créateur
   */
  async createNotification(
    creatorId: string,
    type: CreatorNotification['type'],
    title: string,
    message: string,
    relatedId?: string
  ): Promise<CreatorNotification> {
    const notification: CreatorNotification = {
      id: `notif-${Date.now()}`,
      creatorId,
      type,
      title,
      message,
      relatedId,
      read: false,
      createdAt: Date.now(),
    };

    await AsyncStorage.setItem(`creatorNotif-${notification.id}`, JSON.stringify(notification));
    return notification;
  }

  /**
   * Récupère les notifications du créateur
   */
  async getCreatorNotifications(creatorId: string): Promise<CreatorNotification[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const notifKeys = keys.filter(k => k.startsWith('creatorNotif-'));

      const notifications: CreatorNotification[] = [];
      for (const key of notifKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const notif = JSON.parse(stored);
          if (notif.creatorId === creatorId) {
            notifications.push(notif);
          }
        }
      }

      return notifications.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
  }
}

// Instance globale
const creatorDashboard = new CreatorDashboardManager();

export default creatorDashboard;

/**
 * Crée un profil créateur
 */
export async function createCreatorProfile(
  userId: string,
  name: string,
  bio: string,
  specialties: string[]
): Promise<CreatorProfile> {
  return creatorDashboard.createCreatorProfile(userId, name, bio, specialties);
}

/**
 * Récupère le profil créateur
 */
export async function getCreatorProfile(userId: string): Promise<CreatorProfile | null> {
  return creatorDashboard.getCreatorProfile(userId);
}

/**
 * Met à jour le profil créateur
 */
export async function updateCreatorProfile(
  userId: string,
  updates: Partial<CreatorProfile>
): Promise<void> {
  return creatorDashboard.updateCreatorProfile(userId, updates);
}

/**
 * Crée un contenu
 */
export async function createContent(
  creatorId: string,
  title: string,
  description: string,
  category: 'course' | 'template' | 'resource' | 'coaching',
  price: number,
  imageUrl: string,
  level?: 'beginner' | 'intermediate' | 'advanced'
): Promise<CreatorContent> {
  return creatorDashboard.createContent(creatorId, title, description, category, price, imageUrl, level);
}

/**
 * Récupère le contenu d'un créateur
 */
export async function getCreatorContent(creatorId: string): Promise<CreatorContent[]> {
  return creatorDashboard.getCreatorContent(creatorId);
}

/**
 * Publie un contenu
 */
export async function publishContent(contentId: string): Promise<void> {
  return creatorDashboard.publishContent(contentId);
}

/**
 * Récupère les statistiques du créateur
 */
export async function getCreatorStats(creatorId: string): Promise<CreatorStats> {
  return creatorDashboard.getCreatorStats(creatorId);
}

/**
 * Crée une demande de paiement
 */
export async function requestPayout(
  creatorId: string,
  amount: number,
  bankAccount: string
): Promise<CreatorPayout> {
  return creatorDashboard.requestPayout(creatorId, amount, bankAccount);
}

/**
 * Récupère les paiements du créateur
 */
export async function getCreatorPayouts(creatorId: string): Promise<CreatorPayout[]> {
  return creatorDashboard.getCreatorPayouts(creatorId);
}

/**
 * Ajoute un avis
 */
export async function addReview(
  contentId: string,
  buyerId: string,
  buyerName: string,
  rating: number,
  comment: string
): Promise<CreatorReview> {
  return creatorDashboard.addReview(contentId, buyerId, buyerName, rating, comment);
}

/**
 * Récupère les avis d'un contenu
 */
export async function getContentReviews(contentId: string): Promise<CreatorReview[]> {
  return creatorDashboard.getContentReviews(contentId);
}

/**
 * Crée une notification créateur
 */
export async function createCreatorNotification(
  creatorId: string,
  type: CreatorNotification['type'],
  title: string,
  message: string,
  relatedId?: string
): Promise<CreatorNotification> {
  return creatorDashboard.createNotification(creatorId, type, title, message, relatedId);
}

/**
 * Récupère les notifications du créateur
 */
export async function getCreatorNotifications(creatorId: string): Promise<CreatorNotification[]> {
  return creatorDashboard.getCreatorNotifications(creatorId);
}
