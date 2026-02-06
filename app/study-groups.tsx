import { ScrollView, Text, View, FlatList, Pressable, Modal, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { createStudyGroup, getStudyGroups, saveStudyGroup, addMemberToGroup } from '@/lib/social';
import type { StudyGroup } from '@/lib/types-social';

export default function StudyGroupsScreen() {
  const colors = useColors();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSkill, setNewGroupSkill] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const stored = await getStudyGroups();
      if (stored.length === 0) {
        // Créer des groupes de démonstration
        const demoGroups: StudyGroup[] = [
          {
            id: 'group-1',
            name: 'Public Speaking Masters',
            description: 'Groupe pour maîtriser l\'art de la prise de parole en public',
            skillFocus: 'public-speaking',
            level: 'intermediate',
            members: [
              { userId: 'user-1', username: 'You', role: 'admin', joinedAt: Date.now(), level: 3 },
              { userId: 'user-2', username: 'Sarah', role: 'member', joinedAt: Date.now() - 86400000, level: 2 },
              { userId: 'user-3', username: 'Marc', role: 'member', joinedAt: Date.now() - 172800000, level: 1 },
            ],
            maxMembers: 50,
            createdBy: 'user-1',
            createdAt: Date.now(),
            isPublic: true,
          },
          {
            id: 'group-2',
            name: 'Productivité Pro',
            description: 'Techniques avancées de gestion du temps et productivité',
            skillFocus: 'productivity',
            level: 'advanced',
            members: [
              { userId: 'user-1', username: 'You', role: 'member', joinedAt: Date.now() - 604800000, level: 4 },
              { userId: 'user-4', username: 'Alex', role: 'admin', joinedAt: Date.now() - 1209600000, level: 5 },
            ],
            maxMembers: 30,
            createdBy: 'user-4',
            createdAt: Date.now() - 1209600000,
            isPublic: true,
          },
        ];
        setGroups(demoGroups);
      } else {
        setGroups(stored);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !newGroupSkill.trim()) return;

    try {
      const newGroup = createStudyGroup(newGroupName, newGroupSkill, 'user-1', 'intermediate');
      await saveStudyGroup(newGroup);
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setNewGroupSkill('');
      setShowCreateModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-foreground">Chargement des groupes...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* En-tête */}
        <View className="px-6 pt-4 pb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-foreground">Groupes d'étude</Text>
            <Text className="text-base text-muted mt-1">Apprenez ensemble</Text>
          </View>
          <Pressable
            onPress={() => setShowCreateModal(true)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="bg-primary rounded-lg px-4 py-2"
          >
            <Text className="text-background font-semibold">+ Créer</Text>
          </Pressable>
        </View>

        {/* Groupes */}
        <FlatList
          data={groups}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedGroup(item)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              className="px-6 mb-4"
            >
              <View className="bg-surface rounded-xl p-4 border border-border">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground">{item.name}</Text>
                    <Text className="text-xs text-primary mt-1">
                      {item.skillFocus.replace('-', ' ').toUpperCase()}
                    </Text>
                  </View>
                  <View className="bg-primary/10 rounded-full px-2 py-1">
                    <Text className="text-xs font-semibold text-primary">
                      {item.level === 'beginner' ? 'Débutant' : item.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                    </Text>
                  </View>
                </View>

                <Text className="text-sm text-muted mb-3">{item.description}</Text>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-lg">👥</Text>
                    <Text className="text-sm text-muted">
                      {item.members.length}/{item.maxMembers} membres
                    </Text>
                  </View>
                  <View className="flex-row gap-1">
                    {item.members.slice(0, 3).map(member => (
                      <View
                        key={member.userId}
                        className="w-6 h-6 rounded-full bg-primary/30 items-center justify-center"
                      >
                        <Text className="text-xs font-bold">
                          {member.username.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    ))}
                    {item.members.length > 3 && (
                      <View className="w-6 h-6 rounded-full bg-muted/30 items-center justify-center">
                        <Text className="text-xs font-bold">+{item.members.length - 3}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </Pressable>
          )}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Modal de création */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 items-end">
          <View className="bg-background w-full rounded-t-3xl p-6 pt-8">
            <Text className="text-2xl font-bold text-foreground mb-4">Créer un groupe</Text>

            <TextInput
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="Nom du groupe"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-3"
            />

            <TextInput
              value={newGroupSkill}
              onChangeText={setNewGroupSkill}
              placeholder="Compétence (ex: public-speaking)"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-6"
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowCreateModal(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="flex-1 bg-muted rounded-lg py-3"
              >
                <Text className="text-center font-semibold text-foreground">Annuler</Text>
              </Pressable>
              <Pressable
                onPress={handleCreateGroup}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                className="flex-1 bg-primary rounded-lg py-3"
              >
                <Text className="text-center font-semibold text-background">Créer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de détails du groupe */}
      {selectedGroup && (
        <Modal visible={!!selectedGroup} transparent animationType="slide">
          <View className="flex-1 bg-black/50">
            <ScreenContainer className="flex-1 pt-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-2xl font-bold text-foreground">{selectedGroup.name}</Text>
                <Pressable
                  onPress={() => setSelectedGroup(null)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="px-3 py-1"
                >
                  <Text className="text-2xl">✕</Text>
                </Pressable>
              </View>

              <ScrollView>
                <Text className="text-muted mb-4">{selectedGroup.description}</Text>

                <Text className="text-lg font-bold text-foreground mb-3">Membres ({selectedGroup.members.length})</Text>
                <FlatList
                  data={selectedGroup.members}
                  keyExtractor={item => item.userId}
                  renderItem={({ item }) => (
                    <View className="bg-surface rounded-lg p-3 mb-2 flex-row items-center justify-between">
                      <View>
                        <Text className="font-semibold text-foreground">{item.username}</Text>
                        <Text className="text-xs text-muted">Niveau {item.level}</Text>
                      </View>
                      <View className="bg-primary/10 rounded-full px-2 py-1">
                        <Text className="text-xs font-semibold text-primary">
                          {item.role === 'admin' ? 'Admin' : item.role === 'moderator' ? 'Modérateur' : 'Membre'}
                        </Text>
                      </View>
                    </View>
                  )}
                  scrollEnabled={false}
                />

                <Pressable
                  onPress={() => setSelectedGroup(null)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  className="bg-primary rounded-lg py-3 mt-6"
                >
                  <Text className="text-center font-semibold text-background">Rejoindre le groupe</Text>
                </Pressable>
              </ScrollView>
            </ScreenContainer>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  );
}
