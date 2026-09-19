import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { colors } from './theme/colors';

// Telas
import LoginScreen from './screens/LoginScreen';
import InicioScreen from './screens/InicioScreen';
import RelatorioScreen from './screens/RelatorioScreen';
import AtestadoScreen from './screens/AtestadoScreen';
import CriarContaScreen from './screens/CriarContaScreen';
import PerfilScreen from './screens/PerfilScreen';

// Componente de Navegação Inferior
import BottomNav from './components/BottomNav';

export default function App() {
  // Estado de Autenticação
  const [usuario, setUsuario] = useState({
    id: 'usr-lucas-01',
    nome: 'Lucas Ferreira Santos',
    email: 'lucas.ferreira@sme.edu.br',
    cpf: '452.891.038-12',
    matricula: 'EST-2025-9482',
    cargo: 'Estagiário de TI',
    setor: 'SME Sede Central',
    carga_horaria: 6,
    turno: 'morning',
    supervisor_nome: 'Amanda Rocha - DRE',
    notificar_supervisor: true,
    biometria_ativa: true,
    foto_url:
      'https://lh3.googleusercontent.com/aida/AEtjO1UfhhXpM3nc6tDxGO2q633Gnc5QSvNNPc6KExhWNfrzF9m6f5ywhkvo77zt3xkBJmGDJu1PQ9vL9esM8oUoIwYoG-SLmR608R4H7liAKX-89iIt6iw5nU12rASwLDEOcutkVHhh_C8kClp3PwnsXVqcC0Bcgg5YwNn4t6eZSrC-9VFDLORfmCUyf326jK0vBbn85c3V-3NDRfvZHWs_pID2qWA_QVcOSpHp-dv5pF0WMzJ4z_B_eqBvW_g'
  });

  // Telas públicas: 'login' | 'register'
  // Telas autenticadas: 'home' | 'timesheet' | 'justification' | 'profile'
  const [currentScreen, setCurrentScreen] = useState('home');

  // Callbacks de autenticação
  const handleLoginSuccess = (userLogged) => {
    setUsuario(userLogged);
    setCurrentScreen('home');
  };

  const handleRegisterSuccess = (newUser) => {
    setUsuario(newUser);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setUsuario(null);
    setCurrentScreen('login');
  };

  // Se não estiver logado
  if (!usuario) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        {currentScreen === 'register' ? (
          <CriarContaScreen
            onGoBack={() => setCurrentScreen('login')}
            onRegisterSuccess={handleRegisterSuccess}
          />
        ) : (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentScreen('register')}
          />
        )}
      </SafeAreaView>
    );
  }

  // Renderização da tela autenticada ativa
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <InicioScreen
            usuario={usuario}
            onNavigateToJustificativa={() => setCurrentScreen('justification')}
          />
        );
      case 'timesheet':
        return (
          <RelatorioScreen
            onNavigateToJustificativa={() => setCurrentScreen('justification')}
          />
        );
      case 'justification':
        return (
          <AtestadoScreen
            onGoBack={() => setCurrentScreen('home')}
          />
        );
      case 'profile':
        return (
          <PerfilScreen
            usuario={usuario}
            onLogout={handleLogout}
            onUpdateUsuario={(updated) => setUsuario(updated)}
          />
        );
      default:
        return (
          <InicioScreen
            usuario={usuario}
            onNavigateToJustificativa={() => setCurrentScreen('justification')}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.content}>{renderScreen()}</View>
      <BottomNav
        activeTab={currentScreen}
        onSelectTab={(tabId) => setCurrentScreen(tabId)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface
  },
  content: {
    flex: 1
  }
});
