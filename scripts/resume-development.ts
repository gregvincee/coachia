#!/usr/bin/env node

/**
 * Script de reprise automatique du développement
 * À exécuter chaque jour avec les 300 crédits offerts
 * 
 * Usage: npx ts-node scripts/resume-development.ts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDevelopmentPlan,
  getLastCheckpoint,
  createDailyReminder,
  generateProgressReport,
  calculateDailyProgress,
} from '../lib/task-persistence';

async function resumeDevelopment() {
  console.log('\n🚀 REPRISE DU DÉVELOPPEMENT COACHIA');
  console.log('═══════════════════════════════════════════\n');

  try {
    // Récupérer le plan de développement
    const plan = await getDevelopmentPlan();
    if (!plan) {
      console.log('❌ Aucun plan de développement trouvé.');
      console.log('💡 Créez d\'abord un plan avec createDevelopmentPlan()');
      return;
    }

    // Récupérer le dernier checkpoint
    const lastCheckpoint = await getLastCheckpoint();
    if (lastCheckpoint) {
      console.log(`✅ Dernier checkpoint: Phase ${lastCheckpoint.phase} - ${lastCheckpoint.phaseName}`);
      console.log(`   Complétées: ${lastCheckpoint.completedItems.length}`);
      console.log(`   En attente: ${lastCheckpoint.pendingItems.length}`);
      console.log(`   Crédits utilisés: ${lastCheckpoint.creditUsed}\n`);
    }

    // Afficher la progression quotidienne
    const dailyProgress = calculateDailyProgress(plan);
    console.log(`📅 PROGRESSION QUOTIDIENNE - ${dailyProgress.date}`);
    console.log(`   Crédits disponibles: ${dailyProgress.creditAvailable}`);
    console.log(`   Crédits utilisés: ${dailyProgress.creditUsed}`);
    console.log(`   Crédits restants: ${dailyProgress.creditAvailable - dailyProgress.creditUsed}\n`);

    // Afficher le rappel quotidien
    const reminder = createDailyReminder(plan);
    console.log(reminder);

    // Afficher le rapport de progression
    const report = generateProgressReport(plan);
    console.log(report);

    // Afficher les prochaines étapes
    const nextPhase = plan.phases.find(p => p.status === 'pending');
    if (nextPhase) {
      console.log('\n🎯 PROCHAINES ÉTAPES');
      console.log('═══════════════════════════════════════════\n');
      console.log(`Phase ${nextPhase.id}: ${nextPhase.name}`);
      console.log(`Description: ${nextPhase.description}`);
      console.log(`Crédits estimés: ${nextPhase.estimatedCredits}\n`);
      console.log('Tâches à compléter:');
      nextPhase.items.forEach((item, idx) => {
        const status = item.completed ? '✅' : '⬜';
        console.log(`  ${status} ${idx + 1}. ${item.name}`);
      });
    } else {
      console.log('\n🎉 PROJET TERMINÉ !');
      console.log('═══════════════════════════════════════════\n');
      console.log('Toutes les phases ont été complétées avec succès.');
      console.log(`Total de crédits utilisés: ${plan.totalCreditsUsed}`);
    }

    console.log('\n💡 CONSEILS');
    console.log('═══════════════════════════════════════════');
    console.log('• Complétez 3-4 tâches par jour pour maximiser les 300 crédits');
    console.log('• Sauvegardez un checkpoint à la fin de chaque phase');
    console.log('• Consultez le tableau de bord pour suivre la progression');
    console.log('• Utilisez les rappels quotidiens pour rester organisé\n');

  } catch (error) {
    console.error('❌ Erreur lors de la reprise du développement:', error);
  }
}

// Exécuter le script
resumeDevelopment();
