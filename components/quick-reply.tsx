import { TouchableOpacity, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface QuickReplyProps {
  text: string;
  onPress: () => void;
}

export function QuickReply({ text, onPress }: QuickReplyProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="px-4 py-2 rounded-full mr-2"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
      activeOpacity={0.7}
    >
      <Text className="text-sm text-foreground">{text}</Text>
    </TouchableOpacity>
  );
}
