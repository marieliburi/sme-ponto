import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking
} from 'react-native';
import { colors } from '../theme/colors';
import StatusBadge from '../components/StatusBadge';
import { pontoService } from '../services/api';

export default function RelatorioScreen({ onNavigateToJustificativa }) {
  const [selectedMonth, setSelectedMonth] = useState({ mes: 10, ano: 2024, nome: 'Outubro 2024' });
  const [activeFilter, setActiveFilter] = useState('todos');
  const [espelhoData, setEspelhoData] = useState({
    resumo: {
      horasTrabalhadas: '126h 15m',
      metaHoras: '130h 00m',
      percentualMeta: 97,
      saldoBanco: '+04h 15m',
      diasCompletos: 18,
      diasPendentes: 2,
      justificados: 1,
      totalDias: 21
    },
    dias: [
      {
        id: 'd-24',
        dia: '24',
        diaSemana: 'Quinta',
        dataCompleta: '24/10/2024',
        tipoStatus: 'normal',
        statusLabel: 'Normal',
        horasFeitas: '06h 00m',
        slots: ['08:00', '12:00', '13:00', '15:00'],
        local: 'SME Sede Central'
      },
      {
        id: 'd-23',
        dia: '23',
        diaSemana: 'Quarta',
        dataCompleta: '23/10/2024',
        tipoStatus: 'normal',
        statusLabel: 'Normal',
        horasFeitas: '05h 57m',
        slots: ['08:05', '12:00', '13:00', '15:02'],
        local: 'SME Sede Central'
      },
      {
        id: 'd-22',
        dia: '22',
        diaSemana: 'Terça',
        dataCompleta: '22/10/2024',
        tipoStatus: 'atestado',
        statusLabel: 'Atestado Médico',
        horasFeitas: '06h 00m (Aban.)',
        slots: ['--', '--', '--', '--'],
        local: 'Anexo Homologado R-408'
      },
      {
        id: 'd-21',
        dia: '21',
        diaSemana: 'Segunda',
        dataCompleta: '21/10/2024',
        tipoStatus: 'pendente',
        statusLabel: 'Incompleto',
        horasFeitas: '04h 30m',
        slots: ['08:00', '12:00', '13:00', '--'],
        local: 'SME Sede Central'
      }
    ]
  });

  useEffect(() => {
    carregarEspelho();
  }, [selectedMonth]);

  const carregarEspelho = async () => {
    try {
      const res = await pontoService.getEspelhoMes(selectedMonth.ano, selectedMonth.mes);
      if (res.success && res.dias) {
        setEspelhoData({
          resumo: res.resumo,
          dias: res.dias
        });
      }
    } catch (e) {
      console.warn('Usando dados mock do espelho:', e.message);
    }
  };

  const handleExportPdf = () => {
    const url = pontoService.getRelatorioPdfUrl(selectedMonth.ano, selectedMonth.mes);
    Linking.openURL(url).catch(() => {
      Alert.alert('Exportar Relatório', `Gerando espelho em PDF do mês de ${selectedMonth.nome}...`);
    });
  };

  // Filtragem dos cards de dia
  const filteredDias = espelhoData.dias.filter((item) => {
    if (activeFilter === 'completos') return item.tipoStatus === 'normal';
    if (activeFilter === 'pendencias') return item.tipoStatus === 'pendente';
    if (activeFilter === 'justificados') return item.tipoStatus === 'atestado';
    return true;
  });

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Espelho de Ponto Diário</Text>
          <Text style={styles.headerSubtitle}>Controle Mensal de Frequência</Text>
        </View>

        <TouchableOpacity style={styles.exportBtn} onPress={handleExportPdf} activeOpacity={0.8}>
          <Text style={styles.exportBtnIcon}>📄</Text>
          <Text style={styles.exportBtnText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month Selector Bar */}
        <View style={styles.monthSelectorBar}>
          <TouchableOpacity
            style={styles.monthArrowBtn}
            onPress={() => setSelectedMonth({ mes: 9, ano: 2024, nome: 'Setembro 2024' })}
          >
            <Text style={styles.monthArrow}>‹</Text>
          </TouchableOpacity>

          <View style={styles.monthTitleBox}>
            <Text style={styles.monthIcon}>📅</Text>
            <Text style={styles.monthTitleText}>{selectedMonth.nome}</Text>
          </View>

          <TouchableOpacity
            style={styles.monthArrowBtn}
            onPress={() => setSelectedMonth({ mes: 11, ano: 2024, nome: 'Novembro 2024' })}
          >
            <Text style={styles.monthArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Metrics Cards */}
        <View style={styles.metricsContainer}>
          {/* Card 1: Horas Trabalhadas */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Horas Trabalhadas</Text>
            <Text style={styles.metricMainNumber}>{espelhoData.resumo.horasTrabalhadas}</Text>
            <Text style={styles.metricMeta}>Meta: {espelhoData.resumo.metaHoras}</Text>
            <View style={styles.metricProgressBg}>
              <View style={[styles.metricProgressFill, { width: `${espelhoData.resumo.percentualMeta}%` }]} />
            </View>
          </View>

          {/* Card 2: Saldo Banco */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Banco de Horas</Text>
            <Text style={[styles.metricMainNumber, { color: colors.secondary }]}>
              {espelhoData.resumo.saldoBanco}
            </Text>
            <Text style={styles.metricMeta}>Saldo em Crédito</Text>
            <View style={styles.metricChip}>
              <Text style={styles.metricChipText}>Regularizado</Text>
            </View>
          </View>
        </View>

        {/* Filter Chips Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'todos' && styles.filterChipActive]}
            onPress={() => setActiveFilter('todos')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'todos' && styles.filterChipTextActive]}>
              Todos ({espelhoData.resumo.totalDias})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'completos' && styles.filterChipActive]}
            onPress={() => setActiveFilter('completos')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'completos' && styles.filterChipTextActive]}>
              Completos ({espelhoData.resumo.diasCompletos})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'pendencias' && styles.filterChipActive]}
            onPress={() => setActiveFilter('pendencias')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'pendencias' && styles.filterChipTextActive]}>
              Pendências ({espelhoData.resumo.diasPendentes})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'justificados' && styles.filterChipActive]}
            onPress={() => setActiveFilter('justificados')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'justificados' && styles.filterChipTextActive]}>
              Justificados ({espelhoData.resumo.justificados})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Day-by-Day Timesheet List */}
        <View style={styles.daysList}>
          {filteredDias.map((d) => (
            <View key={d.id} style={styles.dayCard}>
              {/* Day Header Row */}
              <View style={styles.dayHeaderRow}>
                <View style={styles.dayNumberBox}>
                  <Text style={styles.dayNumber}>{d.dia}</Text>
                  <Text style={styles.dayWeek}>{d.diaSemana}</Text>
                </View>

                <View style={styles.dayCenterInfo}>
                  <Text style={styles.dayHours}>{d.horasFeitas}</Text>
                  <Text style={styles.dayLocation}>{d.local}</Text>
                </View>

                <StatusBadge status={d.statusLabel} />
              </View>

              {/* Day Punch Slots Badges */}
              <View style={styles.daySlotsRow}>
                <View style={styles.slotPill}>
                  <Text style={styles.slotLabel}>E1:</Text>
                  <Text style={styles.slotVal}>{d.slots[0]}</Text>
                </View>
                <View style={styles.slotPill}>
                  <Text style={styles.slotLabel}>S1:</Text>
                  <Text style={styles.slotVal}>{d.slots[1]}</Text>
                </View>
                <View style={styles.slotPill}>
                  <Text style={styles.slotLabel}>E2:</Text>
                  <Text style={styles.slotVal}>{d.slots[2]}</Text>
                </View>
                <View style={styles.slotPill}>
                  <Text style={styles.slotLabel}>S2:</Text>
                  <Text style={styles.slotVal}>{d.slots[3]}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Justificativa Button */}
        <TouchableOpacity
          style={styles.justificativaCTA}
          onPress={onNavigateToJustificativa}
          activeOpacity={0.85}
        >
          <Text style={styles.justificativaCTAIcon}>📝</Text>
          <Text style={styles.justificativaCTAText}>Nova Justificativa ou Ajuste</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainer,
    backgroundColor: 'rgba(248, 249, 255, 0.95)'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.onSurfaceVariant
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  exportBtnIcon: {
    fontSize: 14
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface
  },
  scrollArea: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30
  },
  monthSelectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  monthArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center'
  },
  monthArrow: {
    fontSize: 20,
    color: colors.onSurface,
    fontWeight: 'bold',
    lineHeight: 22
  },
  monthTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  monthIcon: {
    fontSize: 16
  },
  monthTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    marginBottom: 4
  },
  metricMainNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 2
  },
  metricMeta: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    marginBottom: 8
  },
  metricProgressBg: {
    height: 5,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 9999,
    overflow: 'hidden'
  },
  metricProgressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 9999
  },
  metricChip: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  metricChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.onSecondaryContainer
  },
  filtersScroll: {
    marginBottom: 14
  },
  filterChip: {
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  filterChipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant
  },
  filterChipTextActive: {
    color: colors.onPrimary,
    fontWeight: '700'
  },
  daysList: {
    gap: 10,
    marginBottom: 16
  },
  dayCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  dayNumberBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface
  },
  dayWeek: {
    fontSize: 9,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  dayCenterInfo: {
    flex: 1
  },
  dayHours: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface
  },
  dayLocation: {
    fontSize: 11,
    color: colors.onSurfaceVariant
  },
  daySlotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerLow
  },
  slotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4
  },
  slotLabel: {
    fontSize: 9,
    color: colors.onSurfaceVariant,
    fontWeight: 'bold'
  },
  slotVal: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurface
  },
  justificativaCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: 14,
    height: 48,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  justificativaCTAIcon: {
    fontSize: 16
  },
  justificativaCTAText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onPrimary
  }
});
