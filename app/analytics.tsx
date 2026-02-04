import { ScrollView, Text, View, FlatList, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { calculateUserAnalytics, generateProgressReport, generateUserInsights, exportUserData } from '@/lib/analytics';
import type { UserAnalytics, UserInsight } from '@/lib/types-analytics';

export default function AnalyticsScreen() {
  const colors = useColors();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [insights, setInsights] = useState<UserInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const userAnalytics = await calculateUserAnalytics('user-1');
      setAnalytics(userAnalytics);
      setInsights(generateUserInsights(userAnalytics));
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const data = await exportUserData('user-1', 'json');
      console.log('Données exportées:', data);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  if (loading || !analytics) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-foreground">Chargement des analytics...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* En-tête */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Analytics</Text>
          <Text className="text-base text-muted">Votre progression en détail</Text>
        </View>

        {/* Métriques principales */}
        <View className="px-6 mb-6">
          <View className="grid grid-cols-2 gap-3">
            {/* Sessions */}
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-3xl mb-1">📊</Text>
              <Text className="text-sm text-muted mb-1">Sessions</Text>
              <Text className="text-2xl font-bold text-foreground">{analytics.totalSessions}</Text>
            </View>

            {/* XP Total */}
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-3xl mb-1">⭐</Text>
              <Text className="text-sm text-muted mb-1">XP Total</Text>
              <Text className="text-2xl font-bold text-primary">{analytics.totalXP}</Text>
            </View>

            {/* Badges */}
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-3xl mb-1">🏆</Text>
              <Text className="text-sm text-muted mb-1">Badges</Text>
              <Text className="text-2xl font-bold text-foreground">{analytics.badgesUnlocked}</Text>
            </View>

            {/* Streak */}
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-3xl mb-1">🔥</Text>
              <Text className="text-sm text-muted mb-1">Streak</Text>
              <Text className="text-2xl font-bold text-warning">{analytics.streakCurrent}j</Text>
            </View>
          </View>
        </View>

        {/* Score d'engagement */}
        <View className="px-6 mb-6">
          <View className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl p-6 border border-primary/30">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-foreground">Score d'engagement</Text>
              <Text className="text-3xl font-bold text-primary">{Math.round(analytics.engagementScore)}%</Text>
            </View>
            <View className="bg-background rounded-full h-2 overflow-hidden">
              <View
                className="bg-primary h-full"
                style={{ width: `${analytics.engagementScore}%` }}
              />
            </View>
            <Text className="text-xs text-muted mt-3">
              {analytics.engagementScore >= 80
                ? 'Excellent ! Vous êtes très engagé'
                : analytics.engagementScore >= 60
                ? 'Bon engagement, continuez !'
                : 'Augmentez votre engagement avec plus de sessions'}
            </Text>
          </View>
        </View>

        {/* Insights */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Insights</Text>
          <FlatList
            data={insights}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View className="bg-surface rounded-xl p-4 border border-border mb-3">
                <View className="flex-row items-start">
                  <Text className="text-2xl mr-3">
                    {item.type === 'strength' ? '💪' : item.type === 'weakness' ? '⚠️' : '💡'}
                  </Text>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">{item.title}</Text>
                    <Text className="text-sm text-muted mt-1">{item.description}</Text>
                    {item.suggestedAction && (
                      <Text className="text-xs text-primary mt-2 font-semibold">
                        💡 {item.suggestedAction}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}
            scrollEnabled={false}
          />
        </View>

        {/* Statistiques détaillées */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Statistiques détaillées</Text>
          <View className="bg-surface rounded-xl p-4 border border-border gap-3">
            <View className="flex-row justify-between items-center pb-3 border-b border-border">
              <Text className="text-sm text-muted">Durée moyenne de session</Text>
              <Text className="font-semibold text-foreground">{analytics.averageSessionDuration} min</Text>
            </View>
            <View className="flex-row justify-between items-center pb-3 border-b border-border">
              <Text className="text-sm text-muted">Compétences tentées</Text>
              <Text className="font-semibold text-foreground">{analytics.skillsAttempted}</Text>
            </View>
            <View className="flex-row justify-between items-center pb-3 border-b border-border">
              <Text className="text-sm text-muted">Compétences complétées</Text>
              <Text className="font-semibold text-foreground">{analytics.skillsCompleted}</Text>
            </View>
            <View className="flex-row justify-between items-center pb-3 border-b border-border">
              <Text className="text-sm text-muted">Meilleur streak</Text>
              <Text className="font-semibold text-foreground">{analytics.streakLongest} jours</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted">Jours depuis le début</Text>
              <Text className="font-semibold text-foreground">{analytics.retentionDays}</Text>
            </View>
          </View>
        </View>

        {/* Bouton d'export */}
        <View className="px-6 mb-6">
          <Pressable
            onPress={handleExportData}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="bg-primary rounded-lg py-3 px-4"
          >
            <Text className="text-center font-semibold text-background">📥 Exporter mes données</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
