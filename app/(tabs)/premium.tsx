import { ScrollView, Text, View, FlatList, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { PREMIUM_PLANS, COACHING_PACKAGES, getPremiumPlan } from '@/lib/premium';
import type { PremiumPlan, CoachingPackage } from '@/lib/types-premium';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PremiumScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<'plans' | 'packages'>('plans');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState<string>('free');

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  const loadCurrentPlan = async () => {
    try {
      const stored = await AsyncStorage.getItem('userPlan');
      if (stored) {
        setCurrentPlan(stored);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du plan:', error);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Logique de sélection du plan (intégration paiement)
    console.log(`Plan sélectionné: ${planId}`);
  };

  return (
    <ScreenContainer className="flex-1">
      <View className="flex-1">
        {/* En-tête */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Premium</Text>
          <Text className="text-base text-muted">Débloquez tout le potentiel de CoachIA</Text>
        </View>

        {/* Onglets */}
        <View className="flex-row px-6 mb-6 gap-3">
          <Pressable
            onPress={() => {
              setActiveTab('plans');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="flex-1"
          >
            <View
              className={`py-3 px-4 rounded-lg border-b-2 ${
                activeTab === 'plans'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'plans' ? 'text-primary' : 'text-muted'
                }`}
              >
                Abonnements
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              setActiveTab('packages');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="flex-1"
          >
            <View
              className={`py-3 px-4 rounded-lg border-b-2 ${
                activeTab === 'packages'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'packages' ? 'text-primary' : 'text-muted'
                }`}
              >
                Packs
              </Text>
            </View>
          </Pressable>
        </View>

        {activeTab === 'plans' && (
          <>
            {/* Sélecteur de cycle de facturation */}
            <View className="px-6 mb-6 flex-row gap-3">
              <Pressable
                onPress={() => setBillingCycle('monthly')}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="flex-1"
              >
                <View
                  className={`py-2 px-3 rounded-lg border ${
                    billingCycle === 'monthly'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface'
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-semibold ${
                      billingCycle === 'monthly' ? 'text-primary' : 'text-muted'
                    }`}
                  >
                    Mensuel
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setBillingCycle('yearly')}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="flex-1"
              >
                <View
                  className={`py-2 px-3 rounded-lg border relative ${
                    billingCycle === 'yearly'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface'
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-semibold ${
                      billingCycle === 'yearly' ? 'text-primary' : 'text-muted'
                    }`}
                  >
                    Annuel
                  </Text>
                  <View className="absolute -top-2 -right-2 bg-success px-2 py-1 rounded-full">
                    <Text className="text-xs font-bold text-background">-17%</Text>
                  </View>
                </View>
              </Pressable>
            </View>

            {/* Plans */}
            <FlatList
              data={PREMIUM_PLANS}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const price = item.price[billingCycle];
                const isCurrentPlan = currentPlan === item.id;

                return (
                  <View className="px-6 mb-4">
                    <View
                      className={`rounded-2xl p-6 border ${
                        isCurrentPlan
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-surface'
                      }`}
                    >
                      {/* En-tête du plan */}
                      <View className="mb-4">
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-2xl font-bold text-foreground">{item.name}</Text>
                          {isCurrentPlan && (
                            <View className="bg-primary px-3 py-1 rounded-full">
                              <Text className="text-xs font-bold text-background">Actif</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-sm text-muted">{item.description}</Text>
                      </View>

                      {/* Prix */}
                      <View className="mb-4 pb-4 border-b border-border">
                        {price > 0 ? (
                          <View>
                            <Text className="text-4xl font-bold text-foreground">
                              ${price.toFixed(2)}
                            </Text>
                            <Text className="text-sm text-muted mt-1">
                              par {billingCycle === 'monthly' ? 'mois' : 'an'}
                            </Text>
                          </View>
                        ) : (
                          <Text className="text-3xl font-bold text-foreground">Gratuit</Text>
                        )}
                      </View>

                      {/* Fonctionnalités */}
                      <View className="mb-6">
                        {item.features.map((feature, idx) => (
                          <View key={idx} className="flex-row items-start mb-2">
                            <Text className="text-lg mr-2">✓</Text>
                            <Text className="text-sm text-foreground flex-1">{feature}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Bouton */}
                      {!isCurrentPlan && (
                        <Pressable
                          onPress={() => handleSelectPlan(item.id)}
                          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                          className={`py-3 px-4 rounded-lg ${
                            item.id === 'free'
                              ? 'bg-muted'
                              : 'bg-primary'
                          }`}
                        >
                          <Text
                            className={`text-center font-semibold ${
                              item.id === 'free'
                                ? 'text-foreground'
                                : 'text-background'
                            }`}
                          >
                            {item.id === 'free' ? 'Utiliser' : 'Passer à ' + item.name}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              }}
              contentContainerStyle={{ paddingBottom: 20 }}
              scrollEnabled={true}
            />
          </>
        )}

        {activeTab === 'packages' && (
          <FlatList
            data={COACHING_PACKAGES}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View className="px-6 mb-4">
                <View className="rounded-2xl p-6 border border-border bg-surface">
                  <View className="mb-3">
                    <Text className="text-xl font-bold text-foreground">{item.name}</Text>
                    <Text className="text-sm text-muted mt-1">{item.description}</Text>
                  </View>

                  <View className="mb-4 pb-4 border-b border-border">
                    <View className="flex-row items-baseline gap-1">
                      <Text className="text-3xl font-bold text-primary">${item.price}</Text>
                      <Text className="text-sm text-muted">une fois</Text>
                    </View>
                  </View>

                  <View className="mb-6 gap-2">
                    <View className="flex-row items-center">
                      <Text className="text-lg mr-2">📅</Text>
                      <Text className="text-sm text-foreground">{item.duration} jours d'accès</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-lg mr-2">💬</Text>
                      <Text className="text-sm text-foreground">{item.sessions} sessions de coaching</Text>
                    </View>
                    {item.customization && (
                      <View className="flex-row items-center">
                        <Text className="text-lg mr-2">⚙️</Text>
                        <Text className="text-sm text-foreground">Personnalisation complète</Text>
                      </View>
                    )}
                    {item.bonus && (
                      <View className="flex-row items-center">
                        <Text className="text-lg mr-2">🎁</Text>
                        <Text className="text-sm text-foreground">+{item.bonus.xp} XP bonus</Text>
                      </View>
                    )}
                  </View>

                  <Pressable
                    onPress={() => handleSelectPlan(item.id)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="bg-primary py-3 px-4 rounded-lg"
                  >
                    <Text className="text-center font-semibold text-background">Acheter maintenant</Text>
                  </Pressable>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            scrollEnabled={true}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
