# Villa D Estilo | Quiz Looks Inteligentes

Quiz estático (sem build) publicado em https://villadestilo.vercel.app via GitHub `expandads/villadestilo`.

## Estrutura

- `index.html`: markup + CSS crítico inline + Meta Pixel
- `assets/js/main.js`: lógica do quiz, eventos do Pixel, checkout
- `assets/img/`: WebP. Fotos em 3 larguras (`nome-640/960/1440.webp`), avatar, e-book, relatos
- `assets/fonts/`: DM Sans e Cormorant Garamond (subset latin, woff2 variável)
- `vercel.json`: cache de 1 ano (immutable) em `/assets`
- `tools/build_img.py`: gera os recortes WebP (não é publicado, ver `.vercelignore`)

## Regras

- `/assets` tem cache immutable. Ao trocar um arquivo: **imagem/fonte** usa nome novo; **main.js** bumpa `?v=` no `index.html`.
- Relatos (`relato-1..3.webp`) precisam manter 941x1672: os valores `top`/`bottom` em `proofItems` são em pixels dessa resolução.
- Foto de cada pergunta: campo `photo` em `questions` (main.js).

## Meta Pixel 1658819022345400

Abandono: compare as contagens em sequência (QuizInicio > Quiz25 > Quiz50 > Quiz75 > Quiz100 > QuizDiagnostico > QuizRelatos > ViewContent > VerOferta > CliqueCheckout). A queda entre dois eventos é onde as pessoas saem.

Cada evento dispara 1x por sessão (sessionStorage `villa-d-px`).

| Evento | Tipo | Quando |
|---|---|---|
| PageView | padrão | carregou a página |
| QuizInicio | custom | clicou em começar |
| Quiz25 / Quiz50 / Quiz75 / Quiz100 | custom | respondeu a 2ª / 4ª / 6ª / 8ª pergunta |
| QuizDiagnostico | custom | viu a tela de diagnóstico |
| QuizRelatos | custom | viu a tela de relatos |
| ViewContent | padrão | abriu a tela da oferta (R$ 47) |
| VerOferta | custom | a oferta final ("Você tem peças. Agora falta a lógica.") apareceu na tela, rolando ou pelo botão verde |
| CliqueCheckout | custom | clicou em comprar, antes de ir pra Kiwify |

InitiateCheckout (ao entrar no checkout) e Purchase (cartão aprovado) são disparados pela própria Kiwify quando o pixel está configurado no produto, conforme a [ajuda da Kiwify](https://help.kiwify.com/en/article/how-to-set-up-the-facebook-pixel-1oxa7i0/). Por isso o clique aqui é evento custom, pra não duplicar InitiateCheckout. O clique repassa os parâmetros da URL (utm_*, fbclid, src, sck) pro checkout `https://pay.kiwify.com.br/hlngerK`.
