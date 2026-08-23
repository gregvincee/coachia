import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";

function PrivacySection({ title, children }: { title: string; children: string }) {
  return (
    <View className="mt-5 rounded-2xl border border-[#2C3B4E] bg-[#10141D] p-5">
      <Text className="text-base font-bold text-[#F4F7FB]">{title}</Text>
      <Text className="mt-2 text-sm leading-6 text-[#B0BBC9]">{children}</Text>
    </View>
  );
}

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <ScreenContainer className="p-0" containerClassName="bg-[#05070A]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 28, paddingBottom: 36 }}>
        <Text className="text-xs font-bold tracking-widest text-[#72D6FF]">TRANSPARENCE BÊTA</Text>
        <Text className="mt-3 text-3xl font-bold leading-10 text-[#F4F7FB]">Votre confidentialité, simplement expliquée.</Text>
        <Text className="mt-3 text-sm leading-6 text-[#B0BBC9]">Cette page décrit le traitement des données dans la bêta CoachIA. Il s’agit d’un brouillon de transparence produit à faire valider avant un lancement public élargi.</Text>

        <PrivacySection
          title="Ce que nous collectons"
        >
          Si vous rejoignez la liste bêta, nous conservons votre adresse e-mail et la date de votre consentement. Dans l’application, les indicateurs de cohorte sont agrégés et les retours détaillés restent sur votre appareil jusqu’à un partage volontaire.
        </PrivacySection>
        <PrivacySection
          title="Pourquoi"
        >
          Votre adresse sert uniquement à vous inviter, à vous informer de l’ouverture de la bêta et à vous communiquer les étapes de test. Elle n’est pas vendue ni utilisée pour personnaliser les métriques administratives.
        </PrivacySection>
        <PrivacySection
          title="Séparation des données"
        >
          L’adresse de la liste d’attente est conservée séparément des indicateurs d’usage. Les rapports administratifs affichent des tendances de cohorte anonymisées, sans adresse e-mail ni contenu de conversation.
        </PrivacySection>
        <PrivacySection
          title="Durée et retrait"
        >
          L’adresse est conservée pendant la préparation et le déroulement de la bêta, ou jusqu’à votre demande de retrait. Vous pourrez répondre à l’invitation bêta reçue pour demander l’accès, la correction ou la suppression de votre inscription.
        </PrivacySection>

        <Text className="mt-6 text-xs leading-5 text-[#788899]">Version bêta — 23 août 2026</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Retourner à la page de lancement CoachIA"
          activeOpacity={0.8}
          className="mt-5 items-center rounded-xl border border-[#2D8CFF] bg-[#1875FF] px-4 py-4"
          onPress={() => router.replace("/launch")}
        >
          <Text className="font-bold text-white">Retour à la page de lancement</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
