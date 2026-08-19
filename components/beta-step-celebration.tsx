import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Platform, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

import { getBetaCelebrationConfig } from "@/lib/beta-celebration";

type BetaStepCelebrationProps = {
  visible: boolean;
  title: string;
  message: string;
  onFinished: () => void;
};

/** Confirmation brève d'un jalon, compatible avec la réduction des mouvements système. */
export function BetaStepCelebration({ visible, title, message, onFinished }: BetaStepCelebrationProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const config = getBetaCelebrationConfig(reduceMotion);
    opacity.setValue(0);
    scale.setValue(config.useScale ? 0.94 : 1);
    if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const animation = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ...(config.useScale ? [Animated.timing(scale, { toValue: 1, duration: 260, useNativeDriver: true })] : []),
    ]);
    animation.start();
    const timeout = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(onFinished);
    }, config.duration);
    return () => { clearTimeout(timeout); animation.stop(); };
  }, [onFinished, opacity, reduceMotion, scale, visible]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" accessibilityLiveRegion="polite" style={styles.container}>
      <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
        <View style={styles.check}><Text style={styles.checkText}>✓</Text></View>
        <View style={styles.copy}><Text style={styles.title}>{title}</Text><Text style={styles.message}>{message}</Text></View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 30, alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 360, flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 20, padding: 18, backgroundColor: "#123A4A", shadowColor: "#000", shadowOpacity: 0.22, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  check: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 21, backgroundColor: "#22C55E" },
  checkText: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  copy: { flex: 1 },
  title: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  message: { marginTop: 3, color: "#D7EEF4", fontSize: 13, lineHeight: 18 },
});
