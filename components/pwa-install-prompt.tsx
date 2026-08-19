import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

function isStandalonePwa() {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as NavigatorWithStandalone).standalone);
}

function isIosBrowser() {
  if (Platform.OS !== "web" || typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Propose l’installation web quand le navigateur le permet et prévient quand
 * une nouvelle version PWA est prête. Le composant ne s’affiche jamais dans
 * les builds iOS/Android natifs ni pendant le développement Metro.
 */
export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredInstallPrompt | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || process.env.NODE_ENV !== "production" || typeof window === "undefined") return;
    if (isStandalonePwa()) return;

    let active = true;
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (active) setDeferredPrompt(event as DeferredInstallPrompt);
    };
    const onAppInstalled = () => {
      if (!active) return;
      setDeferredPrompt(null);
      setDismissed(true);
    };
    const onControllerChange = () => window.location.reload();

    const observeRegistration = (registration: ServiceWorkerRegistration) => {
      registrationRef.current = registration;
      if (registration.waiting && active) setUpdateReady(true);
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller && active) {
            setUpdateReady(true);
          }
        });
      });
      void registration.update().catch(() => undefined);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(observeRegistration).catch(() => undefined);

    return () => {
      active = false;
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const applyUpdate = () => {
    if (registrationRef.current?.waiting) {
      registrationRef.current.waiting.postMessage({ type: "SKIP_WAITING" });
      return;
    }
    window.location.reload();
  };

  if (Platform.OS !== "web" || dismissed || isStandalonePwa()) return null;

  const mode = updateReady ? "update" : deferredPrompt ? "install" : isIosBrowser() ? "ios" : null;
  if (!mode) return null;

  const title = mode === "update" ? "Une mise à jour est prête" : "Installer CoachIA";
  const description = mode === "update"
    ? "Actualisez maintenant pour utiliser la dernière version de CoachIA."
    : mode === "ios"
      ? "Dans Safari, touchez Partager puis « Sur l’écran d’accueil » pour l’installer."
      : "Ajoutez CoachIA à votre écran d’accueil pour l’ouvrir comme une application.";
  const action = mode === "update" ? "Actualiser" : mode === "install" ? "Installer" : "Compris";

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <View style={styles.card}>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={() => setDismissed(true)} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryLabel}>Plus tard</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action}
            onPress={mode === "update" ? applyUpdate : mode === "install" ? install : () => setDismissed(true)}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryLabel}>{action}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 22,
    zIndex: 1000,
  },
  card: {
    backgroundColor: "#1E293B",
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  copy: { gap: 4 },
  title: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  description: { color: "#CBD5E1", fontSize: 13, lineHeight: 19 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 14 },
  primaryButton: { backgroundColor: "#6366F1", borderRadius: 12, minHeight: 38, justifyContent: "center", paddingHorizontal: 14 },
  secondaryButton: { borderRadius: 12, minHeight: 38, justifyContent: "center", paddingHorizontal: 12 },
  primaryLabel: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  secondaryLabel: { color: "#CBD5E1", fontSize: 13, fontWeight: "600" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
