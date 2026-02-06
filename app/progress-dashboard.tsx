import { ScrollView, Text, View, FlatList, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import {
  getDevelopmentPlan,
  getTaskCheckpoints,
  calculateDailyProgress,
  createDailyReminder,
  generateProgressReport,
} from '@/lib/task-persistence';
import type { DevelopmentPlan, DailyProgress, TaskCheckpoint } from '@/lib/task-persistence';

export default function ProgressDashboardScreen() {
  const colors = useColors();
  const [plan, setPlan] = useState<DevelopmentPlan | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [checkpoints, setCheckpoints] = useState<TaskCheckpoint[]>([]);
  const [reminder, setReminder] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const storedPlan = await getDevelopmentPlan();
      if (storedPlan) {
        setPlan(storedPlan);
        setDailyProgress(calculateDailyProgress(storedPlan));
        setReminder(createDailyReminder(storedPlan));
      }

      const storedCheckpoints = await getTaskCheckpoints();
      setCheckpoints(storedCheckpoints.slice(-5)); // Derniers 5 checkpoints
    } catch (error) {
      console.error('Erreur lors du chargement de la progression:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !plan || !dailyProgress) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-foreground">Chargement du tableau de bord...</Text>
      </ScreenContainer>
    );
  }

  const completionPercentage = (plan.completedPhases / plan.totalPhases) * 100;

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* En-tête */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-3xl font-bold text-foreground">Tableau de bord</Text>
          <Text className="text-base text-muted mt-1">Suivi de progression du projet</Text>
        </View>

        {/* Progression globale */}
        <View className="px-6 mb-6">
          <View className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl p-6 border border-primary/30">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-foreground">Progression globale</Text>
              <Text className="text-3xl font-bold text-primary">{Math.round(completionPercentage)}%</Text>
            </View>
            <View className="bg-background rounded-full h-3 overflow-hidden">
              <View
                className="bg-primary h-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </View>
            <Text className="text-xs text-muted mt-3">
              {plan.completedPhases} de {plan.totalPhases} phases complétées
            </Text>
          </View>
        </View>

        {/* Crédits quotidiens */}
        <View className="px-6 mb-6">
          <View className="grid grid-cols-2 gap-3">
            {/* Crédits disponibles */}
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-3xl mb-1">💳</Text>
              <Text className="text-sm text-muted mb-1">Disponibles</Text>
              <Text className="text-2xl font-bold text-foreground">{dailyProgress.creditAvailable}</Text>
            </View>

            {/* Crédits utilisés */}
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-3xl mb-1">✅</Text>
              <Text className="text-sm text-muted mb-1">Utilisés</Text>
              <Text className="text-2xl font-bold text-primary">{dailyProgress.creditUsed}</Text>
            </View>
          </View>
        </View>

        {/* Rappel quotidien */}
        <View className="px-6 mb-6">
          <View className="bg-warning/10 rounded-xl p-4 border border-warning/30">
            <Text className="text-sm text-foreground leading-relaxed">{reminder}</Text>
          </View>
        </View>

        {/* Phases */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Phases</Text>
          <FlatList
            data={plan.phases}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => {
              const itemsCompleted = item.items.filter(i => i.completed).length;
              const itemsTotal = item.items.length;
              const phasePercentage = (itemsCompleted / itemsTotal) * 100;

              return (
                <View className="bg-surface rounded-xl p-4 border border-border mb-3">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">{item.name}</Text>
                      <Text className="text-xs text-muted mt-1">
                        {itemsCompleted}/{itemsTotal} tâches
                      </Text>
                    </View>
                    <View
                      className={`rounded-full px-2 py-1 ${
                        item.status === 'completed'
                          ? 'bg-success/20'
                          : item.status === 'in-progress'
                          ? 'bg-primary/20'
                          : 'bg-muted/20'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          item.status === 'completed'
                            ? 'text-success'
                            : item.status === 'in-progress'
                            ? 'text-primary'
                            : 'text-muted'
                        }`}
                      >
                        {item.status === 'completed'
                          ? 'Complétée'
                          : item.status === 'in-progress'
                          ? 'En cours'
                          : 'En attente'}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-background rounded-full h-2 overflow-hidden">
                    <View
                      className={`h-full ${
                        item.status === 'completed'
                          ? 'bg-success'
                          : item.status === 'in-progress'
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`}
                      style={{ width: `${phasePercentage}%` }}
                    />
                  </View>
                </View>
              );
            }}
            scrollEnabled={false}
          />
        </View>

        {/* Checkpoints récents */}
        {checkpoints.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">Checkpoints récents</Text>
            <FlatList
              data={checkpoints}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View className="bg-surface rounded-xl p-4 border border-border mb-3">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-semibold text-foreground">Phase {item.phase}: {item.phaseName}</Text>
                    <Text className="text-xs text-muted">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="flex-row gap-4 mt-2">
                    <View>
                      <Text className="text-xs text-muted">Complétées</Text>
                      <Text className="text-lg font-bold text-success">{item.completedItems.length}</Text>
                    </View>
                    <View>
                      <Text className="text-xs text-muted">En attente</Text>
                      <Text className="text-lg font-bold text-warning">{item.pendingItems.length}</Text>
                    </View>
                    <View>
                      <Text className="text-xs text-muted">Crédits</Text>
                      <Text className="text-lg font-bold text-primary">{item.creditUsed}</Text>
                    </View>
                  </View>
                  {item.notes && (
                    <Text className="text-xs text-muted mt-2 italic">Note: {item.notes}</Text>
                  )}
                </View>
              )}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Statistiques */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Statistiques</Text>
          <View className="bg-surface rounded-xl p-4 border border-border gap-3">
            <View className="flex-row justify-between items-center pb-3 border-b border-border">
              <Text className="text-sm text-muted">Crédits totaux utilisés</Text>
              <Text className="font-semibold text-foreground">{plan.totalCreditsUsed}</Text>
            </View>
            <View className="flex-row justify-between items-center pb-3 border-b border-border">
              <Text className="text-sm text-muted">Crédits par jour</Text>
              <Text className="font-semibold text-foreground">
                {(plan.totalCreditsUsed / Math.max(1, Math.floor((Date.now() - plan.startDate) / (24 * 60 * 60 * 1000)))).toFixed(0)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center pb-3 border-b border-border">
              <Text className="text-sm text-muted">Jours écoulés</Text>
              <Text className="font-semibold text-foreground">
                {Math.floor((Date.now() - plan.startDate) / (24 * 60 * 60 * 1000))}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted">Estimation</Text>
              <Text className="font-semibold text-foreground">{dailyProgress.estimatedCompletion}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
