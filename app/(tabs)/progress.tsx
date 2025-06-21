import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { StorageService } from '@/utils/storage';
import { Calendar, CircleCheck as CheckCircle, Circle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressData {
  date: string;
  morningComplete: boolean;
  eveningComplete: boolean;
  morningSteps: number;
  eveningSteps: number;
}

export default function ProgressScreen() {
  const { colors } = useTheme();
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    completedDays: 0,
    totalDays: 7,
    morningStreak: 0,
    eveningStreak: 0,
  });
  const [totalStats, setTotalStats] = useState({
    totalDays: 0,
    totalWeeks: 0,
    totalMonths: 0,
    firstDay: '',
  });

  useEffect(() => {
    loadProgressData();
    loadTotalStats();
  }, []);

  const loadProgressData = async () => {
    const data: ProgressData[] = [];
    const today = new Date();
    
    // Load last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toDateString();
      
      const morningProgress = await StorageService.getProgress(dateKey, 'morning');
      const eveningProgress = await StorageService.getProgress(dateKey, 'evening');
      
      const morningSteps = morningProgress ? Object.values(morningProgress).filter(Boolean).length : 0;
      const eveningSteps = eveningProgress ? Object.values(eveningProgress).filter(Boolean).length : 0;
      
      const morningTotal = morningProgress ? Object.keys(morningProgress).length : 0;
      const eveningTotal = eveningProgress ? Object.keys(eveningProgress).length : 0;
      
      data.push({
        date: dateKey,
        morningComplete: morningTotal > 0 && morningSteps === morningTotal,
        eveningComplete: eveningTotal > 0 && eveningSteps === eveningTotal,
        morningSteps,
        eveningSteps,
      });
    }
    
    setProgressData(data);
    calculateWeeklyStats(data);
  };

  const calculateWeeklyStats = (data: ProgressData[]) => {
    const completedDays = data.filter(d => d.morningComplete && d.eveningComplete).length;
    let morningStreak = 0;
    let eveningStreak = 0;
    
    // Calculate current streaks
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].morningComplete) {
        morningStreak++;
      } else {
        break;
      }
    }
    
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].eveningComplete) {
        eveningStreak++;
      } else {
        break;
      }
    }
    
    setWeeklyStats({
      completedDays,
      totalDays: 7,
      morningStreak,
      eveningStreak,
    });
  };

  const loadTotalStats = async () => {
    const allProgress = await StorageService.getAllProgress();
    // Map: { 'progress_DATE_morning': {...}, 'progress_DATE_evening': {...} }
    const dayMap: Record<string, { morning: boolean; evening: boolean }> = {};
    Object.keys(allProgress).forEach(key => {
      const match = key.match(/^progress_(.+)_(morning|evening)$/);
      if (match) {
        const date = match[1];
        const type = match[2];
        if (!dayMap[date]) dayMap[date] = { morning: false, evening: false };
        const progress = allProgress[key];
        const total = progress ? Object.keys(progress).length : 0;
        const completed = progress ? Object.values(progress).filter(Boolean).length : 0;
        if (type === 'morning') dayMap[date].morning = total > 0 && completed === total;
        if (type === 'evening') dayMap[date].evening = total > 0 && completed === total;
      }
    });
    // Only count days where both morning and evening are complete
    const completedDates = Object.keys(dayMap).filter(date => dayMap[date].morning && dayMap[date].evening);
    completedDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const totalDays = completedDates.length;
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = Math.floor(totalDays / 30);
    setTotalStats({
      totalDays,
      totalWeeks,
      totalMonths,
      firstDay: completedDates[0] || '',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    return Math.round((weeklyStats.completedDays / weeklyStats.totalDays) * 100);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Progress</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your skincare consistency
          </Text>
        </View>

        {/* Total Consistency Stats */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, marginBottom: 8 }]}>
          <View style={styles.summaryContent}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Total Consistency</Text>
            <Text style={[styles.summarySubtext, { color: colors.textSecondary }]}>Days: {totalStats.totalDays}</Text>
            <Text style={[styles.summarySubtext, { color: colors.textSecondary }]}>Weeks: {totalStats.totalWeeks}</Text>
            <Text style={[styles.summarySubtext, { color: colors.textSecondary }]}>Months: {totalStats.totalMonths}</Text>
            {totalStats.firstDay ? (
              <Text style={[styles.summarySubtext, { color: colors.textSecondary }]}>Since: {totalStats.firstDay}</Text>
            ) : null}
          </View>
        </View>

        {/* Weekly Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <LinearGradient
            colors={['#E8F5E8', '#C8E6C9']}
            style={styles.gradientBackground}
          >
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                This Week
              </Text>
              <Text style={[styles.summaryPercent, { color: '#2E7D32' }]}>
                {getProgressPercentage()}%
              </Text>
              <Text style={[styles.summarySubtext, { color: colors.textSecondary }]}>
                {weeklyStats.completedDays} of {weeklyStats.totalDays} days completed
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Streaks */}
        <View style={styles.streaksContainer}>
          <View style={[styles.streakCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.streakNumber, { color: '#1976D2' }]}>
              {weeklyStats.morningStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
              Morning Streak
            </Text>
          </View>
          <View style={[styles.streakCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.streakNumber, { color: '#7B1FA2' }]}>
              {weeklyStats.eveningStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
              Evening Streak
            </Text>
          </View>
        </View>

        {/* Daily Progress */}
        <View style={styles.dailyProgressContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Daily Progress
          </Text>
          {progressData.map((day, index) => (
            <View key={day.date} style={[styles.dayRow, { backgroundColor: colors.surface }]}>
              <View style={styles.dayInfo}>
                <Calendar size={20} color={colors.textSecondary} />
                <Text style={[styles.dayText, { color: colors.text }]}>
                  {formatDate(day.date)}
                </Text>
              </View>
              <View style={styles.dayProgress}>
                <View style={styles.routineProgress}>
                  {day.morningComplete ? (
                    <CheckCircle size={24} color="#1976D2" />
                  ) : (
                    <Circle size={24} color={colors.border} />
                  )}
                  <Text style={[styles.routineLabel, { color: colors.textSecondary }]}>
                    Morning
                  </Text>
                </View>
                <View style={styles.routineProgress}>
                  {day.eveningComplete ? (
                    <CheckCircle size={24} color="#7B1FA2" />
                  ) : (
                    <Circle size={24} color={colors.border} />
                  )}
                  <Text style={[styles.routineLabel, { color: colors.textSecondary }]}>
                    Evening
                  </Text>
                </View>
              </View>
            </View>
          ))}
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
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  summaryCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  gradientBackground: {
    padding: 24,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  summaryPercent: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  streaksContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  streakCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  dailyProgressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  dayProgress: {
    flexDirection: 'row',
    gap: 20,
  },
  routineProgress: {
    alignItems: 'center',
    gap: 4,
  },
  routineLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});