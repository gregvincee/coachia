import { ScrollView, Text, View, FlatList, Pressable, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { createChatMessage, saveMessage, getMessages, createConversation, saveConversation } from '@/lib/social';
import type { ChatMessage, ChatConversation } from '@/lib/types-social';

export default function ChatScreen() {
  const colors = useColors();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      // Créer des conversations de démonstration
      const demoConversations: ChatConversation[] = [
        {
          id: 'conv-1',
          type: 'direct',
          participants: ['user-1', 'user-2'],
          name: 'Sarah',
          lastMessageTime: Date.now(),
          unreadCount: 2,
          createdAt: Date.now(),
          lastMessage: {
            id: 'msg-1',
            senderId: 'user-2',
            senderName: 'Sarah',
            content: 'Comment ça va ?',
            timestamp: Date.now(),
            isRead: false,
            reactions: {},
          },
        },
        {
          id: 'conv-2',
          type: 'group',
          participants: ['user-1', 'user-3', 'user-4'],
          name: 'Groupe Public Speaking',
          lastMessageTime: Date.now() - 3600000,
          unreadCount: 0,
          createdAt: Date.now(),
        },
      ];
      setConversations(demoConversations);
      setSelectedConversation(demoConversations[0]);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await getMessages(conversationId);
      setMessages(msgs);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      const newMessage = createChatMessage('user-1', 'You', messageText.trim());
      await saveMessage(selectedConversation.id, newMessage);
      setMessages([...messages, newMessage]);
      setMessageText('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-foreground">Chargement du chat...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <View className="flex-1 flex-row">
        {/* Liste des conversations */}
        <View className="w-1/3 border-r border-border bg-surface">
          <View className="px-4 py-3 border-b border-border">
            <Text className="text-lg font-bold text-foreground">Messages</Text>
          </View>
          <FlatList
            data={conversations}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setSelectedConversation(item)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className={`px-4 py-3 border-b border-border ${
                  selectedConversation?.id === item.id ? 'bg-primary/10' : ''
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">{item.name || 'Sans titre'}</Text>
                    <Text className="text-xs text-muted mt-1 truncate">
                      {item.lastMessage?.content || 'Aucun message'}
                    </Text>
                  </View>
                  {item.unreadCount > 0 && (
                    <View className="bg-primary rounded-full w-5 h-5 items-center justify-center ml-2">
                      <Text className="text-xs font-bold text-background">{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            )}
          />
        </View>

        {/* Chat */}
        {selectedConversation && (
          <View className="flex-2 flex-col">
            {/* En-tête */}
            <View className="px-4 py-3 border-b border-border bg-surface">
              <Text className="text-lg font-bold text-foreground">{selectedConversation.name}</Text>
              <Text className="text-xs text-muted mt-1">
                {selectedConversation.participants.length} participants
              </Text>
            </View>

            {/* Messages */}
            <FlatList
              data={messages}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View
                  className={`px-4 py-2 flex-row ${
                    item.senderId === 'user-1' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <View
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      item.senderId === 'user-1'
                        ? 'bg-primary'
                        : 'bg-surface border border-border'
                    }`}
                  >
                    {item.senderId !== 'user-1' && (
                      <Text className="text-xs font-semibold text-muted mb-1">{item.senderName}</Text>
                    )}
                    <Text
                      className={`${
                        item.senderId === 'user-1' ? 'text-background' : 'text-foreground'
                      }`}
                    >
                      {item.content}
                    </Text>
                    <Text
                      className={`text-xs mt-1 ${
                        item.senderId === 'user-1' ? 'text-background/70' : 'text-muted'
                      }`}
                    >
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              )}
              contentContainerStyle={{ paddingVertical: 10 }}
              inverted
            />

            {/* Input */}
            <View className="px-4 py-3 border-t border-border bg-surface flex-row gap-2">
              <TextInput
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Votre message..."
                placeholderTextColor={colors.muted}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                multiline
              />
              <Pressable
                onPress={handleSendMessage}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="bg-primary rounded-lg px-4 py-2 items-center justify-center"
              >
                <Text className="text-background font-semibold">Envoyer</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
