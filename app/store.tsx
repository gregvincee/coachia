import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as WebBrowser from "expo-web-browser";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import type { MicroPurchaseCategory } from "@/lib/micro-purchases";

const FILTERS: Array<{ id: "all" | MicroPurchaseCategory; label: string }> = [
  { id: "all", label: "Tout" },
  { id: "boost", label: "⚡ Boosts" },
  { id: "sessions", label: "📚 Sessions" },
  { id: "content", label: "✨ Contenu" },
  { id: "coaching", label: "🎓 Coaching" },
  { id: "bundle", label: "📦 Bundle" },
];

export default function StoreScreen() {
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const catalog = trpc.commerce.catalog.useQuery();
  const checkout = trpc.commerce.createCheckout.useMutation();
  const trackStoreEvent = trpc.commerce.trackStoreEvent.useMutation();

  useEffect(() => {
    if (isAuthenticated) {
      trackStoreEvent.mutate({ eventType: "store_view" });
    }
  }, [isAuthenticated, trackStoreEvent]);

  const products = useMemo(() => {
    const entries = catalog.data?.products ?? [];
    return filter === "all" ? entries : entries.filter((product) => product.category === filter);
  }, [catalog.data?.products, filter]);

  async function handlePurchase(productId: string) {
    if (!isAuthenticated) {
      Alert.alert("Connexion requise", "Connectez-vous pour associer cet achat à votre compte CoachIA.");
      return;
    }

    trackStoreEvent.mutate({ eventType: "product_selected", productId });

    if (!catalog.data?.stripeEnabled) {
      Alert.alert("Paiements en préparation", "Le Store est prêt, mais les paiements réels sont encore en mode test.");
      return;
    }

    if (Platform.OS !== "web") {
      Alert.alert(
        "Achat intégré requis",
        "Les crédits numériques seront proposés avec le paiement Apple ou Google lors de la publication mobile. Le checkout Stripe est réservé au Web.",
      );
      return;
    }

    try {
      const returnBaseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const result = await checkout.mutateAsync({ productId, returnBaseUrl });
      await WebBrowser.openBrowserAsync(result.checkoutUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de démarrer le paiement.";
      Alert.alert("Paiement indisponible", message);
    }
  }

  return (
    <ScreenContainer className="p-0" containerClassName="bg-[#05070A]">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="border-b border-[#2C3B4E] bg-[#10141D] px-5 pb-6 pt-7">
          <View className="flex-row items-center gap-3">
            <Image
              source={require("@/assets/images/icon.png")}
              accessibilityRole="image"
              accessibilityLabel="Monogramme CoachIA C delta I"
              resizeMode="contain"
              style={styles.storeLogo}
            />
            <Text className="text-xs font-bold tracking-widest text-[#72D6FF]">ACHATS À LA CARTE</Text>
          </View>
          <Text className="mt-4 text-3xl font-bold text-[#F4F7FB]">Store CoachIA</Text>
          <Text className="mt-2 text-sm leading-5 text-[#B0BBC9]">Choisissez les bonus utiles à votre progression, sans abonnement imposé.</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, padding: 16 }}>
          {FILTERS.map((item) => {
            const selected = filter === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setFilter(item.id)}
                activeOpacity={0.75}
                className={selected ? "rounded-full border border-[#2D8CFF] bg-[#1875FF] px-4 py-2" : "rounded-full border border-[#2C3B4E] bg-[#10141D] px-4 py-2"}
              >
                <Text className={selected ? "font-semibold text-white" : "font-semibold text-[#F4F7FB]"}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View className="px-4 gap-3">
          {catalog.isLoading ? (
            <Text className="py-10 text-center text-[#B0BBC9]">Chargement du catalogue…</Text>
          ) : products.map((product) => (
            <View key={product.id} className="rounded-2xl border border-[#2C3B4E] bg-[#10141D] p-4 gap-3">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1 gap-1">
                  <Text className="text-xl font-bold text-[#F4F7FB]">{product.icon} {product.name}</Text>
                  <Text className="text-sm leading-5 text-[#B0BBC9]">{product.description}</Text>
                  {"popular" in product && product.popular ? <Text className="mt-1 text-xs font-bold text-[#72D6FF]">CHOIX POPULAIRE</Text> : null}
                </View>
                <Text className="text-2xl font-bold text-[#72D6FF]">${product.price.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Acheter ${product.name}`}
                disabled={checkout.isPending}
                onPress={() => handlePurchase(product.id)}
                activeOpacity={0.8}
                className="items-center rounded-xl border border-[#2D8CFF] bg-[#1875FF] px-4 py-3"
              >
                <Text className="font-bold text-white">{checkout.isPending ? "Préparation…" : "Choisir ce bonus"}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View className="mx-4 mt-5 rounded-xl border border-[#2C3B4E] bg-[#10141D] p-4">
          <Text className="text-sm font-semibold text-[#F4F7FB]">Paiements responsables</Text>
          <Text className="mt-1 text-xs leading-5 text-[#B0BBC9]">Les prix et droits sont vérifiés côté serveur. Aucun bonus n’est attribué avant confirmation du paiement.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  storeLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
});
