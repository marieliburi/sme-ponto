import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function StatusBadge({ status, label, icon, pulse = false }) {
  let bg = colors.surfaceContainerHigh;
  let text = colors.onSurface;
  let pulseColor = colors.secondary;

  const s = (status || '').toLowerCase();

  if (s.includes('gps') || s.includes('confirmado') || s.includes('ativo') || s.includes('aberto') || s.includes('aprovado') || s.includes('normal')) {
    bg = colors.secondaryContainer;
    text = colors.onSecondaryContainer;
    pulseColor = colors.secondary;
  } else if (s.includes('análise') || s.includes('analise') || s.includes('pendente') || s.includes('incompleto')) {
    bg = colors.tertiaryFixed;
    text = colors.onTertiaryContainer;
    pulseColor = colors.onTertiaryContainer;
  } else if (s.includes('erro') || s.includes('falta') || s.includes('rejeitado')) {
    bg = colors.errorContainer;
    text = colors.error;
    pulseColor = colors.error;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {pulse && <View style={[styles.pulseDot, { backgroundColor: pulseColor }]} />}
      <Text style={[styles.badgeText, { color: text }]}>{label || status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    alignSelf: 'flex-start'
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4
  }
});
