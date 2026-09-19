import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

export default function BotaoBiometria({ onPress, proximoSlotLabel, loading = false, gpsLocation = 'SME Prédio Central' }) {
  const [pressed, setPressed] = useState(false);

  return (
    <View style={styles.container}>
      {/* Indicador de Status GPS Superior */}
      <View style={styles.gpsBanner}>
        <View style={styles.pulseDot} />
        <Text style={styles.gpsText}>GPS Ativo: {gpsLocation}</Text>
        <Text style={styles.accuracyText}>• Precisão 3m</Text>
      </View>

      {/* Botão Biométrico Circular com Anéis Concêntricos */}
      <View style={styles.outerRing}>
        <View style={styles.middleRing}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            onPress={onPress}
            disabled={loading}
            style={[styles.punchButton, pressed && styles.punchButtonPressed]}
          >
            {loading ? (
              <ActivityIndicator size="large" color={colors.secondaryFixed} />
            ) : (
              <View style={styles.buttonContent}>
                {/* Ícone de Biometria Digital */}
                <View style={styles.fingerprintIconContainer}>
                  <Text style={styles.fingerprintEmoji}>🖲️</Text>
                </View>
                <Text style={styles.punchTitle}>BATER PONTO</Text>
                <Text style={styles.punchSub}>
                  {proximoSlotLabel ? proximoSlotLabel.replace('1ª Batida • ', '').replace('2ª Batida • ', '') : 'Registrar'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Dica de Toque */}
      <Text style={styles.hintText}>Toque para registrar via Biometria e GPS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 14
  },
  gpsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.secondary,
    marginRight: 6
  },
  gpsText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary
  },
  accuracyText: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    marginLeft: 4
  },
  outerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(111, 251, 190, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 108, 73, 0.2)'
  },
  middleRing: {
    width: 172,
    height: 172,
    borderRadius: 86,
    backgroundColor: 'rgba(111, 251, 190, 0.3)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  punchButton: {
    width: 146,
    height: 146,
    borderRadius: 73,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.secondaryFixed
  },
  punchButtonPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: '#0a101d'
  },
  buttonContent: {
    alignItems: 'center'
  },
  fingerprintIconContainer: {
    marginBottom: 4
  },
  fingerprintEmoji: {
    fontSize: 32
  },
  punchTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.onPrimary,
    letterSpacing: 0.8
  },
  punchSub: {
    fontSize: 11,
    color: colors.secondaryFixed,
    fontWeight: '600',
    marginTop: 2
  },
  hintText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 12,
    fontWeight: '500'
  }
});
