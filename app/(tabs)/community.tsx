import { ScrollView, Text, View, FlatList, Pressable, Share } from 'react-native';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { generateCommunityLeaderboard, generateReferralCode } from '@/lib/referral';
import type { CommunityLeaderboard } from '@/lib/types-referral';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CommunityScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'friends' | 'referral'>('leaderboard');
  const [leaderboard, setLeaderboard] = useState<CommunityLeaderboard[]>([]);
  const [referralCode, setReferralCode] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      // Charger le leaderboard
      const stored = await AsyncStorage.getItem('communityLeaderboard');
      if (stored) {
        setLeaderboard(JSON.parse(stored));
      }

      // Charger ou générer le code de parrainage
      let code = await AsyncStorage.getItem('referralCode');
      if (!code) {
        code = generateReferralCode();
        await AsyncStorage.setItem('referralCode', code);
      }
      setReferralCode(code);
    } catch (error) {
      console.error('Erreur lors du chargement des données communautaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareReferralCode = async () => {
    try {
      await Share.share({
        message: `Rejoins-moi sur CoachIA ! Utilise mon code de parrainage ${referralCode} pour obtenir 50 XP bonus ! 🚀`,
        url: `https://coachia.app/join?ref=${referralCode}`,
        title: 'Rejoins CoachIA',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  return (
    <ScreenContainer className="flex-1">
      <View className="flex-1">
        {/* En-tête */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Communauté</Text>
          <Text className="text-base text-muted">Connectez-vous et progressez ensemble</Text>
        </View>

        {/* Onglets */}
        <View className="flex-row px-6 mb-6 gap-2">
          {['leaderboard', 'friends', 'referral'].map(tab => (
            <Pressable
              key={tab}
              onPress={() => {
                setActiveTab(tab as any);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="flex-1"
            >
              <View
                className={`py-2 px-3 rounded-lg border-b-2 ${
                  activeTab === tab
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-surface'
                }`}
              >
                <Text
                  className={`text-center text-xs font-semibold ${
                    activeTab === tab ? 'text-primary' : 'text-muted'
                  }`}
                >
                  {tab === 'leaderboard' ? 'Classement' : tab === 'friends' ? 'Amis' : 'Parrainage'}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Contenu */}
        {activeTab === 'leaderboard' && (
          <FlatList
            data={leaderboard}
            keyExtractor={item => item.userId}
            renderItem={({ item, index }) => (
              <View className="px-6 mb-3">
                <Pressable
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="flex-row items-center bg-surface rounded-xl p-4 border border-border"
                >
                  <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                    <Text className="font-bold text-primary text-sm">#{item.rank}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">{item.username}</Text>
                    <Text className="text-xs text-muted mt-1">
                      Niveau {item.level} • {item.totalXP} XP
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                    </Text>
                  </View>
                </Pressable>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            scrollEnabled={true}
          />
        )}

        {activeTab === 'friends' && (
          <View className="px-6 flex-1">
            <View className="bg-surface rounded-xl p-6 border border-border items-center">
              <Text className="text-6xl mb-4">👥</Text>
              <Text className="text-lg font-semibold text-foreground mb-2">Aucun ami pour l'instant</Text>
              <Text className="text-sm text-muted text-center">
                Invitez vos amis et relevez des défis ensemble !
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'referral' && (
          <ScrollView className="px-6 flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Carte de parrainage */}
            <View className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl p-6 border border-primary/30 mb-6">
              <Text className="text-lg font-bold text-foreground mb-2">Mon code de parrainage</Text>
              <View className="bg-background rounded-lg p-4 mb-4 border border-border">
                <Text className="text-3xl font-bold text-primary text-center">{referralCode}</Text>
              </View>
              <Text className="text-sm text-muted mb-4">
                Partagez ce code avec vos amis pour gagner 100 XP par parrainage complété !
              </Text>
              <Pressable
                onPress={handleShareReferralCode}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="bg-primary rounded-lg py-3"
              >
                <Text className="text-center font-semibold text-background">Partager le code</Text>
              </Pressable>
            </View>

            {/* Statistiques de parrainage */}
            <View className="gap-3">
              <View className="bg-surface rounded-xl p-4 border border-border flex-row items-center">
                <Text className="text-3xl mr-3">👥</Text>
                <View className="flex-1">
                  <Text className="text-sm text-muted">Parrainages complétés</Text>
                  <Text className="text-2xl font-bold text-foreground">0</Text>
                </View>
              </View>

              <View className="bg-surface rounded-xl p-4 border border-border flex-row items-center">
                <Text className="text-3xl mr-3">⭐</Text>
                <View className="flex-1">
                  <Text className="text-sm text-muted">XP gagnés via parrainage</Text>
                  <Text className="text-2xl font-bold text-primary">0</Text>
                </View>
              </View>

              <View className="bg-surface rounded-xl p-4 border border-border flex-row items-center">
                <Text className="text-3xl mr-3">🔄</Text>
                <View className="flex-1">
                  <Text className="text-sm text-muted">Parrainages en attente</Text>
                  <Text className="text-2xl font-bold text-foreground">0</Text>
                </View>
              </View>
            </View>

            {/* Avantages */}
            <View className="mt-6">
              <Text className="text-lg font-bold text-foreground mb-3">Avantages du parrainage</Text>
              <View className="bg-surface rounded-xl p-4 border border-border">
                <View className="mb-3">
                  <Text className="font-semibold text-foreground">✓ 100 XP pour vous</Text>
                  <Text className="text-xs text-muted mt-1">À chaque parrainage complété</Text>
                </View>
                <View className="mb-3">
                  <Text className="font-semibold text-foreground">✓ 50 XP pour votre ami</Text>
                  <Text className="text-xs text-muted mt-1">Bonus de bienvenue</Text>
                </View>
                <View>
                  <Text className="font-semibold text-foreground">✓ Badge exclusif</Text>
                  <Text className="text-xs text-muted mt-1">Débloquez le badge "Parrain" après 5 parrainages</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </ScreenContainer>
  );
}
