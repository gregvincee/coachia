import { Image, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

import { ScreenContainer } from '@/components/screen-container';
import { getUserProfile, getMissionLearningState } from '@/lib/storage';
import { MISSION_DEFINITIONS, type MissionDefinition, type MissionLearningState } from '@/lib/mission-engine';
import type { UserProfile } from '@/lib/types';

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [learning, setLearning] = useState<MissionLearningState | null>(null);

  const loadData = useCallback(async () => {
    const [userProfile, missionLearning] = await Promise.all([getUserProfile(), getMissionLearningState()]);
    setProfile(userProfile);
    setLearning(missionLearning);
  }, []);

  useFocusEffect(useCallback(() => {
    void loadData();
  }, [loadData]));

  if (!profile || !learning) {
    return <ScreenContainer className="p-6"><View className="flex-1 items-center justify-center"><Text className="text-muted">Préparation de votre mission…</Text></View></ScreenContainer>;
  }

  const activeMission = MISSION_DEFINITIONS[learning.activeMissionId];
  const nextDifficulty = learning.lastDifficulty ?? 'Commencez par une tentative personnelle : l’IA vous aidera ensuite à la rendre plus solide.';
  const missionData = Object.values(MISSION_DEFINITIONS);

  function openMission(missionId: MissionDefinition['id']) {
    router.push({ pathname: '/mission/[missionId]', params: { missionId } });
  }

  return (
    <ScreenContainer className="p-0" containerClassName="bg-[#07080C]">
      <FlatList
        data={missionData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={(
          <View className="gap-5 px-5 pb-5 pt-4">
            <View className="flex-row items-center gap-3">
              <Image source={require('@/assets/images/icon.png')} accessibilityRole="image" accessibilityLabel="Monogramme CoachIA C delta I" resizeMode="contain" style={styles.brandLogo} />
              <View className="flex-1"><Text className="text-xs font-bold tracking-widest text-[#E8C98A]">COACHIA · APPRENDRE EN FAISANT</Text><Text className="mt-1 text-sm text-[#AEB4C0]">Bonjour, {profile.name}</Text></View>
            </View>

            <View className="rounded-3xl border border-[#C89D56] bg-[#151820] p-5">
              <Text className="text-xs font-bold tracking-widest text-[#E8C98A]">MA MISSION</Text>
              <Text className="mt-3 text-2xl font-bold leading-8 text-[#F5F1E8]" numberOfLines={2}>{activeMission.title}</Text>
              <Text className="mt-2 text-sm leading-6 text-[#AEB4C0]">{activeMission.goal}</Text>
              <View className="mt-4 rounded-2xl bg-[#0B0D12] p-3"><Text className="text-xs font-bold uppercase tracking-wide text-[#8F96A4]">Dernière difficulté détectée</Text><Text className="mt-1 text-sm leading-5 text-[#E5DFD2]">{nextDifficulty}</Text></View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Continuer la mission active" onPress={() => openMission(activeMission.id)} activeOpacity={0.8} className="mt-5 items-center rounded-xl bg-[#D6B36A] px-4 py-4"><Text className="font-bold text-white">Continuer</Text></TouchableOpacity>
            </View>

            <View className="rounded-2xl border border-[#343947] bg-[#151820] p-4">
              <View className="flex-row items-center justify-between"><Text className="text-base font-bold text-[#F5F1E8]">Maîtrise réelle</Text><Text className="text-xs text-[#AEB4C0]">Distincte de vos {profile.xp} XP</Text></View>
              <View className="mt-4 flex-row justify-between gap-2">
                <MasterySnapshot label="Prompting" score={learning.mastery.prompting.score} stage={learning.mastery.prompting.stage} />
                <MasterySnapshot label="Vérifier" score={learning.mastery.verification.score} stage={learning.mastery.verification.stage} />
                <MasterySnapshot label="Raisonner" score={learning.mastery.reasoning.score} stage={learning.mastery.reasoning.stage} />
                <MasterySnapshot label="Workflow" score={learning.mastery.automation.score} stage={learning.mastery.automation.stage} />
              </View>
            </View>

            <View><Text className="text-lg font-bold text-[#F5F1E8]">Choisir une mission</Text><Text className="mt-1 text-sm text-[#AEB4C0]">Chaque mission commence par votre tentative, pas par une réponse toute faite.</Text></View>
          </View>
        )}
        renderItem={({ item }) => <MissionChoice mission={item} active={item.id === activeMission.id} onPress={() => openMission(item.id)} />}
      />
    </ScreenContainer>
  );
}

function MasterySnapshot({ label, score, stage }: { label: string; score: number; stage: string }) {
  return <View className="flex-1 gap-1"><Text className="text-xs text-[#AEB4C0]" numberOfLines={1}>{label}</Text><Text className="text-base font-bold text-[#F5F1E8]">{score}/100</Text><Text className="text-[10px] text-[#E8C98A]" numberOfLines={1}>{stage}</Text></View>;
}

function MissionChoice({ mission, active, onPress }: { mission: MissionDefinition; active: boolean; onPress: () => void }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={`Choisir la mission ${mission.label}`} onPress={onPress} activeOpacity={0.75} className={active ? 'mx-5 mb-3 rounded-2xl border border-[#C89D56] bg-[#242B3A] p-4' : 'mx-5 mb-3 rounded-2xl border border-[#343947] bg-[#151820] p-4'}><View className="flex-row items-start justify-between gap-3"><View className="flex-1"><Text className="text-xs font-bold tracking-widest text-[#E8C98A]">{mission.label.toUpperCase()}</Text><Text className="mt-2 text-lg font-bold text-[#F5F1E8]">{mission.title}</Text><Text className="mt-1 text-sm leading-5 text-[#AEB4C0]">{mission.outcome}</Text></View><Text className="text-xl text-[#C89D56]">›</Text></View></TouchableOpacity>;
}

const styles = StyleSheet.create({
  brandLogo: { width: 48, height: 48, borderRadius: 12 },
  listContent: { paddingBottom: 32 },
});
