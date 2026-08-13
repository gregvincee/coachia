export type MicroPurchaseCategory = "boost" | "sessions" | "content" | "coaching" | "bundle";

export interface MicroPurchase {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MicroPurchaseCategory;
  icon: string;
  quantity?: number;
  durationDays?: number;
  popular?: boolean;
}

/**
 * Catalogue contrôlé exclusivement côté serveur au moment de créer un paiement.
 * Le client n’envoie jamais de prix, empêchant toute modification du montant.
 */
export const MICRO_PURCHASES_CATALOG = {
  xp_boost_24h: {
    id: "xp_boost_24h",
    name: "Boost XP 24 h",
    description: "Double les XP gagnés pendant une journée.",
    price: 0.99,
    category: "boost",
    icon: "⚡",
    durationDays: 1,
  },
  streak_saver: {
    id: "streak_saver",
    name: "Sauveur de streak",
    description: "Protège une journée oubliée sans casser votre série.",
    price: 1.99,
    category: "boost",
    icon: "🔥",
    quantity: 1,
  },
  daily_challenge: {
    id: "daily_challenge",
    name: "Défi bonus",
    description: "Un défi additionnel et ses récompenses.",
    price: 0.99,
    category: "boost",
    icon: "🎯",
    quantity: 1,
  },
  hint_pack: {
    id: "hint_pack",
    name: "Pack de 5 indices",
    description: "Cinq indices pour débloquer vos défis.",
    price: 1.99,
    category: "boost",
    icon: "💡",
    quantity: 5,
  },
  session_pack_5: {
    id: "session_pack_5",
    name: "Pack de 5 sessions",
    description: "Cinq sessions IA supplémentaires, valables sans abonnement.",
    price: 4.99,
    category: "sessions",
    icon: "📚",
    quantity: 5,
    popular: true,
  },
  session_pack_10: {
    id: "session_pack_10",
    name: "Pack de 10 sessions",
    description: "Dix sessions IA supplémentaires au meilleur prix unitaire.",
    price: 8.99,
    category: "sessions",
    icon: "📘",
    quantity: 10,
  },
  premium_content: {
    id: "premium_content",
    name: "Contenu premium",
    description: "Débloque dix ressources d'apprentissage exclusives.",
    price: 2.99,
    category: "content",
    icon: "✨",
    quantity: 10,
  },
  badge_collection: {
    id: "badge_collection",
    name: "Collection de badges",
    description: "Cinq badges cosmétiques pour personnaliser votre profil.",
    price: 2.99,
    category: "content",
    icon: "🎨",
    quantity: 5,
  },
  skill_mastery_pack: {
    id: "skill_mastery_pack",
    name: "Pack maîtrise",
    description: "Dix sessions et cinq accès défis pour progresser plus vite.",
    price: 4.99,
    category: "sessions",
    icon: "🏆",
    quantity: 15,
  },
  live_coaching_30min: {
    id: "live_coaching_30min",
    name: "Coaching humain — 30 min",
    description: "Réservation d’une séance individuelle avec un coach certifié.",
    price: 9.99,
    category: "coaching",
    icon: "🎓",
    quantity: 30,
  },
  live_coaching_60min: {
    id: "live_coaching_60min",
    name: "Coaching humain — 60 min",
    description: "Une séance approfondie avec un coach certifié.",
    price: 19.99,
    category: "coaching",
    icon: "🧑‍🏫",
    quantity: 60,
  },
  masterclass_access: {
    id: "masterclass_access",
    name: "Pass masterclasses",
    description: "Accès à cinq masterclasses thématiques.",
    price: 14.99,
    category: "content",
    icon: "👑",
    quantity: 5,
  },
  monthly_bundle: {
    id: "monthly_bundle",
    name: "Bundle mensuel",
    description: "Sessions IA et contenu premium pendant 30 jours.",
    price: 7.99,
    category: "bundle",
    icon: "📦",
    durationDays: 30,
    popular: true,
  },
} as const satisfies Record<string, MicroPurchase>;

export type MicroPurchaseId = keyof typeof MICRO_PURCHASES_CATALOG;

export function getMicroPurchase(productId: string) {
  return MICRO_PURCHASES_CATALOG[productId as MicroPurchaseId];
}

export function getMicroPurchasesByCategory(category: MicroPurchaseCategory) {
  return Object.values(MICRO_PURCHASES_CATALOG).filter((purchase) => purchase.category === category);
}

export function getMicroPurchaseCategories() {
  return ["boost", "sessions", "content", "coaching", "bundle"] as const;
}
