/**
 * Données statiques pour l'application CoachIA
 */

import type { Skill, Badge } from './types';

export const SKILLS: Skill[] = [
  {
    id: 'public-speaking',
    name: 'Prise de parole',
    icon: 'mic',
    description: 'Développez votre aisance à l\'oral et gérez votre trac',
    category: 'communication',
    color: '#6366F1',
  },
  {
    id: 'creative-writing',
    name: 'Écriture créative',
    icon: 'edit',
    description: 'Libérez votre créativité et améliorez votre style',
    category: 'creativity',
    color: '#8B5CF6',
  },
  {
    id: 'productivity',
    name: 'Productivité',
    icon: 'bolt',
    description: 'Optimisez votre temps et vos méthodes de travail',
    category: 'efficiency',
    color: '#F59E0B',
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: 'chat-bubble',
    description: 'Améliorez vos relations interpersonnelles',
    category: 'communication',
    color: '#10B981',
  },
  {
    id: 'leadership',
    name: 'Leadership',
    icon: 'star',
    description: 'Développez votre capacité à inspirer et guider',
    category: 'management',
    color: '#EF4444',
  },
  {
    id: 'time-management',
    name: 'Gestion du temps',
    icon: 'schedule',
    description: 'Maîtrisez votre emploi du temps et vos priorités',
    category: 'efficiency',
    color: '#3B82F6',
  },
];

export const BADGES: Badge[] = [
  {
    id: 'first-step',
    name: 'Premier pas',
    description: 'Complétez votre première session de coaching',
    icon: '🎯',
    condition: 'Compléter 1 session',
    unlocked: false,
    category: 'bronze',
  },
  {
    id: 'chatty',
    name: 'Bavard',
    description: 'Envoyez 50 messages au coach IA',
    icon: '💬',
    condition: 'Envoyer 50 messages',
    unlocked: false,
    category: 'silver',
  },
  {
    id: 'consistent',
    name: 'Assidu',
    description: 'Maintenez un streak de 7 jours consécutifs',
    icon: '🔥',
    condition: 'Streak de 7 jours',
    unlocked: false,
    category: 'gold',
  },
  {
    id: 'versatile',
    name: 'Polyvalent',
    description: 'Essayez 3 compétences différentes',
    icon: '🎨',
    condition: 'Essayer 3 compétences',
    unlocked: false,
    category: 'silver',
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Atteignez le niveau 5 dans une compétence',
    icon: '🏆',
    condition: 'Niveau 5 dans une compétence',
    unlocked: false,
    category: 'gold',
  },
  {
    id: 'marathoner',
    name: 'Marathonien',
    description: 'Complétez 30 sessions de coaching',
    icon: '🏃',
    condition: '30 sessions complétées',
    unlocked: false,
    category: 'platinum',
  },
  {
    id: 'night-owl',
    name: 'Noctambule',
    description: 'Faites une session après 22h',
    icon: '🦉',
    condition: 'Session après 22h',
    unlocked: false,
    category: 'bronze',
  },
  {
    id: 'early-bird',
    name: 'Matinal',
    description: 'Faites une session avant 7h',
    icon: '🌅',
    condition: 'Session avant 7h',
    unlocked: false,
    category: 'bronze',
  },
];

// Prompts système pour chaque compétence
export const SKILL_PROMPTS: Record<string, string> = {
  'public-speaking': `Tu es un coach expert en prise de parole en public. Ton rôle est d'aider l'utilisateur à développer son aisance à l'oral, gérer son trac et améliorer sa communication. 

Propose des exercices pratiques, des techniques de respiration, des conseils de posture et de gestion du stress. Sois encourageant, bienveillant et concret. Adapte tes conseils au niveau et aux besoins spécifiques de l'utilisateur.

Fournis toujours 2-3 suggestions de réponses courtes pour faciliter la conversation.`,

  'creative-writing': `Tu es un mentor en écriture créative passionné. Ton rôle est d'aider l'utilisateur à libérer sa créativité, améliorer son style d'écriture et surmonter le syndrome de la page blanche.

Propose des exercices d'écriture stimulants, des techniques narratives, des analyses de style et de l'inspiration. Sois encourageant et constructif dans tes retours. Adapte tes conseils au genre d'écriture qui intéresse l'utilisateur.

Fournis toujours 2-3 suggestions de réponses courtes pour faciliter la conversation.`,

  'productivity': `Tu es un coach en productivité expérimenté. Ton rôle est d'aider l'utilisateur à optimiser son temps, améliorer ses méthodes de travail et atteindre ses objectifs efficacement.

Propose des techniques comme Pomodoro, GTD, Time Blocking, des outils de gestion de tâches et des stratégies de priorisation. Sois pragmatique et orienté résultats. Adapte tes conseils au contexte professionnel ou personnel de l'utilisateur.

Fournis toujours 2-3 suggestions de réponses courtes pour faciliter la conversation.`,

  'communication': `Tu es un coach en communication interpersonnelle. Ton rôle est d'aider l'utilisateur à améliorer ses relations, développer son écoute active et communiquer avec assertivité.

Propose des techniques de communication non violente, d'écoute active, de gestion de conflits et d'empathie. Sois empathique et constructif. Adapte tes conseils aux situations relationnelles spécifiques de l'utilisateur.

Fournis toujours 2-3 suggestions de réponses courtes pour faciliter la conversation.`,

  'leadership': `Tu es un coach en leadership inspirant. Ton rôle est d'aider l'utilisateur à développer sa capacité à guider, inspirer et motiver les autres.

Propose des techniques de management, de prise de décision, de gestion d'équipe et de développement de la vision. Sois inspirant et pragmatique. Adapte tes conseils au contexte de leadership de l'utilisateur (équipe, projet, organisation).

Fournis toujours 2-3 suggestions de réponses courtes pour faciliter la conversation.`,

  'time-management': `Tu es un coach en gestion du temps expert. Ton rôle est d'aider l'utilisateur à maîtriser son emploi du temps, définir ses priorités et éliminer les distractions.

Propose des techniques de planification, de priorisation (matrice Eisenhower), de gestion des interruptions et d'équilibre vie pro/perso. Sois structuré et orienté action. Adapte tes conseils aux contraintes de temps de l'utilisateur.

Fournis toujours 2-3 suggestions de réponses courtes pour faciliter la conversation.`,
};

// Calcul du XP nécessaire pour chaque niveau
export function getXPForLevel(level: number): number {
  return level * 200;
}

// Calcul du niveau à partir du XP total
export function getLevelFromXP(xp: number): number {
  let level = 1;
  let totalXP = 0;
  while (totalXP + getXPForLevel(level) <= xp) {
    totalXP += getXPForLevel(level);
    level++;
  }
  return level;
}

// Calcul du XP restant pour le prochain niveau
export function getXPToNextLevel(xp: number, level: number): number {
  const xpForCurrentLevel = getXPForLevel(level);
  const xpInCurrentLevel = xp - getXPForPreviousLevels(level);
  return xpForCurrentLevel - xpInCurrentLevel;
}

// Calcul du XP total accumulé jusqu'au niveau précédent
export function getXPForPreviousLevels(level: number): number {
  let totalXP = 0;
  for (let i = 1; i < level; i++) {
    totalXP += getXPForLevel(i);
  }
  return totalXP;
}

// Calcul du pourcentage de progression dans le niveau actuel
export function getProgressInLevel(xp: number, level: number): number {
  const xpInCurrentLevel = xp - getXPForPreviousLevels(level);
  const xpForCurrentLevel = getXPForLevel(level);
  return (xpInCurrentLevel / xpForCurrentLevel) * 100;
}
