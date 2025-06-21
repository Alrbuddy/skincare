import { View, Text, StyleSheet, ScrollView, SafeAreaView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Bell, Info, Shield, Clock, Trash2 } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { StorageService } from '@/utils/storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();

  // Wake/Sleep time state
  const [wakeTime, setWakeTime] = useState('08:00');
  const [sleepTime, setSleepTime] = useState('00:00');
  const [loadingTimes, setLoadingTimes] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [loadingReminder, setLoadingReminder] = useState(true);
  
  // Time picker states
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  const [showSleepTimePicker, setShowSleepTimePicker] = useState(false);
  const [wakeDate, setWakeDate] = useState(new Date());
  const [sleepDate, setSleepDate] = useState(new Date());

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedWake = await StorageService.getWakeTime();
      const storedSleep = await StorageService.getSleepTime();
      const storedReminder = await StorageService.getReminderEnabled();
      
      if (storedWake) {
        setWakeTime(storedWake);
        const [hours, minutes] = storedWake.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        setWakeDate(date);
      }
      
      if (storedSleep) {
        setSleepTime(storedSleep);
        const [hours, minutes] = storedSleep.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        setSleepDate(date);
      }
      
      setReminderEnabled(storedReminder);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoadingTimes(false);
      setLoadingReminder(false);
    }
  };

  const handleWakeTimeChange = async (event: any, selectedDate?: Date) => {
    setShowWakeTimePicker(false);
    if (selectedDate) {
      setWakeDate(selectedDate);
      const timeString = selectedDate.toTimeString().slice(0, 5);
      setWakeTime(timeString);
      await StorageService.setWakeTime(timeString);
    }
  };

  const handleSleepTimeChange = async (event: any, selectedDate?: Date) => {
    setShowSleepTimePicker(false);
    if (selectedDate) {
      setSleepDate(selectedDate);
      const timeString = selectedDate.toTimeString().slice(0, 5);
      setSleepTime(timeString);
      await StorageService.setSleepTime(timeString);
    }
  };

  const handleReminderToggle = async (val: boolean) => {
    setReminderEnabled(val);
    await StorageService.setReminderEnabled(val);
    // Placeholder: schedule or cancel notifications
    if (val) {
      // scheduleRoutineReminders(wakeTime, sleepTime);
    } else {
      // cancelRoutineReminders();
    }
  };

  const showAbout = () => {
    Alert.alert(
      'About Skincare App',
      'Version 1.0.0\n\nTrack your daily skincare routine with precision and consistency.',
      [{ text: 'OK' }]
    );
  };

  const showSafetyGuidelines = () => {
    Alert.alert(
      'Safety Guidelines',
      'Important reminders:\n\n• Never use lactic acid and retinol on the same night\n• Minoxidil should only be used once daily\n• Always patch test new products\n• Consult a dermatologist for concerns',
      [{ text: 'OK' }]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your progress and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearProgress();
              Alert.alert('Success', 'All data has been cleared.');
              // Reload settings
              loadSettings();
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data.');
            }
          }
        }
      ]
    );
  };

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange,
    disabled = false
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity 
      style={[
        styles.settingRow, 
        { backgroundColor: colors.surface },
        disabled && { opacity: 0.6 }
      ]}
      onPress={onPress}
      disabled={showSwitch || disabled}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showSwitch && onSwitchChange && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          disabled={disabled}
          trackColor={{ false: colors.border, true: colors.primary + '40' }}
          thumbColor={switchValue ? colors.primary : colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Customize your skincare experience
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            APPEARANCE
          </Text>
          <SettingRow
            icon={isDark ? <Moon size={20} color={colors.primary} /> : <Sun size={20} color={colors.primary} />}
            title="Dark Mode"
            subtitle={isDark ? "Using dark theme" : "Using light theme"}
            showSwitch={true}
            switchValue={isDark}
            onSwitchChange={toggleTheme}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            NOTIFICATIONS
          </Text>
          <SettingRow
            icon={<Bell size={20} color={colors.primary} />}
            title="Timer Alerts"
            subtitle="Get notified when timers complete"
            showSwitch={true}
            switchValue={true}
            onSwitchChange={() => {}}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            SCHEDULE
          </Text>
          
          <SettingRow
            icon={<Clock size={20} color={colors.primary} />}
            title="Wake Time"
            subtitle={`Currently set to ${wakeTime}`}
            onPress={() => setShowWakeTimePicker(true)}
            disabled={loadingTimes}
          />
          
          <SettingRow
            icon={<Moon size={20} color={colors.primary} />}
            title="Sleep Time"
            subtitle={`Currently set to ${sleepTime}`}
            onPress={() => setShowSleepTimePicker(true)}
            disabled={loadingTimes}
          />
          
          <SettingRow
            icon={<Bell size={20} color={colors.primary} />}
            title="Routine Reminders"
            subtitle="Get notified at your set times"
            showSwitch={true}
            switchValue={reminderEnabled}
            onSwitchChange={handleReminderToggle}
            disabled={loadingReminder}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            INFORMATION
          </Text>
          <SettingRow
            icon={<Shield size={20} color={colors.primary} />}
            title="Safety Guidelines"
            subtitle="Learn about product interactions"
            onPress={showSafetyGuidelines}
          />
          <SettingRow
            icon={<Info size={20} color={colors.primary} />}
            title="About"
            subtitle="Version 1.0.0"
            onPress={showAbout}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            DATA MANAGEMENT
          </Text>
          <SettingRow
            icon={<Trash2 size={20} color={colors.error} />}
            title="Clear All Data"
            subtitle="Reset progress and settings"
            onPress={handleClearData}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Built with care for your skincare journey
          </Text>
        </View>
      </ScrollView>

      {/* Time Pickers */}
      {showWakeTimePicker && (
        <DateTimePicker
          value={wakeDate}
          mode="time"
          is24Hour={true}
          onChange={handleWakeTimeChange}
        />
      )}
      
      {showSleepTimePicker && (
        <DateTimePicker
          value={sleepDate}
          mode="time"
          is24Hour={true}
          onChange={handleSleepTimeChange}
        />
      )}
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});