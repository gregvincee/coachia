import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useState, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { ScreenContainer } from '@/components/screen-container';
import { setOnboardingCompleted } from '@/lib/storage';
import { useColors } from '@/hooks/use-colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  title: string;
  description: string;
  emoji: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    title: 'Développez vos compétences',
    description: 'Un coach IA personnalisé pour vous accompagner dans votre progression',
    emoji: '🎯',
  },
  {
    title: 'Coaching instantané',
    description: 'Obtenez des conseils adaptés à vos besoins en temps réel',
    emoji: '💡',
  },
  {
    title: 'Progressez et débloquez',
    description: 'Gagnez de l\'expérience et débloquez des badges au fil de votre parcours',
    emoji: '🏆',
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollX.value = withTiming(nextIndex * SCREEN_WIDTH, { duration: 300 });
    }
  };

  const handleSkip = async () => {
    await setOnboardingCompleted();
    router.replace('/(tabs)');
  };

  const handleGetStarted = async () => {
    await setOnboardingCompleted();
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']} className="p-6">
      <View className="flex-1">
        {/* Skip Button */}
        <View className="items-end mb-4">
          <TouchableOpacity onPress={handleSkip} className="px-4 py-2">
            <Text className="text-muted text-sm font-medium">Passer</Text>
          </TouchableOpacity>
        </View>

        {/* Slides */}
        <View className="flex-1 justify-center">
          {SLIDES.map((slide, index) => {
            const slideStyle = useAnimatedStyle(() => {
              const opacity = interpolate(
                scrollX.value,
                [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
                [0, 1, 0]
              );
              const translateX = interpolate(
                scrollX.value,
                [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
                [50, 0, -50]
              );
              return {
                opacity,
                transform: [{ translateX }],
              };
            });

            return (
              <Animated.View
                key={index}
                style={[
                  slideStyle,
                  {
                    position: 'absolute',
                    width: SCREEN_WIDTH - 48,
                    alignItems: 'center',
                  },
                ]}
              >
                {index === 0 ? <CoachIAWordmark /> : <Text style={{ fontSize: 80, marginBottom: 32 }}>{slide.emoji}</Text>}
                <Text className="text-3xl font-bold text-foreground text-center mb-4">
                  {slide.title}
                </Text>
                <Text className="text-base text-muted text-center leading-relaxed px-4">
                  {slide.description}
                </Text>
              </Animated.View>
            );
          })}
        </View>

        {/* Pagination Dots */}
        <View className="flex-row justify-center gap-2 mb-8">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className="h-2 rounded-full"
              style={{
                width: currentIndex === index ? 24 : 8,
                backgroundColor: currentIndex === index ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>

        {/* Action Button */}
        <View className="items-center">
          {currentIndex === SLIDES.length - 1 ? (
            <TouchableOpacity
              onPress={handleGetStarted}
              className="bg-primary px-8 py-4 rounded-full w-full max-w-xs"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white text-center font-semibold text-base">
                Commencer
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleNext}
              className="bg-primary px-8 py-4 rounded-full w-full max-w-xs"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white text-center font-semibold text-base">
                Suivant
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

function CoachIAWordmark() {
  return (
    <View accessibilityRole="image" accessibilityLabel="Coach delta I" className="mb-8 flex-row items-end rounded-2xl px-4 py-2" style={{ backgroundColor: "#090B10", borderColor: "#1976FF", borderWidth: 1 }}>
      <Text style={{ color: "#F3F6FB", fontSize: 42, fontWeight: "800", letterSpacing: -2, textShadowColor: "#1B75FF", textShadowRadius: 4 }}>Coach</Text>
      <Text style={{ color: "#F3F6FB", fontSize: 47, fontWeight: "900", lineHeight: 51, textShadowColor: "#1B75FF", textShadowRadius: 7 }}>∆</Text>
      <Text style={{ color: "#F3F6FB", fontSize: 42, fontWeight: "800", letterSpacing: -2, textShadowColor: "#1B75FF", textShadowRadius: 4 }}>I</Text>
    </View>
  );
}
