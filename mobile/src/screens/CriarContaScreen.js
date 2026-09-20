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
import { authService } from '../services/api';

export default function CriarContaScreen({ onGoBack, onRegisterSuccess }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('Estagiário');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const emailFormatado = email.trim().toLowerCase();

    if (!nome.trim() || !emailFormatado || !senha) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha o nome, e-mail e senha.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Senhas Divergentes', 'A confirmação de senha não confere com a senha digitada.');
      return;
    }

    try {
      setLoading(true);
      // Envia apenas as colunas válidas no banco de dados
      const res = await authService.register({
        nome: nome.trim(),
        email: emailFormatado,
        cargo: cargo.trim() || 'Estagiário',
        senha
      });

      if (res && res.success) {
        Alert.alert(
          'Conta Criada com Sucesso!',
          'Seu cadastro foi realizado no sistema. Bem-vindo ao SME Ponto!'
        );
        if (onRegisterSuccess) onRegisterSuccess(res.usuario);
      }
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message ||
        error.message ||
        'Falha ao registrar usuário.';

      Alert.alert('Erro no Cadastro', mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Barra de Navegação Superior */}
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

      {/* Cabeçalho */}
      <View style={styles.headerArea}>
        <Image
          source={{
            uri: 'https://lh3.googleusercontent.com/aida/AEtjO1XK3jxwWmGZjHUXqLey-PO_R5ASBlZsHaWETw9kPz9I1lnRds4EETxOXB-qirbi33diAyWCbZZiW4WebVjAY8tcaWS-03xAUu2QNiCRz4l9bj3quBLOYJK3RfHzx8mlmdHULiD7zA7QWXEple_385pqtJf9UhLnGS2ELrCcp3uZotX7W3bT0DjtMC9ierMGgv9h9ngmJ_nuLwSWZ1CQH2stNJBoOH_fwSCzSBS3euEHdq716whfjR5k4g'
          }}
          style={styles.logo}
        />
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>
          Preencha seus dados para solicitar o acesso ao sistema.
        </Text>
      </View>

      {/* Formulário Simplificado */}
      <View style={styles.form}>
        <Text style={styles.sectionHeading}>Informações do Usuário</Text>

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

        {/* E-mail */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="seu.email@sme.edu.br"
              placeholderTextColor={colors.outlineVariant}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Cargo / Função */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Cargo / Função</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={cargo}
              onChangeText={setCargo}
              placeholder="Ex: Estagiário de TI"
              placeholderTextColor={colors.outlineVariant}
            />
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
                placeholder="Digite sua senha"
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
              <Text style={styles.submitBtnText}>Concluir Cadastro</Text>
              <Text style={styles.submitBtnCheck}>✓</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Link para Fazer Login */}
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
    marginBottom: 20
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
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: 14,
    height: 50,
    gap: 8,
    marginTop: 12,
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