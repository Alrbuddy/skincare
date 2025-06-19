import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Pause, Play, X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface TimerComponentProps {
  stepId: string;
  duration: number; // in minutes (can be decimal for seconds)
  onComplete: () => void;
  onCancel: () => void;
}

export function TimerComponent({ stepId, duration, onComplete, onCancel }: TimerComponentProps) {
  const { colors } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState(Math.round(duration * 60)); // convert to seconds
  const [isActive, setIsActive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, timeRemaining, onComplete]);

  useEffect(() => {
    // Animate progress
    const totalSeconds = Math.round(duration * 60);
    const progress = 1 - (timeRemaining / totalSeconds);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Pulse animation when timer is active
    if (isActive && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timeRemaining, isActive, isPaused, duration, progressAnim, pulseAnim]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleCancel = () => {
    setIsActive(false);
    onCancel();
  };

  const totalSeconds = Math.round(duration * 60);
  const progressPercentage = ((totalSeconds - timeRemaining) / totalSeconds) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.timerContent}>
        <Animated.View 
          style={[
            styles.timerDisplay,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <View style={[styles.progressRing, { borderColor: colors.border }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  borderColor: colors.primary,
                  transform: [
                    {
                      rotate: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            />
            <View style={[styles.timerInner, { backgroundColor: colors.surface }]}>
              <Text style={[styles.timeText, { color: colors.text }]}>
                {formatTime(timeRemaining)}
              </Text>
              <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                {timeRemaining < 60 ? 'seconds' : 'remaining'}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.background }]}
            onPress={togglePause}
          >
            {isPaused ? (
              <Play size={20} color={colors.primary} />
            ) : (
              <Pause size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.background }]}
            onPress={handleCancel}
          >
            <X size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBarFill,
              { 
                backgroundColor: colors.primary,
                width: `${progressPercentage}%`
              }
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {Math.round(progressPercentage)}% complete
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timerDisplay: {
    alignItems: 'center',
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  timerInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  timeLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});