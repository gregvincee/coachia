/**
 * Système de sauvegarde et reprise des tâches de développement
 * Permet de continuer le travail avec les 300 crédits quotidiens
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TaskCheckpoint {
  id: string;
  timestamp: number;
  phase: number;
  phaseName: string;
  completedItems: string[];
  pendingItems: string[];
  notes: string;
  creditUsed: number;
  creditRemaining: number;
}

export interface DailyProgress {
  date: string;
  creditAvailable: number;
  creditUsed: number;
  checkpoints: TaskCheckpoint[];
  currentPhase: number;
  estimatedCompletion: string;
}

export interface DevelopmentPlan {
  projectName: string;
  totalPhases: number;
  currentPhase: number;
  completedPhases: number;
  startDate: number;
  estimatedEndDate: number;
  dailyCredits: number;
  totalCreditsUsed: number;
  phases: PhaseInfo[];
}

export interface PhaseInfo {
  id: number;
  name: string;
  description: string;
  estimatedCredits: number;
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: number;
  items: PhaseItem[];
}

export interface PhaseItem {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: number;
  notes?: string;
}

/**
 * Crée un checkpoint de tâche
 */
export function createTaskCheckpoint(
  phase: number,
  phaseName: string,
  completedItems: string[],
  pendingItems: string[],
  creditUsed: number,
  creditRemaining: number,
  notes: string = ''
): TaskCheckpoint {
  return {
    id: `checkpoint-${Date.now()}`,
    timestamp: Date.now(),
    phase,
    phaseName,
    completedItems,
    pendingItems,
    notes,
    creditUsed,
    creditRemaining,
  };
}

/**
 * Sauvegarde un checkpoint
 */
export async function saveTaskCheckpoint(checkpoint: TaskCheckpoint): Promise<void> {
  try {
    const checkpoints = await getTaskCheckpoints();
    checkpoints.push(checkpoint);
    await AsyncStorage.setItem('taskCheckpoints', JSON.stringify(checkpoints));
    console.log(`Checkpoint sauvegardé: Phase ${checkpoint.phase}`);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du checkpoint:', error);
  }
}

/**
 * Récupère tous les checkpoints
 */
export async function getTaskCheckpoints(): Promise<TaskCheckpoint[]> {
  try {
    const stored = await AsyncStorage.getItem('taskCheckpoints');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des checkpoints:', error);
    return [];
  }
}

/**
 * Récupère le dernier checkpoint
 */
export async function getLastCheckpoint(): Promise<TaskCheckpoint | null> {
  try {
    const checkpoints = await getTaskCheckpoints();
    return checkpoints.length > 0 ? checkpoints[checkpoints.length - 1] : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du dernier checkpoint:', error);
    return null;
  }
}

/**
 * Crée un plan de développement
 */
export function createDevelopmentPlan(
  projectName: string,
  phases: PhaseInfo[],
  dailyCredits: number = 300
): DevelopmentPlan {
  const totalCreditsNeeded = phases.reduce((sum, p) => sum + p.estimatedCredits, 0);
  const estimatedDays = Math.ceil(totalCreditsNeeded / dailyCredits);

  return {
    projectName,
    totalPhases: phases.length,
    currentPhase: 1,
    completedPhases: 0,
    startDate: Date.now(),
    estimatedEndDate: Date.now() + estimatedDays * 24 * 60 * 60 * 1000,
    dailyCredits,
    totalCreditsUsed: 0,
    phases,
  };
}

/**
 * Met à jour la progression du plan
 */
export function updatePlanProgress(
  plan: DevelopmentPlan,
  phaseId: number,
  itemId: string,
  completed: boolean,
  creditUsed: number
): DevelopmentPlan {
  const updatedPlan = { ...plan };
  const phase = updatedPlan.phases.find(p => p.id === phaseId);

  if (phase) {
    const item = phase.items.find(i => i.id === itemId);
    if (item) {
      item.completed = completed;
      if (completed) {
        item.completedAt = Date.now();
      }
    }

    // Vérifier si la phase est complétée
    const allItemsCompleted = phase.items.every(i => i.completed);
    if (allItemsCompleted && phase.status !== 'completed') {
      phase.status = 'completed';
      phase.completedAt = Date.now();
      updatedPlan.completedPhases += 1;
    }
  }

  updatedPlan.totalCreditsUsed += creditUsed;
  return updatedPlan;
}

/**
 * Calcule la progression quotidienne
 */
export function calculateDailyProgress(
  plan: DevelopmentPlan,
  creditAvailable: number = 300
): DailyProgress {
  const today = new Date().toISOString().split('T')[0];
  const creditUsedToday = plan.phases
    .filter(p => p.completedAt && new Date(p.completedAt).toISOString().split('T')[0] === today)
    .reduce((sum, p) => sum + p.estimatedCredits, 0);

  const remainingCredits = creditAvailable - creditUsedToday;
  const completionPercentage = (plan.completedPhases / plan.totalPhases) * 100;
  const daysRemaining = Math.ceil((plan.totalPhases - plan.completedPhases) * plan.dailyCredits / creditAvailable);

  return {
    date: today,
    creditAvailable,
    creditUsed: creditUsedToday,
    checkpoints: [],
    currentPhase: plan.currentPhase,
    estimatedCompletion: `${daysRemaining} jours restants (${completionPercentage.toFixed(0)}% complété)`,
  };
}

/**
 * Génère un rapport de progression
 */
export function generateProgressReport(plan: DevelopmentPlan): string {
  const completionPercentage = (plan.completedPhases / plan.totalPhases) * 100;
  const daysElapsed = Math.floor((Date.now() - plan.startDate) / (24 * 60 * 60 * 1000));
  const creditPerDay = plan.totalCreditsUsed / Math.max(1, daysElapsed);

  let report = `
📊 RAPPORT DE PROGRESSION - ${plan.projectName}
═══════════════════════════════════════════

📈 Progression globale
  • Phases complétées: ${plan.completedPhases}/${plan.totalPhases} (${completionPercentage.toFixed(0)}%)
  • Crédits utilisés: ${plan.totalCreditsUsed}
  • Crédits par jour: ${creditPerDay.toFixed(0)}
  • Jours écoulés: ${daysElapsed}

🎯 Phases
`;

  plan.phases.forEach(phase => {
    const itemsCompleted = phase.items.filter(i => i.completed).length;
    const itemsTotal = phase.items.length;
    const itemPercentage = (itemsCompleted / itemsTotal) * 100;
    
    report += `
  ${phase.id}. ${phase.name} [${phase.status}]
     • Progression: ${itemsCompleted}/${itemsTotal} (${itemPercentage.toFixed(0)}%)
     • Crédits estimés: ${phase.estimatedCredits}
`;
  });

  return report;
}

/**
 * Sauvegarde le plan de développement
 */
export async function saveDevelopmentPlan(plan: DevelopmentPlan): Promise<void> {
  try {
    await AsyncStorage.setItem('developmentPlan', JSON.stringify(plan));
    console.log('Plan de développement sauvegardé');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du plan:', error);
  }
}

/**
 * Récupère le plan de développement
 */
export async function getDevelopmentPlan(): Promise<DevelopmentPlan | null> {
  try {
    const stored = await AsyncStorage.getItem('developmentPlan');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du plan:', error);
    return null;
  }
}

/**
 * Crée un rappel quotidien
 */
export function createDailyReminder(plan: DevelopmentPlan): string {
  const today = new Date().toISOString().split('T')[0];
  const nextPhase = plan.phases.find(p => p.status === 'pending');
  
  if (!nextPhase) {
    return `✅ Toutes les phases sont complétées ! Projet ${plan.projectName} terminé.`;
  }

  const pendingItems = nextPhase.items.filter(i => !i.completed);
  const reminder = `
📅 RAPPEL QUOTIDIEN - ${today}
═══════════════════════════════════════════

🎯 Prochaine phase: ${nextPhase.name}
📝 Tâches restantes: ${pendingItems.length}
💳 Crédits disponibles: 300

Tâches à compléter:
${pendingItems.map((item, idx) => `  ${idx + 1}. ${item.name}`).join('\n')}

💡 Conseil: Complétez ${Math.min(3, pendingItems.length)} tâches pour maximiser l'utilisation des crédits.
`;

  return reminder;
}

/**
 * Exporte le rapport en fichier
 */
export async function exportProgressReport(plan: DevelopmentPlan): Promise<string> {
  const report = generateProgressReport(plan);
  const timestamp = new Date().toISOString();
  const filename = `progress-report-${timestamp}.txt`;

  return `${filename}\n${report}`;
}
