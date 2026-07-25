import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { exercises, categoryLabels } from '../data/exercises';
import { Exercise, MuscleGroup } from '../types/types';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  navigation: any;
  route: any;
}

const categories: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'];

export default function NewWorkoutScreen({ navigation, route }: Props) {
  const templateExercises: Exercise[] | undefined = route.params?.templateExercises;
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(templateExercises || []);
  const [selectedCategory, setSelectedCategory] = useState<MuscleGroup | 'all'>('all');

  const filteredExercises =
    selectedCategory === 'all'
      ? exercises
      : exercises.filter((e) => e.category === selectedCategory);

  const toggleExercise = (exercise: Exercise) => {
    setSelectedExercises((prev) => {
      const exists = prev.find((e) => e.id === exercise.id);
      if (exists) return prev.filter((e) => e.id !== exercise.id);
      return [...prev, exercise];
    });
  };

  const startWorkout = () => {
    if (selectedExercises.length === 0) return;
    navigation.navigate('ActiveWorkout', { exercises: selectedExercises });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {templateExercises ? 'Из шаблона' : 'Новая тренировка'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {selectedExercises.length > 0 && (
        <View style={styles.selectedBar}>
          <Text style={styles.selectedText}>
            Выбрано: {selectedExercises.length}
          </Text>
          <TouchableOpacity onPress={() => setSelectedExercises([])}>
            <Text style={styles.clearText}>Очистить</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <FlatList
            data={[{ id: 'all', label: 'Все' } as any, ...categories.map((c) => ({ id: c, label: categoryLabels[c] }))]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const cat = item.id as MuscleGroup | 'all';
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.categoryContent}
          />
        }
        renderItem={({ item }) => {
          const isSelected = selectedExercises.some((e) => e.id === item.id);
          return (
            <TouchableOpacity
              style={[styles.exerciseItem, isSelected && styles.exerciseItemSelected]}
              onPress={() => toggleExercise(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.exerciseIcon}>{item.icon}</Text>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {item.defaultSets}×{item.defaultReps} · {categoryLabels[item.category]}
                </Text>
              </View>
              <Ionicons
                name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                size={28}
                color={isSelected ? '#4ECDC4' : '#555'}
              />
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.exerciseList}
      />

      {selectedExercises.length > 0 && (
        <TouchableOpacity style={styles.startButton} onPress={startWorkout} activeOpacity={0.8}>
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.startButtonText}>
            Начать ({selectedExercises.length} упр.)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  selectedBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  selectedText: { color: '#4ECDC4', fontSize: 14, fontWeight: '600' },
  clearText: { color: '#FF6B35', fontSize: 14 },
  categoryContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChipActive: { backgroundColor: '#FF6B35' },
  categoryText: { color: '#888', fontSize: 14, fontWeight: '500' },
  categoryTextActive: { color: '#fff' },
  exerciseList: { paddingHorizontal: 16 },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  exerciseItemSelected: { backgroundColor: '#1A2A2A', borderWidth: 1, borderColor: '#4ECDC4' },
  exerciseIcon: { fontSize: 28, marginRight: 14 },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  exerciseMeta: { color: '#888', fontSize: 13, marginTop: 2 },
  startButton: {
    backgroundColor: '#FF6B35',
    margin: 16,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
