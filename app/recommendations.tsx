import { ScrollView, Text, View, FlatList, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { getRecommendations } from '@/lib/advanced-ai';
import type { MLRecommendation } from '@/lib/types-advanced-ai';

export default function RecommendationsScreen() {
  const colors = useColors();
  const [recommendations, setRecommendations] = useState<MLRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      // Simuler l'ID utilisateur
      const recs = await getRecommendations('user-1');
      setRecommendations(recs);
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const handleAccept = (rec: MLRecommendation) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Naviguer vers la compétence/défi/contenu
    console.log('Accepté:', rec.targetId);
  };

  const visibleRecommendations = recommendations.filter(r => !dismissedIds.has(r.id));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'skill':
        return '🎯';
      case 'prompt':
        return '💬';
      case 'challenge':
        return '🏆';
      case 'content':
        return '📚';
      default:
        return '⭐';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'skill':
        return 'Compétence';
      case 'prompt':
        return 'Prompt';
      case 'challenge':
        return 'Défi';
      case 'content':
        return 'Contenu';
      default:
        return 'Recommandation';
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-foreground">Chargement des recommandations...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* En-tête */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-3xl font-bold text-foreground">Recommandations</Text>
          <Text className="text-base text-muted mt-1">Personnalisées pour vous</Text>
        </View>

        {visibleRecommendations.length === 0 ? (
          <View className="px-6">
            <View className="bg-surface rounded-xl p-8 items-center border border-border">
              <Text className="text-4xl mb-3">✨</Text>
              <Text className="text-lg font-semibold text-foreground mb-2">Aucune recommandation</Text>
              <Text className="text-sm text-muted text-center">
                Continuez à pratiquer pour recevoir des recommandations personnalisées
              </Text>
            </View>
          </View>
        ) : (
          <View className="px-6">
            <FlatList
              data={visibleRecommendations}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View className="bg-surface rounded-xl border border-border mb-4 overflow-hidden">
                  {/* En-tête de la recommandation */}
                  <View className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-border">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-2">
                          <Text className="text-2xl">{getTypeIcon(item.type)}</Text>
                          <View
                            className={`rounded-full px-2 py-1 ${
                              item.score > 0.8
                                ? 'bg-success/20'
                                : item.score > 0.6
                                ? 'bg-primary/20'
                                : 'bg-warning/20'
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold ${
                                item.score > 0.8
                                  ? 'text-success'
                                  : item.score > 0.6
                                  ? 'text-primary'
                                  : 'text-warning'
                              }`}
                            >
                              {(item.score * 100).toFixed(0)}% pertinent
                            </Text>
                          </View>
                        </View>
                        <Text className="text-lg font-bold text-foreground mb-1">{item.title}</Text>
                        <Text className="text-xs text-muted">{getTypeLabel(item.type)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Contenu */}
                  <View className="p-4">
                    <Text className="text-sm text-foreground mb-3 leading-relaxed">{item.description}</Text>

                    {/* Raison */}
                    <View className="bg-background rounded-lg p-3 mb-4">
                      <Text className="text-xs text-muted font-semibold mb-1">Pourquoi cette recommandation ?</Text>
                      <Text className="text-sm text-foreground">{item.reason}</Text>
                    </View>

                    {/* Durée d'expiration */}
                    <Text className="text-xs text-muted mb-4">
                      Expire dans {Math.ceil((item.expiresAt - Date.now()) / (24 * 60 * 60 * 1000))} jours
                    </Text>

                    {/* Actions */}
                    <View className="flex-row gap-3">
                      <Pressable
                        onPress={() => handleAccept(item)}
                        className="flex-1"
                        style={({ pressed }) => [
                          {
                            backgroundColor: colors.primary,
                            borderRadius: 8,
                            paddingVertical: 10,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                      >
                        <Text className="text-center font-semibold text-background">Accepter</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handleDismiss(item.id)}
                        className="flex-1"
                        style={({ pressed }) => [
                          {
                            backgroundColor: colors.surface,
                            borderRadius: 8,
                            paddingVertical: 10,
                            borderWidth: 1,
                            borderColor: colors.border,
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                      >
                        <Text className="text-center font-semibold text-foreground">Plus tard</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Statistiques */}
        {visibleRecommendations.length > 0 && (
          <View className="px-6 mt-6">
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-3">Statistiques des recommandations</Text>
              <View className="space-y-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Total</Text>
                  <Text className="font-semibold text-foreground">{recommendations.length}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Visibles</Text>
                  <Text className="font-semibold text-foreground">{visibleRecommendations.length}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Pertinence moyenne</Text>
                  <Text className="font-semibold text-foreground">
                    {(
                      visibleRecommendations.reduce((sum, r) => sum + r.score, 0) / visibleRecommendations.length * 100
                    ).toFixed(0)}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
