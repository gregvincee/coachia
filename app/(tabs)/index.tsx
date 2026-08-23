import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { ScreenContainer } from '@/components/screen-container';
import { SkillCard } from '@/components/skill-card';
import { SKILLS } from '@/lib/data';
import { getUserProfile, createDefaultUserProfile, getSkillsProgress } from '@/lib/storage';
import type { UserProfile, SkillProgress } from '@/lib/types';
import { useColors } from '@/hooks/use-colors';
import { getLevelFromXP, getProgressInLevel } from '@/lib/data';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skillsProgress, setSkillsProgress] = useState<Record<string, SkillProgress>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    let userProfile = await getUserProfile();
    if (!userProfile) {
      userProfile = await createDefaultUserProfile();
    }
    setProfile(userProfile);

    const progress = await getSkillsProgress();
    setSkillsProgress(progress);
  }

  const handleSkillPress = (skillId: string) => {
    router.push(`/coaching/${skillId}`);
  };

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

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <Image
                source={require('@/assets/images/icon.png')}
                accessibilityRole="image"
                accessibilityLabel="Monogramme CoachIA C delta I"
                resizeMode="contain"
                style={styles.brandLogo}
              />
              <Text className="flex-1 text-xs font-bold tracking-widest text-primary" numberOfLines={1}>
                COACHIA
              </Text>
            </View>
            <View className="gap-1">
              <Text className="text-3xl font-bold text-foreground" numberOfLines={2} style={styles.greeting}>
                Bonjour, {profile.name} 👋
              </Text>
              <Text className="text-base text-muted" style={styles.subtitle}>
                Quelle compétence voulez-vous développer aujourd'hui ?
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-semibold text-foreground">
                Niveau {profile.level}
              </Text>
              <Text className="text-xs text-muted">
                {profile.xp} XP
              </Text>
            </View>
            <View
              className="h-2 rounded-full"
              style={{ backgroundColor: colors.border }}
            >
              <View
                className="h-2 rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: colors.primary,
                }}
              />
            </View>
          </View>

          {/* Skills Grid */}
          <View className="gap-4">
            <Text className="text-lg font-semibold text-foreground">
              Compétences disponibles
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {SKILLS.map((skill) => (
                <View key={skill.id} style={{ width: '47%' }}>
                  <SkillCard
                    skill={skill}
                    onPress={() => handleSkillPress(skill.id)}
                    level={skillsProgress[skill.id]?.level}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  brandLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  greeting: {
    lineHeight: 36,
  },
  subtitle: {
    lineHeight: 22,
  },
});
