import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle, Circle, Clock, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { TimerComponent } from './TimerComponent';
import { RoutineStep, RoutineType, ProgressData } from '@/types/routine';

interface RoutineCardProps {
  title: string;
  subtitle: string;
  routineType: RoutineType;
  steps: RoutineStep[];
  progress: ProgressData;
  onStepToggle: (stepId: string, completed: boolean) => void;
  gradientColors: string[];
  accentColor: string;
}

export function RoutineCard({
  title,
  subtitle,
  routineType,
  steps,
  progress,
  onStepToggle,
  gradientColors,
  accentColor,
}: RoutineCardProps) {
  const { colors } = useTheme();
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const completedSteps = Object.values(progress).filter(Boolean).length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const handleStepToggle = (stepId: string) => {
    const isCompleted = !progress[stepId];
    
    // Animate the toggle
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onStepToggle(stepId, isCompleted);

    // Start timer if step is completed and has wait time
    const step = steps.find(s => s.id === stepId);
    if (isCompleted && step?.waitTime && step.waitTime > 0) {
      setActiveTimer(stepId);
    }
  };

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const StepItem = ({ step, index }: { step: RoutineStep; index: number }) => {
    const isCompleted = progress[step.id] || false;
    const isExpanded = expandedSteps[step.id] || false;
    const showTimer = activeTimer === step.id;

    return (
      <View style={styles.stepContainer}>
        <TouchableOpacity
          style={[
            styles.stepRow,
            { backgroundColor: colors.surface },
            isCompleted && { backgroundColor: accentColor + '10' }
          ]}
          onPress={() => handleStepToggle(step.id)}
        >
          <View style={styles.stepLeft}>
            <View style={styles.stepNumber}>
              <Text style={[styles.stepNumberText, { color: colors.textSecondary }]}>
                {index + 1}
              </Text>
            </View>
            {isCompleted ? (
              <CheckCircle size={24} color={accentColor} />
            ) : (
              <Circle size={24} color={colors.border} />
            )}
            <View style={styles.stepText}>
              <Text style={[
                styles.stepName,
                { color: colors.text },
                isCompleted && { color: accentColor }
              ]}>
                {step.name}
              </Text>
              {step.description && (
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  {step.description}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.stepRight}>
            {step.waitTime && step.waitTime > 0 && (
              <View style={styles.waitTimeContainer}>
                <Clock size={16} color={colors.textSecondary} />
                <Text style={[styles.waitTimeText, { color: colors.textSecondary }]}>
                  {step.waitTime}m
                </Text>
              </View>
            )}
            {step.warning && (
              <TouchableOpacity onPress={() => toggleStepExpansion(step.id)}>
                <AlertTriangle size={20} color={colors.warning} />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        {/* Timer */}
        {showTimer && step.waitTime && (
          <TimerComponent
            stepId={step.id}
            duration={step.waitTime}
            onComplete={() => setActiveTimer(null)}
            onCancel={() => setActiveTimer(null)}
          />
        )}

        {/* Warning/Info Expansion */}
        {isExpanded && step.warning && (
          <View style={[styles.warningContainer, { backgroundColor: colors.warning + '15' }]}>
            <AlertTriangle size={16} color={colors.warning} />
            <Text style={[styles.warningText, { color: colors.text }]}>
              {step.warning}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient colors={gradientColors} style={styles.cardGradient}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {title}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          </View>
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, { color: accentColor }]}>
              {completedSteps}/{totalSteps}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { 
                    backgroundColor: accentColor,
                    width: `${progressPercentage}%`
                  }
                ]}
              />
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <StepItem key={step.id} step={step} index={index} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  progressContainer: {
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  progressBar: {
    width: 80,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepsContainer: {
    backgroundColor: 'white',
    paddingTop: 16,
  },
  stepContainer: {
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  stepNumberText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  stepText: {
    flex: 1,
    marginLeft: 12,
  },
  stepName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  stepRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waitTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  waitTimeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
});