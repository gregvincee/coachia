import { Pressable, Text, View } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import type { Challenge, UserChallenge } from '@/lib/types-challenges';
import { getChallengeProgress } from '@/lib/challenges';

interface ChallengeCardProps {
  challenge: Challenge;
  userChallenge?: UserChallenge;
  onPress?: () => void;
}

export function ChallengeCard({ challenge, userChallenge, onPress }: ChallengeCardProps) {
  const colors = useColors();
  const progress = userChallenge ? getChallengeProgress(userChallenge, challenge) : 0;
  const isCompleted = userChallenge?.status === 'completed';

  const difficultyColors = {
    easy: '#10B981',
    medium: '#F59E0B',
    hard: '#EF4444',
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      className="mb-4"
    >
      <View
        className={cn(
          'rounded-2xl p-4 border',
          isCompleted ? 'bg-success/10 border-success' : 'bg-surface border-border'
        )}
        style={{
          borderColor: isCompleted ? '#22C55E' : colors.border,
        }}
      >
        {/* En-tête avec icône et titre */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <Text className="text-3xl mr-3">{challenge.icon}</Text>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground">{challenge.title}</Text>
              <Text className="text-xs text-muted mt-1">{challenge.description}</Text>
            </View>
          </View>

          {/* Badge de difficulté */}
          <View
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor: difficultyColors[challenge.difficulty],
              opacity: 0.2,
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{
                color: difficultyColors[challenge.difficulty],
              }}
            >
              {challenge.difficulty === 'easy'
                ? 'Facile'
                : challenge.difficulty === 'medium'
                  ? 'Moyen'
                  : 'Difficile'}
            </Text>
          </View>
        </View>

        {/* Objectif et récompense */}
        <View className="mb-3 pb-3 border-b border-border">
          <Text className="text-sm text-muted mb-2">
            <Text className="font-semibold">Objectif :</Text> {challenge.objective}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-semibold text-foreground">Récompense :</Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-lg">⭐</Text>
              <Text className="text-sm font-semibold text-foreground">{challenge.reward.xp} XP</Text>
            </View>
            {challenge.reward.bonus > 0 && (
              <View className="flex-row items-center gap-1">
                <Text className="text-sm text-success font-semibold">+{challenge.reward.bonus}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Barre de progression */}
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs text-muted">
              Progression : {Math.round(progress)}%
            </Text>
            <Text className="text-xs text-muted">
              {userChallenge?.progress || 0} / {challenge.targetValue}
            </Text>
          </View>
          <View className="h-2 bg-border rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: isCompleted ? '#22C55E' : challenge.color,
              }}
            />
          </View>
        </View>

        {/* Statut */}
        <View className="flex-row items-center justify-between">
          <Text
            className="text-xs font-semibold"
            style={{
              color: isCompleted ? '#22C55E' : colors.muted,
            }}
          >
            {isCompleted ? '✓ Complété' : 'En cours'}
          </Text>
          {isCompleted && !userChallenge?.claimed && (
            <View className="px-3 py-1 bg-success rounded-full">
              <Text className="text-xs font-semibold text-background">Réclamer</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
