import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { ScreenContainer } from '@/components/screen-container';
import { addXP } from '@/lib/gamification';
import { getMissionCorrectionExample } from '@/lib/mission-correction-examples';
import {
  MISSION_DEFINITIONS,
  diagnoseMissionAttempt,
  recordMissionAttempt,
  type MissionDiagnosis,
  type MasteryCapabilityId,
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
          {!diagnosis ? <AttemptPanel missionHint={mission.firstAttemptHint} request={request} result={result} notice={notice} onRequest={setRequest} onResult={setResult} onAnalyze={() => void analyzeAttempt()} /> : <DiagnosisPanel missionId={mission.id} diagnosis={diagnosis} learning={learning} onRetry={retryMission} onOpenCoach={() => router.push(`/coaching/${mission.coachingSkillId}`)} />}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function AttemptPanel({ missionHint, request, result, notice, onRequest, onResult, onAnalyze }: { missionHint: string; request: string; result: string; notice: string | null; onRequest: (value: string) => void; onResult: (value: string) => void; onAnalyze: () => void }) {
  return <View className="gap-4 rounded-3xl border border-[#2C3B4E] bg-[#10141D] p-5"><View><Text className="text-xs font-bold tracking-widest text-[#72D6FF]">1 · VOTRE TENTATIVE</Text><Text className="mt-2 text-lg font-bold text-[#F4F7FB]">Ne demandez pas la réponse parfaite.</Text><Text className="mt-1 text-sm leading-5 text-[#B0BBC9]">{missionHint}</Text></View><TextInput accessibilityLabel="Demande que vous avez faite à l’intelligence artificielle" value={request} onChangeText={onRequest} placeholder="Copiez ou écrivez votre demande…" placeholderTextColor="#788899" multiline style={styles.input} textAlignVertical="top" /><View><Text className="text-xs font-bold tracking-widest text-[#72D6FF]">2 · RÉSULTAT OBSERVÉ</Text><Text className="mt-2 text-sm leading-5 text-[#B0BBC9]">Qu’a répondu l’IA, et qu’est-ce qui vous semble faible ou incomplet ?</Text></View><TextInput accessibilityLabel="Résultat obtenu avec l’intelligence artificielle" value={result} onChangeText={onResult} placeholder="Décrivez le résultat réel…" placeholderTextColor="#788899" multiline style={styles.input} textAlignVertical="top" /><TouchableOpacity accessibilityRole="button" accessibilityLabel="Diagnostiquer ma tentative" onPress={onAnalyze} activeOpacity={0.8} className="items-center rounded-xl bg-[#1875FF] px-4 py-4" disabled={false}><Text className="font-bold text-white">Diagnostiquer ma tentative</Text></TouchableOpacity>{notice ? <Text accessibilityLiveRegion="polite" className="text-sm leading-5 text-[#D9E4F3]">{notice}</Text> : null}</View>;
}

const CAPABILITY_DETAILS: Record<MasteryCapabilityId, { label: string; icon: string; action: string }> = {
  prompting: { label: 'Prompting', icon: '✦', action: 'Ajoutez le contexte, l’audience et un format mesurable.' },
  verification: { label: 'Vérifier', icon: '✓', action: 'Ajoutez une source, un critère de contrôle ou une preuve attendue.' },
  reasoning: { label: 'Raisonner', icon: '◆', action: 'Demandez des options, les hypothèses et le pourquoi de la recommandation.' },
  automation: { label: 'Workflow', icon: '→', action: 'Décrivez le déclencheur, les étapes, le contrôle et le résultat final.' },
};

function DiagnosisPanel({ missionId, diagnosis, learning, onRetry, onOpenCoach }: { missionId: MissionTrackId; diagnosis: MissionDiagnosis; learning: MissionLearningState; onRetry: () => void; onOpenCoach: () => void }) {
  const weakestCapability = (Object.entries(diagnosis.capabilityScores) as Array<[MasteryCapabilityId, number]>).sort(([, left], [, right]) => left - right)[0][0];
  const [focusedCapability, setFocusedCapability] = useState<MasteryCapabilityId>(weakestCapability);
  const [showScoreGuide, setShowScoreGuide] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [showConcreteExample, setShowConcreteExample] = useState(false);
  const focusedDetails = CAPABILITY_DETAILS[focusedCapability];
  const focusedScore = diagnosis.capabilityScores[focusedCapability];
  const correctionExample = getMissionCorrectionExample(missionId, diagnosis);

  return (
    <View className="gap-5 rounded-3xl border border-[#2D8CFF] bg-[#10141D] p-5">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1"><Text className="text-xs font-bold tracking-widest text-[#72D6FF]">3 · DIAGNOSTIC PÉDAGOGIQUE</Text><Text className="mt-2 text-2xl font-bold leading-8 text-[#F4F7FB]">Voici ce qui fera progresser votre prochaine tentative.</Text></View>
        <View className="items-center rounded-2xl border border-[#2D8CFF] bg-[#071B3A] px-3 py-2"><Text className="text-2xl font-bold text-[#72D6FF]">{diagnosis.overallScore}</Text><Text className="text-[10px] font-bold tracking-wide text-[#B0BBC9]">/ 100</Text></View>
      </View>

      <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: showScoreGuide }} accessibilityLabel="Comprendre le score de maîtrise" onPress={() => setShowScoreGuide((value) => !value)} activeOpacity={0.75} className="flex-row items-center justify-between rounded-xl bg-[#080B11] px-4 py-3"><Text className="text-sm font-semibold text-[#D9E4F3]">Comprendre le score de maîtrise</Text><Text className="text-lg text-[#72D6FF]">{showScoreGuide ? '−' : '+'}</Text></TouchableOpacity>
      {showScoreGuide ? <View className="rounded-2xl border border-[#2C3B4E] bg-[#171E29] p-4"><Text className="text-sm leading-6 text-[#D9E4F3]">Le score mesure ce que votre tentative démontre aujourd’hui. Il ne récompense pas l’effort seul et il ne remplace pas vos XP.</Text></View> : null}

      <View className="rounded-2xl border border-[#3B8069] bg-[#0C2520] p-4"><Text className="text-xs font-bold tracking-widest text-[#6FE0B4]">✓ CE QUI EST DÉJÀ SOLIDE</Text><Text className="mt-2 text-sm leading-6 text-[#E1F8EF]">{diagnosis.strength}</Text></View>

      <View className="rounded-2xl border border-[#C48A33] bg-[#302312] p-4"><Text className="text-xs font-bold tracking-widest text-[#FFD184]">↗ PRIORITÉ DE PROGRESSION</Text><Text className="mt-2 text-base font-semibold leading-6 text-[#FFF1D7]">{diagnosis.difficulty}</Text></View>

      <View className="gap-3"><View className="flex-row items-center justify-between"><Text className="text-base font-bold text-[#F4F7FB]">Vos capacités dans cette tentative</Text><Text className="text-xs text-[#B0BBC9]">Touchez pour explorer</Text></View><View className="flex-row gap-2"><CapabilityTile capabilityId="prompting" score={diagnosis.capabilityScores.prompting} selected={focusedCapability === 'prompting'} onPress={setFocusedCapability} /><CapabilityTile capabilityId="verification" score={diagnosis.capabilityScores.verification} selected={focusedCapability === 'verification'} onPress={setFocusedCapability} /><CapabilityTile capabilityId="reasoning" score={diagnosis.capabilityScores.reasoning} selected={focusedCapability === 'reasoning'} onPress={setFocusedCapability} /><CapabilityTile capabilityId="automation" score={diagnosis.capabilityScores.automation} selected={focusedCapability === 'automation'} onPress={setFocusedCapability} /></View></View>

      <View className="rounded-2xl border border-[#34557F] bg-[#0D1C31] p-4"><Text className="text-xs font-bold tracking-widest text-[#72D6FF]">FOCUS · {focusedDetails.label.toUpperCase()} · {focusedScore}/100</Text><Text className="mt-2 text-sm leading-6 text-[#D9E4F3]">{focusedDetails.action}</Text><Text className="mt-2 text-xs leading-5 text-[#8290A2]">Votre niveau cumulé dans cette capacité : {learning.mastery[focusedCapability].score}/100.</Text></View>

      <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: showCorrection }} accessibilityLabel="Voir la correction détaillée de l’intelligence artificielle" onPress={() => setShowCorrection((value) => !value)} activeOpacity={0.75} className="flex-row items-center justify-between rounded-xl border border-[#2C3B4E] bg-[#080B11] px-4 py-4"><View><Text className="font-bold text-[#F4F7FB]">Voir la correction de l’IA</Text><Text className="mt-0.5 text-xs text-[#B0BBC9]">Appliquez-la plutôt que de demander une réponse neuve.</Text></View><Text className="text-lg text-[#72D6FF]">{showCorrection ? '⌃' : '⌄'}</Text></TouchableOpacity>
      {showCorrection ? <View className="rounded-2xl border border-[#2D8CFF] bg-[#071B3A] p-4"><Text className="text-xs font-bold tracking-widest text-[#72D6FF]">CORRECTION À APPLIQUER</Text><Text className="mt-2 text-sm leading-6 text-[#E0EDFF]">{diagnosis.correction}</Text></View> : null}

      <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: showConcreteExample }} accessibilityLabel="Voir un exemple de correction adapté à la difficulté détectée" onPress={() => setShowConcreteExample((value) => !value)} activeOpacity={0.75} className="flex-row items-center justify-between rounded-xl border border-[#5E54B8] bg-[#181530] px-4 py-4"><View><Text className="font-bold text-[#F2EDFF]">Voir un exemple adapté</Text><Text className="mt-0.5 text-xs text-[#C5B9FF]">{correctionExample.levelLabel} · un modèle à adapter, jamais à recopier.</Text></View><Text className="text-lg text-[#C5B9FF]">{showConcreteExample ? '⌃' : '⌄'}</Text></TouchableOpacity>
      {showConcreteExample ? <View className="rounded-2xl border border-[#6B5EEB] bg-[#17142D] p-4"><Text className="text-xs font-bold tracking-widest text-[#C5B9FF]">EXEMPLE ADAPTÉ · {correctionExample.levelLabel.toUpperCase()}</Text><Text className="mt-2 text-xs leading-5 text-[#D8D2FF]">{correctionExample.levelGuidance}</Text><Text className="mt-3 text-base font-bold leading-6 text-[#F2EDFF]">{correctionExample.title}</Text><View className="mt-4 rounded-xl border border-[#7A4452] bg-[#2C1820] p-3"><Text className="text-xs font-bold tracking-wide text-[#FFADB8]">AVANT</Text><Text className="mt-1 text-sm leading-6 text-[#FFE6EA]">{correctionExample.before}</Text></View><View className="mt-3 rounded-xl border border-[#3B8069] bg-[#0C2520] p-3"><Text className="text-xs font-bold tracking-wide text-[#82E8BE]">APRÈS</Text><Text className="mt-1 text-sm leading-6 text-[#E2FFF1]">{correctionExample.after}</Text></View><Text className="mt-4 text-sm leading-6 text-[#D8D2FF]">{correctionExample.takeaway}</Text></View> : null}

      <View className="rounded-2xl bg-[#171E29] p-4"><Text className="text-xs font-bold tracking-widest text-[#B5C7DD]">4 · PLAN DE RETENTATIVE</Text><Text className="mt-2 text-sm leading-6 text-[#F4F7FB]">{diagnosis.retryPrompt}</Text></View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Appliquer les conseils et faire une nouvelle tentative" onPress={onRetry} activeOpacity={0.8} className="items-center rounded-xl bg-[#1875FF] px-4 py-4"><Text className="font-bold text-white">Appliquer les conseils et réessayer</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Ouvrir le coach IA pour approfondir la correction" onPress={onOpenCoach} activeOpacity={0.75} className="items-center rounded-xl border border-[#2C3B4E] bg-[#080B11] px-4 py-4"><Text className="font-semibold text-[#F4F7FB]">Approfondir avec le coach IA</Text></TouchableOpacity>
    </View>
  );
}

function CapabilityTile({ capabilityId, score, selected, onPress }: { capabilityId: MasteryCapabilityId; score: number; selected: boolean; onPress: (capabilityId: MasteryCapabilityId) => void }) {
  const details = CAPABILITY_DETAILS[capabilityId];
  return <TouchableOpacity accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={`${details.label}, score ${score} sur 100`} onPress={() => onPress(capabilityId)} activeOpacity={0.75} className={selected ? 'flex-1 rounded-xl border border-[#2D8CFF] bg-[#17355C] px-2 py-3' : 'flex-1 rounded-xl border border-[#2C3B4E] bg-[#080B11] px-2 py-3'}><Text className="text-center text-base text-[#72D6FF]">{details.icon}</Text><Text className="mt-1 text-center text-[10px] font-semibold text-[#D9E4F3]" numberOfLines={1}>{details.label}</Text><Text className="mt-1 text-center text-sm font-bold text-[#F4F7FB]">{score}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 36 },
  input: { minHeight: 116, borderWidth: 1, borderColor: '#2C3B4E', borderRadius: 14, backgroundColor: '#080B11', color: '#F4F7FB', fontSize: 16, lineHeight: 22, padding: 14 },
});
