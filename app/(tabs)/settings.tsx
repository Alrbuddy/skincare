// @ts-nocheck
// This file uses JSX/TSX. Ensure your tsconfig.json has "jsx": "react-native" or "react-jsx".
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Bell, Info, Shield } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { StorageService } from '@/utils/storage';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();

  // Wake/Sleep time state
  const [wakeTime, setWakeTime] = useState('08:00');
  const [sleepTime, setSleepTime] = useState('00:00');
  const [loadingTimes, setLoadingTimes] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [loadingReminder, setLoadingReminder] = useState(true);

  useEffect(() => {
    (async () => {
      const storedWake = await StorageService.getWakeTime();
      const storedSleep = await StorageService.getSleepTime();
      const storedReminder = await StorageService.getReminderEnabled?.();
      if (storedWake) setWakeTime(storedWake);
      if (storedSleep) setSleepTime(storedSleep);
      if (typeof storedReminder === 'boolean') setReminderEnabled(storedReminder);
      setLoadingTimes(false);
      setLoadingReminder(false);
    })();
  }, []);

  const handleWakeTimeChange = async (val: string) => {
    setWakeTime(val);
    await StorageService.setWakeTime(val);
  };
  const handleSleepTimeChange = async (val: string) => {
    setSleepTime(val);
    await StorageService.setSleepTime(val);
  };
  const handleReminderToggle = async (val: boolean) => {
    setReminderEnabled(val);
    await StorageService.setReminderEnabled?.(val);
    // Placeholder: schedule or cancel notifications
    if (val) {
      // scheduleRoutineReminders(wakeTime, sleepTime);
    } else {
      // cancelRoutineReminders();
    }
  };

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
  }) => (
    <TouchableOpacity 
      style={[styles.settingRow, { backgroundColor: colors.surface }]}
      onPress={onPress}
      disabled={showSwitch}
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
      {showSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
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
            INFORMATION
          </Text>
          <SettingRow
            icon={<Shield size={20} color={colors.primary} />}
            title="Safety Guidelines"
            subtitle="Learn about product interactions"
            onPress={() => {}}
          />
          <SettingRow
            icon={<Info size={20} color={colors.primary} />}
            title="About"
            subtitle="Version 1.0.0"
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SCHEDULE</Text>
          <View style={[styles.settingRow, { backgroundColor: colors.surface }]}> 
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>⏰</View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Wake Time</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>When you usually wake up</Text>
              </View>
            </View>
            <input
              type="time"
              value={wakeTime}
              onChange={e => handleWakeTimeChange(e.target.value)}
              style={{ width: 80, fontSize: 16 }}
              disabled={loadingTimes}
            />
          </View>
          <View style={[styles.settingRow, { backgroundColor: colors.surface }]}> 
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>🌙</View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Sleep Time</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>When you usually go to sleep</Text>
              </View>
            </View>
            <input
              type="time"
              value={sleepTime}
              onChange={e => handleSleepTimeChange(e.target.value)}
              style={{ width: 80, fontSize: 16 }}
              disabled={loadingTimes}
            />
          </View>
          <View style={[styles.settingRow, { backgroundColor: colors.surface }]}> 
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>🔔</View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Routine Reminders</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Get notified at your set times</Text>
              </View>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={handleReminderToggle}
              disabled={loadingReminder}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={reminderEnabled ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Built with care for your skincare journey
          </Text>
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