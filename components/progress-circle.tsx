import { View, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import Svg, { Circle } from 'react-native-svg';

interface ProgressCircleProps {
  size?: number;
  progress: number; // 0-100
  strokeWidth?: number;
  label?: string;
  value?: string;
}

export function ProgressCircle({
  size = 120,
  progress,
  strokeWidth = 8,
  label,
  value,
}: ProgressCircleProps) {
  const colors = useColors();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {/* Center Content */}
      <View className="absolute items-center justify-center">
        {value && (
          <Text className="text-2xl font-bold text-foreground">{value}</Text>
        )}
        {label && (
          <Text className="text-xs text-muted mt-1">{label}</Text>
        )}
      </View>
    </View>
  );
}
