const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

let isLiveDb = false;
let pool = null;

// Tenta configurar a conexão com o PostgreSQL do Supabase
if (connectionString && !connectionString.includes('yourpassword')) {
  try {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false // Necessário para conexões SSL com Supabase
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[DB] Erro no pool PostgreSQL:', err.message);
    });

    // Teste inicial de conectividade
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.warn('⚠️ [DB] Aviso de conexão com Supabase:', err.message);
        console.warn('ℹ️ [DB] O backend utilizará armazenamento em memória demonstrativo até que uma DATABASE_URL válida seja configurada no .env.');
        isLiveDb = false;
      } else {
        isLiveDb = true;
        console.log('✅ [DB] Conectado com sucesso ao Supabase PostgreSQL! Horário do servidor:', res.rows[0].now);
      }
    });
  } catch (error) {
    console.warn('⚠️ [DB] Não foi possível inicializar pool:', error.message);
    isLiveDb = false;
  }
} else {
  console.log('ℹ️ [DB] DATABASE_URL contém placeholder ou não foi configurada. Operando em modo de demonstração com persistência em memória.');
}

// Armazenamento em memória para modo mock / desenvolvimento
const memoryStore = {
  usuarios: [
    {
      id: 'usr-lucas-01',
      nome: 'Lucas Ferreira Santos',
      email: 'lucas.ferreira@sme.edu.br',
      senha: '$2a$10$wN9aWlq7wBfWvjYl4fEWeeOaT8Xh0.lW9u7S3w1sP8qXzQWbV9bCy', // hash de "123456"
      cpf: '452.891.038-12',
      matricula: 'EST-2025-9482',
      cargo: 'Estagiário de TI',
      setor: 'SME Central',
      carga_horaria: 6,
      turno: 'morning',
      tolerancia_minutos: 10,
      supervisor_nome: 'Amanda Rocha - DRE',
      notificar_supervisor: true,
      biometria_ativa: true,
      foto_url: 'https://lh3.googleusercontent.com/aida/AEtjO1UfhhXpM3nc6tDxGO2q633Gnc5QSvNNPc6KExhWNfrzF9m6f5ywhkvo77zt3xkBJmGDJu1PQ9vL9esM8oUoIwYoG-SLmR608R4H7liAKX-89iIt6iw5nU12rASwLDEOcutkVHhh_C8kClp3PwnsXVqcC0Bcgg5YwNn4t6eZSrC-9VFDLORfmCUyf326jK0vBbn85c3V-3NDRfvZHWs_pID2qWA_QVcOSpHp-dv5pF0WMzJ4z_B_eqBvW_g',
      created_at: new Date('2025-01-10T08:00:00Z')
    }
  ],
  registros_ponto: [
    {
      id: 'reg-001',
      usuario_id: 'usr-lucas-01',
      tipo: 'entrada',
      horario_registro: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
      data_registro: new Date().toISOString().split('T')[0],
      latitude: -23.550520,
      longitude: -46.633308,
      localizacao_nome: 'SME Prédio Central',
      gps_confirmado: true,
      tipo_autenticacao: 'biometria',
      observacao: 'Batida validada biometricamente'
    }
  ],
  justificativas: [
    {
      id: 'jst-408',
      usuario_id: 'usr-lucas-01',
      protocolo: 'R-408',
      tipo: 'Atestado Médico / Odontológico',
      data_ocorrencia: '2025-09-22',
      descricao: 'Consulta médica oftalmológica de rotina com dilatação de pupila impossibilitando o trabalho na tela.',
      anexo_nome: 'atestado_medico_22set.pdf',
      anexo_url: '/uploads/atestado_medico_22set.pdf',
      anexo_tamanho: '1.4 MB',
      status: 'Em Análise',
      supervisor_nome: 'Amanda Rocha',
      resposta_supervisor: null,
      created_at: new Date('2025-09-22T14:30:00Z').toISOString()
    }
  ]
};

async function query(text, params) {
  if (isLiveDb && pool) {
    return pool.query(text, params);
  }
  return null;
}

module.exports = {
  query,
  pool,
  isLiveDb: () => isLiveDb,
  memoryStore
};
