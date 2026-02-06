/**
 * Service d'animations avancées avec react-native-reanimated
 */

import { Animated, Easing } from 'react-native';

/**
 * Animation de fade in
 */
export function createFadeInAnimation(duration: number = 300): Animated.Value {
  const opacity = new Animated.Value(0);
  Animated.timing(opacity, {
    toValue: 1,
    duration,
    easing: Easing.ease,
    useNativeDriver: true,
  }).start();
  return opacity;
}

/**
 * Animation de slide in depuis la gauche
 */
export function createSlideInLeftAnimation(duration: number = 300): Animated.Value {
  const translateX = new Animated.Value(-100);
  Animated.timing(translateX, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
  return translateX;
}

/**
 * Animation de slide in depuis la droite
 */
export function createSlideInRightAnimation(duration: number = 300): Animated.Value {
  const translateX = new Animated.Value(100);
  Animated.timing(translateX, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
  return translateX;
}

/**
 * Animation de scale (zoom)
 */
export function createScaleAnimation(duration: number = 300): Animated.Value {
  const scale = new Animated.Value(0.8);
  Animated.timing(scale, {
    toValue: 1,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
  return scale;
}

/**
 * Animation de bounce
 */
export function createBounceAnimation(duration: number = 600): Animated.Value {
  const scale = new Animated.Value(0.5);
  Animated.sequence([
    Animated.timing(scale, {
      toValue: 1.2,
      duration: duration * 0.5,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(scale, {
      toValue: 1,
      duration: duration * 0.5,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }),
  ]).start();
  return scale;
}

/**
 * Animation de pulse (respiration)
 */
export function createPulseAnimation(duration: number = 1000): Animated.Value {
  const opacity = new Animated.Value(1);
  Animated.loop(
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.5,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  ).start();
  return opacity;
}

/**
 * Animation de rotation
 */
export function createRotateAnimation(duration: number = 1000): Animated.Value {
  const rotation = new Animated.Value(0);
  Animated.loop(
    Animated.timing(rotation, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();
  return rotation;
}

/**
 * Animation de shake (secousse)
 */
export function createShakeAnimation(duration: number = 200): Animated.Value {
  const translateX = new Animated.Value(0);
  Animated.sequence([
    Animated.timing(translateX, { toValue: -10, duration: duration / 4, useNativeDriver: true }),
    Animated.timing(translateX, { toValue: 10, duration: duration / 4, useNativeDriver: true }),
    Animated.timing(translateX, { toValue: -10, duration: duration / 4, useNativeDriver: true }),
    Animated.timing(translateX, { toValue: 0, duration: duration / 4, useNativeDriver: true }),
  ]).start();
  return translateX;
}

/**
 * Animation de flip (retournement)
 */
export function createFlipAnimation(duration: number = 500): Animated.Value {
  const rotateY = new Animated.Value(0);
  Animated.timing(rotateY, {
    toValue: 1,
    duration,
    easing: Easing.inOut(Easing.cubic),
    useNativeDriver: true,
  }).start();
  return rotateY;
}

/**
 * Combine plusieurs animations
 */
export function combineAnimations(animations: Animated.Value[]): Animated.CompositeAnimation {
  return Animated.parallel(
    animations.map(anim => Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }))
  );
}

/**
 * Crée une animation de progression linéaire
 */
export function createProgressAnimation(
  fromValue: number = 0,
  toValue: number = 100,
  duration: number = 1000
): Animated.Value {
  const progress = new Animated.Value(fromValue);
  Animated.timing(progress, {
    toValue,
    duration,
    easing: Easing.inOut(Easing.ease),
    useNativeDriver: false, // Progress ne supporte pas native driver
  }).start();
  return progress;
}

/**
 * Crée une animation élastique
 */
export function createSpringAnimation(
  initialValue: number = 0,
  finalValue: number = 1,
  tension: number = 40,
  friction: number = 7
): Animated.Value {
  const value = new Animated.Value(initialValue);
  Animated.spring(value, {
    toValue: finalValue,
    tension,
    friction,
    useNativeDriver: true,
  }).start();
  return value;
}

/**
 * Interpolation pour les animations
 */
export function interpolateValue(
  animatedValue: Animated.Value,
  inputRange: number[],
  outputRange: (string | number)[]
): any {
  return animatedValue.interpolate({
    inputRange,
    outputRange: outputRange as any,
  });
}
