# Monopólio Pods

Aplicação do catálogo da Monopólio Pods, usada para apresentar os produtos da loja, organizar sabores por modelo, calcular frete por região e montar pedidos enviados pelo WhatsApp.

## Visão geral

O projeto foi pensado para o atendimento da loja em Recife e Olinda, com foco em:

- vitrine dos produtos
- página individual por modelo
- cálculo de frete por bairro e cidade
- checkout com montagem de mensagem para WhatsApp
- área de feedbacks e imagens da loja

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Vitest

## Rodando localmente

1. Instale as dependências:
   `npm install`
2. Inicie o ambiente:
   `npm run dev`

O servidor local roda na porta `8080`.

## Scripts

- `npm run dev`: ambiente de desenvolvimento
- `npm run build`: build de produção
- `npm run preview`: visualização local do build
- `npm run lint`: conferência de lint
- `npm test`: execução dos testes

## Estrutura principal

- `src/pages`: páginas da aplicação
- `src/components`: componentes reutilizáveis da interface
- `src/data`: catálogo, frete, depoimentos e dados fixos
- `src/lib`: regras auxiliares e geração das mensagens de pedido
- `scripts`: rotinas auxiliares para SEO e tratamento de arquivos
- `public`: imagens e arquivos públicos

## Observações

- Antes do build, o projeto gera os assets usados nas imagens de SEO.
- Os pedidos são fechados no frontend e enviados para o WhatsApp da loja.
