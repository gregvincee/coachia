import { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { BETA_WELCOME_STEPS, getBetaWelcomeCompletion, type BetaWelcomeProgress } from "@/lib/beta-welcome";
import { getBetaWelcomeProgress } from "@/lib/storage";

export default function BetaWelcomeScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<BetaWelcomeProgress | null>(null);

  const loadProgress = useCallback(async () => {
    setProgress(await getBetaWelcomeProgress());
  }, []);

  useEffect(() => { void loadProgress(); }, [loadProgress]);

  const completion = progress ? getBetaWelcomeCompletion(progress) : null;

  const openStep = (stepId: (typeof BETA_WELCOME_STEPS)[number]["id"]) => {
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(stepId === "first_session" ? "/(tabs)" : "/beta-feedback");
  };

  return (
    <ScreenContainer className="bg-[#07080C] p-0" containerClassName="bg-[#07080C]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <View className="border-b border-[#D6B36A] bg-[#0B0D12] px-5 pb-7 pt-5">
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Retour aux paramètres" onPress={() => router.back()} activeOpacity={0.75}>
            <Text className="text-sm font-semibold text-[#E5DFD2]">‹ Retour</Text>
          </TouchableOpacity>
          <Text className="mt-5 text-3xl font-bold text-white">Votre parcours bêta</Text>
          <Text className="mt-2 text-sm leading-5 text-[#AEB4C0]">Deux étapes simples pour nous aider à améliorer CoachIA avant le lancement.</Text>
        </View>

        <View className="gap-5 px-4 pt-5">
          <View className="rounded-2xl border border-[#343947] bg-[#151820] p-4">
            <View className="flex-row items-end justify-between"><View><Text className="text-sm font-semibold text-[#AEB4C0]">Progression</Text><Text className="mt-1 text-2xl font-bold text-[#F5F1E8]">{completion ? `${completion.completed}/${completion.total}` : "…"}</Text></View><Text className="text-sm font-bold text-[#C89D56]">{completion ? `${Math.round(completion.ratio * 100)} %` : ""}</Text></View>
            <View className="mt-3 h-2 overflow-hidden rounded-full bg-[#343947]"><View className="h-full rounded-full bg-[#D6B36A]" style={{ width: `${Math.round((completion?.ratio ?? 0) * 100)}%` }} /></View>
          </View>

          <View className="gap-3">
            {BETA_WELCOME_STEPS.map((step, index) => {
              const completed = progress?.[step.id] ?? false;
              return (
                <TouchableOpacity key={step.id} accessibilityRole="button" accessibilityLabel={step.title} accessibilityState={{ selected: completed }} onPress={() => openStep(step.id)} activeOpacity={0.75} className="rounded-2xl border border-[#343947] bg-[#151820] p-4">
                  <View className="flex-row items-start gap-3"><View className={completed ? "h-7 w-7 items-center justify-center rounded-full bg-success" : "h-7 w-7 items-center justify-center rounded-full bg-[#D6B36A]"}><Text className="font-bold text-white">{completed ? "✓" : index + 1}</Text></View><View className="flex-1"><View className="flex-row items-center justify-between gap-3"><Text className="text-base font-bold text-[#F5F1E8]">{step.title}</Text><Text className={completed ? "text-xs font-bold text-success" : "text-xs font-bold text-[#C89D56]"}>{completed ? "Terminé" : "Commencer"}</Text></View><Text className="mt-1 text-sm leading-5 text-[#AEB4C0]">{step.description}</Text></View></View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="rounded-2xl border border-[#343947] bg-[#151820] p-4"><Text className="text-sm font-bold text-[#F5F1E8]">Ce que nous observons</Text><Text className="mt-1 text-sm leading-5 text-[#AEB4C0]">L’activité de session et votre note peuvent contribuer à des statistiques agrégées pour améliorer la bêta. Votre commentaire détaillé reste uniquement sur votre appareil.</Text></View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
