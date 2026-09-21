import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do IP e da URL Base
const SERVER_IP = '192.168.0.110';
const BASE_URL =
  typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost'
    ? `http://${window.location.hostname}:3000`
    : `http://${SERVER_IP}:3000`;

// Salva e remove o token diretamente no armazenamento físico
export const setAuthToken = async (token) => {
  try {
    if (token) {
      await AsyncStorage.setItem('@token', token);
    } else {
      await AsyncStorage.removeItem('@token');
    }
  } catch (error) {
    console.error('[API] Erro ao salvar token no AsyncStorage:', error);
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('@token');
  } catch {
    return null;
  }
};

// Funçao utilitária para requisições com leitura direta do AsyncStorage
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Busca o token persistido no dispositivo no EXATO momento da requisição
  const token = await AsyncStorage.getItem('@token');

  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const textResponse = await res.text();
    let data;

    try {
      data = textResponse ? JSON.parse(textResponse) : {};
    } catch {
      throw new Error(`Resposta inválida do servidor (${res.status}).`);
    }

    if (!res.ok) {
      const mensagemErro =
        data.message ||
        data.mensagem ||
        data.error ||
        `Erro HTTP ${res.status}`;
      throw new Error(mensagemErro);
    }

    return data;
  } catch (error) {
    console.warn(`[API] Falha em ${endpoint}:`, error.message);
    throw error;
  }
}

// 1. Serviços de Autenticação
export const authService = {
  login: async (email, senha) => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: { email, senha }
    });
    if (res.token) {
      await setAuthToken(res.token);
    }
    return res;
  },

  register: async (userData) => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: userData
    });
    if (res.token) {
      await setAuthToken(res.token);
    }
    return res;
  },

  logout: async () => {
    await setAuthToken(null);
  },

  getMe: async () => {
    return request('/api/auth/me');
  },

  updateProfile: async (data) => {
    return request('/api/auth/profile', {
      method: 'PUT',
      body: data
    });
  }
};

// 2. Serviços de Ponto Eletrônico
export const pontoService = {
  registrarPonto: async ({ usuario_id, tipo, latitude, longitude, localizacao_nome, tipo_autenticacao }) => {
    return request('/api/ponto/registrar', {
      method: 'POST',
      body: {
        usuario_id,
        tipo,
        latitude,
        longitude,
        localizacao_nome,
        tipo_autenticacao
      }
    });
  },

  getPontosHoje: async () => {
    return request('/api/ponto/hoje');
  },

  getEspelhoMes: async (ano, mes) => {
    const query = new URLSearchParams();
    if (ano) query.append('ano', ano);
    if (mes) query.append('mes', mes);
    const queryString = query.toString();
    return request(`/api/ponto/mes${queryString ? `?${queryString}` : ''}`);
  }
};