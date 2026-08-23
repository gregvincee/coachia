import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

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
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const withdrawWaitlist = trpc.beta.withdrawWaitlist.useMutation();

  async function submitWithdrawal() {
    setNotice(null);
    if (!confirmed) {
      setNotice("Confirmez votre demande avant de retirer l’adresse de la liste bêta.");
      return;
    }

    try {
      await withdrawWaitlist.mutateAsync({ email, confirm: true });
      setEmail("");
      setConfirmed(false);
      setNotice("Votre demande a été traitée. Cette adresse ne recevra plus d’invitation bêta.");
    } catch {
      setNotice("Impossible de traiter votre demande pour le moment. Réessayez plus tard.");
    }
  }

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
          L’adresse est conservée pendant la préparation et le déroulement de la bêta, ou jusqu’à votre demande de retrait. Le formulaire ci-dessous supprime l’adresse de la liste d’attente et ne renvoie pas son statut, afin de ne pas exposer l’inscription d’une autre personne.
        </PrivacySection>

        <View className="mt-5 rounded-2xl border border-[#2D8CFF] bg-[#10141D] p-5">
          <Text className="text-xs font-bold tracking-widest text-[#72D6FF]">RETRAIT DE LA BÊTA</Text>
          <Text className="mt-2 text-xl font-bold text-[#F4F7FB]">Retirer mon adresse de la liste</Text>
          <Text className="mt-2 text-sm leading-6 text-[#B0BBC9]">Saisissez l’adresse utilisée pour l’inscription. La réponse ne confirme jamais si elle était présente dans la liste.</Text>
          <TextInput
            accessibilityLabel="Adresse e-mail à retirer de la liste bêta"
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
            accessibilityLabel="Confirmer le retrait de cette adresse de la liste bêta"
            accessibilityState={{ checked: confirmed }}
            activeOpacity={0.75}
            className="mt-4 flex-row items-start gap-3"
            onPress={() => setConfirmed((current) => !current)}
          >
            <View className={confirmed ? "mt-0.5 h-5 w-5 items-center justify-center rounded border border-[#2D8CFF] bg-[#1875FF]" : "mt-0.5 h-5 w-5 rounded border border-[#788899] bg-[#080B11]"}>
              {confirmed ? <Text className="text-xs font-bold text-white">✓</Text> : null}
            </View>
            <Text className="flex-1 text-xs leading-5 text-[#B0BBC9]">Je confirme vouloir retirer cette adresse de la liste d’attente bêta.</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Confirmer le retrait de la liste bêta"
            activeOpacity={0.8}
            className="mt-5 items-center rounded-xl border border-[#2D8CFF] bg-[#1875FF] px-4 py-4"
            disabled={withdrawWaitlist.isPending}
            onPress={() => void submitWithdrawal()}
            style={withdrawWaitlist.isPending ? styles.disabledButton : undefined}
          >
            <Text className="font-bold text-white">{withdrawWaitlist.isPending ? "Traitement…" : "Retirer mon adresse"}</Text>
          </TouchableOpacity>
          {notice ? <Text accessibilityLiveRegion="polite" className="mt-3 text-sm leading-5 text-[#D9E4F3]">{notice}</Text> : null}
        </View>

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

const styles = StyleSheet.create({
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
