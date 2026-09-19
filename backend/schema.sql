-- ========================================================
-- Schema do Banco de Dados PostgreSQL - Supabase
-- Projeto: Sistema de Ponto SME (Secretaria Municipal de Educação)
-- Tabelas: usuarios, registros_ponto, justificativas
-- ========================================================

-- Habilitar extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE USUÁRIOS (Estagiários e Servidores)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    matricula VARCHAR(50) NOT NULL UNIQUE,
    cargo VARCHAR(150) DEFAULT 'Estagiário de TI',
    setor VARCHAR(150) DEFAULT 'SME Central',
    carga_horaria INT DEFAULT 6, -- 4 ou 6 horas diárias (20h ou 30h semanais)
    turno VARCHAR(20) DEFAULT 'morning', -- 'morning' (08h às 14h) ou 'afternoon' (12h às 18h)
    tolerancia_minutos INT DEFAULT 10,
    supervisor_nome VARCHAR(255) DEFAULT 'Amanda Rocha - DRE',
    notificar_supervisor BOOLEAN DEFAULT TRUE,
    biometria_ativa BOOLEAN DEFAULT TRUE,
    foto_url TEXT DEFAULT 'https://lh3.googleusercontent.com/aida/AEtjO1UfhhXpM3nc6tDxGO2q633Gnc5QSvNNPc6KExhWNfrzF9m6f5ywhkvo77zt3xkBJmGDJu1PQ9vL9esM8oUoIwYoG-SLmR608R4H7liAKX-89iIt6iw5nU12rASwLDEOcutkVHhh_C8kClp3PwnsXVqcC0Bcgg5YwNn4t6eZSrC-9VFDLORfmCUyf326jK0vBbn85c3V-3NDRfvZHWs_pID2qWA_QVcOSpHp-dv5pF0WMzJ4z_B_eqBvW_g',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE REGISTROS DE PONTO (Batidas diárias com GPS e Biometria)
CREATE TABLE IF NOT EXISTS registros_ponto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- 'entrada', 'saida_almoco', 'retorno_almoco', 'saida_final'
    horario_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_registro DATE DEFAULT CURRENT_DATE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    localizacao_nome VARCHAR(255) DEFAULT 'SME Prédio Central',
    gps_confirmado BOOLEAN DEFAULT TRUE,
    tipo_autenticacao VARCHAR(50) DEFAULT 'biometria', -- 'biometria', 'manual', 'pin'
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE JUSTIFICATIVAS E ATESTADOS
CREATE TABLE IF NOT EXISTS justificativas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    protocolo VARCHAR(50) NOT NULL UNIQUE, -- Ex: 'R-408' ou 'JST-20250919-XXXX'
    tipo VARCHAR(100) NOT NULL, -- 'Atestado Médico / Odontológico', 'Declaração Escolar / Prova Universitária', 'Problema Técnico de Biometria / GPS', 'Outros Afastamentos Legais'
    data_ocorrencia DATE NOT NULL,
    descricao TEXT NOT NULL,
    anexo_nome VARCHAR(255),
    anexo_url TEXT,
    anexo_tamanho VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Em Análise', -- 'Em Análise', 'Aprovado', 'Rejeitado'
    supervisor_nome VARCHAR(255) DEFAULT 'Amanda Rocha',
    resposta_supervisor TEXT,
    data_homologacao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_registros_usuario_data ON registros_ponto(usuario_id, data_registro);
CREATE INDEX IF NOT EXISTS idx_justificativas_usuario ON justificativas(usuario_id);
