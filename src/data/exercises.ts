import { Exercise } from '../types/types';

export const exercises: Exercise[] = [
  { id: '1', name: 'Жим лёжа', category: 'chest', icon: '🏋️', defaultSets: 4, defaultReps: 10 },
  { id: '2', name: 'Разводка гантелей', category: 'chest', icon: '💪', defaultSets: 3, defaultReps: 12 },
  { id: '3', name: 'Отжимания', category: 'chest', icon: '🤸', defaultSets: 3, defaultReps: 15 },
  { id: '4', name: 'Подтягивания', category: 'back', icon: '💪', defaultSets: 4, defaultReps: 8 },
  { id: '5', name: 'Тяга штанги', category: 'back', icon: '🏋️', defaultSets: 4, defaultReps: 10 },
  { id: '6', name: 'Тяга на блоке', category: 'back', icon: '🏋️', defaultSets: 3, defaultReps: 12 },
  { id: '7', name: 'Приседания', category: 'legs', icon: '🦵', defaultSets: 4, defaultReps: 10 },
  { id: '8', name: 'Жим ногами', category: 'legs', icon: '🦵', defaultSets: 4, defaultReps: 12 },
  { id: '9', name: 'Выпады', category: 'legs', icon: '🦵', defaultSets: 3, defaultReps: 12 },
  { id: '10', name: 'Жим стоя', category: 'shoulders', icon: '🏋️', defaultSets: 4, defaultReps: 10 },
  { id: '11', name: 'Разведение рук', category: 'shoulders', icon: '💪', defaultSets: 3, defaultReps: 15 },
  { id: '12', name: 'Бицепс курл', category: 'arms', icon: '💪', defaultSets: 3, defaultReps: 12 },
  { id: '13', name: 'Французский жим', category: 'arms', icon: '💪', defaultSets: 3, defaultReps: 12 },
  { id: '14', name: 'Планка', category: 'core', icon: '🧘', defaultSets: 3, defaultReps: 60 },
  { id: '15', name: 'Скручивания', category: 'core', icon: '🧘', defaultSets: 3, defaultReps: 20 },
  { id: '16', name: 'Бег', category: 'cardio', icon: '🏃', defaultSets: 1, defaultReps: 30 },
  { id: '17', name: 'Велосипед', category: 'cardio', icon: '🚴', defaultSets: 1, defaultReps: 30 },
];

export const categoryLabels: Record<string, string> = {
  chest: 'Грудь',
  back: 'Спина',
  legs: 'Ноги',
  shoulders: 'Плечи',
  arms: 'Руки',
  core: 'Кор',
  cardio: 'Кардио',
};

export const categoryIcons: Record<string, string> = {
  chest: '🏋️',
  back: '💪',
  legs: '🦵',
  shoulders: '🎯',
  arms: '💪',
  core: '🧘',
  cardio: '🏃',
};
