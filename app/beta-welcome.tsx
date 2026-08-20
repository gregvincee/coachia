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
    <ScreenContainer className="bg-[#05070A] p-0" containerClassName="bg-[#05070A]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <View className="border-b border-[#1875FF] bg-[#080B11] px-5 pb-7 pt-5">
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Retour aux paramètres" onPress={() => router.back()} activeOpacity={0.75}>
            <Text className="text-sm font-semibold text-[#D9E4F3]">‹ Retour</Text>
          </TouchableOpacity>
          <Text className="mt-5 text-3xl font-bold text-white">Votre parcours bêta</Text>
          <Text className="mt-2 text-sm leading-5 text-[#B0BBC9]">Deux étapes simples pour nous aider à améliorer CoachIA avant le lancement.</Text>
        </View>

        <View className="gap-5 px-4 pt-5">
          <View className="rounded-2xl border border-[#2C3B4E] bg-[#10141D] p-4">
            <View className="flex-row items-end justify-between"><View><Text className="text-sm font-semibold text-[#B0BBC9]">Progression</Text><Text className="mt-1 text-2xl font-bold text-[#F4F7FB]">{completion ? `${completion.completed}/${completion.total}` : "…"}</Text></View><Text className="text-sm font-bold text-[#2D8CFF]">{completion ? `${Math.round(completion.ratio * 100)} %` : ""}</Text></View>
            <View className="mt-3 h-2 overflow-hidden rounded-full bg-[#263545]"><View className="h-full rounded-full bg-[#1875FF]" style={{ width: `${Math.round((completion?.ratio ?? 0) * 100)}%` }} /></View>
          </View>

          <View className="gap-3">
            {BETA_WELCOME_STEPS.map((step, index) => {
              const completed = progress?.[step.id] ?? false;
              return (
                <TouchableOpacity key={step.id} accessibilityRole="button" accessibilityLabel={step.title} accessibilityState={{ selected: completed }} onPress={() => openStep(step.id)} activeOpacity={0.75} className="rounded-2xl border border-[#2C3B4E] bg-[#10141D] p-4">
                  <View className="flex-row items-start gap-3"><View className={completed ? "h-7 w-7 items-center justify-center rounded-full bg-success" : "h-7 w-7 items-center justify-center rounded-full bg-[#1875FF]"}><Text className="font-bold text-white">{completed ? "✓" : index + 1}</Text></View><View className="flex-1"><View className="flex-row items-center justify-between gap-3"><Text className="text-base font-bold text-[#F4F7FB]">{step.title}</Text><Text className={completed ? "text-xs font-bold text-success" : "text-xs font-bold text-[#2D8CFF]"}>{completed ? "Terminé" : "Commencer"}</Text></View><Text className="mt-1 text-sm leading-5 text-[#B0BBC9]">{step.description}</Text></View></View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="rounded-2xl border border-[#2C3B4E] bg-[#10141D] p-4"><Text className="text-sm font-bold text-[#F4F7FB]">Ce que nous observons</Text><Text className="mt-1 text-sm leading-5 text-[#B0BBC9]">L’activité de session et votre note peuvent contribuer à des statistiques agrégées pour améliorer la bêta. Votre commentaire détaillé reste uniquement sur votre appareil.</Text></View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
