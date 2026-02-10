/**
 * Service de coaching en direct
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  LiveCoachingSession,
  CoachProfile,
  CoachingBooking,
  CoachingReview,
  CoachingPayment,
  CoachingStats,
  LiveCoachingMessage,
  CoachingResource,
} from './types-live-coaching';

class LiveCoachingManager {
  /**
   * Crée un profil de coach
   */
  async createCoachProfile(
    userId: string,
    name: string,
    bio: string,
    specialties: string[],
    hourlyRate: number
  ): Promise<CoachProfile> {
    const profile: CoachProfile = {
      id: `coach-${Date.now()}`,
      userId,
      name,
      bio,
      avatar: '',
      specialties,
      hourlyRate,
      availability: [],
      rating: 0,
      reviewCount: 0,
      totalSessions: 0,
      responseTime: 60,
      verified: false,
      certifications: [],
    };

    await AsyncStorage.setItem(`coachProfile-${userId}`, JSON.stringify(profile));
    return profile;
  }

  /**
   * Récupère le profil du coach
   */
  async getCoachProfile(userId: string): Promise<CoachProfile | null> {
    try {
      const stored = await AsyncStorage.getItem(`coachProfile-${userId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil coach:', error);
      return null;
    }
  }

  /**
   * Crée une session de coaching
   */
  async createCoachingSession(
    coachId: string,
    coachName: string,
    studentId: string,
    skillId: string,
    skillName: string,
    startTime: number,
    duration: number,
    price: number
  ): Promise<LiveCoachingSession> {
    const session: LiveCoachingSession = {
      id: `session-${Date.now()}`,
      coachId,
      coachName,
      studentId,
      skillId,
      skillName,
      status: 'scheduled',
      startTime,
      duration,
      price,
      currency: 'USD',
      createdAt: Date.now(),
    };

    await AsyncStorage.setItem(`coachingSession-${session.id}`, JSON.stringify(session));
    return session;
  }

  /**
   * Récupère les sessions de coaching
   */
  async getCoachingSessions(userId: string, role: 'coach' | 'student'): Promise<LiveCoachingSession[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const sessionKeys = keys.filter(k => k.startsWith('coachingSession-'));

      const sessions: LiveCoachingSession[] = [];
      for (const key of sessionKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const session = JSON.parse(stored);
          if (role === 'coach' && session.coachId === userId) {
            sessions.push(session);
          } else if (role === 'student' && session.studentId === userId) {
            sessions.push(session);
          }
        }
      }

      return sessions;
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error);
      return [];
    }
  }

  /**
   * Démarre une session de coaching
   */
  async startCoachingSession(sessionId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`coachingSession-${sessionId}`);
      if (stored) {
        const session = JSON.parse(stored);
        session.status = 'active';
        await AsyncStorage.setItem(`coachingSession-${sessionId}`, JSON.stringify(session));
      }
    } catch (error) {
      console.error('Erreur lors du démarrage de la session:', error);
    }
  }

  /**
   * Termine une session de coaching
   */
  async endCoachingSession(sessionId: string, notes?: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`coachingSession-${sessionId}`);
      if (stored) {
        const session = JSON.parse(stored);
        session.status = 'completed';
        session.endTime = Date.now();
        if (notes) session.notes = notes;
        await AsyncStorage.setItem(`coachingSession-${sessionId}`, JSON.stringify(session));
      }
    } catch (error) {
      console.error('Erreur lors de la fin de la session:', error);
    }
  }

  /**
   * Crée une demande de coaching
   */
  async createCoachingBooking(
    coachId: string,
    studentId: string,
    skillId: string,
    requestedTime: number,
    message?: string
  ): Promise<CoachingBooking> {
    const booking: CoachingBooking = {
      id: `booking-${Date.now()}`,
      coachId,
      studentId,
      skillId,
      requestedTime,
      status: 'pending',
      message,
      createdAt: Date.now(),
    };

    await AsyncStorage.setItem(`coachingBooking-${booking.id}`, JSON.stringify(booking));
    return booking;
  }

  /**
   * Accepte une demande de coaching
   */
  async acceptCoachingBooking(bookingId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`coachingBooking-${bookingId}`);
      if (stored) {
        const booking = JSON.parse(stored);
        booking.status = 'confirmed';
        booking.respondedAt = Date.now();
        await AsyncStorage.setItem(`coachingBooking-${bookingId}`, JSON.stringify(booking));
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la demande:', error);
    }
  }

  /**
   * Ajoute un avis de coaching
   */
  async addCoachingReview(
    sessionId: string,
    coachId: string,
    studentId: string,
    studentName: string,
    rating: number,
    comment: string
  ): Promise<CoachingReview> {
    const review: CoachingReview = {
      id: `review-${Date.now()}`,
      sessionId,
      coachId,
      studentId,
      studentName,
      rating,
      comment,
      helpful: 0,
      createdAt: Date.now(),
    };

    await AsyncStorage.setItem(`coachingReview-${review.id}`, JSON.stringify(review));

    // Mettre à jour la note du coach
    const coachProfile = await this.getCoachProfile(coachId);
    if (coachProfile) {
      const reviews = await this.getCoachReviews(coachId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0) + rating;
      coachProfile.rating = totalRating / (reviews.length + 1);
      coachProfile.reviewCount = reviews.length + 1;
      await AsyncStorage.setItem(`coachProfile-${coachId}`, JSON.stringify(coachProfile));
    }

    return review;
  }

  /**
   * Récupère les avis d'un coach
   */
  async getCoachReviews(coachId: string): Promise<CoachingReview[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const reviewKeys = keys.filter(k => k.startsWith('coachingReview-'));

      const reviews: CoachingReview[] = [];
      for (const key of reviewKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const review = JSON.parse(stored);
          if (review.coachId === coachId) {
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
   * Crée un paiement de coaching
   */
  async createCoachingPayment(
    sessionId: string,
    coachId: string,
    studentId: string,
    amount: number,
    paymentMethod: string
  ): Promise<CoachingPayment> {
    const payment: CoachingPayment = {
      id: `payment-${Date.now()}`,
      sessionId,
      coachId,
      studentId,
      amount,
      currency: 'USD',
      status: 'completed',
      paymentMethod,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(`coachingPayment-${payment.id}`, JSON.stringify(payment));
    return payment;
  }

  /**
   * Récupère les statistiques du coach
   */
  async getCoachingStats(coachId: string): Promise<CoachingStats> {
    try {
      const sessions = await this.getCoachingSessions(coachId, 'coach');
      const reviews = await this.getCoachReviews(coachId);

      const completedSessions = sessions.filter(s => s.status === 'completed');
      const totalEarnings = completedSessions.reduce((sum, s) => sum + s.price, 0);
      const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

      const thisMonth = new Date();
      const thisMonthSessions = sessions.filter(
        s =>
          new Date(s.startTime).getMonth() === thisMonth.getMonth() &&
          new Date(s.startTime).getFullYear() === thisMonth.getFullYear()
      );

      return {
        coachId,
        totalSessions: completedSessions.length,
        totalEarnings,
        averageRating,
        reviewCount: reviews.length,
        totalStudents: new Set(sessions.map(s => s.studentId)).size,
        thisMonthSessions: thisMonthSessions.length,
        thisMonthEarnings: thisMonthSessions.reduce((sum, s) => sum + s.price, 0),
        responseRate: 100,
        completionRate: sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        coachId,
        totalSessions: 0,
        totalEarnings: 0,
        averageRating: 0,
        reviewCount: 0,
        totalStudents: 0,
        thisMonthSessions: 0,
        thisMonthEarnings: 0,
        responseRate: 0,
        completionRate: 0,
      };
    }
  }

  /**
   * Ajoute un message à une session
   */
  async addSessionMessage(
    sessionId: string,
    senderId: string,
    senderName: string,
    senderRole: 'coach' | 'student',
    message: string
  ): Promise<LiveCoachingMessage> {
    const msg: LiveCoachingMessage = {
      id: `msg-${Date.now()}`,
      sessionId,
      senderId,
      senderName,
      senderRole,
      message,
      timestamp: Date.now(),
      read: false,
    };

    await AsyncStorage.setItem(`coachingMessage-${msg.id}`, JSON.stringify(msg));
    return msg;
  }

  /**
   * Récupère les messages d'une session
   */
  async getSessionMessages(sessionId: string): Promise<LiveCoachingMessage[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const messageKeys = keys.filter(k => k.startsWith('coachingMessage-'));

      const messages: LiveCoachingMessage[] = [];
      for (const key of messageKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const msg = JSON.parse(stored);
          if (msg.sessionId === sessionId) {
            messages.push(msg);
          }
        }
      }

      return messages.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return [];
    }
  }
}

// Instance globale
const liveCoaching = new LiveCoachingManager();

export default liveCoaching;

/**
 * Crée un profil de coach
 */
export async function createCoachProfile(
  userId: string,
  name: string,
  bio: string,
  specialties: string[],
  hourlyRate: number
): Promise<CoachProfile> {
  return liveCoaching.createCoachProfile(userId, name, bio, specialties, hourlyRate);
}

/**
 * Récupère le profil du coach
 */
export async function getCoachProfile(userId: string): Promise<CoachProfile | null> {
  return liveCoaching.getCoachProfile(userId);
}

/**
 * Crée une session de coaching
 */
export async function createCoachingSession(
  coachId: string,
  coachName: string,
  studentId: string,
  skillId: string,
  skillName: string,
  startTime: number,
  duration: number,
  price: number
): Promise<LiveCoachingSession> {
  return liveCoaching.createCoachingSession(coachId, coachName, studentId, skillId, skillName, startTime, duration, price);
}

/**
 * Récupère les sessions de coaching
 */
export async function getCoachingSessions(
  userId: string,
  role: 'coach' | 'student'
): Promise<LiveCoachingSession[]> {
  return liveCoaching.getCoachingSessions(userId, role);
}

/**
 * Démarre une session de coaching
 */
export async function startCoachingSession(sessionId: string): Promise<void> {
  return liveCoaching.startCoachingSession(sessionId);
}

/**
 * Termine une session de coaching
 */
export async function endCoachingSession(sessionId: string, notes?: string): Promise<void> {
  return liveCoaching.endCoachingSession(sessionId, notes);
}

/**
 * Crée une demande de coaching
 */
export async function createCoachingBooking(
  coachId: string,
  studentId: string,
  skillId: string,
  requestedTime: number,
  message?: string
): Promise<CoachingBooking> {
  return liveCoaching.createCoachingBooking(coachId, studentId, skillId, requestedTime, message);
}

/**
 * Accepte une demande de coaching
 */
export async function acceptCoachingBooking(bookingId: string): Promise<void> {
  return liveCoaching.acceptCoachingBooking(bookingId);
}

/**
 * Ajoute un avis de coaching
 */
export async function addCoachingReview(
  sessionId: string,
  coachId: string,
  studentId: string,
  studentName: string,
  rating: number,
  comment: string
): Promise<CoachingReview> {
  return liveCoaching.addCoachingReview(sessionId, coachId, studentId, studentName, rating, comment);
}

/**
 * Récupère les avis d'un coach
 */
export async function getCoachReviews(coachId: string): Promise<CoachingReview[]> {
  return liveCoaching.getCoachReviews(coachId);
}

/**
 * Crée un paiement de coaching
 */
export async function createCoachingPayment(
  sessionId: string,
  coachId: string,
  studentId: string,
  amount: number,
  paymentMethod: string
): Promise<CoachingPayment> {
  return liveCoaching.createCoachingPayment(sessionId, coachId, studentId, amount, paymentMethod);
}

/**
 * Récupère les statistiques du coach
 */
export async function getCoachingStats(coachId: string): Promise<CoachingStats> {
  return liveCoaching.getCoachingStats(coachId);
}

/**
 * Ajoute un message à une session
 */
export async function addSessionMessage(
  sessionId: string,
  senderId: string,
  senderName: string,
  senderRole: 'coach' | 'student',
  message: string
): Promise<LiveCoachingMessage> {
  return liveCoaching.addSessionMessage(sessionId, senderId, senderName, senderRole, message);
}

/**
 * Récupère les messages d'une session
 */
export async function getSessionMessages(sessionId: string): Promise<LiveCoachingMessage[]> {
  return liveCoaching.getSessionMessages(sessionId);
}
