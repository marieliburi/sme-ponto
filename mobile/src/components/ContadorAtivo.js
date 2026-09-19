import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function ContadorAtivo({ horarioEntrada, initialSeconds = 0, isWorking = true }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [liveClock, setLiveClock] = useState('');

  // Atualiza relógio em tempo real
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const sec = String(now.getSeconds()).padStart(2, '0');
      setLiveClock(`${hrs}:${min}:${sec}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Atualiza contador de horas trabalhadas se o ponto estiver aberto
  useEffect(() => {
    if (!isWorking) return;

    if (horarioEntrada) {
      const entradaTime = new Date(horarioEntrada).getTime();
      const updateElapsed = () => {
        const diff = Math.max(0, Math.floor((Date.now() - entradaTime) / 1000));
        setSeconds(diff);
      };
      updateElapsed();
      const timer = setInterval(updateElapsed, 1000);
      return () => clearInterval(timer);
    } else {
      const timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [horarioEntrada, isWorking]);

  const formatElapsedTime = (totalSec) => {
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.liveIndicator}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveLabel}>Horário Oficial de Brasília</Text>
        </View>
        <Text style={styles.clockText}>{liveClock}</Text>
      </View>

      <View style={styles.timerCard}>
        <Text style={styles.timerLabel}>Tempo trabalhado hoje</Text>
        <Text style={styles.timerDisplay}>{formatElapsedTime(seconds)}</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusChip}>
            <Text style={styles.statusChipText}>Jornada Regulamentar: 06h</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary
  },
  liveLabel: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontWeight: '500'
  },
  clockText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
    fontVariant: ['tabular-nums']
  },
  timerCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  timerDisplay: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.onSurface,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1
  },
  statusRow: {
    marginTop: 8
  },
  statusChip: {
    backgroundColor: colors.surfaceContainerHighest,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurfaceVariant
  }
});
