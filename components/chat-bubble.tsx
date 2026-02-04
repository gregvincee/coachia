import { View, Text, type ViewStyle } from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  style?: ViewStyle;
}

export function ChatBubble({ role, content, style }: ChatBubbleProps) {
  const colors = useColors();
  const isUser = role === 'user';

  return (
    <View
      className="mb-3"
      style={[
        {
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          maxWidth: '80%',
        },
        style,
      ]}
    >
      <View
        className="px-4 py-3 rounded-2xl"
        style={{
          backgroundColor: isUser ? colors.primary : colors.surface,
          borderBottomRightRadius: isUser ? 4 : 16,
          borderBottomLeftRadius: isUser ? 16 : 4,
        }}
      >
        <Text
          className="text-base leading-relaxed"
          style={{
            color: isUser ? '#FFFFFF' : colors.foreground,
          }}
        >
          {content}
        </Text>
      </View>
    </View>
  );
}
