import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";

function Principle({ title, children }: { title: string; children: string }) {
  return (
    <View className="mt-5 rounded-2xl border border-[#343947] bg-[#151820] p-5">
      <Text className="text-base font-bold text-[#F5F1E8]">{title}</Text>
      <Text className="mt-2 text-sm leading-6 text-[#AEB4C0]">{children}</Text>
    </View>
  );
}

export default function ResponsibleAiScreen() {
  const router = useRouter();
  return (
    <ScreenContainer className="p-0" containerClassName="bg-[#07080C]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 28, paddingBottom: 36 }}>
        <Text className="text-xs font-bold tracking-widest text-[#E8C98A]">IA RESPONSABLE</Text>
        <Text className="mt-3 text-3xl font-bold leading-10 text-[#F5F1E8]">Un diagnostic pour apprendre, pas pour étiqueter.</Text>
        <Text className="mt-3 text-sm leading-6 text-[#AEB4C0]">CoachIA aide à améliorer une tentative précise. Il ne classe pas les personnes et ne prend aucune décision d’admission, d’emploi, de crédit ou d’accès à un droit.</Text>
        <Principle title="Même règle pour chaque personne">Les capacités évaluées sont les mêmes pour les missions Créer, Résoudre et Construire : structurer une demande, vérifier une réponse, raisonner et concevoir un workflow. Le score doit être lu avec la tentative et son contexte, jamais isolément.</Principle>
        <Principle title="Limites connues">La qualité d’un diagnostic peut varier selon la langue, l’orthographe, le style, la longueur, les outils d’assistance et le contexte fourni. Les scores ne mesurent ni l’intelligence, ni la personnalité, ni la valeur professionnelle. Une formulation atypique ne doit pas être interprétée comme une incapacité.</Principle>
        <Principle title="Droit à la reprise">Chaque diagnostic affiche une difficulté et une correction actionnable. L’utilisateur peut modifier sa tentative, refaire la mission et progresser. Une erreur de l’IA ne doit pas devenir une sanction permanente.</Principle>
        <Principle title="Accessibilité et accommodations">Les utilisateurs peuvent rédiger avec leurs outils d’assistance et expliquer un besoin dans leur tentative. Les missions ne doivent pas exiger une vitesse, une orthographe, une vision, une audition ou une motricité particulières. Les contrôles doivent rester utilisables au clavier et avec un lecteur d’écran sur le web.</Principle>
        <Principle title="Vérification humaine">Ne prenez pas une décision importante à partir d’un score CoachIA. Pour signaler un diagnostic incohérent, conservez la mission et la tentative localement, puis utilisez le canal de support légal qui sera publié avant le lancement public.</Principle>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Retourner à la page de lancement CoachIA" onPress={() => router.replace("/launch")} activeOpacity={0.8} className="mt-6 items-center rounded-xl border border-[#C89D56] bg-[#D6B36A] px-4 py-4">
          <Text className="font-bold text-[#07080C]">Retour à la page de lancement</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
