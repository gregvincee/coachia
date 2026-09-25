import type { ReactNode } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";

function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mt-5 rounded-2xl border border-[#343947] bg-[#151820] p-5">
      <Text className="text-base font-bold text-[#F5F1E8]">{title}</Text>
      <Text className="mt-2 text-sm leading-6 text-[#AEB4C0]">{children}</Text>
    </View>
  );
}

export default function TermsScreen() {
  const router = useRouter();
  return (
    <ScreenContainer className="p-0" containerClassName="bg-[#07080C]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 28, paddingBottom: 36 }}>
        <Text className="text-xs font-bold tracking-widest text-[#E8C98A]">INFORMATIONS BÊTA</Text>
        <Text className="mt-3 text-3xl font-bold leading-10 text-[#F5F1E8]">Conditions d’utilisation</Text>
        <Text className="mt-3 text-sm leading-6 text-[#AEB4C0]">Version bêta du 23 septembre 2026. Ces conditions expliquent le fonctionnement du prototype et doivent être relues par l’exploitant et validées juridiquement avant un lancement commercial.</Text>
        <LegalSection title="Nature du service">CoachIA propose des missions d’apprentissage, des retours pédagogiques automatisés et des outils de progression. Le service ne remplace pas un enseignant, un conseiller professionnel, un avis juridique, médical ou financier, ni une décision humaine.</LegalSection>
        <LegalSection title="Exactitude et responsabilité">Un diagnostic IA peut être incomplet, inexact ou influencé par la formulation, la langue, le contexte ou les informations fournies. Vérifiez les résultats avant toute utilisation importante. Les scores mesurent uniquement les éléments démontrés dans une tentative et ne constituent pas une mesure de valeur personnelle, d’intelligence ou d’aptitude professionnelle.</LegalSection>
        <LegalSection title="Contenu envoyé">N’envoyez pas de mots de passe, de données de santé, de données financières, de secrets commerciaux ou de renseignements concernant une autre personne. Vous devez disposer des droits nécessaires sur tout contenu soumis. Le contenu local de la bêta reste sur l’appareil jusqu’à un partage volontaire, selon les limites décrites dans la page Confidentialité.</LegalSection>
        <LegalSection title="Suppression du compte">Un utilisateur authentifié peut demander la suppression de son compte depuis Paramètres. Cette action efface les données rattachées au profil, au portefeuille, aux achats, aux événements de commerce, aux quotas et à la cohorte. Les statistiques globales déjà agrégées et dépourvues d’identifiant utilisateur peuvent être conservées.</LegalSection>
        <LegalSection title="Accès équitable">CoachIA est conçu pour être utilisé sans discrimination fondée sur l’origine, la couleur, le sexe, l’identité ou l’expression de genre, l’orientation sexuelle, la religion, l’âge, le handicap, la langue ou la situation socioéconomique. Un score ne doit jamais servir seul à prendre une décision concernant une personne.</LegalSection>
        <LegalSection title="Disponibilité et paiements">La bêta peut être interrompue, limitée ou modifiée. Aucun achat n’est requis pour participer à la bêta actuelle. Les prix, crédits, remboursements et conditions commerciales devront être publiés séparément avant l’activation de paiements réels.</LegalSection>
        <LegalSection title="Âge et signalement">La bêta actuelle est destinée aux personnes de 18 ans et plus. Si un problème d’accessibilité, de discrimination, de confidentialité ou de sécurité est rencontré, cessez d’utiliser la fonction concernée et signalez-le à <Text className="font-semibold text-[#E8C98A]">vragelab@gmail.com</Text>. Le nom légal et la juridiction de l’exploitant restent à renseigner dans la configuration de production.</LegalSection>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Retourner à la page de lancement CoachIA" onPress={() => router.replace("/launch")} activeOpacity={0.8} className="mt-6 items-center rounded-xl border border-[#C89D56] bg-[#D6B36A] px-4 py-4">
          <Text className="font-bold text-[#07080C]">Retour à la page de lancement</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
