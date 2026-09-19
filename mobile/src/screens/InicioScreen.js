import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { colors } from '../theme/colors';
import ContadorAtivo from '../components/ContadorAtivo';
import BotaoBiometria from '../components/BotaoBiometria';
import CardPonto from '../components/CardPonto';
import StatusBadge from '../components/StatusBadge';
import { pontoService } from '../services/api';
import { locationService } from '../services/locationService';
import { bioService } from '../services/bioService';

export default function InicioScreen({ usuario, onNavigateToJustificativa }) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [punchData, setPunchData] = useState({
    slots: [
      {
        id: '1',
        tipo: 'entrada',
        titulo: '1ª Batida • Entrada',
        subtitulo: 'SME Prédio Central',
        horario: '08:00',
        status: 'realizado',
        gpsConfirmado: true
      },
      {
        id: '2',
        tipo: 'saida_almoco',
        titulo: '2ª Batida • Saída Almoço',
        subtitulo: 'Intervalo regulamentar',
        horario: '12:00',
        status: 'pendente',
        gpsConfirmado: false
      },
      {
        id: '3',
        tipo: 'retorno_almoco',
        titulo: '3ª Batida • Retorno Almoço',
        subtitulo: 'Reinício do expediente',
        horario: '13:00',
        status: 'pendente',
        gpsConfirmado: false
      },
      {
        id: '4',
        tipo: 'saida_final',
        titulo: '4ª Batida • Saída Final',
        subtitulo: 'Encerramento da jornada',
        horario: '14:00',
        status: 'pendente',
        gpsConfirmado: false
      }
    ],
    proximoSlotLabel: '2ª Batida • Saída Almoço',
    segundosTrabalhados: 12840, // aprox 3h 34m
    primeiroRegistro: new Date(new Date().setHours(8, 0, 0, 0)).toISOString()
  });

  const carregarDadosHoje = async () => {
    try {
      const res = await pontoService.getPontosHoje();
      if (res.success && res.slots) {
        setPunchData({
          slots: res.slots,
          proximoSlotLabel: res.proximoSlotLabel,
          segundosTrabalhados: res.segundosTrabalhados,
          primeiroRegistro: res.primeiroRegistro
        });
      }
    } catch (e) {
      console.warn('Usando dados demonstrativos de hoje:', e.message);
    }
  };

  useEffect(() => {
    carregarDadosHoje();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDadosHoje();
    setRefreshing(false);
  };

  const handleBaterPonto = async () => {
    try {
      setLoading(true);

      // 1. Captura GPS
      const loc = await locationService.getCurrentLocation();

      // 2. Validação Biométrica
      const bio = await bioService.autenticarBiometria('Confirme sua digital para registrar o ponto');
      if (!bio.sucesso) {
        Alert.alert('Falha', 'Não foi possível confirmar a biometria.');
        return;
      }

      // 3. Envia batida ao backend
      const res = await pontoService.registrarPonto({
        latitude: loc.latitude,
        longitude: loc.longitude,
        localizacao_nome: loc.localizacao_nome,
        tipo_autenticacao: 'biometria'
      });

      Alert.alert('Sucesso!', res.message || 'Ponto registrado e autenticado com sucesso!');
      await carregarDadosHoje();
    } catch (error) {
      Alert.alert('Erro ao bater ponto', error.message || 'Falha ao registrar batida.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida/AEtjO1XK3jxwWmGZjHUXqLey-PO_R5ASBlZsHaWETw9kPz9I1lnRds4EETxOXB-qirbi33diAyWCbZZiW4WebVjAY8tcaWS-03xAUu2QNiCRz4l9bj3quBLOYJK3RfHzx8mlmdHULiD7zA7QWXEple_385pqtJf9UhLnGS2ELrCcp3uZotX7W3bT0DjtMC9ierMGgv9h9ngmJ_nuLwSWZ1CQH2stNJBoOH_fwSCzSBS3euEHdq716whfjR5k4g'
            }}
            style={styles.headerLogo}
          />
          <View>
            <Text style={styles.headerAppTitle}>SME Ponto</Text>
            <View style={styles.headerGpsTag}>
              <View style={styles.gpsDotPulse} />
              <Text style={styles.headerGpsText}>GPS Ativo</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.userInfoTextCol}>
            <Text style={styles.userName}>{usuario?.nome || 'Lucas Ferreira'}</Text>
            <Text style={styles.userRole}>{usuario?.cargo || 'Estagiário de TI'}</Text>
          </View>
          <Image
            source={{
              uri:
                usuario?.foto_url ||
                'https://lh3.googleusercontent.com/aida/AEtjO1UfhhXpM3nc6tDxGO2q633Gnc5QSvNNPc6KExhWNfrzF9m6f5ywhkvo77zt3xkBJmGDJu1PQ9vL9esM8oUoIwYoG-SLmR608R4H7liAKX-89iIt6iw5nU12rASwLDEOcutkVHhh_C8kClp3PwnsXVqcC0Bcgg5YwNn4t6eZSrC-9VFDLORfmCUyf326jK0vBbn85c3V-3NDRfvZHWs_pID2qWA_QVcOSpHp-dv5pF0WMzJ4z_B_eqBvW_g'
            }}
            style={styles.userAvatar}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Date and Daily Status Banner */}
        <View style={styles.dateRow}>
          <View>
            <Text style={styles.dateLabel}>Hoje, Quinta-feira</Text>
            <Text style={styles.dateText}>19 de Setembro</Text>
          </View>
          <StatusBadge status="Ponto em Aberto" pulse={true} />
        </View>

        {/* Real-time Clock & Active Stopwatch */}
        <ContadorAtivo
          horarioEntrada={punchData.primeiroRegistro}
          initialSeconds={punchData.segundosTrabalhados}
          isWorking={true}
        />

        {/* Central Biometric Action Button */}
        <BotaoBiometria
          onPress={handleBaterPonto}
          loading={loading}
          proximoSlotLabel={punchData.proximoSlotLabel}
          gpsLocation="SME Prédio Central"
        />

        {/* Quick Action Buttons */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => Alert.alert('Intervalo', 'Intervalo regulamentar de 15 minutos registrado.')}
          >
            <Text style={styles.quickActionIcon}>☕</Text>
            <Text style={styles.quickActionText}>Intervalo 15m</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => Alert.alert('Saída Antecipada', 'Lembre-se de anexar justificativa ao sair antecipadamente.')}
          >
            <Text style={styles.quickActionIcon}>⎋</Text>
            <Text style={styles.quickActionText}>Saída Cedo</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Progress Cards */}
        <View style={styles.summaryGrid}>
          {/* Card Horas Semanais */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeaderSmall}>
              <Text style={styles.cardHeaderTitle}>Horas Semanais</Text>
              <Text style={styles.cardHeaderIcon}>📅</Text>
            </View>
            <Text style={styles.cardBigNumber}>18h 45m</Text>
            <Text style={styles.cardSub}>Restante p/ 30h</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '37.5%' }]} />
            </View>
          </View>

          {/* Card Banco de Horas */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeaderSmall}>
              <Text style={styles.cardHeaderTitle}>Banco de Horas</Text>
              <Text style={styles.cardHeaderIcon}>⚖️</Text>
            </View>
            <Text style={[styles.cardBigNumber, { color: colors.secondary }]}>+02h 15m</Text>
            <Text style={styles.cardSub}>Saldo positivo acumulado</Text>
            <View style={styles.chipBanco}>
              <Text style={styles.chipBancoText}>Regularizado</Text>
            </View>
          </View>
        </View>

        {/* Today's Punch Activity Timeline */}
        <View style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <View style={styles.timelineHeaderTitleRow}>
              <Text style={styles.timelineIcon}>⏱</Text>
              <Text style={styles.timelineTitle}>Registros de Hoje</Text>
            </View>
            <View style={styles.timelineBadge}>
              <Text style={styles.timelineBadgeText}>4 Batidas Previstas</Text>
            </View>
          </View>

          <View style={styles.slotsList}>
            {punchData.slots.map((slot) => (
              <CardPonto key={slot.id || slot.tipo} slot={slot} />
            ))}
          </View>
        </View>

        {/* Institutional Notice / Supervisor Contact Footer */}
        <TouchableOpacity
          style={styles.noticeCard}
          onPress={onNavigateToJustificativa}
          activeOpacity={0.8}
        >
          <View style={styles.noticeIconCircle}>
            <Text style={styles.noticeEmoji}>💬</Text>
          </View>
          <View style={styles.noticeTextCol}>
            <Text style={styles.noticeTitle}>Divergência ou Problemas com o Ponto?</Text>
            <Text style={styles.noticeDesc}>Envie um atestado ou justificativa ao supervisor DRE</Text>
          </View>
          <Text style={styles.noticeArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(248, 249, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainer
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerLogo: {
    width: 34,
    height: 34,
    borderRadius: 8
  },
  headerAppTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface
  },
  headerGpsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  gpsDotPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary
  },
  headerGpsText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  userInfoTextCol: {
    alignItems: 'flex-end'
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurface
  },
  userRole: {
    fontSize: 11,
    color: colors.onSurfaceVariant
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.surfaceContainerHigh
  },
  scrollArea: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  dateLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontWeight: '500'
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  quickActionIcon: {
    fontSize: 15
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  cardHeaderSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurfaceVariant
  },
  cardHeaderIcon: {
    fontSize: 12
  },
  cardBigNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 2
  },
  cardSub: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    marginBottom: 8
  },
  progressBarBg: {
    height: 5,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 9999,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 9999
  },
  chipBanco: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  chipBancoText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.onSecondaryContainer
  },
  timelineCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  timelineHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  timelineIcon: {
    fontSize: 16
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface
  },
  timelineBadge: {
    backgroundColor: 'rgba(108, 248, 187, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  timelineBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
    textTransform: 'uppercase'
  },
  slotsList: {
    gap: 2
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  noticeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center'
  },
  noticeEmoji: {
    fontSize: 18
  },
  noticeTextCol: {
    flex: 1
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 1
  },
  noticeDesc: {
    fontSize: 11,
    color: colors.onSurfaceVariant
  },
  noticeArrow: {
    fontSize: 22,
    color: colors.onSurfaceVariant,
    fontWeight: '600'
  }
});
