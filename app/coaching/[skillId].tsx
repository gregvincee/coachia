import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';

import { ScreenContainer } from '@/components/screen-container';
import { ChatBubble } from '@/components/chat-bubble';
import { QuickReply } from '@/components/quick-reply';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { SKILLS } from '@/lib/data';
import { trpc } from '@/lib/trpc';
import {
  getChatHistory,
  addChatMessage,
  completeBetaWelcomeStep,
} from '@/lib/storage';
import { addXP, updateStreak } from '@/lib/gamification';
import type { ChatMessage } from '@/lib/types';

export default function CoachingScreen() {
  const { skillId } = useLocalSearchParams<{ skillId: string }>();
  const router = useRouter();
  const colors = useColors();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const skill = SKILLS.find((s) => s.id === skillId);

  const chatMutation = trpc.ai.chat.useMutation();
  const betaActivityMutation = trpc.beta.recordActivity.useMutation();

  useEffect(() => {
    loadChatHistory();
  }, [skillId]);

  async function loadChatHistory() {
    if (!skillId) return;
    const history = await getChatHistory(skillId);
    setMessages(history);

    // Si c'est la première session, envoyer un message de bienvenue
    if (history.length === 0) {
      await sendWelcomeMessage();
    }
  }

  async function sendWelcomeMessage() {
    if (!skillId) return;

    setIsLoading(true);
    try {
      const response = await chatMutation.mutateAsync({
        skillId,
        messages: [
          {
            role: 'user',
            content: 'Bonjour, je voudrais commencer une session de coaching.',
          },
        ],
      });

      const assistantMsg = await addChatMessage(skillId, {
        skillId,
        role: 'assistant',
        content: response.message,
        suggestions: response.suggestions,
      });

      setMessages([assistantMsg]);
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Error sending welcome message:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || !skillId) return;

    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Ajouter le message utilisateur
    const userMsg = await addChatMessage(skillId, {
      skillId,
      role: 'user',
      content: text,
    });

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSuggestions([]);
    setIsLoading(true);

    // Scroll vers le bas
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Préparer l'historique pour l'API
      const apiMessages = [...messages, userMsg].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Appeler l'API
      const response = await chatMutation.mutateAsync({
        skillId,
        messages: apiMessages,
      });

      // Ajouter la réponse de l'assistant
      const assistantMsg = await addChatMessage(skillId, {
        skillId,
        role: 'assistant',
        content: response.message,
        suggestions: response.suggestions,
      });

      setMessages((prev) => [...prev, assistantMsg]);
      setSuggestions(response.suggestions || []);

      // Mettre à jour l'XP de l'utilisateur
      await updateUserXP(10); // +10 XP par message
      await completeBetaWelcomeStep('first_session');
      // Un signal anonyme suffit pour la cohorte : aucun texte de coaching n'est transmis.
      betaActivityMutation.mutate();

      // Scroll vers le bas
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Afficher un message d'erreur à l'utilisateur
    } finally {
      setIsLoading(false);
    }
  }

  async function updateUserXP(xp: number) {
    await addXP(xp);
    await updateStreak();
  }

  function handleSuggestionPress(suggestion: string) {
    sendMessage(suggestion);
  }

  if (!skill) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Compétence introuvable</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View
          className="flex-row items-center px-4 py-3 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Text className="text-2xl" style={{ color: colors.foreground }}>←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">{skill.name}</Text>
            <Text className="text-xs text-muted">{skill.description}</Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble role={item.role} content={item.content} />
          )}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View className="px-4 pb-2">
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text className="text-sm text-muted">Le coach réfléchit...</Text>
            </View>
          </View>
        )}

        {/* Quick Replies */}
        {suggestions.length > 0 && !isLoading && (
          <View className="px-4 pb-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {suggestions.map((suggestion, index) => (
                <QuickReply
                  key={index}
                  text={suggestion}
                  onPress={() => handleSuggestionPress(suggestion)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input */}
        <View
          className="flex-row items-center px-4 py-3 border-t"
          style={{ borderTopColor: colors.border }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Écrivez votre message..."
            placeholderTextColor={colors.muted}
            className="flex-1 px-4 py-2 rounded-full text-base"
            style={{
              backgroundColor: colors.surface,
              color: colors.foreground,
            }}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(inputText)}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            className="ml-2 w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.border,
            }}
          >
            <IconSymbol
              name="paperplane.fill"
              size={20}
              color={inputText.trim() && !isLoading ? '#FFFFFF' : colors.muted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
