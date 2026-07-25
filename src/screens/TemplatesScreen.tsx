import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { storage } from '../storage/storage';
import { WorkoutTemplate, Exercise } from '../types/types';
import { exercises, categoryLabels } from '../data/exercises';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  navigation: any;
}

export default function TemplatesScreen({ navigation }: Props) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [])
  );

  const loadTemplates = async () => {
    const data = await storage.getTemplates();
    setTemplates(data);
  };

  const toggleExercise = (exercise: Exercise) => {
    setSelectedExercises((prev) => {
      const exists = prev.find((e) => e.id === exercise.id);
      if (exists) return prev.filter((e) => e.id !== exercise.id);
      return [...prev, exercise];
    });
  };

  const saveTemplate = async () => {
    if (!newName.trim() || selectedExercises.length === 0) return;

    const template: WorkoutTemplate = {
      id: Date.now().toString(),
      name: newName.trim(),
      exercises: selectedExercises,
      createdAt: new Date().toISOString(),
    };

    await storage.saveTemplate(template);
    setShowNew(false);
    setNewName('');
    setSelectedExercises([]);
    loadTemplates();
  };

  const deleteTemplate = (id: string, name: string) => {
    Alert.alert('Удалить шаблон?', `"${name}"`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await storage.deleteTemplate(id);
          loadTemplates();
        },
      },
    ]);
  };

  const startFromTemplate = (template: WorkoutTemplate) => {
    navigation.navigate('NewWorkout', { templateExercises: template.exercises });
  };

  if (showNew) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setShowNew(false); setSelectedExercises([]); }}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Новый шаблон</Text>
          <TouchableOpacity onPress={saveTemplate}>
            <Text style={styles.saveText}>Сохранить</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.nameInput}
          placeholder="Название шаблона"
          placeholderTextColor="#555"
          value={newName}
          onChangeText={setNewName}
        />

        <Text style={styles.selectLabel}>Выбери упражнения ({selectedExercises.length})</Text>

        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedExercises.some((e) => e.id === item.id);
            return (
              <TouchableOpacity
                style={[styles.exerciseItem, isSelected && styles.exerciseItemSelected]}
                onPress={() => toggleExercise(item)}
              >
                <Text style={styles.exerciseIcon}>{item.icon}</Text>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <Text style={styles.exerciseMeta}>{categoryLabels[item.category]}</Text>
                </View>
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                  size={24}
                  color={isSelected ? '#4ECDC4' : '#555'}
                />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Шаблоны</Text>
        <TouchableOpacity onPress={() => setShowNew(true)}>
          <Ionicons name="add" size={28} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {templates.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text" size={48} color="#333" />
          <Text style={styles.emptyText}>Нет шаблонов</Text>
          <Text style={styles.emptySubtext}>Создай шаблон чтобы быстро начинать тренировку</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => setShowNew(true)}>
            <Text style={styles.createButtonText}>Создать шаблон</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={templates}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.templateCard}
              onPress={() => startFromTemplate(item)}
              activeOpacity={0.7}
            >
              <View style={styles.templateHeader}>
                <Ionicons name="document-text" size={24} color="#FF6B35" />
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{item.name}</Text>
                  <Text style={styles.templateMeta}>
                    {item.exercises.length} упражнений
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => deleteTemplate(item.id, item.name)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.templateExercises}>
                {item.exercises.slice(0, 4).map((e) => (
                  <Text key={e.id} style={styles.templateExercise}>
                    {e.icon} {e.name}
                  </Text>
                ))}
                {item.exercises.length > 4 && (
                  <Text style={styles.templateMore}>+{item.exercises.length - 4} ещё</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
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
    paddingBottom: 16,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  saveText: { color: '#4ECDC4', fontSize: 16, fontWeight: '700' },
  nameInput: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  selectLabel: { color: '#888', fontSize: 14, marginHorizontal: 16, marginBottom: 8 },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 6,
  },
  exerciseItemSelected: { backgroundColor: '#1A2A2A', borderWidth: 1, borderColor: '#4ECDC4' },
  exerciseIcon: { fontSize: 24, marginRight: 10 },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  exerciseMeta: { color: '#888', fontSize: 12, marginTop: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#666', fontSize: 18, marginTop: 12 },
  emptySubtext: { color: '#444', fontSize: 13, marginTop: 4, textAlign: 'center', marginHorizontal: 40 },
  createButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 20,
  },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  templateCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  templateHeader: { flexDirection: 'row', alignItems: 'center' },
  templateInfo: { flex: 1, marginLeft: 12 },
  templateName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  templateMeta: { color: '#888', fontSize: 13, marginTop: 2 },
  templateExercises: { marginTop: 12, gap: 4 },
  templateExercise: { color: '#888', fontSize: 13 },
  templateMore: { color: '#FF6B35', fontSize: 13, fontWeight: '600' },
});
