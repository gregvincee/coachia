import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
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
import type { CoachIAAlert } from "@/lib/types-alerts";

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
  const [expandedAlertIds, setExpandedAlertIds] = useState<string[]>([]);
  const metrics = trpc.commerce.metrics.useQuery({ days }, { enabled: isAuthenticated });
  const alertMetrics = trpc.commerce.alerts.useQuery(undefined, { enabled: isAuthenticated });
  const cohortMetrics = trpc.beta.metrics.useQuery({ days }, { enabled: isAuthenticated });
  const waitlist = trpc.beta.waitlistSummary.useQuery(undefined, { enabled: isAuthenticated });
  const prepareInvite = trpc.beta.prepareNextInvite.useMutation({ onSuccess: () => void waitlist.refetch() });

  const onRefresh = useCallback(async () => {
    await Promise.all([metrics.refetch(), alertMetrics.refetch(), cohortMetrics.refetch(), waitlist.refetch()]);
  }, [alertMetrics, cohortMetrics, metrics, waitlist]);

  const errorCode = (metrics.error as { data?: { code?: string } } | null)?.data?.code;
  const isForbidden = errorCode === "FORBIDDEN" || errorCode === "UNAUTHORIZED";
  const products = metrics.data?.products ?? [];
  const totals = metrics.data?.totals;
  const alerts = alertMetrics.data?.alerts ?? [];
  const cohort = cohortMetrics.data;
  const confirmedWidth = Math.min(100, Math.round((totals?.conversionRate ?? 0) * 100));
  const toggleAlert = useCallback((alertId: string) => {
    setExpandedAlertIds((current) => current.includes(alertId)
      ? current.filter((id) => id !== alertId)
      : [...current, alertId]);
  }, []);

  const header = useMemo(() => (
    <View className="gap-5 pb-5">
      <View className="gap-3 border-b border-[#D6B36A] bg-[#0B0D12] px-5 pb-6 pt-4">
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Retour" onPress={() => router.back()} activeOpacity={0.75}>
          <Text className="text-sm font-semibold text-[#E5DFD2]">‹ Retour</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-3xl font-bold text-white">Pilotage du Store</Text>
          <Text className="mt-1 text-sm text-[#AEB4C0]">Ventes, revenus et conversion par micro-achat.</Text>
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
              className={selected ? "rounded-full bg-[#D6B36A] px-4 py-2" : "rounded-full border border-[#343947] bg-[#151820] px-4 py-2"}
            >
              <Text className={selected ? "font-bold text-white" : "font-semibold text-[#DCE5F0]"}>{period.label}</Text>
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
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-[#F5F1E8]">Alertes opérationnelles</Text>
              <Text className="text-sm font-semibold text-[#AEB4C0]">{alerts.length} active{alerts.length > 1 ? "s" : ""}</Text>
            </View>
            {alertMetrics.isLoading ? (
              <View className="rounded-2xl border border-[#343947] bg-[#151820] p-4"><Text className="text-sm text-[#AEB4C0]">Analyse des alertes…</Text></View>
            ) : alerts.length === 0 ? (
              <View className="rounded-2xl border border-success/40 bg-[#151820] p-4"><Text className="text-sm font-semibold text-success">Aucune alerte active</Text><Text className="mt-1 text-sm leading-5 text-[#AEB4C0]">Les seuils opérationnels surveillés sont actuellement dans leur plage attendue.</Text></View>
            ) : alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                expanded={expandedAlertIds.includes(alert.id)}
                onPress={() => toggleAlert(alert.id)}
                onOpenStripe={alert.action.stripePath ? () => Linking.openURL(alert.action.stripePath as string) : undefined}
              />
            ))}
          </View>

          <View className="flex-row gap-3">
            <MetricCard label="Revenu brut" value={formatCurrency(totals.revenueCents)} emphasis />
            <MetricCard label="Ventes" value={String(totals.paidOrders)} />
          </View>
          <View className="flex-row gap-3">
            <MetricCard label="Conversion" value={formatPercent(totals.conversionRate)} />
            <MetricCard label="Panier moyen" value={formatCurrency(totals.averageOrderValueCents)} />
          </View>

          <CohortSummary cohort={cohort} loading={cohortMetrics.isLoading} />
          <WaitlistInviteSummary
            summary={waitlist.data}
            loading={waitlist.isLoading}
            preparing={prepareInvite.isPending}
            result={prepareInvite.data?.status}
            onPrepare={() => void prepareInvite.mutateAsync()}
          />

          <View className="gap-3 rounded-2xl border border-[#343947] bg-[#151820] p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-[#F5F1E8]">Entonnoir de paiement</Text>
              <Text className="text-sm font-semibold text-[#C89D56]">{totals.checkoutStarts} démarrages</Text>
            </View>
            <View className="gap-2">
              <View className="h-3 overflow-hidden rounded-full bg-[#343947]"><View className="h-full rounded-full bg-[#D6B36A]" style={{ width: "100%" }} /></View>
              <View className="flex-row items-center justify-between"><Text className="text-xs text-[#AEB4C0]">Checkout lancé</Text><Text className="text-xs font-semibold text-[#F5F1E8]">{totals.checkoutStarts}</Text></View>
              <View className="h-3 overflow-hidden rounded-full bg-[#343947]"><View className="h-full rounded-full bg-success" style={{ width: `${confirmedWidth}%` }} /></View>
              <View className="flex-row items-center justify-between"><Text className="text-xs text-[#AEB4C0]">Paiement confirmé</Text><Text className="text-xs font-semibold text-[#F5F1E8]">{totals.totalConfirmedEvents}</Text></View>
            </View>
          </View>

          <Text className="text-lg font-bold text-[#F5F1E8]">Performance par produit</Text>
        </View>
      ) : null}
    </View>
  ), [alertMetrics.isLoading, alerts, authLoading, cohort, cohortMetrics.isLoading, confirmedWidth, days, expandedAlertIds, isAuthenticated, isForbidden, metrics.error, metrics.isLoading, prepareInvite, router, toggleAlert, totals, waitlist.data, waitlist.isLoading]);

  return (
    <ScreenContainer className="bg-[#07080C] p-0" containerClassName="bg-[#07080C]">
      <FlatList
        data={totals ? products : []}
        keyExtractor={(item) => item.productId}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View className="mx-4 mb-3 gap-3 rounded-2xl border border-[#343947] bg-[#151820] p-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1"><Text className="text-base font-bold text-[#F5F1E8]">{item.name}</Text><Text className="mt-1 text-xs text-[#AEB4C0]">{item.category}</Text></View>
              <Text className="text-base font-bold text-[#C89D56]">{formatCurrency(item.revenueCents)}</Text>
            </View>
            <View className="flex-row justify-between border-t border-[#343947] pt-3">
              <MiniMetric label="Ventes" value={String(item.paidOrders)} />
              <MiniMetric label="Conversion" value={formatPercent(item.conversionRate)} />
              <MiniMetric label="Checkout" value={String(item.checkoutStarts)} />
            </View>
          </View>
        )}
        ListEmptyComponent={totals && !metrics.isLoading ? <Notice title="Pas encore de ventes" description="Les résultats apparaîtront ici après les premiers checkouts et paiements confirmés." /> : null}
        refreshControl={<RefreshControl refreshing={metrics.isFetching || alertMetrics.isFetching || cohortMetrics.isFetching || waitlist.isFetching} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </ScreenContainer>
  );
}

type CohortMetrics = {
  cohortSize: number;
  activeUsers: number;
  activityRate: number;
  eligibleForRetention: number;
  retention7dRate: number | null;
  feedbackCount: number;
  averageFeedbackRating: number | null;
  sampleSizeReached: boolean;
  decision: { title: string; description: string };
};

function CohortSummary({ cohort, loading }: { cohort?: CohortMetrics; loading: boolean }) {
  if (loading) return <View className="rounded-2xl border border-[#343947] bg-[#151820] p-4"><Text className="text-sm text-[#AEB4C0]">Analyse de la cohorte bêta…</Text></View>;
  if (!cohort) return <View className="rounded-2xl border border-[#343947] bg-[#151820] p-4"><Text className="text-sm text-[#AEB4C0]">Les données de cohorte seront disponibles après les premières sessions bêta.</Text></View>;

  return (
    <View className="gap-3 rounded-2xl border border-[#343947] bg-[#151820] p-4">
      <View className="flex-row items-center justify-between gap-3">
        <View><Text className="text-base font-bold text-[#F5F1E8]">Cohorte bêta</Text><Text className="mt-1 text-xs text-[#AEB4C0]">Données agrégées, sans identité personnelle.</Text></View>
        <Text className="text-sm font-bold text-[#C89D56]">{cohort.cohortSize} actif{cohort.cohortSize > 1 ? "s" : ""}</Text>
      </View>
      <View className="flex-row gap-3">
        <MiniMetric label="Engagement" value={formatPercent(cohort.activityRate)} />
        <MiniMetric label="Rétention J7" value={cohort.retention7dRate === null ? "—" : formatPercent(cohort.retention7dRate)} />
        <MiniMetric label="Retours" value={String(cohort.feedbackCount)} />
        <MiniMetric label="Note" value={cohort.averageFeedbackRating === null ? "—" : `${cohort.averageFeedbackRating}/5`} />
      </View>
      <View className="rounded-xl bg-[#1D2029] p-3"><Text className="text-sm font-bold text-[#F5F1E8]">{cohort.decision.title}</Text><Text className="mt-1 text-sm leading-5 text-[#AEB4C0]">{cohort.decision.description}</Text><Text className="mt-2 text-xs text-[#8F96A4]">Seuil de lecture : {cohort.sampleSizeReached ? "atteint" : "en attente de 5 participants activés"} · Éligibles J7 : {cohort.eligibleForRetention}</Text></View>
    </View>
  );
}

type WaitlistSummary = { total: number; waiting: number; invited: number; declined: number };

function WaitlistInviteSummary({
  summary,
  loading,
  preparing,
  result,
  onPrepare,
}: {
  summary?: WaitlistSummary;
  loading: boolean;
  preparing: boolean;
  result?: "prepared" | "empty";
  onPrepare: () => void;
}) {
  if (loading) return <View className="rounded-2xl border border-[#343947] bg-[#151820] p-4"><Text className="text-sm text-[#AEB4C0]">Lecture de la liste bêta…</Text></View>;
  if (!summary) return null;

  const resultMessage = result === "prepared"
    ? "Une invitation a été préparée. L’adresse est transmise au propriétaire, jamais affichée ici."
    : result === "empty"
      ? "Aucune candidature en attente à inviter."
      : null;

  return (
    <View className="gap-3 rounded-2xl border border-[#C89D56] bg-[#151820] p-4">
      <View className="flex-row items-center justify-between gap-3"><View className="flex-1"><Text className="text-base font-bold text-[#F5F1E8]">Invitation de cohorte</Text><Text className="mt-1 text-xs leading-5 text-[#AEB4C0]">Vue agrégée : aucune adresse e-mail n’apparaît dans ce tableau.</Text></View><Text className="text-sm font-bold text-[#C89D56]">{summary.waiting} en attente</Text></View>
      <View className="flex-row gap-4"><MiniMetric label="Inscrits" value={String(summary.total)} /><MiniMetric label="Invités" value={String(summary.invited)} /><MiniMetric label="Retraits" value={String(summary.declined)} /></View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Préparer la prochaine invitation bêta" disabled={preparing} onPress={onPrepare} activeOpacity={0.75} className={preparing ? "items-center rounded-xl bg-[#D6B36A] px-4 py-3 opacity-70" : "items-center rounded-xl bg-[#D6B36A] px-4 py-3"}><Text className="font-bold text-white">{preparing ? "Préparation…" : "Préparer la prochaine invitation"}</Text></TouchableOpacity>
      {resultMessage ? <Text accessibilityLiveRegion="polite" className="text-sm leading-5 text-[#E5DFD2]">{resultMessage}</Text> : null}
    </View>
  );
}

function MetricCard({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return <View className={emphasis ? "flex-1 rounded-2xl border border-[#C89D56] bg-[#242B3A] p-4" : "flex-1 rounded-2xl border border-[#343947] bg-[#151820] p-4"}><Text className={emphasis ? "text-xs font-semibold text-[#F3DCA8]" : "text-xs font-semibold text-[#AEB4C0]"}>{label}</Text><Text className="mt-2 text-xl font-bold text-[#F5F1E8]">{value}</Text></View>;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <View className="gap-1"><Text className="text-xs text-[#AEB4C0]">{label}</Text><Text className="text-sm font-bold text-[#F5F1E8]">{value}</Text></View>;
}

function AlertCard({
  alert,
  expanded,
  onPress,
  onOpenStripe,
}: {
  alert: CoachIAAlert;
  expanded: boolean;
  onPress: () => void;
  onOpenStripe?: () => void;
}) {
  const styles = alert.level === "CRITICAL"
    ? { border: "border-error/40", badge: "bg-error", label: "Critique", value: "text-error" }
    : alert.level === "WARNING"
      ? { border: "border-warning/40", badge: "bg-warning", label: "À vérifier", value: "text-warning" }
      : { border: "border-success/40", badge: "bg-success", label: "Information", value: "text-success" };
  const value = alert.type === "AI_BUDGET"
    ? formatCurrency(alert.valeurActuelle)
    : formatPercent(alert.valeurActuelle);
  const threshold = alert.type === "AI_BUDGET"
    ? formatCurrency(alert.seuil)
    : formatPercent(alert.seuil);

  return (
    <View className={`rounded-2xl border bg-[#151820] p-4 ${styles.border}`}>
      <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={`Alerte ${styles.label}: ${alert.problème}`} onPress={onPress} activeOpacity={0.75}>
        <View className="flex-row items-start gap-3">
          <View className={`mt-1 h-3 w-3 rounded-full ${styles.badge}`} />
          <View className="flex-1 gap-1">
            <View className="flex-row items-center justify-between gap-2"><Text className={`text-xs font-bold uppercase ${styles.value}`}>{styles.label}</Text><Text className="text-xs text-[#AEB4C0]">{alert.période}</Text></View>
            <Text className="text-base font-bold text-[#F5F1E8]">{alert.problème}</Text>
            <Text className="text-sm leading-5 text-[#AEB4C0]">{alert.métrique} : <Text className="font-bold text-[#F5F1E8]">{value}</Text> · Seuil : {threshold}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View className="mt-4 gap-3 border-t border-[#343947] pt-4">
          <Text className="text-sm leading-5 text-[#AEB4C0]"><Text className="font-bold text-[#F5F1E8]">Impact estimé. </Text>{alert.impactEstimé}</Text>
          <Text className="text-sm leading-5 text-[#AEB4C0]"><Text className="font-bold text-[#F5F1E8]">Décision recommandée. </Text>{alert.actionRecommandée}</Text>
          {alert.comparaisonPériodePrécédente ? <Text className="text-sm text-[#AEB4C0]">Période précédente : {formatPercent(alert.comparaisonPériodePrécédente.valeur)}{alert.comparaisonPériodePrécédente.évolution !== null ? ` · Évolution : ${formatPercent(alert.comparaisonPériodePrécédente.évolution)}` : ""}</Text> : null}
          <Text className="text-xs text-[#8F96A4]">Volume minimal : {alert.volumeMinimalAtteint ? "atteint" : "non atteint"} · Action automatique : {alert.actionAutomatiqueAppliquée ? "appliquée" : "non appliquée"}</Text>
          {onOpenStripe ? <TouchableOpacity accessibilityRole="link" accessibilityLabel="Ouvrir le diagnostic Stripe" onPress={onOpenStripe} activeOpacity={0.75} className="self-start rounded-full bg-[#D6B36A] px-4 py-2"><Text className="font-bold text-white">Ouvrir Stripe et les paiements</Text></TouchableOpacity> : null}
        </View>
      ) : null}
    </View>
  );
}

function Notice({ title, description }: { title: string; description: string }) {
  return <View className="mx-4 items-center rounded-2xl border border-[#343947] bg-[#151820] p-6"><Text className="text-base font-bold text-[#F5F1E8]">{title}</Text><Text className="mt-2 text-center text-sm leading-5 text-[#AEB4C0]">{description}</Text></View>;
}
