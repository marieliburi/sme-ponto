import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { colors } from '../theme/colors';
import { authService } from '../services/api';

export default function PerfilScreen({ usuario, onLogout, onUpdateUsuario }) {
  const [turno, setTurno] = useState(usuario?.turno || 'morning');
  const [notificarSupervisor, setNotificarSupervisor] = useState(
    usuario?.notificar_supervisor !== undefined ? usuario.notificar_supervisor : true
  );
  const [biometriaAtiva, setBiometriaAtiva] = useState(
    usuario?.biometria_ativa !== undefined ? usuario.biometria_ativa : true
  );
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSalvarPerfil = async () => {
    try {
      setSaving(true);
      const res = await authService.updateProfile({
        turno,
        notificar_supervisor: notificarSupervisor
      });

      if (res.success) {
        if (onUpdateUsuario) onUpdateUsuario(res.usuario);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3500);
      }
    } catch (error) {
      Alert.alert('Erro ao Salvar', error.message || 'Falha ao atualizar dados do perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleRecadastrarBiometria = async () => {
    Alert.alert(
      'Recadastrar Biometria',
      'Deseja atualizar a impressão digital cadastrada para validação de ponto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Leitura',
          onPress: async () => {
            await authService.recadastrarBiometria(true);
            setBiometriaAtiva(true);
            Alert.alert('Sucesso', 'Nova biometria digital vinculada ao seu registro funcional!');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header Card: Perfil do Estagiário */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.profileAvatarBox}>
          <Image
            source={{
              uri:
                usuario?.foto_url ||
                'https://lh3.googleusercontent.com/aida/AEtjO1UfhhXpM3nc6tDxGO2q633Gnc5QSvNNPc6KExhWNfrzF9m6f5ywhkvo77zt3xkBJmGDJu1PQ9vL9esM8oUoIwYoG-SLmR608R4H7liAKX-89iIt6iw5nU12rASwLDEOcutkVHhh_C8kClp3PwnsXVqcC0Bcgg5YwNn4t6eZSrC-9VFDLORfmCUyf326jK0vBbn85c3V-3NDRfvZHWs_pID2qWA_QVcOSpHp-dv5pF0WMzJ4z_B_eqBvW_g'
            }}
            style={styles.profileAvatar}
          />
          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={() => Alert.alert('Alterar Foto', 'Acesso à câmera liberado para foto de perfil.')}
          >
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfoCol}>
          <Text style={styles.profileName}>{usuario?.nome || 'Lucas Ferreira Santos'}</Text>
          <Text style={styles.profileMatricula}>
            Matrícula: <Text style={styles.bold}>{usuario?.matricula || 'EST-2025-9482'}</Text>
          </Text>

          <View style={styles.roleBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.roleBadgeText}>
              {usuario?.cargo || 'Estagiário de TI'} • {usuario?.setor || 'SME Sede'}
            </Text>
          </View>
        </View>
      </View>

      {/* Seção 1: Dados Cadastrais */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Dados Cadastrais</Text>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>CPF</Text>
          <Text style={styles.dataValue}>{usuario?.cpf || '452.891.038-12'}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>E-mail</Text>
          <Text style={styles.dataValue}>{usuario?.email || 'lucas.ferreira@sme.edu.br'}</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Telefone</Text>
          <Text style={styles.dataValue}>(11) 98765-4321</Text>
        </View>

        <View style={[styles.dataRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.dataLabel}>Supervisor DRE</Text>
          <Text style={styles.dataValue}>{usuario?.supervisor_nome || 'Amanda Rocha - DRE'}</Text>
        </View>
      </View>

      {/* Seção 2: Turno & Horário de Estágio */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Turno & Horário de Estágio</Text>
        <Text style={styles.sectionSubtitle}>Selecione sua faixa de atuação diária</Text>

        {/* Turno Manhã */}
        <TouchableOpacity
          style={[styles.shiftCard, turno === 'morning' && styles.shiftCardActive]}
          onPress={() => setTurno('morning')}
          activeOpacity={0.8}
        >
          <View style={styles.shiftLeft}>
            <Text style={styles.shiftIcon}>🌅</Text>
            <View>
              <Text style={styles.shiftTitle}>Turno Manhã (08:00 às 14:00)</Text>
              <Text style={styles.shiftDesc}>6 horas diárias • Intervalo às 12:00</Text>
            </View>
          </View>
          <View style={[styles.shiftRadio, turno === 'morning' && styles.shiftRadioActive]}>
            {turno === 'morning' && <Text style={styles.shiftCheckIcon}>✓</Text>}
          </View>
        </TouchableOpacity>

        {/* Turno Tarde */}
        <TouchableOpacity
          style={[styles.shiftCard, turno === 'afternoon' && styles.shiftCardActive]}
          onPress={() => setTurno('afternoon')}
          activeOpacity={0.8}
        >
          <View style={styles.shiftLeft}>
            <Text style={styles.shiftIcon}>🌇</Text>
            <View>
              <Text style={styles.shiftTitle}>Turno Tarde (12:00 às 18:00)</Text>
              <Text style={styles.shiftDesc}>6 horas diárias • Intervalo às 15:00</Text>
            </View>
          </View>
          <View style={[styles.shiftRadio, turno === 'afternoon' && styles.shiftRadioActive]}>
            {turno === 'afternoon' && <Text style={styles.shiftCheckIcon}>✓</Text>}
          </View>
        </TouchableOpacity>

        {/* Tolerância e Notificações */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>Notificar supervisor em atraso</Text>
            <Text style={styles.toggleDesc}>Tolerância regulamentar de 10 minutos</Text>
          </View>
          <Switch
            value={notificarSupervisor}
            onValueChange={setNotificarSupervisor}
            trackColor={{ false: colors.surfaceContainerHighest, true: colors.secondary }}
            thumbColor={colors.surfaceContainerLowest}
          />
        </View>
      </View>

      {/* Seção 3: Horas Extras & Excedente */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Horas Extras & Excedente</Text>
        <View style={styles.bancoHeaderRow}>
          <View>
            <Text style={styles.bancoNumber}>+04h 15m</Text>
            <Text style={styles.bancoDesc}>Saldo credor no banco de horas</Text>
          </View>
          <View style={styles.bancoBadge}>
            <Text style={styles.bancoBadgeText}>Dentro do limite legal</Text>
          </View>
        </View>
        <Text style={styles.legalNotice}>
          Conforme a Lei de Estágio (Lei 11.788/08), o limite diário de atividades não pode exceder 2 horas além da carga pactuada.
        </Text>
      </View>

      {/* Seção 4: Segurança & Autenticação */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Segurança & Autenticação</Text>

        {/* Biometria */}
        <View style={styles.securityRow}>
          <View style={styles.secLeft}>
            <Text style={styles.secEmoji}>🖲️</Text>
            <View>
              <Text style={styles.secTitle}>Biometria Digital</Text>
              <Text style={styles.secDesc}>
                {biometriaAtiva ? 'Ativa e vinculada a este aparelho' : 'Desativada'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.secActionBtn} onPress={handleRecadastrarBiometria}>
            <Text style={styles.secActionBtnText}>Recadastrar</Text>
          </TouchableOpacity>
        </View>

        {/* Senha */}
        <View style={[styles.securityRow, { borderBottomWidth: 0 }]}>
          <View style={styles.secLeft}>
            <Text style={styles.secEmoji}>🔑</Text>
            <View>
              <Text style={styles.secTitle}>Credencial do Portal</Text>
              <Text style={styles.secDesc}>Última alteração há 42 dias</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.secActionBtn}
            onPress={() => Alert.alert('Alterar Senha', 'Link de alteração de senha enviado ao seu e-mail funcional.')}
          >
            <Text style={styles.secActionBtnText}>Alterar Senha</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Toast Feedback */}
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ Configurações e turno salvos com sucesso!</Text>
        </View>
      )}

      {/* Botões de Ação */}
      <View style={styles.actionsCol}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSalvarPerfil}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <>
              <Text style={styles.saveBtnIcon}>✓</Text>
              <Text style={styles.saveBtnText}>Salvar Alterações do Perfil</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.85}>
          <Text style={styles.logoutBtnIcon}>⎋</Text>
          <Text style={styles.logoutBtnText}>Desconectar / Sair da Conta</Text>
        </TouchableOpacity>
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
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
    gap: 14
  },
  profileAvatarBox: {
    position: 'relative'
  },
  profileAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest
  },
  cameraIcon: {
    fontSize: 11
  },
  profileInfoCol: {
    flex: 1
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 2
  },
  profileMatricula: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginBottom: 6
  },
  bold: {
    fontWeight: '700',
    color: colors.onSurface
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    gap: 4
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.onSecondaryContainer,
    textTransform: 'uppercase'
  },
  sectionCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 4
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginBottom: 12
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerLow
  },
  dataLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant
  },
  dataValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface
  },
  shiftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  shiftCardActive: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.secondary
  },
  shiftLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  shiftIcon: {
    fontSize: 18
  },
  shiftTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurface
  },
  shiftDesc: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    marginTop: 1
  },
  shiftRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center'
  },
  shiftRadioActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary
  },
  shiftCheckIcon: {
    color: colors.onSecondary,
    fontSize: 12,
    fontWeight: 'bold'
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerLow
  },
  toggleTextCol: {
    flex: 1
  },
  toggleTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface
  },
  toggleDesc: {
    fontSize: 10,
    color: colors.onSurfaceVariant
  },
  bancoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6
  },
  bancoNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.secondary
  },
  bancoDesc: {
    fontSize: 10,
    color: colors.onSurfaceVariant
  },
  bancoBadge: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  bancoBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.onSecondaryContainer
  },
  legalNotice: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    lineHeight: 14,
    marginTop: 6
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerLow
  },
  secLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  secEmoji: {
    fontSize: 18
  },
  secTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface
  },
  secDesc: {
    fontSize: 10,
    color: colors.onSurfaceVariant
  },
  secActionBtn: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  secActionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurface
  },
  toast: {
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10
  },
  toastText: {
    color: colors.onSecondary,
    fontSize: 12,
    fontWeight: '700'
  },
  actionsCol: {
    gap: 10,
    marginTop: 4
  },
  saveBtn: {
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
  saveBtnIcon: {
    fontSize: 14,
    color: colors.secondaryFixed,
    fontWeight: 'bold'
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onPrimary
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 14,
    height: 48,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.surfaceContainer
  },
  logoutBtnIcon: {
    fontSize: 16,
    color: colors.error
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.error
  }
});
