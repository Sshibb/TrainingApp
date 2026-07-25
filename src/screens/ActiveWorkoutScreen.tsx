import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Exercise, WorkoutExercise, Workout, RPE } from '../types/types';
import { storage } from '../storage/storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import RestTimer from '../components/RestTimer';
import RPEPicker from '../components/RPEPicker';

interface Props {
  navigation: any;
  route: any;
}

const REST_PRESETS = [60, 90, 120];

export default function ActiveWorkoutScreen({ navigation, route }: Props) {
  const exercises: Exercise[] = route.params.exercises;
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    exercises.map((e) => ({
      exercise: e,
      sets: Array.from({ length: e.defaultSets }, (_, i) => ({
        reps: e.defaultReps,
        weight: 0,
        completed: false,
        rpe: undefined as RPE | undefined,
        previousReps: undefined,
        previousWeight: undefined,
      })),
    }))
  );
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [activeRPEExercise, setActiveRPEExercise] = useState<{ exIdx: number; setIdx: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(Date.now());
  const loadPreviousData = useRef(false);

  useEffect(() => {
    if (!loadPreviousData.current) {
      loadPreviousData.current = true;
      loadPreviousSets();
    }
  }, []);

  const loadPreviousSets = async () => {
    const updated = await Promise.all(
      workoutExercises.map(async (we) => {
        const last = await storage.getLastSetForExercise(we.exercise.id);
        return {
          ...we,
          sets: we.sets.map((s) => ({
            ...s,
            previousReps: last?.reps,
            previousWeight: last?.weight,
          })),
        };
      })
    );
    setWorkoutExercises(updated);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  useEffect(() => {
    if (isPaused) {
      startTime.current = Date.now() - elapsed * 1000;
    }
  }, [isPaused]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const updateSet = (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: string) => {
    const num = parseInt(value) || 0;
    setWorkoutExercises((prev) => {
      const updated = [...prev];
      updated[exIdx] = {
        ...updated[exIdx],
        sets: updated[exIdx].sets.map((s, i) => (i === setIdx ? { ...s, [field]: num } : s)),
      };
      return updated;
    });
  };

  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWorkoutExercises((prev) => {
      const updated = [...prev];
      updated[exIdx] = {
        ...updated[exIdx],
        sets: updated[exIdx].sets.map((s, i) =>
          i === setIdx ? { ...s, completed: !s.completed } : s
        ),
      };
      return updated;
    });
  };

  const handleSetComplete = (exIdx: number, setIdx: number) => {
    toggleSetComplete(exIdx, setIdx);
    setShowRestTimer(true);
  };

  const addSet = (exIdx: number) => {
    setWorkoutExercises((prev) => {
      const updated = [...prev];
      const lastSet = updated[exIdx].sets[updated[exIdx].sets.length - 1];
      updated[exIdx] = {
        ...updated[exIdx],
        sets: [
          ...updated[exIdx].sets,
          {
            reps: lastSet?.reps ?? 10,
            weight: lastSet?.weight ?? 0,
            completed: false,
            previousReps: lastSet?.reps,
            previousWeight: lastSet?.weight,
          },
        ],
      };
      return updated;
    });
  };

  const deleteSet = (exIdx: number, setIdx: number) => {
    setWorkoutExercises((prev) => {
      const updated = [...prev];
      updated[exIdx] = {
        ...updated[exIdx],
        sets: updated[exIdx].sets.filter((_, i) => i !== setIdx),
      };
      return updated;
    });
  };

  const removeExercise = (exIdx: number) => {
    setWorkoutExercises((prev) => prev.filter((_, i) => i !== exIdx));
  };

  const setRPE = (rpe: RPE) => {
    if (!activeRPEExercise) return;
    const { exIdx, setIdx } = activeRPEExercise;
    setWorkoutExercises((prev) => {
      const updated = [...prev];
      updated[exIdx] = {
        ...updated[exIdx],
        sets: updated[exIdx].sets.map((s, i) =>
          i === setIdx ? { ...s, rpe } : s
        ),
      };
      return updated;
    });
    setActiveRPEExercise(null);
  };

  const finishWorkout = async () => {
    const workout: Workout = {
      id: Date.now().toString(),
      name: exercises.map((e) => e.name).join(' + '),
      date: new Date().toISOString(),
      duration: elapsed,
      exercises: workoutExercises,
      completed: true,
    };
    await storage.saveWorkout(workout);
    navigation.navigate('MainTabs');
  };

  const confirmFinish = () => {
    Alert.alert('Завершить тренировку?', `Время: ${formatTime(elapsed)}`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Завершить', onPress: finishWorkout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerBar}>
        <TouchableOpacity onPress={() => setIsPaused(!isPaused)}>
          <Ionicons name={isPaused ? 'play' : 'pause'} size={28} color="#FF6B35" />
        </TouchableOpacity>
        <Text style={styles.timer}>{formatTime(elapsed)}</Text>
        <TouchableOpacity onPress={confirmFinish}>
          <Ionicons name="checkmark-circle" size={32} color="#4ECDC4" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {workoutExercises.map((we, exIdx) => {
          const completedCount = we.sets.filter((s) => s.completed).length;
          return (
            <View key={exIdx} style={styles.exerciseBlock}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseIcon}>{we.exercise.icon}</Text>
                <View style={styles.exerciseHeaderInfo}>
                  <Text style={styles.exerciseName}>{we.exercise.name}</Text>
                  <Text style={styles.exerciseProgress}>
                    {completedCount}/{we.sets.length} подходов
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeExercise(exIdx)}>
                  <Ionicons name="close-circle" size={24} color="#555" />
                </TouchableOpacity>
              </View>

              <View style={styles.setsHeader}>
                <Text style={[styles.setHeader, { width: 32 }]}>#</Text>
                <Text style={[styles.setHeader, { flex: 1 }]}>Повт.</Text>
                <Text style={[styles.setHeader, { flex: 1 }]}>Вес (кг)</Text>
                <Text style={[styles.setHeader, { width: 36 }]}>RPE</Text>
                <Text style={[styles.setHeader, { width: 32 }]}>✓</Text>
              </View>

              {we.sets.map((set, setIdx) => (
                <View key={setIdx} style={styles.setRow}>
                  <Text style={styles.setNumber}>{setIdx + 1}</Text>
                  <TextInput
                    style={[styles.setInput, set.completed && styles.setInputCompleted]}
                    keyboardType="numeric"
                    value={set.reps.toString()}
                    onChangeText={(v) => updateSet(exIdx, setIdx, 'reps', v)}
                  />
                  <TextInput
                    style={[styles.setInput, set.completed && styles.setInputCompleted]}
                    keyboardType="numeric"
                    value={set.weight.toString()}
                    onChangeText={(v) => updateSet(exIdx, setIdx, 'weight', v)}
                  />
                  <TouchableOpacity
                    style={[
                      styles.rpeButton,
                      set.rpe && { backgroundColor: '#252525' },
                    ]}
                    onPress={() => setActiveRPEExercise({ exIdx, setIdx })}
                  >
                    <Text style={[styles.rpeButtonText, set.rpe && { color: '#FF6B35' }]}>
                      {set.rpe ?? '—'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleSetComplete(exIdx, setIdx)}
                  >
                    <Ionicons
                      name={set.completed ? 'checkmark-circle' : 'ellipse-outline'}
                      size={28}
                      color={set.completed ? '#4ECDC4' : '#555'}
                    />
                  </TouchableOpacity>
                </View>
              ))}

              {we.sets.some((s) => s.previousWeight !== undefined) && (
                <Text style={styles.previousHint}>
                  💡 Прошлая: {we.sets.find((s) => s.previousWeight !== undefined)?.previousWeight}кг × {we.sets.find((s) => s.previousReps !== undefined)?.previousReps}
                </Text>
              )}

              <View style={styles.setActions}>
                <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(exIdx)}>
                  <Ionicons name="add" size={16} color="#888" />
                  <Text style={styles.addSetText}>Добавить подход</Text>
                </TouchableOpacity>
                {we.sets.length > 0 && (
                  <TouchableOpacity
                    style={styles.deleteSetButton}
                    onPress={() => deleteSet(exIdx, we.sets.length - 1)}
                  >
                    <Ionicons name="remove" size={16} color="#888" />
                    <Text style={styles.addSetText}>Убрать подход</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        <View style={styles.restSettings}>
          <Text style={styles.restLabel}>Таймер отдыха:</Text>
          <View style={styles.restPresets}>
            {REST_PRESETS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.restPreset, restDuration === p && styles.restPresetActive]}
                onPress={() => setRestDuration(p)}
              >
                <Text
                  style={[styles.restPresetText, restDuration === p && styles.restPresetTextActive]}
                >
                  {p >= 60 ? `${p / 60}м` : `${p}с`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <RestTimer
        visible={showRestTimer}
        initialSeconds={restDuration}
        onComplete={() => setShowRestTimer(false)}
        onSkip={() => setShowRestTimer(false)}
        onAdd={(sec) => setRestDuration((prev) => prev + sec)}
      />

      {activeRPEExercise && (
        <View style={styles.rpeOverlay}>
          <View style={styles.rpeContainer}>
            <View style={styles.rpeHeader}>
              <Text style={styles.rpeTitle}>RPE</Text>
              <TouchableOpacity onPress={() => setActiveRPEExercise(null)}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            <RPEPicker value={undefined} onChange={setRPE} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  timerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  timer: { color: '#FF6B35', fontSize: 36, fontWeight: '800', fontVariant: ['tabular-nums'] },
  scrollContent: { padding: 16, paddingBottom: 40 },
  exerciseBlock: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  exerciseIcon: { fontSize: 24, marginRight: 10 },
  exerciseHeaderInfo: { flex: 1 },
  exerciseName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  exerciseProgress: { color: '#888', fontSize: 13, marginTop: 2 },
  setsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 },
  setHeader: { color: '#666', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  setNumber: { width: 32, color: '#666', fontSize: 15, textAlign: 'center' },
  setInput: {
    flex: 1,
    backgroundColor: '#252525',
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 10,
    marginHorizontal: 3,
  },
  setInputCompleted: { backgroundColor: '#1A2A2A', color: '#4ECDC4' },
  rpeButton: {
    width: 36,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#252525',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  rpeButtonText: { color: '#666', fontSize: 12, fontWeight: '700' },
  previousHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 36,
    fontStyle: 'italic',
  },
  setActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 8,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  deleteSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  addSetText: { color: '#888', fontSize: 13, marginLeft: 4 },
  restSettings: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  restLabel: { color: '#888', fontSize: 14 },
  restPresets: { flexDirection: 'row', gap: 8 },
  restPreset: {
    backgroundColor: '#252525',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  restPresetActive: { backgroundColor: '#FF6B35' },
  restPresetText: { color: '#888', fontSize: 13, fontWeight: '600' },
  restPresetTextActive: { color: '#fff' },
  rpeOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  rpeContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    width: '85%',
  },
  rpeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rpeTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
