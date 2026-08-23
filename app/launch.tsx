import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";

export default function LaunchScreen() {
  const router = useRouter();

  return (
    <ScreenContainer className="p-0" containerClassName="bg-[#05070A]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View className="items-center border-b border-[#2C3B4E] px-6 pb-8 pt-7">
          <Image
            source={require("@/assets/images/icon.png")}
            accessibilityRole="image"
            accessibilityLabel="Monogramme CoachIA C delta I"
            resizeMode="contain"
            style={styles.logo}
          />
          <Text className="mt-4" style={styles.eyebrow}>COHORTE BÊTA PRIVÉE</Text>
          <Text className="mt-3 text-center text-4xl font-bold leading-tight text-[#F4F7FB]">Progressez sur ce qui fait vraiment avancer votre travail.</Text>
          <Text className="mt-4 text-center text-base leading-6 text-[#B0BBC9]">CoachIA transforme vos défis de communication en micro-sessions personnalisées, en dix minutes par jour.</Text>
        </View>

        <View className="gap-3 px-4 pt-6">
          <BenefitCard number="01" title="Un défi précis" description="Préparez un pitch, un message client ou une décision difficile sans vous perdre dans un cours interminable." />
          <BenefitCard number="02" title="Un coach qui répond" description="Recevez une réponse adaptée à votre objectif, avec des pistes concrètes à appliquer immédiatement." />
          <BenefitCard number="03" title="Une progression visible" description="Gagnez de l’expérience, complétez vos défis et voyez votre niveau évoluer à chaque micro-victoire." />
        </View>

        <View className="mx-4 mt-6 rounded-2xl border border-[#2D8CFF] bg-[#10141D] p-5">
          <Text className="text-xs font-bold tracking-widest text-[#72D6FF]">BÊTA LIMITÉE</Text>
          <Text className="mt-2 text-2xl font-bold text-[#F4F7FB]">30 testeurs. 10 jours pour faire la différence.</Text>
          <Text className="mt-2 text-sm leading-5 text-[#B0BBC9]">Accès Free prioritaire, parcours guidé et possibilité de façonner les prochaines améliorations de CoachIA.</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Commencer gratuitement avec CoachIA"
            onPress={() => router.replace("/onboarding")}
            activeOpacity={0.8}
            className="mt-5 items-center rounded-xl border border-[#2D8CFF] bg-[#1875FF] px-4 py-4"
          >
            <Text className="font-bold text-white">Commencer gratuitement</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Découvrir le parcours bêta"
            onPress={() => router.push("/beta-welcome")}
            activeOpacity={0.75}
            className="mt-3 items-center rounded-xl border border-[#2C3B4E] bg-[#080B11] px-4 py-4"
          >
            <Text className="font-semibold text-[#F4F7FB]">Découvrir le parcours bêta</Text>
          </TouchableOpacity>
        </View>

        <View className="mx-4 mt-5 rounded-2xl border border-[#2C3B4E] bg-[#10141D] p-4">
          <Text className="text-sm font-bold text-[#F4F7FB]">Vos retours comptent, vos données restent maîtrisées.</Text>
          <Text className="mt-1 text-sm leading-5 text-[#B0BBC9]">Les indicateurs d’usage sont agrégés. Vos commentaires détaillés restent sur votre appareil jusqu’à ce que vous choisissiez de les partager.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function BenefitCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <View className="flex-row gap-4 rounded-2xl border border-[#2C3B4E] bg-[#10141D] p-4">
      <View className="h-9 w-9 items-center justify-center rounded-full border border-[#2D8CFF] bg-[#0B1727]">
        <Text className="text-xs font-bold text-[#72D6FF]">{number}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold text-[#F4F7FB]">{title}</Text>
        <Text className="mt-1 text-sm leading-5 text-[#B0BBC9]">{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 36,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
  },
  eyebrow: {
    color: "#72D6FF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.8,
  },
});
