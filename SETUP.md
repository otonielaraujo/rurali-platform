# RURALI - Guia de Configuração

## 🚀 Deploy Rápido

### 1. Clone o Repositório
```bash
git clone https://github.com/otonielaraujo/rurali-platform.git
cd rurali-platform
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure o Banco de Dados
```bash
# Configure a variável de ambiente com sua conexão PostgreSQL
export DATABASE_URL="postgresql://username:password@localhost:5432/rurali"

# Execute as migrações
npm run db:push
```

### 4. Inicie o Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5000`

## 🌐 Deploy em Produção

### Replit (Recomendado)
1. Importe o projeto no Replit
2. Configure a variável `DATABASE_URL` nos Secrets
3. Execute `npm run dev`

### Vercel/Netlify
1. Configure as variáveis de ambiente
2. Execute `npm run build`
3. Faça deploy da pasta `dist`

## 📊 Funcionalidades Principais

- ✅ Sistema de autenticação completo
- ✅ Dashboard interativo com geolocalização
- ✅ Busca de prestadores por localização
- ✅ Sistema de reservas e agendamento
- ✅ Avaliações e reviews
- ✅ Integração com dados meteorológicos
- ✅ Interface responsiva e moderna

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Banco**: PostgreSQL + Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Autenticação**: Session-based

## 📱 Próximos Passos

1. Configurar domínio personalizado
2. Implementar notificações em tempo real
3. Adicionar sistema de pagamentos
4. Expandir para tratores e trabalhadores rurais
5. Otimizar para PWA (aplicativo móvel)

---

**RURALI** - Transformando o agronegócio brasileiro através da tecnologia 🌱