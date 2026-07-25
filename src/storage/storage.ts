import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout, WorkoutTemplate, PersonalRecord, Exercise } from '../types/types';

const WORKOUTS_KEY = '@fitness_workouts';
const TEMPLATES_KEY = '@fitness_templates';
const PR_KEY = '@fitness_prs';

function calc1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export const storage = {
  async getWorkouts(): Promise<Workout[]> {
    const data = await AsyncStorage.getItem(WORKOUTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async saveWorkout(workout: Workout): Promise<void> {
    const workouts = await this.getWorkouts();
    workouts.unshift(workout);
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
    await this.updatePRs(workout);
  },

  async deleteWorkout(id: string): Promise<void> {
    const workouts = await this.getWorkouts();
    const filtered = workouts.filter((w) => w.id !== id);
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(filtered));
  },

  async getThisWeekWorkouts(): Promise<Workout[]> {
    const workouts = await this.getWorkouts();
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return workouts.filter((w) => new Date(w.date) >= weekStart);
  },

  async getStreak(): Promise<number> {
    const workouts = await this.getWorkouts();
    if (workouts.length === 0) return 0;

    const dates = [...new Set(workouts.map((w) => w.date.split('T')[0]))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];

    if (dates[0] !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (dates[0] !== yesterday.toISOString().split('T')[0]) return 0;
    }

    for (let i = 0; i < dates.length; i++) {
      const current = new Date(dates[i]);
      if (i > 0) {
        const prev = new Date(dates[i - 1]);
        const diff = (prev.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
        if (diff > 1) break;
      }
      streak++;
    }

    return streak;
  },

  async getTotalDuration(): Promise<number> {
    const workouts = await this.getWorkouts();
    return workouts.reduce((acc, w) => acc + w.duration, 0);
  },

  async getExerciseHistory(exerciseId: string): Promise<{ date: string; maxWeight: number; maxReps: number; volume: number }[]> {
    const workouts = await this.getWorkouts();
    const result: { date: string; maxWeight: number; maxReps: number; volume: number }[] = [];

    for (const w of workouts) {
      for (const we of w.exercises) {
        if (we.exercise.id === exerciseId) {
          const completedSets = we.sets.filter((s) => s.completed);
          if (completedSets.length > 0) {
            const maxWeight = Math.max(...completedSets.map((s) => s.weight));
            const maxReps = Math.max(...completedSets.map((s) => s.reps));
            const volume = completedSets.reduce((acc, s) => acc + s.weight * s.reps, 0);
            result.push({
              date: w.date.split('T')[0],
              maxWeight,
              maxReps,
              volume,
            });
          }
        }
      }
    }

    return result.reverse();
  },

  async getLastSetForExercise(exerciseId: string): Promise<{ reps: number; weight: number } | null> {
    const workouts = await this.getWorkouts();
    for (const w of workouts) {
      for (const we of w.exercises) {
        if (we.exercise.id === exerciseId) {
          const completedSets = we.sets.filter((s) => s.completed);
          if (completedSets.length > 0) {
            return completedSets[completedSets.length - 1];
          }
        }
      }
    }
    return null;
  },

  async getPRs(): Promise<PersonalRecord[]> {
    const data = await AsyncStorage.getItem(PR_KEY);
    return data ? JSON.parse(data) : [];
  },

  async getPRForExercise(exerciseId: string): Promise<PersonalRecord | null> {
    const prs = await this.getPRs();
    return prs.find((p) => p.exerciseId === exerciseId) || null;
  },

  async updatePRs(workout: Workout): Promise<void> {
    const prs = await this.getPRs();

    for (const we of workout.exercises) {
      const completedSets = we.sets.filter((s) => s.completed);
      if (completedSets.length === 0) continue;

      const maxWeight = Math.max(...completedSets.map((s) => s.weight));
      const maxReps = Math.max(...completedSets.map((s) => s.reps));
      const best1RM = Math.max(...completedSets.map((s) => calc1RM(s.weight, s.reps)));

      const existing = prs.find((p) => p.exerciseId === we.exercise.id);

      if (!existing) {
        prs.push({
          exerciseId: we.exercise.id,
          maxWeight,
          maxReps,
          oneRepMax: best1RM,
          date: workout.date,
        });
      } else {
        let changed = false;
        if (maxWeight > existing.maxWeight) {
          existing.maxWeight = maxWeight;
          changed = true;
        }
        if (maxReps > existing.maxReps) {
          existing.maxReps = maxReps;
          changed = true;
        }
        if (best1RM > existing.oneRepMax) {
          existing.oneRepMax = best1RM;
          changed = true;
        }
        if (changed) existing.date = workout.date;
      }
    }

    await AsyncStorage.setItem(PR_KEY, JSON.stringify(prs));
  },

  async getTemplates(): Promise<WorkoutTemplate[]> {
    const data = await AsyncStorage.getItem(TEMPLATES_KEY);
    return data ? JSON.parse(data) : [];
  },

  async saveTemplate(template: WorkoutTemplate): Promise<void> {
    const templates = await this.getTemplates();
    const existing = templates.findIndex((t) => t.id === template.id);
    if (existing >= 0) {
      templates[existing] = template;
    } else {
      templates.unshift(template);
    }
    await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  },

  async deleteTemplate(id: string): Promise<void> {
    const templates = await this.getTemplates();
    const filtered = templates.filter((t) => t.id !== id);
    await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
  },
};
