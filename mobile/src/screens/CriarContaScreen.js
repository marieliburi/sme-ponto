import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { colors } from '../theme/colors';
import { authService } from '../services/api';

export default function CriarContaScreen({ onGoBack, onRegisterSuccess }) {
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('Estagiário de TI');
  const [setor, setSetor] = useState('SME Sede Central');
  const [cargaHoraria, setCargaHoraria] = useState(6);
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [biometriaAtiva, setBiometriaAtiva] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nome || !matricula || !cpf || !email || !senha) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos do formulário.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Senhas Divergentes', 'A confirmação de senha não confere com a senha digitada.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.register({
        nome,
        matricula,
        cpf,
        email,
        cargo,
        setor,
        carga_horaria: cargaHoraria,
        turno: 'morning',
        senha,
        biometria_ativa: biometriaAtiva
      });

      if (res.success) {
        Alert.alert(
          'Conta Criada com Sucesso!',
          'Seu cadastro institucional foi ativado com sucesso. Bem-vindo ao SME Ponto!'
        );
        if (onRegisterSuccess) onRegisterSuccess(res.usuario);
      }
    } catch (error) {
      Alert.alert('Erro no Cadastro', error.message || 'Falha ao registrar usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={onGoBack} activeOpacity={0.7}>
          <Text style={styles.backBtnIcon}>‹</Text>
          <Text style={styles.backBtnText}>Voltar ao Login</Text>
        </TouchableOpacity>

        <View style={styles.conectaBadge}>
          <Text style={styles.conectaIcon}>🛡️</Text>
          <Text style={styles.conectaText}>SME Conecta</Text>
        </View>
      </View>

      {/* Header Section with Logo */}
      <View style={styles.headerArea}>
        <Image
          source={{
            uri: 'https://lh3.googleusercontent.com/aida/AEtjO1XK3jxwWmGZjHUXqLey-PO_R5ASBlZsHaWETw9kPz9I1lnRds4EETxOXB-qirbi33diAyWCbZZiW4WebVjAY8tcaWS-03xAUu2QNiCRz4l9bj3quBLOYJK3RfHzx8mlmdHULiD7zA7QWXEple_385pqtJf9UhLnGS2ELrCcp3uZotX7W3bT0DjtMC9ierMGgv9h9ngmJ_nuLwSWZ1CQH2stNJBoOH_fwSCzSBS3euEHdq716whfjR5k4g'
          }}
          style={styles.logo}
        />
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>
          Preencha seus dados de estagiário e ative o acesso biométrico seguro.
        </Text>
      </View>

      {/* Step Progress Indicator */}
      <View style={styles.stepsCard}>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepCircleActive]}>
            <Text style={styles.stepNumberActive}>1</Text>
          </View>
          <View>
            <Text style={styles.stepLabel}>Dados Pessoais</Text>
            <Text style={styles.stepSubActive}>Em preenchimento</Text>
          </View>
        </View>

        <Text style={styles.stepArrow}>›</Text>

        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepCircleBio]}>
            <Text style={styles.stepEmoji}>🖲️</Text>
          </View>
          <View>
            <Text style={styles.stepLabel}>Biometria</Text>
            <Text style={styles.stepSub}>Pronta p/ ativar</Text>
          </View>
        </View>
      </View>

      {/* Main Registration Form */}
      <View style={styles.form}>
        <Text style={styles.sectionHeading}>Identificação do Estagiário</Text>

        {/* Nome Completo */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nome Completo</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ex: Lucas Ferreira Santos"
              placeholderTextColor={colors.outlineVariant}
              value={nome}
              onChangeText={setNome}
            />
          </View>
        </View>

        {/* Matrícula & CPF Row */}
        <View style={styles.rowTwo}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Matrícula</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="EST-2025-9482"
                placeholderTextColor={colors.outlineVariant}
                value={matricula}
                onChangeText={setMatricula}
              />
            </View>
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>CPF</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor={colors.outlineVariant}
                value={cpf}
                onChangeText={setCpf}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* E-mail */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>E-mail Institucional ou Pessoal</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="lucas.ferreira@sme.edu.br"
              placeholderTextColor={colors.outlineVariant}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Cargo e Lotação */}
        <View style={styles.rowTwo}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Cargo / Função</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={cargo}
                onChangeText={setCargo}
                placeholder="Estagiário de TI"
                placeholderTextColor={colors.outlineVariant}
              />
            </View>
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Lotação / Setor</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={setor}
                onChangeText={setSetor}
                placeholder="SME Sede Central"
                placeholderTextColor={colors.outlineVariant}
              />
            </View>
          </View>
        </View>

        {/* Carga Horária Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Carga Horária Regulamentar</Text>
          <View style={styles.cargaRow}>
            <TouchableOpacity
              style={[styles.cargaChip, cargaHoraria === 6 && styles.cargaChipActive]}
              onPress={() => setCargaHoraria(6)}
            >
              <Text style={[styles.cargaChipText, cargaHoraria === 6 && styles.cargaChipTextActive]}>
                6 Horas / Dia (30h semanais)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cargaChip, cargaHoraria === 4 && styles.cargaChipActive]}
              onPress={() => setCargaHoraria(4)}
            >
              <Text style={[styles.cargaChipText, cargaHoraria === 4 && styles.cargaChipTextActive]}>
                4 Horas / Dia (20h semanais)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Senha e Confirmação */}
        <Text style={[styles.sectionHeading, { marginTop: 10 }]}>Segurança do Acesso</Text>
        <View style={styles.rowTwo}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 dígitos"
                placeholderTextColor={colors.outlineVariant}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
              />
            </View>
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Repita a senha"
                placeholderTextColor={colors.outlineVariant}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Card de Ativação Biométrica */}
        <View style={styles.biometriaCard}>
          <View style={styles.biometriaIconCircle}>
            <Text style={styles.biometriaEmoji}>🖲️</Text>
          </View>
          <View style={styles.biometriaTextCol}>
            <Text style={styles.biometriaTitle}>Ativar Biometria Digital</Text>
            <Text style={styles.biometriaDesc}>
              Permite validar ponto com a digital do smartphone vinculada ao GPS.
            </Text>
          </View>
          <Switch
            value={biometriaAtiva}
            onValueChange={setBiometriaAtiva}
            trackColor={{ false: colors.surfaceContainerHighest, true: colors.secondary }}
            thumbColor={colors.surfaceContainerLowest}
          />
        </View>

        {/* Botão de Envio */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Concluir Cadastro e Ativar Acesso</Text>
              <Text style={styles.submitBtnCheck}>✓</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Rodapé Fazer Login */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Já possui conta? </Text>
          <TouchableOpacity onPress={onGoBack}>
            <Text style={styles.footerLink}>Fazer Login</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 20,
    paddingBottom: 40
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 4
  },
  backBtnIcon: {
    fontSize: 20,
    color: colors.onSurface,
    fontWeight: 'bold',
    lineHeight: 22
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface
  },
  conectaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4
  },
  conectaIcon: {
    fontSize: 10
  },
  conectaText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.secondary,
    textTransform: 'uppercase'
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 18
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginBottom: 8
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 16
  },
  stepsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepCircleActive: {
    backgroundColor: colors.primary
  },
  stepCircleBio: {
    backgroundColor: colors.secondaryContainer
  },
  stepNumberActive: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onPrimary
  },
  stepEmoji: {
    fontSize: 14
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurface
  },
  stepSubActive: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary
  },
  stepSub: {
    fontSize: 10,
    color: colors.onSurfaceVariant
  },
  stepArrow: {
    fontSize: 18,
    color: colors.outlineVariant
  },
  form: {
    gap: 12
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 2
  },
  fieldGroup: {
    gap: 4
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurface
  },
  inputContainer: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
    justifyContent: 'center'
  },
  input: {
    fontSize: 13,
    color: colors.onSurface
  },
  cargaRow: {
    gap: 8
  },
  cargaChip: {
    backgroundColor: colors.surfaceContainerLow,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  cargaChipActive: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.secondary
  },
  cargaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant
  },
  cargaChipTextActive: {
    color: colors.onSecondaryContainer,
    fontWeight: '700'
  },
  biometriaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 14,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
    marginVertical: 4
  },
  biometriaIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center'
  },
  biometriaEmoji: {
    fontSize: 20
  },
  biometriaTextCol: {
    flex: 1
  },
  biometriaTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurface
  },
  biometriaDesc: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    lineHeight: 14
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: 14,
    height: 50,
    gap: 8,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onPrimary
  },
  submitBtnCheck: {
    fontSize: 14,
    color: colors.secondaryFixed,
    fontWeight: 'bold'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12
  },
  footerText: {
    fontSize: 12,
    color: colors.onSurfaceVariant
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary
  }
});
