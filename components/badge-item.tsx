import { View, Text, TouchableOpacity, type ViewStyle } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import type { Badge } from '@/lib/types';

interface BadgeItemProps {
  badge: Badge;
  onPress?: () => void;
  style?: ViewStyle;
}

export function BadgeItem({ badge, onPress, style }: BadgeItemProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="items-center"
      style={style}
      activeOpacity={0.7}
    >
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-2"
        style={{
          backgroundColor: badge.unlocked ? colors.surface : colors.border + '40',
          borderWidth: 2,
          borderColor: badge.unlocked ? getBadgeColor(badge.category) : colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            opacity: badge.unlocked ? 1 : 0.3,
          }}
        >
          {badge.icon}
        </Text>
      </View>
      <Text
        className="text-xs text-center font-medium"
        style={{
          color: badge.unlocked ? colors.foreground : colors.muted,
        }}
        numberOfLines={2}
      >
        {badge.name}
      </Text>
    </TouchableOpacity>
  );
}

function getBadgeColor(category: Badge['category']): string {
  switch (category) {
    case 'bronze':
      return '#CD7F32';
    case 'silver':
      return '#C0C0C0';
    case 'gold':
      return '#FFD700';
    case 'platinum':
      return '#E5E4E2';
    default:
      return '#C0C0C0';
  }
}
