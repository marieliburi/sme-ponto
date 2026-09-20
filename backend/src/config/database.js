// OBRIGATÓRIO: dotenv na primeiríssima linha do arquivo
require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

let isLiveDb = false;
let pool = null;

// Verifica se a URL do banco existe e se não é o placeholder padrão
if (connectionString && !connectionString.includes('yourpassword')) {
  try {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false // Necessário para conexões SSL com o Supabase
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('[DB] Erro assíncrono no pool PostgreSQL:', err.message);
    });

    // Teste inicial de conectividade síncrono no carregamento do módulo
    pool.query('SELECT NOW()')
      .then((res) => {
        isLiveDb = true;
        console.log('✅ [DB] Conectado com sucesso ao Supabase PostgreSQL! Horário do servidor:', res.rows[0].now);
      })
      .catch((err) => {
        isLiveDb = false;
        console.warn('⚠️ [DB] Erro de autenticação/conexão com Supabase:', err.message);
        console.warn('ℹ️ [DB] Operando em modo em memória demonstrativo temporário.');
      });

  } catch (error) {
    console.warn('⚠️ [DB] Não foi possível inicializar o pool:', error.message);
    isLiveDb = false;
  }
} else {
  console.log('ℹ️ [DB] DATABASE_URL não encontrada no .env ou é inválida. Operando em modo de demonstração.');
}

// Armazenamento em memória para contingência / desenvolvimento
const memoryStore = {
  usuarios: [
    {
      id: 'usr-lucas-01',
      nome: 'Lucas Ferreira Santos',
      email: 'lucas.ferreira@sme.edu.br',
      senha_hash: '$2a$10$wN9aWlq7wBfWvjYl4fEWeeOaT8Xh0.lW9u7S3w1sP8qXzQWbV9bCy', // hash de "123456"
      cargo: 'Estagiário de TI',
      criado_em: new Date('2025-01-10T08:00:00Z')
    }
  ],
  registros_ponto: [],
  justificativas: []
};

// Executor unificado de consultas SQL
async function query(text, params) {
  if (isLiveDb && pool) {
    return pool.query(text, params);
  }
  
  // Se por algum motivo o banco desconectar em tempo de execução, lança erro em vez de retornar null silencioso
  if (connectionString && !isLiveDb) {
    throw new Error('Servidor temporariamente desconectado do banco de dados Supabase.');
  }

  return null;
}

module.exports = {
  query,
  pool,
  isLiveDb: () => isLiveDb,
  memoryStore
};