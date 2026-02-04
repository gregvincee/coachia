import { View, Text, TouchableOpacity, type ViewStyle } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import type { Skill } from '@/lib/types';

interface SkillCardProps {
  skill: Skill;
  onPress: () => void;
  level?: number;
  style?: ViewStyle;
}

export function SkillCard({ skill, onPress, level, style }: SkillCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      <View className="items-center gap-3">
        {/* Icon */}
        <View
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{ backgroundColor: skill.color + '20' }}
        >
          <IconSymbol
            name={skill.icon as any}
            size={28}
            color={skill.color}
          />
        </View>

        {/* Name */}
        <Text
          className="text-base font-semibold text-foreground text-center"
          numberOfLines={2}
        >
          {skill.name}
        </Text>

        {/* Level (if provided) */}
        {level !== undefined && (
          <View className="flex-row items-center gap-1">
            <IconSymbol name="star" size={14} color={colors.warning} />
            <Text className="text-xs text-muted font-medium">
              Niveau {level}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
