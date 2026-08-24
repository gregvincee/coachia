import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { ScreenContainer } from '@/components/screen-container';
import { addXP } from '@/lib/gamification';
import {
  MISSION_DEFINITIONS,
  diagnoseMissionAttempt,
  recordMissionAttempt,
  type MissionDiagnosis,
  type MissionLearningState,
  type MissionTrackId,
} from '@/lib/mission-engine';
import { getMissionLearningState, saveMissionLearningState } from '@/lib/storage';
import { trpc } from '@/lib/trpc';

const EXAMPLES: Record<MissionTrackId, string> = {
  create: 'Contexte : je présente une offre à des freelances. Objectif : écrire un post LinkedIn. Audience : créateurs indépendants. Format : 120 mots. Contrainte : ton direct, sans promesse exagérée.',
  solve: 'Contexte : un client répond peu à mes propositions. Objectif : choisir la meilleure relance. Propose deux options avec avantages, risques et critère de décision. Vérifie les hypothèses que tu fais.',
  build: 'Déclencheur : chaque nouveau brief client. Étapes : extraire les besoins, créer un brouillon, demander une vérification humaine, envoyer la version validée. Résultat : un workflow répétable et contrôlable.',
};

export default function MissionScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: MissionTrackId }>();
  const router = useRouter();
  const [learning, setLearning] = useState<MissionLearningState | null>(null);
  const [request, setRequest] = useState('');
  const [result, setResult] = useState('');
  const [diagnosis, setDiagnosis] = useState<MissionDiagnosis | null>(null);
  const [showWhy, setShowWhy] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const mission = missionId ? MISSION_DEFINITIONS[missionId] : undefined;
  const diagnoseMission = trpc.ai.diagnoseMission.useMutation();

  useEffect(() => {
    async function load() {
      const current = await getMissionLearningState();
      if (!mission) return;
      const next = { ...current, activeMissionId: mission.id };
      await saveMissionLearningState(next);
      setLearning(next);
    }
    void load();
  }, [mission]);

  if (!mission || !learning) return <ScreenContainer className="p-6"><Text className="text-muted">Préparation de la mission…</Text></ScreenContainer>;

  async function analyzeAttempt() {
    if (!mission || !learning) return;
    if (!request.trim() || !result.trim()) {
      setNotice('Décrivez votre demande et ce que l’IA vous a réellement répondu avant de demander le diagnostic.');
      return;
    }
    const fallbackDiagnosis = diagnoseMissionAttempt(mission.id, request, result);
    let nextDiagnosis = fallbackDiagnosis;
    let usedFallback = false;
    try {
      nextDiagnosis = await diagnoseMission.mutateAsync({ missionId: mission.id, request, result });
    } catch {
      usedFallback = true;
      setNotice('Le diagnostic personnalisé sera disponible dès que le coach IA pourra répondre. Votre progression locale a tout de même été mise à jour.');
    }
    const nextState = recordMissionAttempt(learning, {
      id: `mission-${Date.now()}`,
      missionId: mission.id,
      request,
      result,
      diagnosis: nextDiagnosis,
      createdAt: new Date().toISOString(),
    });
    await saveMissionLearningState(nextState);
    await addXP(15);
    setLearning(nextState);
    setDiagnosis(nextDiagnosis);
    if (!usedFallback) setNotice(null);
  }

  function retryMission() {
    setDiagnosis(null);
    setResult('');
    setNotice('Nouvelle tentative : améliorez votre demande avant de consulter une nouvelle réponse IA.');
  }

  return (
    <ScreenContainer className="p-0" containerClassName="bg-[#05070A]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View className="flex-row items-center border-b border-[#2C3B4E] px-5 pb-4 pt-3"><TouchableOpacity accessibilityRole="button" accessibilityLabel="Retour aux missions" onPress={() => router.back()} activeOpacity={0.75}><Text className="text-base font-semibold text-[#D9E4F3]">‹ Missions</Text></TouchableOpacity><Text className="ml-4 flex-1 text-right text-xs font-bold tracking-widest text-[#72D6FF]">{mission.label.toUpperCase()}</Text></View>
        <View className="gap-5 px-5 pt-6">
          <View><Text className="text-3xl font-bold leading-10 text-[#F4F7FB]">{mission.title}</Text><Text className="mt-3 text-base leading-6 text-[#B0BBC9]">{mission.goal}</Text></View>
          <View className="rounded-2xl border border-[#2D8CFF] bg-[#10141D] p-4"><Text className="text-xs font-bold tracking-widest text-[#72D6FF]">RÉSULTAT À CONSERVER</Text><Text className="mt-2 text-base font-semibold leading-6 text-[#F4F7FB]">{mission.outcome}</Text></View>
          <View className="flex-row gap-3"><TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: showWhy }} onPress={() => setShowWhy((value) => !value)} activeOpacity={0.75} className="flex-1 rounded-xl border border-[#2C3B4E] bg-[#10141D] px-3 py-3"><Text className="text-center font-semibold text-[#D9E4F3]">Pourquoi ?</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: showExample }} onPress={() => setShowExample((value) => !value)} activeOpacity={0.75} className="flex-1 rounded-xl border border-[#2C3B4E] bg-[#10141D] px-3 py-3"><Text className="text-center font-semibold text-[#D9E4F3]">Montre-moi</Text></TouchableOpacity></View>
          {showWhy ? <View className="rounded-2xl bg-[#171E29] p-4"><Text className="text-sm leading-6 text-[#D9E4F3]">{mission.whyItMatters}</Text></View> : null}
          {showExample ? <View className="rounded-2xl bg-[#171E29] p-4"><Text className="text-xs font-bold tracking-widest text-[#72D6FF]">EXEMPLE À ADAPTER</Text><Text className="mt-2 text-sm leading-6 text-[#D9E4F3]">{EXAMPLES[mission.id]}</Text></View> : null}
          {!diagnosis ? <AttemptPanel missionHint={mission.firstAttemptHint} request={request} result={result} notice={notice} onRequest={setRequest} onResult={setResult} onAnalyze={() => void analyzeAttempt()} /> : <DiagnosisPanel diagnosis={diagnosis} learning={learning} onRetry={retryMission} onOpenCoach={() => router.push(`/coaching/${mission.coachingSkillId}`)} />}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function AttemptPanel({ missionHint, request, result, notice, onRequest, onResult, onAnalyze }: { missionHint: string; request: string; result: string; notice: string | null; onRequest: (value: string) => void; onResult: (value: string) => void; onAnalyze: () => void }) {
  return <View className="gap-4 rounded-3xl border border-[#2C3B4E] bg-[#10141D] p-5"><View><Text className="text-xs font-bold tracking-widest text-[#72D6FF]">1 · VOTRE TENTATIVE</Text><Text className="mt-2 text-lg font-bold text-[#F4F7FB]">Ne demandez pas la réponse parfaite.</Text><Text className="mt-1 text-sm leading-5 text-[#B0BBC9]">{missionHint}</Text></View><TextInput accessibilityLabel="Demande que vous avez faite à l’intelligence artificielle" value={request} onChangeText={onRequest} placeholder="Copiez ou écrivez votre demande…" placeholderTextColor="#788899" multiline style={styles.input} textAlignVertical="top" /><View><Text className="text-xs font-bold tracking-widest text-[#72D6FF]">2 · RÉSULTAT OBSERVÉ</Text><Text className="mt-2 text-sm leading-5 text-[#B0BBC9]">Qu’a répondu l’IA, et qu’est-ce qui vous semble faible ou incomplet ?</Text></View><TextInput accessibilityLabel="Résultat obtenu avec l’intelligence artificielle" value={result} onChangeText={onResult} placeholder="Décrivez le résultat réel…" placeholderTextColor="#788899" multiline style={styles.input} textAlignVertical="top" /><TouchableOpacity accessibilityRole="button" accessibilityLabel="Diagnostiquer ma tentative" onPress={onAnalyze} activeOpacity={0.8} className="items-center rounded-xl bg-[#1875FF] px-4 py-4" disabled={false}><Text className="font-bold text-white">Diagnostiquer ma tentative</Text></TouchableOpacity>{notice ? <Text accessibilityLiveRegion="polite" className="text-sm leading-5 text-[#D9E4F3]">{notice}</Text> : null}</View>;
}

function DiagnosisPanel({ diagnosis, learning, onRetry, onOpenCoach }: { diagnosis: MissionDiagnosis; learning: MissionLearningState; onRetry: () => void; onOpenCoach: () => void }) {
  return <View className="gap-4 rounded-3xl border border-[#2D8CFF] bg-[#10141D] p-5"><Text className="text-xs font-bold tracking-widest text-[#72D6FF]">3 · DIAGNOSTIC</Text><Text className="text-2xl font-bold text-[#F4F7FB]">Maîtrise provisoire : {diagnosis.overallScore}/100</Text><Text className="text-sm leading-6 text-[#D9E4F3]">{diagnosis.strength}</Text><View className="rounded-2xl bg-[#080B11] p-4"><Text className="text-xs font-bold text-[#72D6FF]">DIFFICULTÉ À TRAVAILLER</Text><Text className="mt-1 text-sm leading-5 text-[#F4F7FB]">{diagnosis.difficulty}</Text></View><Text className="text-sm leading-6 text-[#B0BBC9]">{diagnosis.correction}</Text><Text className="text-sm leading-6 text-[#D9E4F3]">{diagnosis.retryPrompt}</Text><View className="rounded-2xl bg-[#171E29] p-4"><Text className="text-sm font-bold text-[#F4F7FB]">Carte de capacités mise à jour</Text><Text className="mt-1 text-sm leading-5 text-[#B0BBC9]">Prompting {learning.mastery.prompting.score}/100 · Vérification {learning.mastery.verification.score}/100 · Raisonnement {learning.mastery.reasoning.score}/100 · Workflow {learning.mastery.automation.score}/100</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Faire une nouvelle tentative de mission" onPress={onRetry} activeOpacity={0.8} className="items-center rounded-xl bg-[#1875FF] px-4 py-4"><Text className="font-bold text-white">Nouvelle tentative</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityLabel="Ouvrir le coach IA pour améliorer la demande" onPress={onOpenCoach} activeOpacity={0.75} className="items-center rounded-xl border border-[#2C3B4E] bg-[#080B11] px-4 py-4"><Text className="font-semibold text-[#F4F7FB]">Améliorer avec le coach IA</Text></TouchableOpacity></View>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 36 },
  input: { minHeight: 116, borderWidth: 1, borderColor: '#2C3B4E', borderRadius: 14, backgroundColor: '#080B11', color: '#F4F7FB', fontSize: 16, lineHeight: 22, padding: 14 },
});
