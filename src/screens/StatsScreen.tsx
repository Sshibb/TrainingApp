import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { storage } from '../storage/storage';
import { Workout } from '../types/types';
import { Ionicons } from '@expo/vector-icons';
import { categoryLabels } from '../data/exercises';

export default function StatsScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    totalMinutes: 0,
    streak: 0,
    thisWeek: 0,
    favoriteMuscle: '',
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const allWorkouts = await storage.getWorkouts();
    const weekWorkouts = await storage.getThisWeekWorkouts();
    const streak = await storage.getStreak();
    const totalDuration = await storage.getTotalDuration();

    const muscleCount: Record<string, number> = {};
    allWorkouts.forEach((w) => {
      w.exercises.forEach((we) => {
        const cat = we.exercise.category;
        muscleCount[cat] = (muscleCount[cat] || 0) + 1;
      });
    });
    const fav = Object.entries(muscleCount).sort((a, b) => b[1] - a[1])[0];

    setWorkouts(allWorkouts);
    setStats({
      total: allWorkouts.length,
      totalMinutes: Math.round(totalDuration / 60),
      streak,
      thisWeek: weekWorkouts.length,
      favoriteMuscle: fav ? categoryLabels[fav[0]] || fav[0] : '—',
    });
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}м ${s}с`;
  };

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const count = workouts.filter((w) => w.date.split('T')[0] === dateStr).length;
    const dayLabel = d.toLocaleDateString('ru-RU', { weekday: 'short' });
    return { day: dayLabel, count };
  });

  const maxCount = Math.max(...weeklyData.map((d) => d.count), 1);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Статистика</Text>

      <View style={styles.bigStatsRow}>
        <View style={styles.bigStatCard}>
          <Ionicons name="flame" size={36} color="#FF6B35" />
          <Text style={styles.bigStatValue}>{stats.streak}</Text>
          <Text style={styles.bigStatLabel}>Текущий streak</Text>
        </View>
        <View style={styles.bigStatCard}>
          <Ionicons name="barbell" size={36} color="#4ECDC4" />
          <Text style={styles.bigStatValue}>{stats.total}</Text>
          <Text style={styles.bigStatLabel}>Всего тренировок</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="time" size={20} color="#FFE66D" />
          <Text style={styles.infoValue}>{stats.totalMinutes}</Text>
          <Text style={styles.infoLabel}>мин суммарно</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="calendar" size={20} color="#A78BFA" />
          <Text style={styles.infoValue}>{stats.thisWeek}</Text>
          <Text style={styles.infoLabel}>на этой неделе</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="heart" size={20} color="#F472B6" />
          <Text style={styles.infoValue}>{stats.favoriteMuscle}</Text>
          <Text style={styles.infoLabel}>любимая группа</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Активность за неделю</Text>
      <View style={styles.chart}>
        {weeklyData.map((d, i) => (
          <View key={i} style={styles.chartBar}>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${(d.count / maxCount) * 100}%`,
                    backgroundColor: d.count > 0 ? '#FF6B35' : '#252525',
                  },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{d.day}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>История</Text>
      {workouts.length === 0 ? (
        <Text style={styles.emptyText}>Пока нет тренировок</Text>
      ) : (
        workouts.slice(0, 20).map((w) => (
          <View key={w.id} style={styles.historyItem}>
            <View style={styles.historyLeft}>
              <Text style={styles.historyName}>
                {w.exercises.map((e) => e.exercise.icon).join(' ')}
              </Text>
              <Text style={styles.historyExercises}>
                {w.exercises.map((e) => e.exercise.name).join(', ')}
              </Text>
            </View>
            <View style={styles.historyRight}>
              <Text style={styles.historyDuration}>{formatDuration(w.duration)}</Text>
              <Text style={styles.historyDate}>
                {new Date(w.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginTop: 60,
    marginLeft: 20,
    marginBottom: 24,
  },
  bigStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  bigStatCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '46%',
  },
  bigStatValue: { fontSize: 36, fontWeight: '800', color: '#fff', marginTop: 8 },
  bigStatLabel: { color: '#888', fontSize: 13, marginTop: 4 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoItem: { alignItems: 'center' },
  infoValue: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 4 },
  infoLabel: { color: '#888', fontSize: 11, marginTop: 2 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    height: 180,
    marginBottom: 24,
  },
  chartBar: { alignItems: 'center', flex: 1 },
  barContainer: { height: 120, width: 20, justifyContent: 'flex-end' },
  bar: { width: 20, borderRadius: 6, minHeight: 4 },
  barLabel: { color: '#666', fontSize: 11, marginTop: 6 },
  emptyText: { color: '#555', textAlign: 'center', marginVertical: 40 },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 16,
  },
  historyLeft: { flex: 1 },
  historyName: { fontSize: 20, marginBottom: 4 },
  historyExercises: { color: '#888', fontSize: 13 },
  historyRight: { alignItems: 'flex-end', marginLeft: 12 },
  historyDuration: { color: '#4ECDC4', fontSize: 16, fontWeight: '600' },
  historyDate: { color: '#666', fontSize: 12, marginTop: 4 },
});
