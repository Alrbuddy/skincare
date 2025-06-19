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
}