import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

export default function LaunchScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const joinWaitlist = trpc.beta.joinWaitlist.useMutation();

  async function submitWaitlist() {
    setNotice(null);
    if (!consent) {
      setNotice("Votre consentement est nécessaire pour vous recontacter au sujet de la bêta.");
      return;
    }

    try {
      const result = await joinWaitlist.mutateAsync({ email, consent: true });
      setNotice(
        result.status === "created"
          ? "Votre place est enregistrée. Nous vous contacterons à l’ouverture de la bêta."
          : "Cette adresse est déjà enregistrée pour la bêta.",
      );
      if (result.status === "created") setEmail("");
    } catch {
      setNotice("Impossible de valider votre inscription pour le moment. Réessayez un peu plus tard.");
    }
  }

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

        <View className="mx-4 mt-5 rounded-2xl border border-[#2C3B4E] bg-[#10141D] p-5">
          <Text className="text-xs font-bold tracking-widest text-[#72D6FF]">LISTE BÊTA</Text>
          <Text className="mt-2 text-xl font-bold text-[#F4F7FB]">Recevez votre accès en priorité.</Text>
          <Text className="mt-2 text-sm leading-5 text-[#B0BBC9]">Laissez votre adresse uniquement si vous souhaitez être recontacté pour tester CoachIA.</Text>
          <TextInput
            accessibilityLabel="Adresse e-mail pour l’inscription bêta"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="vous@exemple.com"
            placeholderTextColor="#788899"
            returnKeyType="done"
            style={styles.emailInput}
            value={email}
          />
          <TouchableOpacity
            accessibilityRole="checkbox"
            accessibilityLabel="Consentir à être recontacté pour la bêta CoachIA"
            accessibilityState={{ checked: consent }}
            activeOpacity={0.75}
            className="mt-4 flex-row items-start gap-3"
            onPress={() => setConsent((current) => !current)}
          >
            <View className={consent ? "mt-0.5 h-5 w-5 items-center justify-center rounded border border-[#2D8CFF] bg-[#1875FF]" : "mt-0.5 h-5 w-5 rounded border border-[#788899] bg-[#080B11]"}>
              {consent ? <Text className="text-xs font-bold text-white">✓</Text> : null}
            </View>
            <Text className="flex-1 text-xs leading-5 text-[#B0BBC9]">J’accepte que CoachIA conserve mon adresse pour me recontacter uniquement au sujet de cette bêta.</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Rejoindre la liste bêta CoachIA"
            disabled={joinWaitlist.isPending}
            onPress={() => void submitWaitlist()}
            activeOpacity={0.8}
            className="mt-5 items-center rounded-xl border border-[#2D8CFF] bg-[#1875FF] px-4 py-4"
            style={joinWaitlist.isPending ? styles.disabledButton : undefined}
          >
            <Text className="font-bold text-white">{joinWaitlist.isPending ? "Validation…" : "Rejoindre la liste bêta"}</Text>
          </TouchableOpacity>
          {notice ? <Text accessibilityLiveRegion="polite" className="mt-3 text-sm leading-5 text-[#D9E4F3]">{notice}</Text> : null}
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
  emailInput: {
    marginTop: 16,
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#2C3B4E",
    borderRadius: 12,
    backgroundColor: "#080B11",
    color: "#F4F7FB",
    fontSize: 16,
    paddingHorizontal: 14,
  },
  disabledButton: {
    opacity: 0.65,
  },
});
