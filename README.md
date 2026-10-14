# Villa D Estilo | Quiz Looks Inteligentes

Quiz estático (sem build) publicado em https://villadestilo.vercel.app via GitHub `expandads/villadestilo`.

## Estrutura

- `index.html`: markup + CSS crítico inline + Meta Pixel
- `assets/js/main.js`: lógica do quiz, eventos do Pixel, checkout
- `assets/img/`: WebP. Fotos em 3 larguras (`nome-640/960/1440.webp`), avatar, e-book, relatos
- `assets/fonts/`: DM Sans e Cormorant Garamond (subset latin, woff2 variável)
- `vercel.json`: cache de 1 ano (immutable) em `/assets`

## Regras

- `/assets` tem cache immutable. Ao trocar um arquivo: **imagem/fonte** usa nome novo; **main.js** bumpa `?v=` no `index.html`.
- Relatos (`relato-1..3.webp`) precisam manter 941x1672: os valores `top`/`bottom` em `proofItems` são em pixels dessa resolução.
- Foto de cada pergunta: campo `photo` em `questions` (main.js).

## Meta Pixel 1658819022345400

Cada evento dispara 1x por sessão (sessionStorage `villa-d-px`).

| Evento | Tipo | Quando |
|---|---|---|
| PageView | padrão | carregou a página |
| QuizInicio | custom | clicou em começar |
| QuizResposta | custom | cada resposta (`pergunta`, `resposta` A/B/C) |
| Quiz25 / Quiz50 / Quiz75 / Quiz100 | custom | respondeu a 2ª / 4ª / 6ª / 8ª pergunta |
| ViewContent | padrão | abriu a tela da oferta (R$ 49,90) |
| CliqueCheckout | custom | clicou em comprar, antes de ir pra Kiwify |

InitiateCheckout e Purchase ficam com a Kiwify (pixel configurado no produto lá). O clique repassa os parâmetros da URL (utm_*, fbclid, src, sck) pro checkout `https://pay.kiwify.com.br/hlngerK`.
