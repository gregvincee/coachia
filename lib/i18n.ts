/**
 * Système de multi-langue (i18n) pour CoachIA
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'fr' | 'en' | 'es' | 'de' | 'pt' | 'ja' | 'zh';

export interface Translation {
  [key: string]: string | Translation;
}

export interface LanguagePack {
  code: Language;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  translations: Translation;
}

// Traductions en français
const frTranslations: Translation = {
  common: {
    app_name: 'CoachIA',
    welcome: 'Bienvenue',
    continue: 'Continuer',
    skip: 'Passer',
    back: 'Retour',
    next: 'Suivant',
    save: 'Enregistrer',
    delete: 'Supprimer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Avertissement',
    info: 'Information',
  },
  home: {
    title: 'Accueil',
    greeting: 'Bonjour',
    select_skill: 'Sélectionnez une compétence',
    start_session: 'Commencer une session',
    your_progress: 'Votre progression',
    recent_sessions: 'Sessions récentes',
  },
  skills: {
    title: 'Compétences',
    public_speaking: 'Prise de parole',
    writing: 'Écriture',
    productivity: 'Productivité',
    leadership: 'Leadership',
    communication: 'Communication',
    negotiation: 'Négociation',
    level: 'Niveau',
    xp: 'XP',
    sessions: 'Sessions',
  },
  coaching: {
    title: 'Session de coaching',
    ai_coach: 'Coach IA',
    your_response: 'Votre réponse',
    send: 'Envoyer',
    feedback: 'Retour',
    score: 'Score',
    tips: 'Conseils',
    practice_again: 'Pratiquer à nouveau',
  },
  gamification: {
    title: 'Gamification',
    level: 'Niveau',
    xp: 'Points d\'expérience',
    badges: 'Badges',
    streak: 'Série',
    days: 'jours',
    unlock_badge: 'Badge débloqué !',
    level_up: 'Niveau augmenté !',
  },
  profile: {
    title: 'Profil',
    my_profile: 'Mon profil',
    statistics: 'Statistiques',
    achievements: 'Réalisations',
    settings: 'Paramètres',
    edit_profile: 'Modifier le profil',
    total_xp: 'XP total',
    sessions_completed: 'Sessions complétées',
    skills_practiced: 'Compétences pratiquées',
  },
  challenges: {
    title: 'Défis',
    weekly_challenges: 'Défis hebdomadaires',
    difficulty: 'Difficulté',
    reward: 'Récompense',
    progress: 'Progression',
    complete_challenge: 'Compléter le défi',
    challenge_completed: 'Défi complété !',
  },
  community: {
    title: 'Communauté',
    leaderboard: 'Classement',
    friends: 'Amis',
    referral: 'Parrainage',
    invite_friends: 'Inviter des amis',
    referral_code: 'Code de parrainage',
    share: 'Partager',
  },
  premium: {
    title: 'Premium',
    upgrade: 'Passer à Premium',
    features: 'Fonctionnalités',
    unlimited_sessions: 'Sessions illimitées',
    advanced_analytics: 'Analytics avancées',
    priority_support: 'Support prioritaire',
    monthly: 'Mensuel',
    yearly: 'Annuel',
    price: 'Prix',
  },
  settings: {
    title: 'Paramètres',
    language: 'Langue',
    theme: 'Thème',
    notifications: 'Notifications',
    privacy: 'Confidentialité',
    about: 'À propos',
    version: 'Version',
    feedback: 'Retour',
  },
};

// Traductions en anglais
const enTranslations: Translation = {
  common: {
    app_name: 'CoachIA',
    welcome: 'Welcome',
    continue: 'Continue',
    skip: 'Skip',
    back: 'Back',
    next: 'Next',
    save: 'Save',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
  },
  home: {
    title: 'Home',
    greeting: 'Hello',
    select_skill: 'Select a skill',
    start_session: 'Start a session',
    your_progress: 'Your progress',
    recent_sessions: 'Recent sessions',
  },
  skills: {
    title: 'Skills',
    public_speaking: 'Public Speaking',
    writing: 'Writing',
    productivity: 'Productivity',
    leadership: 'Leadership',
    communication: 'Communication',
    negotiation: 'Negotiation',
    level: 'Level',
    xp: 'XP',
    sessions: 'Sessions',
  },
  coaching: {
    title: 'Coaching Session',
    ai_coach: 'AI Coach',
    your_response: 'Your response',
    send: 'Send',
    feedback: 'Feedback',
    score: 'Score',
    tips: 'Tips',
    practice_again: 'Practice again',
  },
  gamification: {
    title: 'Gamification',
    level: 'Level',
    xp: 'Experience Points',
    badges: 'Badges',
    streak: 'Streak',
    days: 'days',
    unlock_badge: 'Badge unlocked!',
    level_up: 'Level up!',
  },
  profile: {
    title: 'Profile',
    my_profile: 'My profile',
    statistics: 'Statistics',
    achievements: 'Achievements',
    settings: 'Settings',
    edit_profile: 'Edit profile',
    total_xp: 'Total XP',
    sessions_completed: 'Sessions completed',
    skills_practiced: 'Skills practiced',
  },
  challenges: {
    title: 'Challenges',
    weekly_challenges: 'Weekly challenges',
    difficulty: 'Difficulty',
    reward: 'Reward',
    progress: 'Progress',
    complete_challenge: 'Complete challenge',
    challenge_completed: 'Challenge completed!',
  },
  community: {
    title: 'Community',
    leaderboard: 'Leaderboard',
    friends: 'Friends',
    referral: 'Referral',
    invite_friends: 'Invite friends',
    referral_code: 'Referral code',
    share: 'Share',
  },
  premium: {
    title: 'Premium',
    upgrade: 'Upgrade to Premium',
    features: 'Features',
    unlimited_sessions: 'Unlimited sessions',
    advanced_analytics: 'Advanced analytics',
    priority_support: 'Priority support',
    monthly: 'Monthly',
    yearly: 'Yearly',
    price: 'Price',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    privacy: 'Privacy',
    about: 'About',
    version: 'Version',
    feedback: 'Feedback',
  },
};

// Packs de langues disponibles
const languagePacks: Record<Language, LanguagePack> = {
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    translations: frTranslations,
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    translations: enTranslations,
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    translations: enTranslations, // Placeholder
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    translations: enTranslations, // Placeholder
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr',
    translations: enTranslations, // Placeholder
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    translations: enTranslations, // Placeholder
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
    translations: enTranslations, // Placeholder
  },
};

class I18nManager {
  private currentLanguage: Language = 'fr';

  /**
   * Initialise le gestionnaire i18n
   */
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('language');
      if (stored) {
        this.currentLanguage = stored as Language;
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation i18n:', error);
    }
  }

  /**
   * Change la langue
   */
  async setLanguage(language: Language): Promise<void> {
    if (languagePacks[language]) {
      this.currentLanguage = language;
      await AsyncStorage.setItem('language', language);
    }
  }

  /**
   * Obtient la langue actuelle
   */
  getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Obtient une traduction
   */
  t(key: string, defaultValue?: string): string {
    const keys = key.split('.');
    let value: any = languagePacks[this.currentLanguage].translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue || key;
      }
    }

    return typeof value === 'string' ? value : key;
  }

  /**
   * Obtient les langues disponibles
   */
  getAvailableLanguages(): LanguagePack[] {
    return Object.values(languagePacks);
  }

  /**
   * Obtient le pack de langue actuel
   */
  getCurrentLanguagePack(): LanguagePack {
    return languagePacks[this.currentLanguage];
  }

  /**
   * Formate une date selon la langue
   */
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString(this.currentLanguage, options);
  }

  /**
   * Formate un nombre selon la langue
   */
  formatNumber(num: number): string {
    return num.toLocaleString(this.currentLanguage);
  }

  /**
   * Formate une devise selon la langue
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency,
    }).format(amount);
  }
}

// Instance globale
const i18n = new I18nManager();

/**
 * Initialise i18n
 */
export async function initializeI18n(): Promise<void> {
  await i18n.initialize();
}

/**
 * Change la langue
 */
export async function setLanguage(language: Language): Promise<void> {
  await i18n.setLanguage(language);
}

/**
 * Obtient une traduction
 */
export function t(key: string, defaultValue?: string): string {
  return i18n.t(key, defaultValue);
}

/**
 * Obtient la langue actuelle
 */
export function getCurrentLanguage(): Language {
  return i18n.getLanguage();
}

/**
 * Obtient les langues disponibles
 */
export function getAvailableLanguages(): LanguagePack[] {
  return i18n.getAvailableLanguages();
}

/**
 * Formate une date
 */
export function formatDate(date: Date): string {
  return i18n.formatDate(date);
}

/**
 * Formate un nombre
 */
export function formatNumber(num: number): string {
  return i18n.formatNumber(num);
}

/**
 * Formate une devise
 */
export function formatCurrency(amount: number, currency?: string): string {
  return i18n.formatCurrency(amount, currency);
}

/**
 * Hook React pour utiliser i18n
 */
export function useI18n() {
  return {
    t,
    language: getCurrentLanguage(),
    setLanguage,
    formatDate,
    formatNumber,
    formatCurrency,
  };
}
