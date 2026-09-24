import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { ProgressCircle } from "@/components/progress-circle";
import { BadgeItem } from "@/components/badge-item";
import { getMissionLearningState, getUserProfile, getBadges, getSkillsProgress } from "@/lib/storage";
import { getProgressInLevel } from "@/lib/data";
import { getMasteryStage, type CapabilityMastery, type MasteryCapabilityId, type MissionLearningState } from "@/lib/mission-engine";
import type { UserProfile, Badge, SkillProgress } from "@/lib/types";

const MASTERY_CAPABILITIES: Array<{ id: MasteryCapabilityId; label: string; description: string }> = [
  { id: "prompting", label: "Prompting", description: "Structurer une demande utile" },
  { id: "verification", label: "Vérification", description: "Contrôler une réponse" },
  { id: "reasoning", label: "Raisonnement", description: "Comparer et décider" },
  { id: "automation", label: "Workflow", description: "Concevoir une séquence" },
];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [skillsProgress, setSkillsProgress] = useState<Record<string, SkillProgress>>({});
  const [learning, setLearning] = useState<MissionLearningState | null>(null);

  const loadData = useCallback(async () => {
    const [userProfile, userBadges, progress, missionLearning] = await Promise.all([
      getUserProfile(),
      getBadges(),
      getSkillsProgress(),
      getMissionLearningState(),
    ]);
    setProfile(userProfile);
    setBadges(userBadges);
    setSkillsProgress(progress);
    setLearning(missionLearning);
  }, []);

  useFocusEffect(useCallback(() => {
    void loadData();
  }, [loadData]));

  if (!profile || !learning) {
    return (
      <ScreenContainer className="p-6" containerClassName="bg-[#07080C]">
        <View className="flex-1 items-center justify-center"><Text className="text-[#AEB4C0]">Chargement du profil…</Text></View>
      </ScreenContainer>
    );
  }

  return <ProfileContent profile={profile} badges={badges} skillsProgress={skillsProgress} learning={learning} />;
}

function ProfileContent({ profile, badges, skillsProgress, learning }: { profile: UserProfile; badges: Badge[]; skillsProgress: Record<string, SkillProgress>; learning: MissionLearningState }) {
  const progressPercent = getProgressInLevel(profile.xp, profile.level);
  const totalSessions = Object.values(skillsProgress).reduce((sum, skill) => sum + skill.sessionsCount, 0);
  const badgesUnlocked = badges.filter((badge) => badge.unlocked).length;
  const masteryValues = Object.values(learning.mastery).map((item) => item.score);
  const overallMastery = Math.round(masteryValues.reduce((sum, score) => sum + score, 0) / masteryValues.length);
  const totalMasteryAttempts = Object.values(learning.mastery).reduce((sum, item) => sum + item.attempts, 0);
  const masteryStage = getMasteryStage(overallMastery);

  const masteryRows = useMemo(() => MASTERY_CAPABILITIES.map((capability) => ({
    ...capability,
    mastery: learning.mastery[capability.id],
  })), [learning.mastery]);

  return (
    <ScreenContainer className="p-0" containerClassName="bg-[#07080C]">
      <ScrollView contentContainerStyle={styles.content}>
        <View className="gap-5 px-5 pt-6">
          <View className="items-center">
            <Text className="text-3xl font-bold text-[#F5F1E8]">{profile.name}</Text>
            <Text className="mt-1 text-sm text-[#AEB4C0]">Membre depuis {new Date(profile.createdAt).toLocaleDateString("fr-FR")}</Text>
          </View>

          <View className="items-center rounded-3xl border border-[#343947] bg-[#151820] p-5">
            <ProgressCircle size={140} progress={progressPercent} value={`${profile.level}`} label="Niveau" />
            <Text className="mt-3 text-base font-bold text-[#F5F1E8]">Évolution d’engagement</Text>
            <Text className="mt-1 text-center text-sm leading-5 text-[#AEB4C0]">{profile.xp} XP gagnés · progression vers le niveau suivant</Text>
            <View className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#253044]"><View className="h-2 rounded-full bg-[#D6B36A]" style={{ width: `${progressPercent}%` }} /></View>
            <Text className="mt-2 text-xs font-semibold text-[#E8C98A]">{Math.round(progressPercent)}% du niveau actuel</Text>
          </View>

          <View className="rounded-3xl border border-[#C89D56] bg-[#101A2B] p-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1"><Text className="text-xs font-bold tracking-widest text-[#E8C98A]">MAÎTRISE IA</Text><Text className="mt-2 text-2xl font-bold text-[#F5F1E8]">{overallMastery}/100</Text><Text className="mt-1 text-sm leading-5 text-[#AEB4C0]">Compétence démontrée dans vos tentatives, indépendante de l’XP.</Text></View>
              <View className="items-end"><Text className="text-sm font-bold text-[#E8C98A]">{masteryStage}</Text><Text className="mt-1 text-xs text-[#8F96A4]">{totalMasteryAttempts} évaluations</Text></View>
            </View>
            <View className="mt-4 h-2 overflow-hidden rounded-full bg-[#253044]"><View className="h-2 rounded-full bg-[#E8C98A]" style={{ width: `${overallMastery}%` }} /></View>
            <Text className="mt-3 text-xs leading-5 text-[#E5DFD2]">Chaque diagnostic affine les quatre capacités. Recommencez une mission pour faire évoluer ce score.</Text>
          </View>

          <View className="gap-3">
            <View className="flex-row items-end justify-between"><View><Text className="text-xl font-bold text-[#F5F1E8]">Progression par capacité</Text><Text className="mt-1 text-sm text-[#AEB4C0]">Ce que vos missions développent réellement.</Text></View><Text className="text-xs font-bold text-[#E8C98A]">/100</Text></View>
            {masteryRows.map(({ id, label, description, mastery }) => <MasteryRow key={id} label={label} description={description} mastery={mastery} />)}
          </View>

          <View className="rounded-2xl border border-[#343947] bg-[#151820] p-4">
            <Text className="text-lg font-bold text-[#F5F1E8]">Vos repères</Text>
            <View className="mt-4 gap-3">
              <StatRow label="Missions évaluées" value={String(learning.attempts.length)} />
              <StatRow label="Sessions complétées" value={String(totalSessions)} />
              <StatRow label="Jours consécutifs" value={`${profile.streak}`} />
              <StatRow label="Badges débloqués" value={`${badgesUnlocked} / ${badges.length}`} />
            </View>
          </View>

          <View>
            <Text className="mb-4 text-xl font-bold text-[#F5F1E8]">Badges</Text>
            <View className="flex-row flex-wrap gap-4">
              {badges.map((badge) => <View key={badge.id} style={styles.badgeCell}><BadgeItem badge={badge} /></View>)}
            </View>
          </View>

          {Object.keys(skillsProgress).length > 0 ? <View>
            <Text className="mb-4 text-xl font-bold text-[#F5F1E8]">Progression par compétence</Text>
            <View className="gap-3">
              {Object.entries(skillsProgress).map(([skillId, progress]) => <SkillRow key={skillId} skillId={skillId} progress={progress} />)}
            </View>
          </View> : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function MasteryRow({ label, description, mastery }: { label: string; description: string; mastery: CapabilityMastery }) {
  return <View className="rounded-2xl border border-[#343947] bg-[#151820] p-4"><View className="flex-row items-start justify-between gap-3"><View className="flex-1"><Text className="font-bold text-[#F5F1E8]">{label}</Text><Text className="mt-1 text-xs text-[#8F96A4]">{description}</Text></View><View className="items-end"><Text className="text-lg font-bold text-[#E8C98A]">{mastery.score}</Text><Text className="text-[10px] text-[#AEB4C0]">{mastery.stage}</Text></View></View><View className="mt-3 h-2 overflow-hidden rounded-full bg-[#253044]"><View className="h-2 rounded-full bg-[#D6B36A]" style={{ width: `${mastery.score}%` }} /></View><Text className="mt-2 text-[10px] text-[#8F96A4]">{mastery.attempts} tentative{mastery.attempts === 1 ? "" : "s"}</Text></View>;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return <View className="flex-row items-center justify-between"><Text className="text-sm text-[#AEB4C0]">{label}</Text><Text className="text-sm font-bold text-[#F5F1E8]">{value}</Text></View>;
}

function SkillRow({ skillId, progress }: { skillId: string; progress: SkillProgress }) {
  const skillProgressPercent = getProgressInLevel(progress.xp, progress.level);
  return <View className="rounded-2xl border border-[#343947] bg-[#151820] p-4"><View className="flex-row items-center justify-between"><Text className="font-bold text-[#F5F1E8]">{skillId}</Text><Text className="text-xs text-[#AEB4C0]">Niveau {progress.level}</Text></View><View className="mt-3 h-2 overflow-hidden rounded-full bg-[#253044]"><View className="h-2 rounded-full bg-[#D6B36A]" style={{ width: `${skillProgressPercent}%` }} /></View><Text className="mt-2 text-xs text-[#8F96A4]">{progress.sessionsCount} sessions · {progress.xp} XP</Text></View>;
}

const styles = StyleSheet.create({
  badgeCell: { width: "22%" },
  content: { paddingBottom: 36 },
});
