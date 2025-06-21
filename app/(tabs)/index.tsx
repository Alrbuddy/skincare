import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { RoutineCard } from '@/components/RoutineCard';
import { getRoutineForDate, getRoutineTypeForDay } from '@/utils/routineScheduler';
import { StorageService } from '@/utils/storage';
import { RoutineType, RoutineStep } from '@/types/routine';

export default function HomeScreen() {
  const { colors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [morningRoutine, setMorningRoutine] = useState<RoutineStep[]>([]);
  const [eveningRoutine, setEveningRoutine] = useState<RoutineStep[]>([]);
  const [morningProgress, setMorningProgress] = useState<Record<string, boolean>>({});
  const [eveningProgress, setEveningProgress] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);
      const now = new Date();
      setCurrentDate(now);
      
      const { morning, evening } = getRoutineForDate(now);
      setMorningRoutine(morning);
      setEveningRoutine(evening);
      
      await loadProgress();
    } catch (error) {
      console.error('Error initializing data:', error);
      Alert.alert('Error', 'Failed to load routine data. Please try restarting the app.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const dateKey = currentDate.toDateString();
      const morningData = await StorageService.getProgress(dateKey, 'morning');
      const eveningData = await StorageService.getProgress(dateKey, 'evening');
      
      setMorningProgress(morningData || {});
      setEveningProgress(eveningData || {});
    } catch (error) {
      console.error('Error loading progress:', error);
      // Don't show alert for progress loading errors as it's less critical
    }
  };

  const updateProgress = async (routineType: RoutineType, stepId: string, completed: boolean) => {
    try {
      const dateKey = currentDate.toDateString();
      
      if (routineType === 'morning') {
        const newProgress = { ...morningProgress, [stepId]: completed };
        setMorningProgress(newProgress);
        await StorageService.saveProgress(dateKey, 'morning', newProgress);
      } else {
        const newProgress = { ...eveningProgress, [stepId]: completed };
        setEveningProgress(newProgress);
        await StorageService.saveProgress(dateKey, 'evening', newProgress);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      Alert.alert('Error', 'Failed to save progress. Please try again.');
      // Revert the UI state if save failed
      await loadProgress();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentTime = () => {
    return currentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEveningRoutineTitle = () => {
    const dayOfWeek = currentDate.getDay();
    return getRoutineTypeForDay(dayOfWeek);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading your routine...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formatDate(currentDate)}
          </Text>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {getCurrentTime()}
          </Text>
        </View>

        <View style={styles.routinesContainer}>
          <RoutineCard
            title="Morning Routine"
            subtitle="Brighten + Protect"
            routineType="morning"
            steps={morningRoutine}
            progress={morningProgress}
            onStepToggle={(stepId, completed) => updateProgress('morning', stepId, completed)}
            gradientColors={['#E3F2FD', '#BBDEFB'] as const}
            accentColor="#1976D2"
          />

          <RoutineCard
            title="Evening Routine"
            subtitle={getEveningRoutineTitle()}
            routineType="evening"
            steps={eveningRoutine}
            progress={eveningProgress}
            onStepToggle={(stepId, completed) => updateProgress('evening', stepId, completed)}
            gradientColors={['#F3E5F5', '#E1BEE7'] as const}
            accentColor="#7B1FA2"
          />
        </View>

        <View style={[styles.scheduleCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.scheduleTitle, { color: colors.text }]}>
            Weekly Evening Schedule
          </Text>
          <Text style={[styles.scheduleSubtitle, { color: colors.textSecondary }]}>
            Alternating active ingredients for optimal results
          </Text>
          <View style={styles.scheduleList}>
            <View style={styles.scheduleRow}>
              <Text style={[styles.scheduleDay, { color: colors.text }]}>Mon & Thu</Text>
              <Text style={[styles.scheduleRoutine, { color: '#E91E63' }]}>Lactic Acid Night</Text>
            </View>
            <View style={styles.scheduleRow}>
              <Text style={[styles.scheduleDay, { color: colors.text }]}>Tue & Fri</Text>
              <Text style={[styles.scheduleRoutine, { color: '#9C27B0' }]}>Retinol Night</Text>
            </View>
            <View style={styles.scheduleRow}>
              <Text style={[styles.scheduleDay, { color: colors.text }]}>Wed & Sat</Text>
              <Text style={[styles.scheduleRoutine, { color: '#4CAF50' }]}>Recovery Night</Text>
            </View>
            <View style={styles.scheduleRow}>
              <Text style={[styles.scheduleDay, { color: colors.text }]}>Sunday</Text>
              <Text style={[styles.scheduleRoutine, { color: colors.textSecondary }]}>Optional/Rest</Text>
            </View>
          </View>
          <View style={[styles.importantNote, { backgroundColor: colors.warning + '15' }]}>
            <Text style={[styles.noteText, { color: colors.text }]}>
              <Text style={{ fontFamily: 'Inter-Bold' }}>Important:</Text> Never use lactic acid and retinol on the same night. Minoxidil should only be used once daily.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  dateText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  routinesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 20,
  },
  scheduleCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scheduleTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  scheduleSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
  },
  scheduleList: {
    gap: 12,
    marginBottom: 16,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleDay: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  scheduleRoutine: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flex: 2,
    textAlign: 'right',
  },
  importantNote: {
    padding: 12,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    lineHeight: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});