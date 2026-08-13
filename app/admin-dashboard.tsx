import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

const PERIODS = [
  { label: "7 j", days: 7 },
  { label: "30 j", days: 30 },
  { label: "90 j", days: 90 },
  { label: "1 an", days: 365 },
] as const;

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "USD" }).format(cents / 100);
}

function formatPercent(rate: number) {
  return `${(rate * 100).toFixed(rate > 0 && rate < 0.1 ? 1 : 0)} %`;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [days, setDays] = useState<(typeof PERIODS)[number]["days"]>(30);
  const metrics = trpc.commerce.metrics.useQuery({ days }, { enabled: isAuthenticated });

  const onRefresh = useCallback(async () => {
    await metrics.refetch();
  }, [metrics]);

  const errorCode = (metrics.error as { data?: { code?: string } } | null)?.data?.code;
  const isForbidden = errorCode === "FORBIDDEN" || errorCode === "UNAUTHORIZED";
  const products = metrics.data?.products ?? [];
  const totals = metrics.data?.totals;
  const confirmedWidth = Math.min(100, Math.round((totals?.conversionRate ?? 0) * 100));

  const header = useMemo(() => (
    <View className="gap-5 pb-5">
      <View className="bg-primary px-5 pb-6 pt-4 gap-3">
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Retour" onPress={() => router.back()} activeOpacity={0.75}>
          <Text className="text-sm font-semibold text-white/90">‹ Retour</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-3xl font-bold text-white">Pilotage du Store</Text>
          <Text className="mt-1 text-sm text-white/85">Ventes, revenus et conversion par micro-achat.</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        {PERIODS.map((period) => {
          const selected = period.days === days;
          return (
            <TouchableOpacity
              key={period.days}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setDays(period.days)}
              activeOpacity={0.75}
              className={selected ? "rounded-full bg-primary px-4 py-2" : "rounded-full border border-border bg-surface px-4 py-2"}
            >
              <Text className={selected ? "font-bold text-white" : "font-semibold text-foreground"}>{period.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {authLoading || metrics.isLoading ? (
        <View className="items-center justify-center py-12"><ActivityIndicator /><Text className="mt-3 text-muted">Chargement des indicateurs…</Text></View>
      ) : !isAuthenticated ? (
        <Notice title="Connexion requise" description="Connectez-vous avec le compte administrateur pour consulter ces données." />
      ) : isForbidden ? (
        <Notice title="Accès réservé" description="Ce tableau de bord est disponible uniquement pour les comptes administrateurs." />
      ) : metrics.error ? (
        <Notice title="Données indisponibles" description="Impossible de charger les métriques. Réessayez dans quelques instants." />
      ) : totals ? (
        <View className="px-4 gap-4">
          <View className="flex-row gap-3">
            <MetricCard label="Revenu brut" value={formatCurrency(totals.revenueCents)} emphasis />
            <MetricCard label="Ventes" value={String(totals.paidOrders)} />
          </View>
          <View className="flex-row gap-3">
            <MetricCard label="Conversion" value={formatPercent(totals.conversionRate)} />
            <MetricCard label="Panier moyen" value={formatCurrency(totals.averageOrderValueCents)} />
          </View>

          <View className="rounded-2xl border border-border bg-surface p-4 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-foreground">Entonnoir de paiement</Text>
              <Text className="text-sm font-semibold text-primary">{totals.checkoutStarts} démarrages</Text>
            </View>
            <View className="gap-2">
              <View className="h-3 overflow-hidden rounded-full bg-border"><View className="h-full rounded-full bg-primary" style={{ width: "100%" }} /></View>
              <View className="flex-row items-center justify-between"><Text className="text-xs text-muted">Checkout lancé</Text><Text className="text-xs font-semibold text-foreground">{totals.checkoutStarts}</Text></View>
              <View className="h-3 overflow-hidden rounded-full bg-border"><View className="h-full rounded-full bg-success" style={{ width: `${confirmedWidth}%` }} /></View>
              <View className="flex-row items-center justify-between"><Text className="text-xs text-muted">Paiement confirmé</Text><Text className="text-xs font-semibold text-foreground">{totals.totalConfirmedEvents}</Text></View>
            </View>
          </View>

          <Text className="text-lg font-bold text-foreground">Performance par produit</Text>
        </View>
      ) : null}
    </View>
  ), [authLoading, confirmedWidth, days, isAuthenticated, isForbidden, metrics.error, metrics.isLoading, router, totals]);

  return (
    <ScreenContainer className="p-0">
      <FlatList
        data={totals ? products : []}
        keyExtractor={(item) => item.productId}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View className="mx-4 mb-3 rounded-2xl border border-border bg-surface p-4 gap-3">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1"><Text className="text-base font-bold text-foreground">{item.name}</Text><Text className="mt-1 text-xs text-muted">{item.category}</Text></View>
              <Text className="text-base font-bold text-primary">{formatCurrency(item.revenueCents)}</Text>
            </View>
            <View className="flex-row justify-between border-t border-border pt-3">
              <MiniMetric label="Ventes" value={String(item.paidOrders)} />
              <MiniMetric label="Conversion" value={formatPercent(item.conversionRate)} />
              <MiniMetric label="Checkout" value={String(item.checkoutStarts)} />
            </View>
          </View>
        )}
        ListEmptyComponent={totals && !metrics.isLoading ? <Notice title="Pas encore de ventes" description="Les résultats apparaîtront ici après les premiers checkouts et paiements confirmés." /> : null}
        refreshControl={<RefreshControl refreshing={metrics.isFetching} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </ScreenContainer>
  );
}

function MetricCard({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return <View className={emphasis ? "flex-1 rounded-2xl bg-primary p-4" : "flex-1 rounded-2xl border border-border bg-surface p-4"}><Text className={emphasis ? "text-xs font-semibold text-white/80" : "text-xs font-semibold text-muted"}>{label}</Text><Text className={emphasis ? "mt-2 text-xl font-bold text-white" : "mt-2 text-xl font-bold text-foreground"}>{value}</Text></View>;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <View className="gap-1"><Text className="text-xs text-muted">{label}</Text><Text className="text-sm font-bold text-foreground">{value}</Text></View>;
}

function Notice({ title, description }: { title: string; description: string }) {
  return <View className="mx-4 items-center rounded-2xl border border-border bg-surface p-6"><Text className="text-base font-bold text-foreground">{title}</Text><Text className="mt-2 text-center text-sm leading-5 text-muted">{description}</Text></View>;
}
