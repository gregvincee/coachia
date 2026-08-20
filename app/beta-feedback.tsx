import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { BetaStepCelebration } from "@/components/beta-step-celebration";
import {
  BETA_FEEDBACK_CATEGORIES,
  createBetaFeedback,
  formatBetaFeedbackExport,
  type BetaFeedback,
  type BetaFeedbackCategory,
  validateBetaFeedback,
} from "@/lib/beta-feedback";
import { addBetaFeedback, completeBetaWelcomeStep, getBetaFeedback, getBetaWelcomeProgress } from "@/lib/storage";
import { trpc } from "@/lib/trpc";

export default function BetaFeedbackScreen() {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<BetaFeedbackCategory>("experience");
  const [message, setMessage] = useState("");
  const [feedbacks, setFeedbacks] = useState<BetaFeedback[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showBetaCelebration, setShowBetaCelebration] = useState(false);
  const betaFeedbackMutation = trpc.beta.recordFeedback.useMutation();

  useEffect(() => {
    void getBetaFeedback().then(setFeedbacks);
  }, []);

  const submitFeedback = useCallback(async () => {
    const draft = { rating, category, message };
    const validation = validateBetaFeedback(draft);
    if (!validation.valid) {
      Alert.alert("Retour incomplet", validation.message);
      return;
    }

    setIsSaving(true);
    try {
      const feedback = createBetaFeedback(draft);
      const updated = await addBetaFeedback(feedback);
      setFeedbacks(updated);
      const betaProgress = await getBetaWelcomeProgress();
      await completeBetaWelcomeStep("share_feedback");
      if (!betaProgress.share_feedback) setShowBetaCelebration(true);
      // Le commentaire reste local. Seule la note volontaire alimente l’agrégat bêta administrateur.
      betaFeedbackMutation.mutate({ rating });
      setRating(0);
      setMessage("");
    } finally {
      setIsSaving(false);
    }
  }, [category, message, rating]);

  const exportFeedback = useCallback(async () => {
    if (feedbacks.length === 0) {
      Alert.alert("Aucun retour", "Envoyez d’abord un retour pour pouvoir l’exporter.");
      return;
    }
    await Share.share({ message: formatBetaFeedbackExport(feedbacks), title: "Retours bêta CoachIA" });
  }, [feedbacks]);

  return (
    <ScreenContainer className="bg-[#05070A] px-5" containerClassName="bg-[#05070A]">
      <Stack.Screen options={{ title: "Retour bêta" }} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>BÊTA COACHIA</Text>
          <Text style={styles.title}>Votre avis construit la suite.</Text>
          <Text style={styles.subtitle}>Partagez un blocage, une idée ou ce qui vous a réellement aidé. Aucun identifiant personnel n’est ajouté à ce retour local.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Comment évaluez-vous votre expérience ?</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={`${value} étoile${value > 1 ? "s" : ""}`}
                accessibilityState={{ selected: rating === value }}
                onPress={() => setRating(value)}
                style={({ pressed }) => [styles.ratingButton, rating >= value && styles.ratingButtonActive, pressed && styles.pressed]}
              >
                <Text style={[styles.ratingValue, rating >= value && styles.ratingValueActive]}>{value}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Quel type de retour souhaitez-vous donner ?</Text>
          <View style={styles.categoryGrid}>
            {BETA_FEEDBACK_CATEGORIES.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected: category === item.id }}
                onPress={() => setCategory(item.id)}
                style={({ pressed }) => [styles.categoryButton, category === item.id && styles.categoryButtonActive, pressed && styles.pressed]}
              >
                <Text style={[styles.categoryLabel, category === item.id && styles.categoryLabelActive]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Votre retour</Text>
          <TextInput
            accessibilityLabel="Votre retour bêta"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={800}
            placeholder="Ex. J’ai trouvé le premier exercice très utile, mais je ne savais pas quoi répondre ensuite…"
            placeholderTextColor="#94A3B8"
            textAlignVertical="top"
            style={styles.input}
          />
          <Text style={styles.counter}>{message.trim().length}/800</Text>
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="Envoyer mon retour" disabled={isSaving} onPress={submitFeedback} style={({ pressed }) => [styles.submitButton, isSaving && styles.disabled, pressed && styles.pressed]}>
          <Text style={styles.submitLabel}>{isSaving ? "Enregistrement…" : "Envoyer mon retour"}</Text>
        </Pressable>

        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <View>
              <Text style={styles.historyTitle}>Mes retours enregistrés</Text>
              <Text style={styles.historySubtitle}>{feedbacks.length} retour{feedbacks.length > 1 ? "s" : ""} conservé{feedbacks.length > 1 ? "s" : ""} sur cet appareil</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Exporter mes retours" onPress={exportFeedback} style={({ pressed }) => [styles.exportButton, pressed && styles.pressed]}>
              <Text style={styles.exportLabel}>Exporter</Text>
            </Pressable>
          </View>
          {feedbacks.length === 0 ? <Text style={styles.emptyText}>Vos retours resteront privés jusqu’à ce que vous choisissiez de les partager.</Text> : feedbacks.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.feedbackPreview}>
              <Text style={styles.previewMeta}>{item.rating}/5 · {BETA_FEEDBACK_CATEGORIES.find((entry) => entry.id === item.category)?.label}</Text>
              <Text numberOfLines={2} style={styles.previewText}>{item.message}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <BetaStepCelebration
        visible={showBetaCelebration}
        title="Retour enregistré"
        message="Merci : votre deuxième jalon bêta est validé."
        onFinished={() => setShowBetaCelebration(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingVertical: 24, gap: 24 },
  hero: { gap: 8 },
  eyebrow: { color: "#2D8CFF", fontSize: 12, fontWeight: "800", letterSpacing: 1.1 },
  title: { color: "#F4F7FB", fontSize: 30, fontWeight: "800", letterSpacing: -0.6 },
  subtitle: { color: "#B0BBC9", fontSize: 15, lineHeight: 22 },
  section: { gap: 10 },
  label: { color: "#F4F7FB", fontSize: 16, fontWeight: "700" },
  ratingRow: { flexDirection: "row", gap: 10 },
  ratingButton: { alignItems: "center", backgroundColor: "#10141D", borderColor: "#2C3B4E", borderRadius: 16, borderWidth: 1, height: 52, justifyContent: "center", width: 52 },
  ratingButtonActive: { backgroundColor: "#152849", borderColor: "#2D8CFF" },
  ratingValue: { color: "#B0BBC9", fontSize: 17, fontWeight: "800" },
  ratingValueActive: { color: "#F4F7FB" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryButton: { backgroundColor: "#10141D", borderColor: "#2C3B4E", borderRadius: 14, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 11 },
  categoryButtonActive: { backgroundColor: "#152849", borderColor: "#2D8CFF" },
  categoryLabel: { color: "#B0BBC9", fontSize: 14, fontWeight: "600" },
  categoryLabelActive: { color: "#F4F7FB" },
  input: { backgroundColor: "#10141D", borderColor: "#2C3B4E", borderRadius: 16, borderWidth: 1, color: "#F4F7FB", fontSize: 15, lineHeight: 21, minHeight: 132, padding: 14 },
  counter: { alignSelf: "flex-end", color: "#8290A2", fontSize: 12 },
  submitButton: { alignItems: "center", backgroundColor: "#1875FF", borderRadius: 16, justifyContent: "center", minHeight: 52, paddingHorizontal: 20 },
  submitLabel: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.98 }] },
  historyCard: { backgroundColor: "#10141D", borderColor: "#2C3B4E", borderRadius: 18, borderWidth: 1, gap: 14, padding: 16 },
  historyHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  historyTitle: { color: "#F4F7FB", fontSize: 16, fontWeight: "800" },
  historySubtitle: { color: "#B0BBC9", fontSize: 12, marginTop: 3 },
  exportButton: { backgroundColor: "#171E29", borderColor: "#3A4B61", borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  exportLabel: { color: "#E8EDF5", fontSize: 13, fontWeight: "700" },
  emptyText: { color: "#B0BBC9", fontSize: 14, lineHeight: 20 },
  feedbackPreview: { borderTopColor: "#2C3B4E", borderTopWidth: 1, gap: 4, paddingTop: 12 },
  previewMeta: { color: "#2D8CFF", fontSize: 12, fontWeight: "700" },
  previewText: { color: "#D2DAE5", fontSize: 14, lineHeight: 20 },
});
