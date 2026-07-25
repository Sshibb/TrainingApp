import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { storage } from '../storage/storage';
import { Workout, PersonalRecord } from '../types/types';
import { exercises } from '../data/exercises';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, streak: 0, totalMinutes: 0 });
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const workouts = await storage.getWorkouts();
    const weekWorkouts = await storage.getThisWeekWorkouts();
    const streak = await storage.getStreak();
    const totalDuration = await storage.getTotalDuration();
    const personalRecords = await storage.getPRs();

    setRecentWorkouts(workouts.slice(0, 5));
    setStats({
      total: workouts.length,
      thisWeek: weekWorkouts.length,
      streak,
      totalMinutes: Math.round(totalDuration / 60),
    });
    setPrs(personalRecords.slice(0, 5));
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const getExerciseName = (id: string) => exercises.find((e) => e.id === id);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.greeting}>FitTracker</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={28} color="#FF6B35" />
          <Text style={styles.statValue}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="barbell" size={28} color="#4ECDC4" />
          <Text style={styles.statValue}>{stats.thisWeek}</Text>
          <Text style={styles.statLabel}>На этой неделе</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={28} color="#FFE66D" />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Всего</Text>
        </View>
      </View>

      <View style={styles.statBar}>
        <Ionicons name="time" size={20} color="#A8A8A8" />
        <Text style={styles.statBarText}>{stats.totalMinutes} мин суммарно</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => navigation.navigate('NewWorkout')}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={22} color="#fff" />
          <Text style={styles.primaryButtonText}>Начать тренировку</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('Templates')}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text" size={22} color="#FF6B35" />
          <Text style={styles.secondaryButtonText}>Шаблоны</Text>
        </TouchableOpacity>
      </View>

      {prs.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Личные рекорды</Text>
          {prs.map((pr) => {
            const ex = getExerciseName(pr.exerciseId);
            if (!ex) return null;
            return (
              <TouchableOpacity
                key={pr.exerciseId}
                style={styles.prCard}
                onPress={() => navigation.navigate('ExerciseProgress', { exerciseId: pr.exerciseId })}
              >
                <Text style={styles.prIcon}>{ex.icon}</Text>
                <View style={styles.prInfo}>
                  <Text style={styles.prName}>{ex.name}</Text>
                  <Text style={styles.prDetail}>{pr.maxWeight} кг · 1RM: {pr.oneRepMax} кг</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#444" />
              </TouchableOpacity>
            );
          })}
        </>
      )}

      <Text style={styles.sectionTitle}>Последние тренировки</Text>

      {recentWorkouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="fitness" size={48} color="#333" />
          <Text style={styles.emptyText}>Пока нет тренировок</Text>
          <Text style={styles.emptySubtext}>Нажми кнопку выше чтобы начать</Text>
        </View>
      ) : (
        recentWorkouts.map((w) => (
          <TouchableOpacity
            key={w.id}
            style={styles.workoutCard}
            onPress={() => navigation.navigate('WorkoutDetail', { workout: w })}
          >
            <View style={styles.workoutCardLeft}>
              <Text style={styles.workoutName}>{w.name}</Text>
              <Text style={styles.workoutDate}>{formatDate(w.date)}</Text>
            </View>
            <View style={styles.workoutCardRight}>
              <Text style={styles.workoutDuration}>{Math.round(w.duration / 60)} мин</Text>
              <Text style={styles.workoutExercises}>{w.exercises.length} упр.</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginTop: 60,
    marginLeft: 20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '30%',
  },
  statValue: { fontSize: 24, fontWeight: '700', color: '#fff', marginTop: 4 },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  statBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statBarText: { color: '#A8A8A8', marginLeft: 8, fontSize: 14 },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButton: { backgroundColor: '#FF6B35' },
  secondaryButton: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryButtonText: { color: '#FF6B35', fontSize: 15, fontWeight: '700' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  prCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 14,
  },
  prIcon: { fontSize: 28, marginRight: 12 },
  prInfo: { flex: 1 },
  prName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  prDetail: { color: '#FFE66D', fontSize: 13, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#666', fontSize: 16, marginTop: 12 },
  emptySubtext: { color: '#444', fontSize: 13, marginTop: 4 },
  workoutCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 16,
  },
  workoutCardLeft: { flex: 1 },
  workoutName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  workoutDate: { color: '#888', fontSize: 13, marginTop: 4 },
  workoutCardRight: { alignItems: 'flex-end' },
  workoutDuration: { color: '#4ECDC4', fontSize: 16, fontWeight: '600' },
  workoutExercises: { color: '#888', fontSize: 13, marginTop: 4 },
});
