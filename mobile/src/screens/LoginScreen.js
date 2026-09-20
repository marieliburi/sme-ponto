import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { colors } from '../theme/colors';
import { authService, setAuthToken } from '../services/api';

export default function LoginScreen({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login tradicional via API
  const handleLogin = async () => {
    const emailFormatado = email.trim().toLowerCase();

    if (!emailFormatado || !senha) {
      Alert.alert('Campos obrigatórios', 'Por favor, informe seu e-mail e senha.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.login(emailFormatado, senha);
      
      if (res && res.usuario) {
        // Garante que o token persistirá no estado do serviço da API e armazenamento local
        if (res.token) {
          await setAuthToken(res.token);
        }
        onLoginSuccess(res.usuario, res.token);
      } else {
        Alert.alert('Erro', 'Resposta inválida do servidor.');
      }
    } catch (error) {
      // Captura mensagens de erro de resposta do servidor ou exceções gerais de rede
      const mensagemErro =
        error.message ||
        error.mensagem ||
        'E-mail ou senha incorretos. Verifique seus dados.';
      
      Alert.alert('Falha no Login', mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Top Brand Area */}
      <View style={styles.brandArea}>
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida/AEtjO1XK3jxwWmGZjHUXqLey-PO_R5ASBlZsHaWETw9kPz9I1lnRds4EETxOXB-qirbi33diAyWCbZZiW4WebVjAY8tcaWS-03xAUu2QNiCRz4l9bj3quBLOYJK3RfHzx8mlmdHULiD7zA7QWXEple_385pqtJf9UhLnGS2ELrCcp3uZotX7W3bT0DjtMC9ierMGgv9h9ngmJ_nuLwSWZ1CQH2stNJBoOH_fwSCzSBS3euEHdq716whfjR5k4g'
            }}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.logoActiveIndicator}>
            <View style={styles.activeDot} />
          </View>
        </View>

        <View style={styles.deptBadge}>
          <Text style={styles.deptBadgeIcon}>✓</Text>
          <Text style={styles.deptBadgeText}>SECRETARIA MUNICIPAL DE EDUCAÇÃO / SME</Text>
        </View>

        <Text style={styles.brandTitle}>SME Ponto</Text>
        <Text style={styles.brandSubtitle}>Controle de Ponto do Estagiário</Text>
      </View>

      {/* Welcome Greeting Card */}
      <View style={styles.greetingCard}>
        <View style={styles.greetingIconContainer}>
          <Text style={styles.greetingEmoji}>👋</Text>
        </View>
        <View style={styles.greetingTextCol}>
          <Text style={styles.greetingTitle}>Bem-vindo de volta!</Text>
          <Text style={styles.greetingDesc}>
            Acesse sua conta com suas credenciais institucionais para registrar sua jornada.
          </Text>
        </View>
      </View>

      {/* Login Form */}
      <View style={styles.form}>
        {/* Email Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="seu.email@sme.edu.br"
              placeholderTextColor={colors.outlineVariant}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Password Field */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Senha</Text>
            <TouchableOpacity onPress={() => Alert.alert('Recuperar Senha', 'Procure a administração para resetar sua senha.')}>
              <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor={colors.outlineVariant}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPassBtn}>
              <Text style={styles.showPassIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão Entrar */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Entrar</Text>
              <Text style={styles.submitButtonArrow}>➔</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Link Criar Conta */}
        <View style={styles.signupPrompt}>
          <Text style={styles.signupText}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={onNavigateToRegister}>
            <Text style={styles.signupLink}>Solicitar Acesso</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Badge Footer */}
      <View style={styles.securityBadge}>
        <Text style={styles.secShieldIcon}>🛡️</Text>
        <Text style={styles.secBadgeText}>Ambiente Seguro SME - Versão 1.4.2</Text>
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
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 40
  },
  brandArea: {
    alignItems: 'center',
    marginBottom: 20
  },
  logoContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 14
  },
  logoActiveIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary
  },
  deptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    marginBottom: 8,
    gap: 4
  },
  deptBadgeIcon: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: 'bold'
  },
  deptBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.5
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginTop: 2
  },
  greetingCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    alignItems: 'flex-start',
    gap: 12
  },
  greetingIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center'
  },
  greetingEmoji: {
    fontSize: 20
  },
  greetingTextCol: {
    flex: 1
  },
  greetingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 2
  },
  greetingDesc: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    lineHeight: 17
  },
  form: {
    gap: 14
  },
  fieldGroup: {
    gap: 6
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurface
  },
  forgotPassword: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    height: 50,
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
    fontSize: 14,
    color: colors.onSurface,
    height: '100%'
  },
  showPassBtn: {
    padding: 4
  },
  showPassIcon: {
    fontSize: 16
  },
  submitButton: {
    backgroundColor: colors.primaryContainer,
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3
  },
  submitButtonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '700'
  },
  submitButtonArrow: {
    color: colors.secondaryFixed,
    fontSize: 16,
    fontWeight: 'bold'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12
  },
  signupText: {
    fontSize: 13,
    color: colors.onSurfaceVariant
  },
  signupLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28
  },
  secShieldIcon: {
    fontSize: 12
  },
  secBadgeText: {
    fontSize: 11,
    color: colors.outline,
    fontWeight: '500'
  }
});