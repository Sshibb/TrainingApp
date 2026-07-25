import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RPE } from '../types/types';

interface Props {
  value?: RPE;
  onChange: (rpe: RPE) => void;
}

const RPE_LABELS: Record<number, string> = {
  1: 'Очень легко',
  2: 'Легко',
  3: 'Легко',
  4: 'Умеренно',
  5: 'Средне',
  6: 'Средне+',
  7: 'Тяжело',
  8: 'Тяжело+',
  9: 'Очень тяжело',
  10: 'Максимум',
};

const RPE_COLORS: Record<number, string> = {
  1: '#4ECDC4',
  2: '#4ECDC4',
  3: '#4ECDC4',
  4: '#7ED957',
  5: '#FFE66D',
  6: '#FFE66D',
  7: '#FF9F43',
  8: '#FF9F43',
  9: '#FF6B35',
  10: '#EE5A24',
};

export default function RPEPicker({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>RPE</Text>
      <View style={styles.row}>
        {(Array.from({ length: 10 }, (_, i) => i + 1) as RPE[]).map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.button,
              value === num && { backgroundColor: RPE_COLORS[num], borderColor: RPE_COLORS[num] },
            ]}
            onPress={() => onChange(num)}
          >
            <Text
              style={[
                styles.buttonText,
                value === num && { color: '#000' },
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {value !== undefined && (
        <Text style={[styles.labelText, { color: RPE_COLORS[value] }]}>
          {RPE_LABELS[value]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  label: { color: '#666', fontSize: 12, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
  row: { flexDirection: 'row', gap: 4 },
  button: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#252525',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#888', fontSize: 12, fontWeight: '700' },
  labelText: { fontSize: 12, fontWeight: '600', marginTop: 4, marginLeft: 4 },
});
