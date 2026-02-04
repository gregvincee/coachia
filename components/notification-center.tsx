import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import type { PushNotification } from '@/lib/types-notifications';

interface NotificationCenterProps {
  visible: boolean;
  onClose?: () => void;
}

export function NotificationCenter({ visible, onClose }: NotificationCenterProps) {
  const colors = useColors();
  const [notifications, setNotifications] = useState<PushNotification[]>([]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification reçue:', response);
    });

    return () => subscription.remove();
  }, []);

  if (!visible) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View className="absolute top-0 left-0 right-0 bg-surface border-b border-border z-50">
      {/* En-tête */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View>
          <Text className="text-lg font-bold text-foreground">Notifications</Text>
          {unreadCount > 0 && (
            <Text className="text-xs text-primary mt-1">{unreadCount} non lue(s)</Text>
          )}
        </View>
        <Pressable onPress={onClose} className="p-2">
          <Text className="text-2xl">✕</Text>
        </Pressable>
      </View>

      {/* Liste des notifications */}
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View
              className={cn(
                'px-4 py-3 border-b border-border',
                !item.read && 'bg-primary/5'
              )}
            >
              <Text className="font-semibold text-foreground">{item.title}</Text>
              <Text className="text-sm text-muted mt-1">{item.body}</Text>
              <Text className="text-xs text-muted mt-2">
                {new Date(item.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          )}
          scrollEnabled={false}
          maxToRenderPerBatch={5}
        />
      ) : (
        <View className="px-4 py-6 items-center">
          <Text className="text-muted">Aucune notification</Text>
        </View>
      )}
    </View>
  );
}
