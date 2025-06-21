import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressData, RoutineType } from '@/types/routine';

export class StorageService {
  static async saveProgress(
    date: string, 
    routineType: RoutineType, 
    progress: ProgressData
  ): Promise<void> {
    try {
      const key = `progress_${date}_${routineType}`;
      await AsyncStorage.setItem(key, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  static async getProgress(
    date: string, 
    routineType: RoutineType
  ): Promise<ProgressData | null> {
    try {
      const key = `progress_${date}_${routineType}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  }

  static async getAllProgress(): Promise<Record<string, ProgressData>> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(key => key.startsWith('progress_'));
      const items = await AsyncStorage.multiGet(progressKeys);
      
      const progressData: Record<string, ProgressData> = {};
      items.forEach(([key, value]) => {
        if (value) {
          try {
            progressData[key] = JSON.parse(value);
          } catch (error) {
            console.error(`Error parsing data for key ${key}:`, error);
          }
        }
      });
      
      return progressData;
    } catch (error) {
      console.error('Error getting all progress:', error);
      return {};
    }
  }

  static async clearProgress(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(key => key.startsWith('progress_'));
      await AsyncStorage.multiRemove(progressKeys);
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  }

  // Wake/Sleep time storage
  static async setWakeTime(time: string): Promise<void> {
    try {
      await AsyncStorage.setItem('wake_time', time);
    } catch (error) {
      console.error('Error saving wake time:', error);
    }
  }

  static async getWakeTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('wake_time');
    } catch (error) {
      console.error('Error getting wake time:', error);
      return null;
    }
  }

  static async setSleepTime(time: string): Promise<void> {
    try {
      await AsyncStorage.setItem('sleep_time', time);
    } catch (error) {
      console.error('Error saving sleep time:', error);
    }
  }

  static async getSleepTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('sleep_time');
    } catch (error) {
      console.error('Error getting sleep time:', error);
      return null;
    }
  }

  static async setReminderEnabled(val: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('reminder_enabled', JSON.stringify(val));
    } catch (error) {
      console.error('Error saving reminder setting:', error);
    }
  }

  static async getReminderEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem('reminder_enabled');
      return value ? JSON.parse(value) : true;
    } catch (error) {
      console.error('Error getting reminder setting:', error);
      return true;
    }
  }
}