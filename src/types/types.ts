export interface Exercise {
  id: string;
  name: string;
  category: MuscleGroup;
  icon: string;
  defaultSets: number;
  defaultReps: number;
}

export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';

export type RPE = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface WorkoutSet {
  reps: number;
  weight: number;
  rpe?: RPE;
  note?: string;
  completed: boolean;
  previousReps?: number;
  previousWeight?: number;
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number;
  exercises: WorkoutExercise[];
  completed: boolean;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
}

export interface PersonalRecord {
  exerciseId: string;
  maxWeight: number;
  maxReps: number;
  oneRepMax: number;
  date: string;
}
