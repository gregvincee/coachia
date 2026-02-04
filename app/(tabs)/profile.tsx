import { ScrollView, View, Text } from 'react-native';
import { useState, useEffect } from 'react';

import { ScreenContainer } from '@/components/screen-container';
import { ProgressCircle } from '@/components/progress-circle';
import { BadgeItem } from '@/components/badge-item';
import { useColors } from '@/hooks/use-colors';
import {
  getUserProfile,
  getBadges,
  getSkillsProgress,
} from '@/lib/storage';
import { getProgressInLevel } from '@/lib/data';
import type { UserProfile, Badge, SkillProgress } from '@/lib/types';

export default function ProfileScreen() {
  const colors = useColors();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [skillsProgress, setSkillsProgress] = useState<Record<string, SkillProgress>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const userProfile = await getUserProfile();
    setProfile(userProfile);

    const userBadges = await getBadges();
    setBadges(userBadges);

    const progress = await getSkillsProgress();
    setSkillsProgress(progress);
  }

  if (!profile) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Chargement...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const progressPercent = getProgressInLevel(profile.xp, profile.level);
  const totalSessions = Object.values(skillsProgress).reduce(
    (sum, skill) => sum + skill.sessionsCount,
    0
  );
  const badgesUnlocked = badges.filter((b) => b.unlocked).length;

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-foreground">
              {profile.name}
            </Text>
            <Text className="text-base text-muted">
              Membre depuis {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
            </Text>
          </View>

          {/* Level Progress */}
          <View className="items-center">
            <ProgressCircle
              size={140}
              progress={progressPercent}
              value={`${profile.level}`}
              label="Niveau"
            />
            <Text className="text-sm text-muted mt-2">
              {profile.xp} XP
            </Text>
          </View>

          {/* Statistics */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Statistiques
            </Text>
            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-base text-muted">Sessions complétées</Text>
                <Text className="text-base font-semibold text-foreground">
                  {totalSessions}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-base text-muted">Jours consécutifs</Text>
                <Text className="text-base font-semibold text-foreground">
                  {profile.streak} 🔥
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-base text-muted">Badges débloqués</Text>
                <Text className="text-base font-semibold text-foreground">
                  {badgesUnlocked} / {badges.length}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-base text-muted">Compétences essayées</Text>
                <Text className="text-base font-semibold text-foreground">
                  {Object.keys(skillsProgress).length}
                </Text>
              </View>
            </View>
          </View>

          {/* Badges */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-4">
              Badges
            </Text>
            <View className="flex-row flex-wrap gap-4">
              {badges.map((badge) => (
                <View key={badge.id} style={{ width: '22%' }}>
                  <BadgeItem badge={badge} />
                </View>
              ))}
            </View>
          </View>

          {/* Skills Progress */}
          {Object.keys(skillsProgress).length > 0 && (
            <View>
              <Text className="text-lg font-semibold text-foreground mb-4">
                Progression par compétence
              </Text>
              <View className="gap-3">
                {Object.entries(skillsProgress).map(([skillId, progress]) => {
                  const skillProgressPercent = getProgressInLevel(progress.xp, progress.level);
                  return (
                    <View
                      key={skillId}
                      className="bg-surface rounded-xl p-4 border border-border"
                    >
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-base font-semibold text-foreground">
                          {skillId}
                        </Text>
                        <Text className="text-sm text-muted">
                          Niveau {progress.level}
                        </Text>
                      </View>
                      <View
                        className="h-2 rounded-full"
                        style={{ backgroundColor: colors.border }}
                      >
                        <View
                          className="h-2 rounded-full"
                          style={{
                            width: `${skillProgressPercent}%`,
                            backgroundColor: colors.primary,
                          }}
                        />
                      </View>
                      <Text className="text-xs text-muted mt-1">
                        {progress.sessionsCount} sessions • {progress.xp} XP
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
