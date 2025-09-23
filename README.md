# 🏥 Sistema de Agendamento Médico

Sistema completo de agendamento médico desenvolvido com Next.js, TypeScript e Tailwind CSS, utilizando componentes do shadcn/ui.

## 🚀 Funcionalidades

- ✅ **Agendamento Público**: Formulário "Marque sua consulta" para pacientes
- ✅ **Área Médica**: Interface para médicos gerenciarem consultas
- ✅ **Área Secretária**: Painel administrativo para secretárias
- ✅ **Sistema Unificado**: Integração entre todas as áreas
- ✅ **Notificações Telegram**: Alertas automáticos para médicos
- ✅ **WhatsApp Integration**: Links diretos para confirmação
- ✅ **Agenda Diária**: Visualização completa dos agendamentos
- ✅ **Lembretes Automáticos**: Sistema de notificações

## 📁 Estrutura do Projeto

```
my-shadcn-app/
├── app/
│   ├── agendamento/          # Página de agendamento público
│   ├── area-medica/          # Interface para médicos
│   ├── area-secretaria/      # Painel administrativo
│   ├── agenda/               # Visualização da agenda
│   └── api/                  # Endpoints da API
├── components/
│   └── ui/                   # Componentes reutilizáveis
├── lib/
│   ├── unified-appointment-system.ts  # Sistema unificado
│   ├── reminder-scheduler.ts          # Agendador de lembretes
│   └── daily-agenda-scheduler.ts      # Agenda diária
└── data/
    └── medical-records.json  # Dados médicos
```

## 🛠️ Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de interface
- **Telegram Bot API** - Notificações automáticas
- **WhatsApp API** - Confirmações via WhatsApp

## Como Executar o Projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## Verificações

Antes de finalizar o desenvolvimento, certifique-se de executar:

- Verificação de tipos TypeScript: `npm run build`
- Linting: `npm run lint`

## Dependências Principais

- Next.js
- React
- TypeScript
- Tailwind CSS
- @headlessui/react
- @heroicons/react/24/outline