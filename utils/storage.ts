import { ProgressData, RoutineType } from '@/types/routine';

export class StorageService {
  private static storage: Record<string, any> = {};

  static async saveProgress(
    date: string, 
    routineType: RoutineType, 
    progress: ProgressData
  ): Promise<void> {
    const key = `progress_${date}_${routineType}`;
    this.storage[key] = progress;
  }

  static async getProgress(
    date: string, 
    routineType: RoutineType
  ): Promise<ProgressData | null> {
    const key = `progress_${date}_${routineType}`;
    return this.storage[key] || null;
  }

  static async getAllProgress(): Promise<Record<string, ProgressData>> {
    const progressData: Record<string, ProgressData> = {};
    
    Object.keys(this.storage).forEach(key => {
      if (key.startsWith('progress_')) {
        progressData[key] = this.storage[key];
      }
    });
    
    return progressData;
  }

  static async clearProgress(): Promise<void> {
    Object.keys(this.storage).forEach(key => {
      if (key.startsWith('progress_')) {
        delete this.storage[key];
      }
    });
  }

  // Wake/Sleep time storage
  static async setWakeTime(time: string): Promise<void> {
    this.storage['wake_time'] = time;
  }
  static async getWakeTime(): Promise<string | null> {
    return this.storage['wake_time'] || null;
  }
  static async setSleepTime(time: string): Promise<void> {
    this.storage['sleep_time'] = time;
  }
  static async getSleepTime(): Promise<string | null> {
    return this.storage['sleep_time'] || null;
  }

  static async setReminderEnabled(val: boolean): Promise<void> {
    this.storage['reminder_enabled'] = val;
  }
  static async getReminderEnabled(): Promise<boolean> {
    return typeof this.storage['reminder_enabled'] === 'boolean' ? this.storage['reminder_enabled'] : true;
  }
}