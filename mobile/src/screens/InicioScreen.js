import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { colors } from '../theme/colors';
import ContadorAtivo from '../components/ContadorAtivo';
import BotaoBiometria from '../components/BotaoBiometria';
import CardPonto from '../components/CardPonto';
import StatusBadge from '../components/StatusBadge';
import { locationService } from '../services/locationService';
import { pontoService } from '../services/api';

export default function InicioScreen({ usuario, onNavigateToJustificativa }) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);

  const [punchData, setPunchData] = useState({
    slots: [
      {
        id: '1',
        tipo: 'entrada',
        titulo: '1ª Batida • Entrada',
        subtitulo: 'SME Prédio Central',
        horario: '--:--',
        status: 'pendente',
        gpsConfirmado: false
      },
      {
        id: '2',
        tipo: 'saida',
        titulo: '2ª Batida • Saída',
        subtitulo: 'Encerramento da jornada (6h)',
        horario: '--:--',
        status: 'pendente',
        gpsConfirmado: false
      }
    ],
    proximoSlotLabel: '1ª Batida • Entrada',
    segundosTrabalhados: 0,
    primeiroRegistro: null,
    jornadaConcluida: false
  });

  // Função auxiliar para normalizar strings de data do banco (PostgreSQL/Node)
  const parseIsoDate = (dateStr) => {
    if (!dateStr) return null;
    if (typeof dateStr === 'string' && dateStr.includes(' ') && !dateStr.includes('T')) {
      return dateStr.replace(' ', 'T');
    }
    return dateStr;
  };

  const sincronizarComServidor = async () => {
    try {
      const res = await pontoService.getPontosHoje();
      if (!res) return;

      const registroHoje = Array.isArray(res) ? res[0] : (res.registro || res.pontos?.[0] || res);
      if (!registroHoje || typeof registroHoje !== 'object') return;

      const rawEntrada = registroHoje.horario_entrada || registroHoje.created_at || registroHoje.data_hora;
      const rawSaida = registroHoje.horario_saida;

      const horaEntrada = parseIsoDate(rawEntrada);
      const horaSaida = parseIsoDate(rawSaida);
      const duracaoSegundos = registroHoje.duracao_segundos;

      const formatarHoraLocal = (isoStr) => {
        if (!isoStr) return '--:--';
        const d = new Date(isoStr);
        return isNaN(d.getTime()) ? '--:--' : d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      };

      const temEntrada = !!horaEntrada;
      const temSaida = !!horaSaida;

      let segundos = duracaoSegundos || 0;
      if (temEntrada && !temSaida) {
        const inicio = new Date(horaEntrada).getTime();
        if (!isNaN(inicio)) {
          segundos = Math.max(0, Math.floor((Date.now() - inicio) / 1000));
        }
      }

      setPunchData({
        slots: [
          {
            id: '1',
            tipo: 'entrada',
            titulo: '1ª Batida • Entrada',
            subtitulo: 'SME Prédio Central',
            horario: temEntrada ? formatarHoraLocal(horaEntrada) : '--:--',
            status: temEntrada ? 'realizado' : 'pendente',
            gpsConfirmado: temEntrada
          },
          {
            id: '2',
            tipo: 'saida',
            titulo: '2ª Batida • Saída',
            subtitulo: 'Encerramento da jornada (6h)',
            horario: temSaida ? formatarHoraLocal(horaSaida) : '--:--',
            status: temSaida ? 'realizado' : 'pendente',
            gpsConfirmado: temSaida
          }
        ],
        proximoSlotLabel: !temEntrada 
          ? '1ª Batida • Entrada' 
          : !temSaida 
          ? '2ª Batida • Saída' 
          : 'Jornada Concluída',
        segundosTrabalhados: segundos,
        primeiroRegistro: horaEntrada,
        jornadaConcluida: temEntrada && temSaida
      });
    } catch (err) {
      console.log('Sincronização pendente:', err.message);
    } finally {
      setLoadingInicial(false);
    }
  };

  useEffect(() => {
    sincronizarComServidor();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await sincronizarComServidor();
    setRefreshing(false);
  };

  const handleBaterPonto = async () => {
    if (punchData.jornadaConcluida) {
      Alert.alert('Jornada Concluída', 'Você já registrou a Entrada e a Saída de hoje.');
      return;
    }

    try {
      setLoading(true);

      let loc = { latitude: -22.9789, longitude: -49.8706 }; // Coordenadas do Prédio Central SME como padrão
      try {
        const gps = await locationService.getCurrentLocation();
        if (gps && gps.latitude) {
          loc = { latitude: gps.latitude, longitude: gps.longitude };
        }
      } catch (err) {
        console.warn('GPS indisponível:', err);
      }

      const tipoRegistro = !punchData.primeiroRegistro ? 'ENTRADA' : 'SAIDA';
      const agoraIso = new Date().toISOString();
      const horaFormatadaAgora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // 1. Chamada API
      const resposta = await pontoService.registrarPonto({
        usuario_id: usuario?.id,
        tipo: tipoRegistro,
        latitude: loc.latitude,
        longitude: loc.longitude,
        localizacao_nome: 'SME Prédio Central',
        tipo_autenticacao: 'manual'
      });

      // 2. Se o GPS estiver desligado ou sem permissão, bloqueia a batida
    if (!loc) {
      Alert.alert(
        'GPS Necessário',
        'Não foi possível obter sua localização. Ative o GPS/Localização do celular para registrar o ponto.'
      );
      return; // Interrompe a função aqui
    }

      // 2.1 Atualização local garantindo que o cronômetro inicie instantaneamente
      setPunchData((prev) => {
        const eEntrada = tipoRegistro === 'ENTRADA';
        const horaEntradaValida = eEntrada ? (prev.primeiroRegistro || agoraIso) : prev.primeiroRegistro;
        const temEntrada = !!horaEntradaValida;
        const temSaida = !eEntrada || prev.slots[1].status === 'realizado';

        return {
          ...prev,
          slots: [
            {
              ...prev.slots[0],
              horario: eEntrada ? horaFormatadaAgora : prev.slots[0].horario,
              status: temEntrada ? 'realizado' : 'pendente',
              gpsConfirmado: temEntrada
            },
            {
              ...prev.slots[1],
              horario: !eEntrada ? horaFormatadaAgora : prev.slots[1].horario,
              status: temSaida ? 'realizado' : 'pendente',
              gpsConfirmado: temSaida
            }
          ],
          proximoSlotLabel: !temEntrada
            ? '1ª Batida • Entrada'
            : !temSaida
            ? '2ª Batida • Saída'
            : 'Jornada Concluída',
          primeiroRegistro: horaEntradaValida,
          jornadaConcluida: temEntrada && temSaida
        };
      });

      Alert.alert('Sucesso!', resposta?.message || resposta?.mensagem || `Ponto de ${tipoRegistro.toLowerCase()} registrado!`);
    } catch (error) {
      console.error('Erro no registro do ponto:', error);
      Alert.alert('Atenção', error?.message || 'Falha ao registrar batida.');
    } finally {
      setLoading(false);
    }
  };

  const hoje = new Date();
  const diaSemana = hoje.toLocaleDateString('pt-BR', { weekday: 'long' });
  const diaEMes = hoje.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  const dataFormatada = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

  if (loadingInicial) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando sistema...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
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
            <Text style={styles.userName}>{usuario?.nome || 'Servidor SME'}</Text>
            <Text style={styles.userRole}>{usuario?.cargo || 'Estagiário'}</Text>
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
        <View style={styles.dateRow}>
          <View>
            <Text style={styles.dateLabel}>Hoje, {dataFormatada}</Text>
            <Text style={styles.dateText}>{diaEMes}</Text>
          </View>
          <StatusBadge 
            status={punchData.jornadaConcluida ? "Jornada Concluída" : "Ponto em Aberto"} 
            pulse={!punchData.jornadaConcluida} 
          />
        </View>

        {/* Cronômetro ativo com validação estrita de booleano */}
        <ContadorAtivo
          horarioEntrada={punchData.primeiroRegistro}
          initialSeconds={punchData.segundosTrabalhados}
          isWorking={Boolean(punchData.primeiroRegistro) && !punchData.jornadaConcluida}
        />

        <BotaoBiometria
          onPress={handleBaterPonto}
          loading={loading}
          proximoSlotLabel={punchData.proximoSlotLabel}
          gpsLocation="SME Prédio Central"
          disabled={punchData.jornadaConcluida}
        />

        <View style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <View style={styles.timelineHeaderTitleRow}>
              <Text style={styles.timelineIcon}>⏱</Text>
              <Text style={styles.timelineTitle}>Registros de Hoje</Text>
            </View>
            <View style={styles.timelineBadge}>
              <Text style={styles.timelineBadgeText}>Jornada 6 Horas</Text>
            </View>
          </View>

          <View style={styles.slotsList}>
            {punchData.slots.map((slot) => (
              <CardPonto key={slot.id || slot.tipo} slot={slot} />
            ))}
          </View>
        </View>

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
            <Text style={styles.noticeDesc}>Envie um atestado ou justificativa ao supervisor</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.onSurfaceVariant
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