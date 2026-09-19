import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { colors } from '../theme/colors';
import { anexoService } from '../services/api';

const TIPOS_JUSTIFICATIVA = [
  'Atestado Médico / Odontológico',
  'Declaração Escolar / Prova Universitária',
  'Problema Técnico de Biometria / GPS',
  'Outros Afastamentos Legais'
];

export default function AtestadoScreen({ onGoBack }) {
  const [tipo, setTipo] = useState(TIPOS_JUSTIFICATIVA[0]);
  const [dataOcorrencia, setDataOcorrencia] = useState('2024-10-22');
  const [descricao, setDescricao] = useState(
    'Consulta médica oftalmológica de rotina com dilatação de pupila impossibilitando o trabalho na tela.'
  );
  const [arquivo, setArquivo] = useState({
    nome: 'atestado_medico_22set.pdf',
    tamanho: '1.4 MB'
  });
  const [loading, setLoading] = useState(false);
  const [enviadoComSucesso, setEnviadoComSucesso] = useState(false);
  const [showTipoPicker, setShowTipoPicker] = useState(false);

  const handleSelecionarArquivo = () => {
    Alert.alert(
      'Anexar Comprovante',
      'Escolha a origem do documento:',
      [
        {
          text: 'Tirar Foto com a Câmera',
          onPress: () => {
            setArquivo({
              nome: `foto_comprovante_${Date.now().toString().slice(-4)}.jpg`,
              tamanho: '2.1 MB'
            });
          }
        },
        {
          text: 'Selecionar PDF ou Arquivo',
          onPress: () => {
            setArquivo({
              nome: 'declaracao_comparecimento.pdf',
              tamanho: '840 KB'
            });
          }
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleRemoverArquivo = () => {
    setArquivo(null);
  };

  const handleEnviar = async () => {
    if (!descricao.trim()) {
      Alert.alert('Campo Obrigatório', 'Preencha a descrição detalhada da justificativa.');
      return;
    }

    try {
      setLoading(true);
      // Envio para o backend
      const res = await anexoService.criarJustificativa({
        tipo,
        data_ocorrencia: dataOcorrencia,
        descricao,
        anexo_nome: arquivo ? arquivo.nome : 'comprovante.pdf'
      });

      setEnviadoComSucesso(true);
      Alert.alert(
        'Justificativa Transmitida!',
        `Seu atestado foi registrado sob o protocolo ${res.protocolo || 'R-408'} e encaminhado para homologação de Amanda Rocha.`
      );

      setTimeout(() => {
        setEnviadoComSucesso(false);
        if (onGoBack) onGoBack();
      }, 1500);
    } catch (error) {
      Alert.alert('Falha no envio', error.message || 'Erro ao submeter justificativa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Top Header & Context Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={onGoBack} activeOpacity={0.7}>
            <Text style={styles.backBtnIcon}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Enviar Justificativa</Text>
            <Text style={styles.headerSubtitle}>Envio de declarações legais e atestados</Text>
          </View>
        </View>

        <View style={styles.protocolBadge}>
          <Text style={styles.protocolIcon}>⏱</Text>
          <Text style={styles.protocolText}>Protocolo R-408</Text>
        </View>
      </View>

      {/* Regulatory Policy Notification Banner */}
      <View style={styles.policyBanner}>
        <View style={styles.policyIconBox}>
          <Text style={styles.policyEmoji}>ℹ️</Text>
        </View>
        <Text style={styles.policyText}>
          Prazo regulamentar de até <Text style={styles.policyBold}>48 horas</Text> após a ocorrência para homologação da chefia imediata.
        </Text>
      </View>

      {/* Main Form Fields */}
      <View style={styles.form}>
        {/* Field 1: Tipo de Justificativa */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Tipo de Justificativa <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setShowTipoPicker(!showTipoPicker)}
            activeOpacity={0.8}
          >
            <Text style={styles.selectText}>{tipo}</Text>
            <Text style={styles.selectChevron}>{showTipoPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showTipoPicker && (
            <View style={styles.dropdown}>
              {TIPOS_JUSTIFICATIVA.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.dropdownItem, item === tipo && styles.dropdownItemActive]}
                  onPress={() => {
                    setTipo(item);
                    setShowTipoPicker(false);
                  }}
                >
                  <Text style={[styles.dropdownText, item === tipo && styles.dropdownTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Field 2: Data da Ocorrência */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Data do Ocorrido <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>📅</Text>
            <TextInput
              style={styles.input}
              value={dataOcorrencia}
              onChangeText={setDataOcorrencia}
              placeholder="AAAA-MM-DD"
              placeholderTextColor={colors.outlineVariant}
            />
          </View>
        </View>

        {/* Field 3: Justificativa / Descrição Detalhada */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelCounterRow}>
            <Text style={styles.label}>
              Justificativa / Descrição Detalhada <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.counterText}>{descricao.length} / 500</Text>
          </View>
          <View style={styles.textareaContainer}>
            <TextInput
              style={styles.textarea}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Descreva brevemente o motivo da ausência ou ajuste..."
              placeholderTextColor={colors.outlineVariant}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>
        </View>

        {/* Field 4: Document Upload Zone */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelCounterRow}>
            <Text style={styles.label}>
              Comprovante ou Atestado Digital <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.counterText}>Máx. 10 MB</Text>
          </View>

          {/* Interactive Upload Zone */}
          <TouchableOpacity
            style={styles.uploadArea}
            onPress={handleSelecionarArquivo}
            activeOpacity={0.8}
          >
            <View style={styles.uploadIconCircle}>
              <Text style={styles.uploadEmoji}>☁️</Text>
            </View>
            <Text style={styles.uploadTitle}>Toque para anexar ou tirar foto</Text>
            <Text style={styles.uploadSub}>PDF, JPG ou PNG em boa resolução</Text>
          </TouchableOpacity>

          {/* Attached File Preview Card */}
          {arquivo && (
            <View style={styles.filePreviewCard}>
              <View style={styles.fileIconBox}>
                <Text style={styles.fileDocEmoji}>📄</Text>
              </View>
              <View style={styles.fileInfoCol}>
                <View style={styles.fileNameRow}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {arquivo.nome}
                  </Text>
                  <Text style={styles.fileCheck}>✓</Text>
                </View>
                <Text style={styles.fileMeta}>{arquivo.tamanho} • Pronto para envio</Text>
              </View>

              <View style={styles.fileActions}>
                <TouchableOpacity
                  style={styles.fileActionBtn}
                  onPress={() => Alert.alert('Visualizar', `Abrindo pré-visualização de ${arquivo.nome}`)}
                >
                  <Text style={styles.fileActionIcon}>👁️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.fileActionBtn} onPress={handleRemoverArquivo}>
                  <Text style={[styles.fileActionIcon, { color: colors.error }]}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Supervisor Approval Insight Card */}
        <View style={styles.supervisorCard}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7E74lewcyIRwyTXJOa-Xz_jLCIaQJLahHCSqQYirRQXUtOZJgkWgHlrGqEhLWXJXLACXSjd753flYLEjjfYOFOFN6YG81CB23-5wYhyjIUOriT90-3jY0j7BxTwydtyo2uWulhw3U_SD8PtH5M8jvPDwOgPQHaqQU6WIfKEdk_OtG08XHzHGmLDQBkDWlt_lI3QjZ4JdRwqylT2yMpW8IbdoFdXtLxO8ZFAZxDHv1eI72zXxFKm3n'
            }}
            style={styles.supervisorAvatar}
          />
          <View style={styles.supervisorTextCol}>
            <Text style={styles.supervisorName}>Supervisão: Amanda Rocha</Text>
            <Text style={styles.supervisorDesc}>Notificação instantânea para análise e homologação</Text>
          </View>
        </View>

        {/* Submission CTAs */}
        <View style={styles.actionsCol}>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleEnviar}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : enviadoComSucesso ? (
              <Text style={styles.submitBtnText}>✓ Enviado com Sucesso!</Text>
            ) : (
              <>
                <Text style={styles.submitBtnIcon}>✈️</Text>
                <Text style={styles.submitBtnText}>Enviar para Análise</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onGoBack} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancelar e Voltar</Text>
          </TouchableOpacity>
        </View>

        {/* Feedback Subtext */}
        <Text style={styles.lgpdNote}>
          Protocolo de envio registrado sob a Lei Geral de Proteção de Dados (LGPD) e diretrizes municipais da SME.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backBtnIcon: {
    fontSize: 24,
    color: colors.onSurface,
    fontWeight: 'bold',
    lineHeight: 26
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
  protocolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4
  },
  protocolIcon: {
    fontSize: 10
  },
  protocolText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.onSurfaceVariant
  },
  policyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  policyIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center'
  },
  policyEmoji: {
    fontSize: 14
  },
  policyText: {
    flex: 1,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    lineHeight: 16
  },
  policyBold: {
    fontWeight: '700',
    color: colors.onSurface
  },
  form: {
    gap: 14
  },
  fieldGroup: {
    gap: 6
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface
  },
  required: {
    color: colors.error
  },
  labelCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  counterText: {
    fontSize: 10,
    color: colors.onSurfaceVariant
  },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  selectText: {
    fontSize: 13,
    color: colors.onSurface,
    fontWeight: '500'
  },
  selectChevron: {
    fontSize: 12,
    color: colors.onSurfaceVariant
  },
  dropdown: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
    overflow: 'hidden',
    marginTop: 4
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerLow
  },
  dropdownItemActive: {
    backgroundColor: colors.surfaceContainerLow
  },
  dropdownText: {
    fontSize: 12,
    color: colors.onSurface
  },
  dropdownTextActive: {
    fontWeight: '700',
    color: colors.secondary
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colors.onSurface
  },
  textareaContainer: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  textarea: {
    fontSize: 13,
    color: colors.onSurface,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  uploadArea: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.secondaryContainer
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  uploadEmoji: {
    fontSize: 20
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurface
  },
  uploadSub: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 2
  },
  filePreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    padding: 10,
    marginTop: 8
  },
  fileIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.secondaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  fileDocEmoji: {
    fontSize: 16
  },
  fileInfoCol: {
    flex: 1
  },
  fileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  fileName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface,
    maxWidth: 160
  },
  fileCheck: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: 'bold'
  },
  fileMeta: {
    fontSize: 10,
    color: colors.onSurfaceVariant
  },
  fileActions: {
    flexDirection: 'row',
    gap: 6
  },
  fileActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fileActionIcon: {
    fontSize: 13
  },
  supervisorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  supervisorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  supervisorTextCol: {
    flex: 1
  },
  supervisorName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurface
  },
  supervisorDesc: {
    fontSize: 10,
    color: colors.onSurfaceVariant
  },
  actionsCol: {
    gap: 8,
    marginTop: 6
  },
  submitBtn: {
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
  submitBtnIcon: {
    fontSize: 16
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onPrimary
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant
  },
  lgpdNote: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 8
  }
});
