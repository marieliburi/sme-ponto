import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function CardPonto({ slot }) {
  const isRealizado = slot.status === 'realizado';

  // Escolha do ícone simplificado baseado no tipo
  const getIconChar = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return '↳';
      case 'saida_almoco':
        return '☕';
      case 'retorno_almoco':
        return '↲';
      case 'saida_final':
        return '⎋';
      default:
        return '⏱';
    }
  };

  return (
    <View
      style={[
        styles.card,
        isRealizado ? styles.cardRealizado : styles.cardPendente
      ]}
    >
      <View style={styles.leftCol}>
        <View
          style={[
            styles.iconCircle,
            isRealizado ? styles.iconCircleRealizado : styles.iconCirclePendente
          ]}
        >
          <Text
            style={[
              styles.iconText,
              isRealizado ? styles.iconTextRealizado : styles.iconTextPendente
            ]}
          >
            {getIconChar(slot.tipo)}
          </Text>
        </View>

        <View style={styles.infoCol}>
          <Text
            style={[
              styles.titulo,
              isRealizado ? styles.tituloRealizado : styles.tituloPendente
            ]}
          >
            {slot.titulo}
          </Text>
          <Text style={styles.subtitulo} numberOfLines={1}>
            {slot.subtitulo}
          </Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text
          style={[
            styles.horario,
            isRealizado ? styles.horarioRealizado : styles.horarioPendente
          ]}
        >
          {slot.horario}
        </Text>
        {isRealizado ? (
          <View style={styles.gpsConfirmado}>
            <Text style={styles.gpsCheck}>✓</Text>
            <Text style={styles.gpsText}>GPS Confirmado</Text>
          </View>
        ) : (
          <Text style={styles.previstoText}>Previsto</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10
  },
  cardRealizado: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  cardPendente: {
    backgroundColor: 'rgba(229, 238, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  iconCircleRealizado: {
    backgroundColor: colors.secondaryContainer
  },
  iconCirclePendente: {
    backgroundColor: colors.surfaceContainer
  },
  iconText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  iconTextRealizado: {
    color: colors.onSecondaryContainer
  },
  iconTextPendente: {
    color: colors.onSurfaceVariant
  },
  infoCol: {
    flex: 1
  },
  titulo: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2
  },
  tituloRealizado: {
    color: colors.onSurface
  },
  tituloPendente: {
    color: colors.onSurfaceVariant
  },
  subtitulo: {
    fontSize: 11,
    color: colors.onSurfaceVariant
  },
  rightCol: {
    alignItems: 'flex-end',
    marginLeft: 8
  },
  horario: {
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    marginBottom: 2
  },
  horarioRealizado: {
    fontWeight: '700',
    color: colors.onSurface
  },
  horarioPendente: {
    fontWeight: '500',
    color: colors.outline
  },
  gpsConfirmado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  gpsCheck: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: 'bold'
  },
  gpsText: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: '700'
  },
  previstoText: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    fontWeight: '500'
  }
});
