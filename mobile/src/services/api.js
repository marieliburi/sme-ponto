import AsyncStorage from '@react-native-async-storage/async-storage';

// Cliente API para o Backend do Sistema de Ponto SME
const SERVER_IP = '192.168.0.110';
const BASE_URL = typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost'
  ? `http://${window.location.hostname}:3000`
  : `http://${SERVER_IP}:3000`;

let authToken = null;

export const setAuthToken = async (token) => {
  authToken = token;
  if (token) {
    await AsyncStorage.setItem('@token', token);
  } else {
    await AsyncStorage.removeItem('@token');
  }
};

export const getAuthToken = () => authToken;

// Utilitário para carregar o token salvo ao abrir o app
export const carregarTokenSalvo = async () => {
  try {
    const token = await AsyncStorage.getItem('@token');
    if (token) {
      authToken = token;
    }
    return token;
  } catch (error) {
    console.warn('[API] Erro ao carregar token do AsyncStorage:', error);
    return null;
  }
};

// Utilitário de requisição HTTP nativo via fetch
async function request(endpoint, options = {}) {
  // Garante que tentará recuperar o token se ele estiver nulo na memória
  if (!authToken) {
    authToken = await AsyncStorage.getItem('@token');
  }

  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    Accept: 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers
  };

  // Se o corpo não for FormData (envio de arquivo), define como JSON
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, { ...options, headers });

    // 1. Tenta converter a resposta para texto primeiro (evita erro de parse JSON se for HTML)
    const textResponse = await res.text();
    let data;

    try {
      data = textResponse ? JSON.parse(textResponse) : {};
    } catch (parseError) {
      // Se não for JSON, o servidor enviou HTML de erro ou texto puro
      throw new Error(`Resposta inválida do servidor (${res.status}): ${textResponse.slice(0, 100)}`);
    }

    // 2. Trata retornos de erro da API (HTTP status 4xx e 5xx)
    if (!res.ok) {
      const mensagemErro =
        data.message ||
        data.mensagem ||
        data.error ||
        `Erro HTTP ${res.status}`;

      const errorObj = new Error(mensagemErro);
      errorObj.status = res.status;
      errorObj.data = data;
      throw errorObj;
    }

    return data;
  } catch (error) {
    console.warn(`[API] Falha em ${endpoint}:`, error.message);
    // Re-lança o erro tratado para ser capturado pela tela que fez a chamada
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
  registrarPonto: async ({ tipo, latitude, longitude, localizacao_nome, tipo_autenticacao }) => {
    return request('/api/ponto/registrar', {
      method: 'POST',
      body: {
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
  },

  getRelatorioPdfUrl: (ano, mes) => {
    const query = new URLSearchParams();
    if (ano) query.append('ano', ano);
    if (mes) query.append('mes', mes);
    const queryString = query.toString();
    return `${BASE_URL}/api/ponto/relatorio-pdf${queryString ? `?${queryString}` : ''}`;
  }
};

// 3. Serviços de Justificativas e Atestados
export const anexoService = {
  criarJustificativa: async (formData) => {
    return request('/api/justificativas', {
      method: 'POST',
      body: formData // Envia como Multipart FormData
    });
  },

  listarJustificativas: async () => {
    return request('/api/justificativas');
  },

  getJustificativaById: async (id) => {
    return request(`/api/justificativas/${id}`);
  }
};