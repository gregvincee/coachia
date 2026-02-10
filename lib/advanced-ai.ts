/**
 * Service d'IA avancée avec prompts contextuels et recommandations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ContextualPrompt,
  AIResponse,
  SentimentAnalysis,
  QualityScore,
  UserLearningProfile,
  MLRecommendation,
  PerformanceMetrics,
  AIInsight,
  LearningPath,
  Milestone,
  Task,
} from './types-advanced-ai';

/**
 * Crée un prompt contextuel
 */
export function createContextualPrompt(
  skillId: string,
  title: string,
  template: string,
  category: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  difficulty: number = 5
): ContextualPrompt {
  return {
    id: `prompt-${Date.now()}`,
    skillId,
    title,
    description: '',
    category,
    difficulty,
    template,
    variables: [],
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Analyse le sentiment d'une réponse
 */
export function analyzeSentiment(text: string): SentimentAnalysis {
  const positiveWords = ['excellent', 'super', 'génial', 'parfait', 'bravo', 'merci', 'oui', 'bien'];
  const negativeWords = ['mauvais', 'difficile', 'impossible', 'non', 'problème', 'erreur', 'frustration'];

  let score = 0;
  let positiveCount = 0;
  let negativeCount = 0;

  const lowerText = text.toLowerCase();

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) {
      positiveCount++;
      score += 0.1;
    }
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) {
      negativeCount++;
      score -= 0.1;
    }
  });

  score = Math.max(-1, Math.min(1, score));

  return {
    score,
    emotion: score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral',
    confidence: Math.min(1, (positiveCount + negativeCount) * 0.2),
    keywords: [...positiveWords.filter(w => lowerText.includes(w)), ...negativeWords.filter(w => lowerText.includes(w))],
  };
}

/**
 * Évalue la qualité d'une réponse IA
 */
export function evaluateQuality(userInput: string, aiOutput: string): QualityScore {
  const relevance = Math.min(1, aiOutput.length / 500); // Plus long = plus pertinent
  const clarity = aiOutput.split('.').length > 2 ? 0.8 : 0.6; // Phrases courtes = plus clair
  const helpfulness = aiOutput.includes('?') ? 0.7 : 0.9; // Pas de questions = plus utile

  const overall = (relevance + clarity + helpfulness) / 3;

  return {
    relevance,
    clarity,
    helpfulness,
    overall,
    suggestions: [
      relevance < 0.5 ? 'Développez votre réponse' : '',
      clarity < 0.5 ? 'Simplifiez votre langage' : '',
      helpfulness < 0.5 ? 'Soyez plus direct' : '',
    ].filter(s => s),
  };
}

/**
 * Crée une réponse IA
 */
export function createAIResponse(
  promptId: string,
  userInput: string,
  aiOutput: string
): AIResponse {
  const sentiment = analyzeSentiment(userInput + ' ' + aiOutput);
  const quality = evaluateQuality(userInput, aiOutput);

  return {
    id: `response-${Date.now()}`,
    promptId,
    userInput,
    aiOutput,
    sentiment,
    quality,
    timestamp: Date.now(),
    duration: Math.random() * 5000 + 1000, // 1-6 secondes
  };
}

/**
 * Crée un profil d'apprentissage utilisateur
 */
export function createUserLearningProfile(userId: string): UserLearningProfile {
  return {
    userId,
    skillProficiencies: {},
    learningStyle: {
      visual: 0.3,
      auditory: 0.3,
      readingWriting: 0.2,
      kinesthetic: 0.2,
      pace: 'normal',
      preferredFormat: 'mixed',
    },
    preferredDifficulty: 5,
    averageSentiment: 0,
    engagementLevel: 0.5,
    lastUpdated: Date.now(),
  };
}

/**
 * Met à jour le profil d'apprentissage
 */
export function updateLearningProfile(
  profile: UserLearningProfile,
  skillId: string,
  score: number,
  sentiment: number
): UserLearningProfile {
  const updated = { ...profile };

  if (!updated.skillProficiencies[skillId]) {
    updated.skillProficiencies[skillId] = {
      skillId,
      level: 1,
      xp: 0,
      sessionsCompleted: 0,
      averageScore: 0,
      lastPracticed: Date.now(),
      trend: 'stable',
    };
  }

  const prof = updated.skillProficiencies[skillId];
  prof.sessionsCompleted++;
  prof.averageScore = (prof.averageScore + score) / 2;
  prof.xp += Math.floor(score / 10);
  prof.level = Math.floor(prof.xp / 100) + 1;
  prof.lastPracticed = Date.now();

  // Calculer la tendance
  if (score > prof.averageScore) {
    prof.trend = 'improving';
  } else if (score < prof.averageScore - 10) {
    prof.trend = 'declining';
  } else {
    prof.trend = 'stable';
  }

  updated.averageSentiment = (updated.averageSentiment + sentiment) / 2;
  updated.engagementLevel = Math.min(1, updated.engagementLevel + 0.05);
  updated.lastUpdated = Date.now();

  return updated;
}

/**
 * Génère des recommandations ML
 */
export function generateMLRecommendations(
  userId: string,
  profile: UserLearningProfile,
  count: number = 5
): MLRecommendation[] {
  const recommendations: MLRecommendation[] = [];

  // Recommander les compétences faibles
  Object.entries(profile.skillProficiencies).forEach(([skillId, prof]) => {
    if (prof.trend === 'declining' && prof.averageScore < 60) {
      recommendations.push({
        id: `rec-${Date.now()}-${skillId}`,
        userId,
        type: 'skill',
        targetId: skillId,
        title: `Améliorer ${skillId}`,
        description: `Votre score dans ${skillId} a baissé. Pratiquez davantage pour progresser.`,
        score: 0.9,
        reason: 'Tendance déclinante détectée',
        createdAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 jours
      });
    }
  });

  // Recommander les défis appropriés
  const avgLevel = Object.values(profile.skillProficiencies).reduce((sum, p) => sum + p.level, 0) / Math.max(1, Object.keys(profile.skillProficiencies).length);
  recommendations.push({
    id: `rec-${Date.now()}-challenge`,
    userId,
    type: 'challenge',
    targetId: `challenge-level-${Math.round(avgLevel)}`,
    title: 'Nouveau défi disponible',
    description: `Un défi de niveau ${Math.round(avgLevel)} est adapté à votre profil.`,
    score: 0.8,
    reason: 'Niveau de compétence détecté',
    createdAt: Date.now(),
    expiresAt: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 jours
  });

  return recommendations.slice(0, count);
}

/**
 * Crée un chemin d'apprentissage
 */
export function createLearningPath(
  userId: string,
  skillId: string,
  durationWeeks: number = 4
): LearningPath {
  const startDate = Date.now();
  const estimatedEndDate = startDate + durationWeeks * 7 * 24 * 60 * 60 * 1000;

  const milestones: Milestone[] = [];

  for (let i = 0; i < durationWeeks; i++) {
    const tasks: Task[] = [
      {
        id: `task-${i}-1`,
        title: `Exercice ${i + 1}.1`,
        description: `Pratiquez les concepts de base`,
        type: 'exercise',
        completed: false,
        estimatedDuration: 30,
      },
      {
        id: `task-${i}-2`,
        title: `Défi ${i + 1}`,
        description: `Appliquez vos connaissances`,
        type: 'challenge',
        completed: false,
        estimatedDuration: 45,
      },
      {
        id: `task-${i}-3`,
        title: `Révision ${i + 1}`,
        description: `Consolidez votre apprentissage`,
        type: 'review',
        completed: false,
        estimatedDuration: 20,
      },
    ];

    milestones.push({
      id: `milestone-${i}`,
      title: `Semaine ${i + 1}`,
      description: `Étape ${i + 1} du parcours`,
      targetDate: startDate + (i + 1) * 7 * 24 * 60 * 60 * 1000,
      completed: false,
      tasks,
    });
  }

  return {
    id: `path-${Date.now()}`,
    userId,
    skillId,
    startDate,
    estimatedEndDate,
    milestones,
    progress: 0,
    status: 'active',
  };
}

/**
 * Génère des insights IA
 */
export function generateAIInsights(
  userId: string,
  profile: UserLearningProfile,
  metrics: PerformanceMetrics
): AIInsight[] {
  const insights: AIInsight[] = [];

  // Insight sur les forces
  const strengths = Object.entries(profile.skillProficiencies)
    .filter(([_, prof]) => prof.averageScore > 80)
    .map(([skillId, _]) => skillId);

  if (strengths.length > 0) {
    insights.push({
      id: `insight-${Date.now()}-strength`,
      userId,
      type: 'strength',
      title: 'Vos points forts',
      description: `Vous excellez dans ${strengths.join(', ')}. Continuez à pratiquer !`,
      actionItems: ['Partager vos connaissances', 'Aider d\'autres utilisateurs'],
      priority: 'medium',
      timestamp: Date.now(),
    });
  }

  // Insight sur les faiblesses
  const weaknesses = Object.entries(profile.skillProficiencies)
    .filter(([_, prof]) => prof.averageScore < 50)
    .map(([skillId, _]) => skillId);

  if (weaknesses.length > 0) {
    insights.push({
      id: `insight-${Date.now()}-weakness`,
      userId,
      type: 'weakness',
      title: 'Domaines à améliorer',
      description: `Concentrez-vous sur ${weaknesses.join(', ')} pour progresser.`,
      actionItems: ['Pratiquer régulièrement', 'Demander de l\'aide', 'Réviser les bases'],
      priority: 'high',
      timestamp: Date.now(),
    });
  }

  // Insight sur les tendances
  if (metrics.improvementRate > 10) {
    insights.push({
      id: `insight-${Date.now()}-trend`,
      userId,
      type: 'trend',
      title: 'Progression rapide',
      description: `Vous progressez de ${metrics.improvementRate.toFixed(1)}% par semaine. Excellent !`,
      actionItems: ['Augmenter la difficulté', 'Relever de nouveaux défis'],
      priority: 'low',
      timestamp: Date.now(),
    });
  }

  return insights;
}

/**
 * Sauvegarde le profil d'apprentissage
 */
export async function saveLearningProfile(profile: UserLearningProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(`learningProfile-${profile.userId}`, JSON.stringify(profile));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du profil:', error);
  }
}

/**
 * Récupère le profil d'apprentissage
 */
export async function getLearningProfile(userId: string): Promise<UserLearningProfile | null> {
  try {
    const stored = await AsyncStorage.getItem(`learningProfile-${userId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
}

/**
 * Sauvegarde les recommandations
 */
export async function saveRecommendations(userId: string, recommendations: MLRecommendation[]): Promise<void> {
  try {
    await AsyncStorage.setItem(`recommendations-${userId}`, JSON.stringify(recommendations));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des recommandations:', error);
  }
}

/**
 * Récupère les recommandations
 */
export async function getRecommendations(userId: string): Promise<MLRecommendation[]> {
  try {
    const stored = await AsyncStorage.getItem(`recommendations-${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des recommandations:', error);
    return [];
  }
}

/**
 * Sauvegarde le chemin d'apprentissage
 */
export async function saveLearningPath(path: LearningPath): Promise<void> {
  try {
    await AsyncStorage.setItem(`learningPath-${path.id}`, JSON.stringify(path));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du chemin:', error);
  }
}

/**
 * Récupère le chemin d'apprentissage
 */
export async function getLearningPath(pathId: string): Promise<LearningPath | null> {
  try {
    const stored = await AsyncStorage.getItem(`learningPath-${pathId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du chemin:', error);
    return null;
  }
}
