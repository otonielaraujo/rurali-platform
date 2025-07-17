# RURALI - Plataforma de Serviços Agrícolas

RURALI é uma plataforma web que conecta produtores rurais com prestadores de serviços agrícolas, facilitando o agendamento e contratação de serviços como operação de drones, tratores e trabalho manual no campo.

## 🚀 Tecnologias

### Frontend
- **React** + **TypeScript** - Interface de usuário moderna e tipada
- **Vite** - Build tool rápido e eficiente
- **Tailwind CSS** + **shadcn/ui** - Design system consistente
- **TanStack Query** - Gerenciamento de estado do servidor
- **Wouter** - Roteamento client-side

### Backend
- **Express.js** + **TypeScript** - API REST robusta
- **PostgreSQL** + **Drizzle ORM** - Banco de dados relacional
- **Neon Serverless** - Conexão otimizada para PostgreSQL

## 🌟 Funcionalidades

### Para Produtores Rurais
- 📍 **Busca por Localização** - Encontre prestadores próximos à sua propriedade
- 🛰️ **Serviços Especializados** - Drones, tratores e trabalho manual
- 📅 **Agendamento Inteligente** - Considere condições climáticas
- ⭐ **Sistema de Avaliações** - Escolha prestadores confiáveis
- 💰 **Cotações Transparentes** - Compare preços por área ou diária

### Para Prestadores de Serviços
- 👤 **Perfil Profissional** - Exiba suas certificações e especialidades
- 📊 **Gestão de Agenda** - Controle sua disponibilidade
- 💼 **Histórico de Trabalhos** - Construa sua reputação
- 📱 **Notificações** - Receba solicitações em tempo real

### Recursos Avançados
- 🌦️ **Integração Climática** - Dados meteorológicos para planejamento
- 🗺️ **Visualização em Mapa** - Interface geográfica intuitiva
- 🔐 **Autenticação Segura** - Sistema de login protegido
- 📊 **Dashboard Analítico** - Métricas e estatísticas

## 🛠️ Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- npm ou yarn

### Configuração
1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/rurali.git
cd rurali
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure sua conexão PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/rurali"
```

4. Execute as migrações do banco:
```bash
npm run db:push
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5000`

## 📁 Estrutura do Projeto

```
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── hooks/       # Hooks customizados
│   │   └── lib/         # Utilitários e configurações
├── server/              # Backend Express
│   ├── index.ts         # Entrada do servidor
│   ├── routes.ts        # Rotas da API
│   ├── storage.ts       # Camada de dados
│   └── db.ts           # Configuração do banco
├── shared/              # Código compartilhado
│   └── schema.ts        # Schema do banco e tipos
└── package.json         # Dependências e scripts
```

## 🚀 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Inicia servidor de produção
- `npm run db:push` - Aplica mudanças do schema no banco
- `npm run db:studio` - Interface visual do banco

## 🌍 Deploy

### Replit (Recomendado)
1. Importe o projeto no Replit
2. Configure as variáveis de ambiente
3. Execute `npm run dev`

### Outras Plataformas
1. Configure as variáveis de ambiente
2. Execute `npm run build`
3. Inicie com `npm run start`

## 📊 Schema do Banco

### Entidades Principais
- **Users** - Usuários do sistema (produtores e prestadores)
- **Producers** - Perfis de produtores rurais
- **Providers** - Perfis de prestadores de serviços
- **Bookings** - Agendamentos de serviços
- **Reviews** - Avaliações e comentários
- **Notifications** - Sistema de notificações

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Contato

RURALI - Conectando o campo à tecnologia

---

⭐ **Desenvolvido com foco na transformação digital do agronegócio brasileiro** ⭐