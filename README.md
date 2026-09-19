# Sistema de Ponto SME - Estágio

Sistema completo de controle de ponto eletrônico para estagiários da Rede Municipal de Ensino (SME), com autenticação biométrica via dispositivo móvel, validação de geolocalização por satélite (GPS), contador ativo em tempo real, espelho de ponto diário e envio de atestados/justificativas.

O projeto foi rigorosamente estruturado e desenvolvido com base nos layouts do **Google Stitch** e no banco de dados **PostgreSQL do Supabase**.

---

## 📁 Estrutura do Projeto

```text
sme-ponto/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Conexão Supabase PostgreSQL (pg Pool) com fallback mock
│   │   ├── controllers/
│   │   │   ├── authController.js    # Login, JWT, Biometria, Registro e Perfil
│   │   │   ├── pontoController.js   # Batida de ponto (GPS, Entrada/Saída, Espelho e PDF)
│   │   │   └── anexoController.js   # Upload e gestão de atestados e justificativas
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js    # Proteção de rotas com validação de JWT
│   │   │   └── uploadMiddleware.js  # Multer (PDF, JPG, PNG até 10MB)
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # /api/auth
│   │   │   ├── pontoRoutes.js       # /api/ponto
│   │   │   └── anexoRoutes.js       # /api/justificativas
│   │   └── app.js                   # Servidor Express, CORS, Estáticos
│   ├── uploads/                     # Armazenamento de anexos enviados
│   ├── schema.sql                   # Definição das tabelas Supabase (usuarios, registros_ponto, justificativas)
│   ├── .env.example                 # Exemplo de variáveis de ambiente
│   ├── .env                         # Configurações ativas
│   └── package.json
└── mobile/
    ├── assets/                      # Logotipo SME Ponto, avatares Lucas e supervisora Amanda
    ├── src/
    │   ├── theme/
    │   │   └── colors.js            # Design tokens e paleta fiel extraída do Tailwind do Stitch
    │   ├── components/
    │   │   ├── BotaoBiometria.js    # Botão de biometria com anéis concêntricos e GPS ativo
    │   │   ├── ContadorAtivo.js     # Cronômetro em tempo real calculando horas trabalhadas
    │   │   ├── CardPonto.js         # Cards de slots diários de batida (1ª, 2ª, 3ª, 4ª)
    │   │   ├── StatusBadge.js       # Badges de status (Confirmado, Pendente, Análise)
    │   │   └── BottomNav.js         # Barra de navegação inferior com as 4 abas
    │   ├── screens/
    │   │   ├── LoginScreen.js       # 1-login: Login institucional e biometria rápida
    │   │   ├── InicioScreen.js      # 2-inicio: Dashboard, contador, batida GPS e timeline
    │   │   ├── RelatorioScreen.js   # 3.relatorio: Espelho de ponto, filtro e exportação PDF
    │   │   ├── AtestadoScreen.js    # 4-atestado: Envio de comprovante/atestado e protocolo R-408
    │   │   ├── CriarContaScreen.js  # 5-criar_conta: Cadastro de estagiário com ativação biométrica
    │   │   └── PerfilScreen.js      # 6-perfil: Dados cadastrais, turno, banco de horas e logout
    │   ├── services/
    │   │   ├── api.js               # Cliente HTTP com injeção automática de Bearer Token JWT
    │   │   ├── locationService.js   # Captura e validação de coordenadas GPS (SME Central)
    │   │   └── bioService.js         # Validação de digital do aparelho
    │   └── App.js                   # Componente raiz com navegação e estado de sessão
    ├── App.js                       # Entrypoint padrão
    └── package.json
```

---

## 🗄️ 1. Configuração do Supabase PostgreSQL

O arquivo `backend/schema.sql` contém a estrutura das 3 tabelas criadas no Supabase:
1. `usuarios`: armazena dados cadastrais, matrícula funcional, hash bcrypt da senha, turno e ativação biométrica.
2. `registros_ponto`: registra cada batida com timestamp, tipo (`entrada`, `saida_almoco`, etc.), latitude, longitude e status GPS.
3. `justificativas`: gerencia envio de atestados com protocolo institucional (`R-408`), status de homologação e supervisor.

Para conectar o backend ao seu Supabase:
1. Acesse o dashboard do seu projeto no Supabase: **Settings > Database > Connection string > URI**.
2. Abra o arquivo `backend/.env` e configure:
```env
DATABASE_URL=postgresql://postgres:[SUA_SENHA]@db.[REF_DO_PROJETO].supabase.co:5432/postgres?sslmode=require
```

> **Nota:** Se a `DATABASE_URL` não for configurada de imediato, o backend roda automaticamente em modo de demonstração com persistência em memória, permitindo testar e navegar por todas as funcionalidades sem bloqueios.

---

## 🚀 2. Como Executar o Backend

```bash
cd /home/marieli/sme-ponto/backend
npm start
```

O servidor iniciará em `http://localhost:3000`:
- **Health Check:** `GET http://localhost:3000/api/health`
- **Registro:** `POST http://localhost:3000/api/auth/register`
- **Login:** `POST http://localhost:3000/api/auth/login`
- **Batida de Ponto:** `POST http://localhost:3000/api/ponto/registrar`
- **Pontos do Dia:** `GET http://localhost:3000/api/ponto/hoje`
- **Espelho Mensal:** `GET http://localhost:3000/api/ponto/mes`
- **Exportação de PDF:** `GET http://localhost:3000/api/ponto/relatorio-pdf`
- **Envio de Atestados:** `POST http://localhost:3000/api/justificativas`

---

## 📱 3. Como Executar o Mobile

O projeto mobile foi desenvolvido em React Native / Expo:

```bash
cd /home/marieli/sme-ponto/mobile
npm install
npx expo start
```

Você pode visualizar no navegador apertando `w`, ou escanear o QR Code no app **Expo Go** em seu aparelho Android ou iOS.

---

## 🎨 4. Design System e Telas do Stitch Integradas

Todas as 6 pastas de `/home/marieli/Documentos/stitch-screens` foram replicadas com precisão:
- **Cores Oficiais:** Verde SME `#006c49`, fundo suave `#f8f9ff`, cartões `#ffffff` e destaques `#6cf8bb`.
- **Botão Biométrico:** Anéis concêntricos pulsantes, ícone digital e indicador de GPS ativo com precisão métrica.
- **Contador em Tempo Real:** Relógio digital ativo calculando segundos decorridos desde a primeira batida.
- **Espelho de Ponto:** Navegação mensal (`Outubro 2024`), filtros rápidos e geração de espelho institucional assinado.
- **Upload de Documentos:** Suporte a comprovantes em PDF, JPG e PNG com preview e protocolo imediato.
