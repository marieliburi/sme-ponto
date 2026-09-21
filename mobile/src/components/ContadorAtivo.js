import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function ContadorAtivo({ horarioEntrada, initialSeconds = 0, isWorking = false }) {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    // Se a jornada for encerrada ou não houver entrada, zera o visor imediatamente
    if (!isWorking || !horarioEntrada) {
      setSegundos(0);
      return;
    }

    const calcular = () => {
      let strData = String(horarioEntrada);
      if (strData.includes(' ') && !strData.includes('T')) {
        strData = strData.replace(' ', 'T');
      }

      const inicioTimestamp = new Date(strData).getTime();
      if (isNaN(inicioTimestamp)) {
        setSegundos(initialSeconds || 0);
        return;
      }

      const agora = Date.now();
      const diffSegundos = Math.max(0, Math.floor((agora - inicioTimestamp) / 1000));
      setSegundos(diffSegundos);
    };

    // Executa a primeira medição imediatamente
    calcular();

    // Atualiza a cada 1 segundo
    const intervalId = setInterval(calcular, 1000);

    return () => clearInterval(intervalId);
  }, [horarioEntrada, isWorking, initialSeconds]);

  const formatarTempo = (totalSec) => {
    const horas = Math.floor(totalSec / 3600);
    const minutos = Math.floor((totalSec % 3600) / 60);
    const segs = totalSec % 60;

    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(horas)}:${pad(minutos)}:${pad(segs)}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={[styles.pulseDot, isWorking && styles.pulseDotActive]} />
          <Text style={styles.label}>
            {isWorking ? 'TEMPO DE JORNADA EM ANDAMENTO' : 'JORNADA ENCERRADA / NÃO INICIADA'}
          </Text>
        </View>
        <Text style={styles.jornadaTarget}>Jornada 6h</Text>
      </View>

      <Text style={[styles.timerDisplay, !isWorking && styles.timerDisplayInactive]}>
        {formatarTempo(segundos)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
    alignItems: 'center'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.outlineVariant
  },
  pulseDotActive: {
    backgroundColor: colors.secondary
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5
  },
  jornadaTarget: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary
  },
  timerDisplay: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: 1,
    fontVariant: ['tabular-nums']
  },
  timerDisplayInactive: {
    color: colors.outlineVariant
  }
});