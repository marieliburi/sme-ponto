require('dotenv').config();
const { Pool } = require('pg');

console.log('--- DIAGNÓSTICO DE CONEXÃO COM O BANCO ---');
console.log('1. DATABASE_URL existe?:', process.env.DATABASE_URL ? 'SIM' : 'NÃO');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERRO CRÍTICO: O arquivo .env não foi lido ou a variável DATABASE_URL não existe nele.');
  process.exit(1);
}

// Mascara a senha para exibição no log de forma segura
const urlMascarada = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
console.log('2. URL de Conexão:', urlMascarada);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000
});

async function testar() {
  try {
    console.log('3. Tentando conectar ao Supabase...');
    const res = await pool.query('SELECT current_database(), current_user, NOW()');
    console.log('------------------------------------------');
    console.log('✅ CONEXÃO ESTABELECIDA COM SUCESSO!');
    console.log('📌 Banco de Dados:', res.rows[0].current_database);
    console.log('📌 Usuário Conectado:', res.rows[0].current_user);
    console.log('📌 Horário no Banco:', res.rows[0].now);
    console.log('------------------------------------------');
    
    // Testa consulta na tabela usuarios
    const usuariosRes = await pool.query('SELECT count(*) FROM usuarios');
    console.log(`📊 Tabela "usuarios" encontrada com ${usuariosRes.rows[0].count} registro(s).`);
    
    process.exit(0);
  } catch (err) {
    console.log('------------------------------------------');
    console.error('❌ FALHA AO CONECTAR NO BANCO:');
    console.error('Nome do Erro:', err.name);
    console.error('Código do Erro:', err.code);
    console.error('Mensagem:', err.message);
    console.log('------------------------------------------');
    process.exit(1);
  }
}

testar();