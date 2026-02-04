import { ScrollView, Text, View, FlatList, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { ChallengeCard } from '@/components/challenge-card';
import { useColors } from '@/hooks/use-colors';
import { WEEKLY_CHALLENGES, generateLeaderboard } from '@/lib/challenges';
import type { UserChallenge, ChallengeLeaderboard } from '@/lib/types-challenges';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChallengesScreen() {
  const colors = useColors();
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<ChallengeLeaderboard[]>([]);
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard'>('challenges');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const stored = await AsyncStorage.getItem('userChallenges');
      const challenges = stored ? JSON.parse(stored) : [];
      setUserChallenges(challenges);

      // Générer le leaderboard
      const lb = generateLeaderboard(challenges, WEEKLY_CHALLENGES);
      setLeaderboard(lb);
    } catch (error) {
      console.error('Erreur lors du chargement des défis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (challengeId: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Logique de réclamation de récompense
  };

  const completedCount = userChallenges.filter(c => c.status === 'completed').length;
  const totalXP = userChallenges.reduce((sum, c) => {
    const def = WEEKLY_CHALLENGES.find(ch => ch.id === c.challengeId);
    return sum + (c.status === 'completed' && def ? def.reward.xp + def.reward.bonus : 0);
  }, 0);

  return (
    <ScreenContainer className="flex-1">
      <View className="flex-1">
        {/* En-tête */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Défis</Text>
          <Text className="text-base text-muted">Relevez les défis et gagnez des récompenses</Text>
        </View>

        {/* Statistiques */}
        <View className="px-6 mb-6 flex-row gap-3">
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-2xl font-bold text-foreground">{completedCount}</Text>
            <Text className="text-xs text-muted mt-1">Défis complétés</Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-2xl font-bold text-primary">{totalXP}</Text>
            <Text className="text-xs text-muted mt-1">XP gagnés</Text>
          </View>
        </View>

        {/* Onglets */}
        <View className="flex-row px-6 mb-6 gap-3">
          <Pressable
            onPress={() => {
              setActiveTab('challenges');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            className="flex-1"
          >
            <View
              className={`py-3 px-4 rounded-lg border-b-2 ${
                activeTab === 'challenges'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'challenges' ? 'text-primary' : 'text-muted'
                }`}
              >
                Défis
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              setActiveTab('leaderboard');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            className="flex-1"
          >
            <View
              className={`py-3 px-4 rounded-lg border-b-2 ${
                activeTab === 'leaderboard'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'leaderboard' ? 'text-primary' : 'text-muted'
                }`}
              >
                Classement
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Contenu */}
        {activeTab === 'challenges' ? (
          <FlatList
            data={WEEKLY_CHALLENGES}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const userChallenge = userChallenges.find(uc => uc.challengeId === item.id);
              return (
                <View className="px-6">
                  <ChallengeCard
                    challenge={item}
                    userChallenge={userChallenge}
                    onPress={() => {
                      if (userChallenge?.status === 'completed' && !userChallenge.claimed) {
                        handleClaimReward(item.id);
                      }
                    }}
                  />
                </View>
              );
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
            scrollEnabled={true}
          />
        ) : (
          <FlatList
            data={leaderboard}
            keyExtractor={item => item.userId}
            renderItem={({ item, index }) => (
              <View className="px-6 mb-3">
                <View className="flex-row items-center bg-surface rounded-xl p-4 border border-border">
                  <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                    <Text className="font-bold text-primary">#{item.rank}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">{item.username}</Text>
                    <Text className="text-xs text-muted mt-1">
                      {item.challengesCompleted} défi(s) • {item.totalXP} XP
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                    </Text>
                  </View>
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
