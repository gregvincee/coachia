import { Animated, View, ViewProps } from 'react-native';
import { useEffect } from 'react';
import { createFadeInAnimation, createSlideInLeftAnimation, createScaleAnimation } from '@/lib/animations';

interface AnimatedCardProps extends ViewProps {
  delay?: number;
  animation?: 'fade' | 'slide' | 'scale' | 'bounce';
  duration?: number;
  children: React.ReactNode;
}

export function AnimatedCard({
  delay = 0,
  animation = 'fade',
  duration = 300,
  children,
  style,
  ...props
}: AnimatedCardProps) {
  const getAnimation = () => {
    switch (animation) {
      case 'slide':
        return createSlideInLeftAnimation(duration);
      case 'scale':
        return createScaleAnimation(duration);
      default:
        return createFadeInAnimation(duration);
    }
  };

  const animatedValue = getAnimation();

  const animatedStyle = animation === 'fade' ? { opacity: animatedValue } : 
                       animation === 'slide' ? { transform: [{ translateX: animatedValue }] } :
                       { transform: [{ scale: animatedValue }] };

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}
