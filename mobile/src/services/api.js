// Cliente API para o Backend do Sistema de Ponto SME
// Configurado com o IP local do seu computador para acesso pelo celular via Wi-Fi
const SERVER_IP = '192.168.0.123';
const BASE_URL = typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost'
  ? `http://${window.location.hostname}:3000`
  : `http://${SERVER_IP}:3000`;

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

// Utilitário de requisição HTTP com injeção automática de JWT
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    Accept: 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers
  };

  // Se não for FormData, envia como JSON
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Erro HTTP ${res.status}`);
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
    if (res.token) setAuthToken(res.token);
    return res;
  },

  biometricLogin: async (email) => {
    const res = await request('/api/auth/biometric-login', {
      method: 'POST',
      body: { email }
    });
    if (res.token) setAuthToken(res.token);
    return res;
  },

  register: async (userData) => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: userData
    });
    if (res.token) setAuthToken(res.token);
    return res;
  },

  getMe: async () => {
    return request('/api/auth/me');
  },

  updateProfile: async (data) => {
    return request('/api/auth/profile', {
      method: 'PUT',
      body: data
    });
  },

  recadastrarBiometria: async (ativa = true) => {
    return request('/api/auth/recadastrar-biometria', {
      method: 'POST',
      body: { ativa }
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
    return request(`/api/ponto/mes?${query.toString()}`);
  },

  getRelatorioPdfUrl: (ano, mes) => {
    return `${BASE_URL}/api/ponto/relatorio-pdf?ano=${ano || ''}&mes=${mes || ''}`;
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
