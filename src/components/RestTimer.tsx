import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Props {
  visible: boolean;
  initialSeconds: number;
  onComplete: () => void;
  onSkip: () => void;
  onAdd: (seconds: number) => void;
}

const PRESETS = [30, 60, 90, 120, 180];

export default function RestTimer({ visible, initialSeconds, onComplete, onSkip, onAdd }: Props) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (visible) {
      setSeconds(initialSeconds);
      setIsRunning(true);
    }
  }, [visible, initialSeconds]);

  useEffect(() => {
    if (!isRunning || !visible) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onComplete();
          return 0;
        }
        if (prev <= 4) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, visible]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = initialSeconds > 0 ? (initialSeconds - seconds) / initialSeconds : 0;
  const circleRadius = 80;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Отдых</Text>

          <View style={styles.timerCircle}>
            <View style={styles.circleBackground}>
              <View
                style={[
                  styles.circleProgress,
                  {
                    borderTopColor: seconds <= 5 ? '#FF6B35' : '#4ECDC4',
                    borderRightColor: seconds <= 5 ? '#FF6B35' : '#4ECDC4',
                  },
                ]}
              />
            </View>
            <Text style={[styles.timerText, seconds <= 5 && styles.timerTextWarning]}>
              {formatTime(seconds)}
            </Text>
          </View>

          <View style={styles.presetsRow}>
            {PRESETS.map((p) => (
              <TouchableOpacity
                key={p}
                style={styles.presetButton}
                onPress={() => onAdd(p)}
              >
                <Text style={styles.presetText}>+{p >= 60 ? `${p / 60}м` : `${p}с`}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setIsRunning(!isRunning)}
            >
              <Ionicons name={isRunning ? 'pause' : 'play'} size={28} color="#fff" />
              <Text style={styles.controlText}>{isRunning ? 'Пауза' : 'Далее'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.skipButton]}
              onPress={onSkip}
            >
              <Ionicons name="play-skip-forward" size={28} color="#FF6B35" />
              <Text style={[styles.controlText, { color: '#FF6B35' }]}>Пропустить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { alignItems: 'center' },
  title: { color: '#888', fontSize: 16, fontWeight: '600', marginBottom: 24 },
  timerCircle: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  circleBackground: {
    ...StyleSheet.absoluteFill,
    borderRadius: 100,
    borderWidth: 6,
    borderColor: '#252525',
  },
  circleProgress: {
    ...StyleSheet.absoluteFill,
    borderRadius: 100,
    borderWidth: 6,
    borderTopColor: '#4ECDC4',
    borderRightColor: '#4ECDC4',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  timerText: {
    color: '#fff',
    fontSize: 52,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  timerTextWarning: { color: '#FF6B35' },
  presetsRow: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  presetButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  presetText: { color: '#888', fontSize: 14, fontWeight: '600' },
  controls: { flexDirection: 'row', gap: 16 },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  skipButton: { backgroundColor: '#1A1A1A' },
  controlText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
