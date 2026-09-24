import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { COACHING_PACKAGES, PREMIUM_PLANS } from "@/lib/premium";

export default function PremiumScreen() {
  const [activeTab, setActiveTab] = useState<"plans" | "packages">("plans");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [currentPlan, setCurrentPlan] = useState("free");

  useEffect(() => {
    void loadCurrentPlan();
  }, []);

  async function loadCurrentPlan() {
    try {
      const stored = await AsyncStorage.getItem("userPlan");
      if (stored) setCurrentPlan(stored);
    } catch (error) {
      console.error("Erreur lors du chargement du plan:", error);
    }
  }

  async function handleSelectPlan(planId: string) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Préparation du paiement : le checkout Stripe sera relié ici après ajout des clés test.
    console.log(`Plan sélectionné: ${planId}`);
  }

  function selectTab(tab: "plans" | "packages") {
    setActiveTab(tab);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <ScreenContainer className="p-0" containerClassName="bg-[#05070A]">
      <View className="flex-1">
        <View className="border-b border-[#2C3B4E] bg-[#10141D] px-5 pb-6 pt-7">
          <Text className="text-xs font-bold tracking-widest text-[#72D6FF]">COACHIA · PROGRESSION</Text>
          <Text className="mt-3 text-3xl font-bold text-[#F4F7FB]">Premium</Text>
          <Text className="mt-2 text-sm leading-5 text-[#B0BBC9]">Des outils supplémentaires pour pratiquer davantage, sans confondre XP et maîtrise.</Text>
        </View>

        <View className="flex-row gap-3 px-5 py-5">
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === "plans" }}
            accessibilityLabel="Voir les abonnements"
            onPress={() => selectTab("plans")}
            style={({ pressed }) => [styles.tabPressable, pressed && styles.pressed]}
          >
            <View className={activeTab === "plans" ? "rounded-xl border border-[#2D8CFF] bg-[#152849] px-4 py-3" : "rounded-xl border border-[#2C3B4E] bg-[#10141D] px-4 py-3"}>
              <Text className={activeTab === "plans" ? "text-center font-bold text-[#72D6FF]" : "text-center font-bold text-[#B0BBC9]"}>Abonnements</Text>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === "packages" }}
            accessibilityLabel="Voir les packs de coaching"
            onPress={() => selectTab("packages")}
            style={({ pressed }) => [styles.tabPressable, pressed && styles.pressed]}
          >
            <View className={activeTab === "packages" ? "rounded-xl border border-[#2D8CFF] bg-[#152849] px-4 py-3" : "rounded-xl border border-[#2C3B4E] bg-[#10141D] px-4 py-3"}>
              <Text className={activeTab === "packages" ? "text-center font-bold text-[#72D6FF]" : "text-center font-bold text-[#B0BBC9]"}>Packs</Text>
            </View>
          </Pressable>
        </View>

        {activeTab === "plans" ? (
          <>
            <View className="flex-row gap-3 px-5 pb-5">
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: billingCycle === "monthly" }}
                onPress={() => setBillingCycle("monthly")}
                style={({ pressed }) => [styles.cyclePressable, pressed && styles.pressed]}
              >
                <View className={billingCycle === "monthly" ? "rounded-xl border border-[#2D8CFF] bg-[#152849] px-3 py-2" : "rounded-xl border border-[#2C3B4E] bg-[#10141D] px-3 py-2"}>
                  <Text className={billingCycle === "monthly" ? "text-center text-sm font-bold text-[#72D6FF]" : "text-center text-sm font-bold text-[#B0BBC9]"}>Mensuel</Text>
                </View>
              </Pressable>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: billingCycle === "yearly" }}
                onPress={() => setBillingCycle("yearly")}
                style={({ pressed }) => [styles.cyclePressable, pressed && styles.pressed]}
              >
                <View className={billingCycle === "yearly" ? "relative rounded-xl border border-[#2D8CFF] bg-[#152849] px-3 py-2" : "relative rounded-xl border border-[#2C3B4E] bg-[#10141D] px-3 py-2"}>
                  <Text className={billingCycle === "yearly" ? "text-center text-sm font-bold text-[#72D6FF]" : "text-center text-sm font-bold text-[#B0BBC9]"}>Annuel · -17%</Text>
                </View>
              </Pressable>
            </View>

            <FlatList
              data={PREMIUM_PLANS}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const price = item.price[billingCycle];
                const isCurrentPlan = currentPlan === item.id;
                return (
                  <View className={isCurrentPlan ? "mx-5 mb-4 rounded-2xl border border-[#2D8CFF] bg-[#152849] p-5" : "mx-5 mb-4 rounded-2xl border border-[#2C3B4E] bg-[#10141D] p-5"}>
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-2xl font-bold text-[#F4F7FB]">{item.name}</Text>
                        <Text className="mt-1 text-sm leading-5 text-[#B0BBC9]">{item.description}</Text>
                      </View>
                      {isCurrentPlan ? <View className="rounded-full bg-[#1875FF] px-3 py-1"><Text className="text-xs font-bold text-white">Actif</Text></View> : null}
                    </View>

                    <View className="mt-4 border-b border-[#2C3B4E] pb-4">
                      {price > 0 ? <><Text className="text-4xl font-bold text-[#72D6FF]">${price.toFixed(2)}</Text><Text className="mt-1 text-sm text-[#B0BBC9]">par {billingCycle === "monthly" ? "mois" : "an"}</Text></> : <Text className="text-3xl font-bold text-[#F4F7FB]">Gratuit</Text>}
                    </View>

                    <View className="gap-2 py-5">
                      {item.features.map((feature) => <View key={feature} className="flex-row items-start gap-2"><Text className="font-bold text-[#72D6FF]">✓</Text><Text className="flex-1 text-sm leading-5 text-[#D9E4F3]">{feature}</Text></View>)}
                    </View>

                    {!isCurrentPlan ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={item.id === "free" ? "Utiliser le plan gratuit" : `Passer au plan ${item.name}`}
                        onPress={() => void handleSelectPlan(item.id)}
                        style={({ pressed }) => [styles.actionPressable, pressed && styles.pressed]}
                      >
                        <View className={item.id === "free" ? "items-center rounded-xl border border-[#526176] bg-[#253044] px-4 py-3" : "items-center rounded-xl bg-[#1875FF] px-4 py-3"}>
                          <Text className={item.id === "free" ? "font-bold text-[#F4F7FB]" : "font-bold text-white"}>{item.id === "free" ? "Utiliser" : `Passer à ${item.name}`}</Text>
                        </View>
                      </Pressable>
                    ) : null}
                  </View>
                );
              }}
            />
          </>
        ) : (
          <FlatList
            data={COACHING_PACKAGES}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View className="mx-5 mb-4 rounded-2xl border border-[#2C3B4E] bg-[#10141D] p-5">
                <Text className="text-xl font-bold text-[#F4F7FB]">{item.name}</Text>
                <Text className="mt-1 text-sm leading-5 text-[#B0BBC9]">{item.description}</Text>
                <View className="mt-4 border-b border-[#2C3B4E] pb-4"><Text className="text-3xl font-bold text-[#72D6FF]">${item.price.toFixed(2)}</Text><Text className="mt-1 text-sm text-[#B0BBC9]">achat unique</Text></View>
                <View className="gap-2 py-5">
                  <Text className="text-sm text-[#D9E4F3]">◷ {item.duration} jours d’accès · {item.sessions} sessions</Text>
                  {item.customization ? <Text className="text-sm text-[#D9E4F3]">◇ Personnalisation complète</Text> : null}
                  {item.bonus ? <Text className="text-sm text-[#D9E4F3]">✦ +{item.bonus.xp} XP bonus</Text> : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Acheter ${item.name}`}
                  onPress={() => void handleSelectPlan(item.id)}
                  style={({ pressed }) => [styles.actionPressable, pressed && styles.pressed]}
                >
                  <View className="items-center rounded-xl bg-[#1875FF] px-4 py-3"><Text className="font-bold text-white">Préparer cet achat</Text></View>
                </Pressable>
              </View>
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actionPressable: { minHeight: 48 },
  cyclePressable: { flex: 1 },
  listContent: { paddingBottom: 32 },
  pressed: { opacity: 0.72 },
  tabPressable: { flex: 1 },
});
