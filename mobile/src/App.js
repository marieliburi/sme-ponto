import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
// Importe o SafeAreaView de 'react-native-safe-area-context'
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './theme/colors';

// Import da API configurada no projeto
import api from './services/api';

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
  // Inicializa sem usuário fictício e com a tela de login como primeira tela
  const [usuario, setUsuario] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [loading, setLoading] = useState(true);

  // Verifica se o usuário já possui token ou sessão salva ao abrir o app
  useEffect(() => {
    async function checarSessao() {
      try {
        const token = await AsyncStorage.getItem('@sme_ponto_token');
        const userSaved = await AsyncStorage.getItem('@sme_ponto_user');

        if (token && userSaved) {
          // Define os headers das requisições futuras
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Opcional: Atualiza os dados mais recentes do usuário buscando na API
          const parsedUser = JSON.parse(userSaved);
          const response = await api.get(`/usuarios/${parsedUser.id}`);
          
          setUsuario(response.data || parsedUser);
          setCurrentScreen('home');
        }
      } catch (error) {
        console.warn('Sessão expirada ou não encontrada. Redirecionando para login.');
        await AsyncStorage.multiRemove(['@sme_ponto_token', '@sme_ponto_user']);
      } finally {
        setLoading(false);
      }
    }

    checarSessao();
  }, []);

  // Callbacks de autenticação chamados pelas telas de Login/Cadastro
  const handleLoginSuccess = async (userLogged, token) => {
    try {
      setUsuario(userLogged);
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await AsyncStorage.setItem('@sme_ponto_token', token);
      }
      await AsyncStorage.setItem('@sme_ponto_user', JSON.stringify(userLogged));
      setCurrentScreen('home');
    } catch (error) {
      console.error('Erro ao salvar dados do login:', error);
    }
  };

  const handleRegisterSuccess = (newUser, token) => {
    handleLoginSuccess(newUser, token);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['@sme_ponto_token', '@sme_ponto_user']);
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
    } finally {
      setUsuario(null);
      setCurrentScreen('login');
    }
  };

  // Tela de carregamento enquanto verifica a sessão inicial
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <ActivityIndicator size="large" color={colors.primary || '#1E293B'} />
      </SafeAreaView>
    );
  }

  // Se não estiver logado, renderiza telas públicas
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
            usuario={usuario}
            onNavigateToJustificativa={() => setCurrentScreen('justification')}
          />
        );
      case 'justification':
        return (
          <AtestadoScreen
            usuario={usuario}
            onGoBack={() => setCurrentScreen('home')}
          />
        );
      case 'profile':
        return (
          <PerfilScreen
            usuario={usuario}
            onLogout={handleLogout}
            onUpdateUsuario={async (updated) => {
              setUsuario(updated);
              await AsyncStorage.setItem('@sme_ponto_user', JSON.stringify(updated));
            }}
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
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});