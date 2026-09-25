import { ScrollView, View, Text, TouchableOpacity, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSettings, saveSettings } from '@/lib/storage';
import type { AppSettings } from '@/lib/types';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { trpc } from '@/lib/trpc';

export default function SettingsScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { logout } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  const deleteAccount = trpc.account.delete.useMutation();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const userSettings = await getSettings();
    setSettings(userSettings);
  }

  async function updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) {
    if (!settings) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  async function handleDeleteAccount() {
    setDeleteNotice(null);
    try {
      await deleteAccount.mutateAsync({ confirm: true });
      await logout();
      router.replace('/launch');
    } catch {
      setDeleteNotice("La suppression n’a pas pu être terminée. Réessayez ou écrivez à vragelab@gmail.com.");
    }
  }

  if (!settings) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Chargement...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">
              Paramètres
            </Text>
          </View>

          {/* Appearance Section */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">
              Apparence
            </Text>
            <View className="bg-surface rounded-2xl border border-border overflow-hidden">
              <SettingRow
                label="Thème"
                value={getThemeLabel(settings.theme)}
                onPress={() => {
                  const themes: AppSettings['theme'][] = ['light', 'dark', 'auto'];
                  const currentIndex = themes.indexOf(settings.theme);
                  const nextTheme = themes[(currentIndex + 1) % themes.length];
                  updateSetting('theme', nextTheme);
                }}
              />
            </View>
          </View>

          {/* Notifications Section */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">
              Notifications
            </Text>
            <View className="bg-surface rounded-2xl border border-border overflow-hidden">
              <SettingRow
                label="Activer les notifications"
                rightComponent={
                  <Switch
                    value={settings.notifications}
                    onValueChange={(value) => updateSetting('notifications', value)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                }
              />
            </View>
          </View>

          {/* About Section */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">
              Bêta et administration
            </Text>
            <View className="bg-surface rounded-2xl border border-border overflow-hidden">
              <SettingRow label="Guide de test bêta" value="›" onPress={() => router.push('/beta-welcome' as never)} />
              <View className="h-px" style={{ backgroundColor: colors.border }} />
              <SettingRow label="Donner mon avis bêta" value="›" onPress={() => router.push('/beta-feedback')} />
              <View className="h-px" style={{ backgroundColor: colors.border }} />
              <SettingRow label="Tableau de bord du Store" value="›" onPress={() => router.push('/admin-dashboard')} />
            </View>
          </View>

          {/* About Section */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">
              À propos
            </Text>
            <View className="bg-surface rounded-2xl border border-border overflow-hidden">
              <SettingRow label="Version" value="1.0.0" />
              <View
                className="h-px"
                style={{ backgroundColor: colors.border }}
              />
              <SettingRow label="Langue" value="Français" />
            </View>
          </View>

          <View>
            <Text className="text-lg font-semibold text-foreground mb-3">Données et compte</Text>
            <View className="bg-surface rounded-2xl border border-border p-4">
              <Text className="text-sm leading-5 text-muted">La suppression efface votre profil, portefeuille, historique d’achat, événements de commerce, quotas et données de cohorte rattachées. Les indicateurs globaux anonymisés sont conservés.</Text>
              {!deleteArmed ? (
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Préparer la suppression définitive de mon compte" onPress={() => setDeleteArmed(true)} activeOpacity={0.75} className="mt-4 items-center rounded-xl border border-error px-4 py-3">
                  <Text className="font-bold text-error">Supprimer mon compte</Text>
                </TouchableOpacity>
              ) : (
                <View className="mt-4 rounded-xl border border-error bg-[#25151A] p-3">
                  <Text className="text-sm font-bold text-[#F5F1E8]">Cette action est irréversible.</Text>
                  <Text className="mt-1 text-xs leading-5 text-[#E5DFD2]">Confirmez uniquement si vous souhaitez effacer les données rattachées à ce compte.</Text>
                  <View className="mt-3 flex-row gap-2">
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Annuler la suppression du compte" onPress={() => setDeleteArmed(false)} activeOpacity={0.75} className="flex-1 items-center rounded-lg border border-border px-3 py-3">
                      <Text className="font-semibold text-foreground">Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Confirmer la suppression définitive de mon compte" disabled={deleteAccount.isPending} onPress={() => void handleDeleteAccount()} activeOpacity={0.75} className="flex-1 items-center rounded-lg bg-error px-3 py-3">
                      <Text className="font-bold text-white">{deleteAccount.isPending ? "Suppression…" : "Confirmer"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {deleteNotice ? <Text accessibilityLiveRegion="polite" className="mt-3 text-sm leading-5 text-error">{deleteNotice}</Text> : null}
            </View>
          </View>

          {/* Info */}
          <View className="items-center mt-4">
            <Text className="text-sm text-muted text-center">
              CoachIA - Micro-coaching Instantané
            </Text>
            <Text className="text-xs text-muted text-center mt-1">
              Développez vos compétences avec l'IA
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

interface SettingRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
}

function SettingRow({ label, value, onPress, rightComponent }: SettingRowProps) {
  const colors = useColors();

  const content = (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text className="text-base text-foreground">{label}</Text>
      {rightComponent || (
        <Text className="text-base text-muted">{value}</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

function getThemeLabel(theme: AppSettings['theme']): string {
  switch (theme) {
    case 'light':
      return 'Clair';
    case 'dark':
      return 'Sombre';
    case 'auto':
      return 'Automatique';
    default:
      return 'Automatique';
  }
}
