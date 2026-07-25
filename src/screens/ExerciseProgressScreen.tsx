import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { storage } from '../storage/storage';
import { exercises } from '../data/exercises';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  navigation: any;
  route: any;
}

export default function ExerciseProgressScreen({ navigation, route }: Props) {
  const { exerciseId } = route.params;
  const exercise = exercises.find((e) => e.id === exerciseId);
  const [history, setHistory] = useState<{ date: string; maxWeight: number; maxReps: number; volume: number }[]>([]);
  const [pr, setPr] = useState<{ maxWeight: number; maxReps: number; oneRepMax: number; date: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const h = await storage.getExerciseHistory(exerciseId);
    setHistory(h);
    const p = await storage.getPRForExercise(exerciseId);
    setPr(p);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const maxWeight = history.length > 0 ? Math.max(...history.map((h) => h.maxWeight)) : 0;
  const maxVolume = history.length > 0 ? Math.max(...history.map((h) => h.volume)) : 0;

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Упражнение не найдено</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{exercise.icon} {exercise.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      {pr && (
        <View style={styles.prCard}>
          <Ionicons name="trophy" size={32} color="#FFE66D" />
          <View style={styles.prInfo}>
            <Text style={styles.prTitle}>Личный рекорд</Text>
            <View style={styles.prStats}>
              <View style={styles.prStat}>
                <Text style={styles.prValue}>{pr.maxWeight} кг</Text>
                <Text style={styles.prLabel}>Макс. вес</Text>
              </View>
              <View style={styles.prStat}>
                <Text style={styles.prValue}>{pr.oneRepMax} кг</Text>
                <Text style={styles.prLabel}>1RM</Text>
              </View>
              <View style={styles.prStat}>
                <Text style={styles.prValue}>{pr.maxReps}</Text>
                <Text style={styles.prLabel}>Макс. повт.</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {history.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Прогресс веса</Text>
          <View style={styles.chart}>
            {history.slice(-10).map((h, i) => {
              const barHeight = maxWeight > 0 ? (h.maxWeight / maxWeight) * 100 : 0;
              return (
                <View key={i} style={styles.chartBar}>
                  <Text style={styles.chartValue}>{h.maxWeight}</Text>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        { height: `${Math.max(barHeight, 8)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartDate}>{formatDate(h.date)}</Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Прогресс объёма</Text>
          <View style={styles.chart}>
            {history.slice(-10).map((h, i) => {
              const barHeight = maxVolume > 0 ? (h.volume / maxVolume) * 100 : 0;
              return (
                <View key={i} style={styles.chartBar}>
                  <Text style={styles.chartValue}>{h.volume}</Text>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        styles.barVolume,
                        { height: `${Math.max(barHeight, 8)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartDate}>{formatDate(h.date)}</Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>История</Text>
          {history.map((h, i) => (
            <View key={i} style={styles.historyItem}>
              <View>
                <Text style={styles.historyDate}>{formatDate(h.date)}</Text>
              </View>
              <View style={styles.historyStats}>
                <Text style={styles.historyStat}>{h.maxWeight} кг</Text>
                <Text style={styles.historyStatDim}>×{h.maxReps}</Text>
                <Text style={styles.historyStatSmall}>{h.volume} об.</Text>
              </View>
            </View>
          ))}
        </>
      )}

      {history.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="bar-chart" size={48} color="#333" />
          <Text style={styles.emptyText}>Нет данных</Text>
          <Text style={styles.emptySubtext}>Выполни это упражнение чтобы увидеть прогресс</Text>
        </View>
      )}
    </ScrollView>
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
    paddingBottom: 16,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  errorText: { color: '#666', textAlign: 'center', marginTop: 100 },
  prCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  prInfo: { flex: 1, marginLeft: 12 },
  prTitle: { color: '#FFE66D', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  prStats: { flexDirection: 'row', justifyContent: 'space-around' },
  prStat: { alignItems: 'center' },
  prValue: { color: '#fff', fontSize: 18, fontWeight: '700' },
  prLabel: { color: '#888', fontSize: 11, marginTop: 2 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 12,
    height: 180,
    marginBottom: 20,
  },
  chartBar: { alignItems: 'center', flex: 1 },
  chartValue: { color: '#888', fontSize: 10, marginBottom: 4 },
  barContainer: { height: 100, width: 16, justifyContent: 'flex-end' },
  bar: { width: 16, borderRadius: 4, backgroundColor: '#FF6B35', minHeight: 4 },
  barVolume: { backgroundColor: '#4ECDC4' },
  chartDate: { color: '#666', fontSize: 9, marginTop: 4 },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
  },
  historyDate: { color: '#888', fontSize: 14 },
  historyStats: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  historyStat: { color: '#fff', fontSize: 16, fontWeight: '700' },
  historyStatDim: { color: '#888', fontSize: 14 },
  historyStatSmall: { color: '#4ECDC4', fontSize: 12, marginLeft: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#666', fontSize: 18, marginTop: 12 },
  emptySubtext: { color: '#444', fontSize: 13, marginTop: 4 },
});
