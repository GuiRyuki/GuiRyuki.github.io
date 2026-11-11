# Portfólio GuiRyuki — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Pedido do usuário:** cada tarefa deve ser implementada por um subagente rodando no modelo **Fable** (`model: "fable"`). Todo texto voltado ao usuário (site, commits, comentários) é em **português do Brasil com acentuação correta**, exceto o conteúdo em inglês do próprio site.

**Goal:** Portfólio estático e bilíngue, com dois modos visuais (sutil, que é o padrão, e jogo em tela única), mostrando KFKA, Batman: Gotham Knights e CasaSabor.

**Architecture:** Um único `index.html` com texto fixo marcado por `data-i18n`. Os projetos e o perfil vêm de módulos de dados e são renderizados por JS em módulos ES nativos, sem build. O modo é um atributo `data-modo` no `<html>`, e o CSS de cada modo depende dele. No modo jogo, `telas.js` mostra uma tela por vez. Funções puras têm testes com `node --test`, e o comportamento no navegador é testado com Playwright.

**Tech Stack:** HTML, CSS e JavaScript (ES modules) puros. Como dependências de desenvolvimento, só `@playwright/test` e `lighthouse`. Servidor estático próprio em Node (`scripts/servir.mjs`), sem dependências. Fontes do Google Fonts.

**Spec:** `docs/superpowers/specs/2026-11-11-portfolio-design.md`. Leia a spec inteira antes de começar qualquer tarefa.

## Global Constraints

- Sem framework, sem bundler e sem etapa de build. O site precisa funcionar servido como arquivos estáticos a partir da raiz do repositório.
- `package.json` só tem `devDependencies` (`@playwright/test`, `lighthouse`). O site publicado não depende de nada do npm.
- Nada de Pokémon nem da Nintendo (nome, personagens, pokébola, sprites, fontes, sons). Arte da DC só pode aparecer dentro dos prints do próprio jogo.
- Nada de barra de habilidade com porcentagem.
- Contra a "cara de IA": nada de Inter, gradiente roxo/azul, glassmorphism, grade de cards com sombra, selos coloridos, rótulo em caixa alta acima de cada título ou seções centralizadas.
- Fontes: Pixelify Sans (nome, títulos e menus; no modo jogo, Silkscreen também é permitida em menus), Instrument Sans (texto corrido) e IBM Plex Mono (detalhes técnicos).
- Paleta do modo sutil: fundo `#f5f3ec`, texto `#22241f`, borda `#d6d2c4`, texto secundário `#6b6d63`.
- Paleta do modo jogo: `#0f1a13`, `#16261b`, `#3d7a4c`, `#9bbc8a`, `#e6eed6`.
- Todo texto do site é HTML real, nunca canvas nem imagem com texto.
- `localStorage` só é acessado pelo `preferencias.js`, sempre dentro de try/catch.
- Animações respeitam `prefers-reduced-motion: reduce`. Nenhuma animação atrasa o acesso ao conteúdo, e a transição do modo jogo leva menos de 400ms.
- Contatos: `ryuki.gui@gmail.com`, `https://github.com/GuiRyuki`, `https://www.linkedin.com/in/guiryuki`. O currículo (`perfil.curriculo`) começa vazio, e vazio não renderiza nada.
- Repositórios: KFKA `https://github.com/2026-2-NADS2/Projeto3`, Batman `https://github.com/felipenono/batman_-gotham-nights`, CasaSabor `https://github.com/SouzaDuda/CasaSabor`.
- Ordem dos projetos: KFKA, Batman: Gotham Knights, CasaSabor.
- Commits terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Não criar remoto e não fazer push.

## Review Focus

1. **Texto em inglês mais longo numa tela de 360px no modo jogo:** a moldura não pode estourar, o conteúdo rola dentro da área de conteúdo e não aparece rolagem horizontal. *(teste na Tarefa 6)*
2. **`localStorage` indisponível (aba anônima/bloqueado):** o site abre no modo sutil, os botões de modo e idioma funcionam e nada quebra no console. *(teste na Tarefa 1 com armazenamento que lança erro, e na Tarefa 5 no navegador)*
3. **Âncora inválida (`#xyz`) ao abrir no modo jogo:** cai na tela inicial, sem tela vazia. *(teste na Tarefa 6)*
4. **Trocar o idioma no meio do modo jogo:** continua na mesma tela, com o mesmo item marcado pelo cursor, e só o texto muda. *(teste na Tarefa 6)*
5. **Projeto com uma imagem só, sem `online` ou sem `repo`:** o painel não mostra controles de galeria nem links quebrados. *(teste na Tarefa 3 com dados injetados)*

---

## Estrutura de arquivos

```
index.html                  marcação única; texto fixo com data-i18n
css/base.css                reset, tipografia, tokens comuns, foco, utilitários (.visualmente-oculto)
css/sutil.css               layout e visual do modo sutil (html:not([data-modo="jogo"]))
css/jogo.css                moldura, paleta, tela única (html[data-modo="jogo"])
js/main.js                  liga tudo: estado inicial, eventos dos botões
js/preferencias.js          leitura/escrita segura no localStorage
js/i18n.js                  dicionário de textos fixos, detecção e aplicação do idioma
js/projetos.js              validação e renderização do menu e do painel de projeto
js/modo.js                  aplica o modo e a transição
js/telas.js                 navegação de tela única do modo jogo
data/projetos.js            lista de projetos (único arquivo a editar para adicionar projeto)
data/perfil.js              nome, apresentação, sobre, contatos, currículo
assets/avatar.svg           avatar provisório em pixel art
assets/projetos/*.webp|mp4  prints e vídeo
scripts/servir.mjs          servidor estático: node scripts/servir.mjs [porta]
scripts/capturar.mjs        captura de prints dos projetos (Playwright)
tests/unit/*.test.js        node --test
tests/e2e/*.spec.js         Playwright (chromium, firefox, webkit)
playwright.config.js
package.json
README.md
```

---

### Task 1: Base do repositório, servidor e preferências

**Files:**
- Create: `package.json`, `.gitignore`, `scripts/servir.mjs`, `playwright.config.js`, `js/preferencias.js`, `tests/unit/preferencias.test.js`, `README.md`

**Interfaces:**
- Produces:
  - `lerPreferencia(chave: string, padrao: string, armazenamento?: Storage) -> string` (o padrão de `armazenamento` é `globalThis.localStorage`; qualquer exceção ou valor `null` retorna `padrao`)
  - `salvarPreferencia(chave: string, valor: string, armazenamento?: Storage) -> void` (engole exceções)
  - Constantes `CHAVE_MODO = "portfolio.modo"` e `CHAVE_IDIOMA = "portfolio.idioma"`
  - Scripts npm: `test` (`node --test tests/unit/`), `test:e2e` (`playwright test`) e `servir` (`node scripts/servir.mjs 5173`)
  - `playwright.config.js` com `webServer` em `node scripts/servir.mjs 5173`, `baseURL: http://localhost:5173` e projetos chromium, firefox e webkit

- [ ] **Step 1: Escrever os testes que falham** em `tests/unit/preferencias.test.js`:
  - `lerPreferencia retorna o padrão quando não há valor`: armazenamento falso vazio, `lerPreferencia("x","sutil",fake) === "sutil"`.
  - `salva e lê o valor`: `salvarPreferencia("x","jogo",fake)` e depois `lerPreferencia("x","sutil",fake) === "jogo"`.
  - `não quebra quando o armazenamento lança erro`: um objeto cujo `getItem`/`setItem` lançam `DOMException`; `lerPreferencia` retorna o padrão e `salvarPreferencia` não lança.
  - `não quebra quando localStorage não existe`: chamar com `armazenamento` `undefined` em Node (sem `localStorage`) retorna o padrão.
- [ ] **Step 2:** `npm test` → FAIL (módulo não existe).
- [ ] **Step 3:** Implementar `js/preferencias.js`, `scripts/servir.mjs` (serve a raiz com os MIME types de `.html .css .js .mjs .json .svg .png .webp .mp4 .webm .woff2`, devolve 404 para arquivo inexistente e bloqueia `..` no caminho), `package.json` (`"type": "module"`), `.gitignore` (`node_modules/`, `test-results/`, `playwright-report/`, `.superpowers/`) e `README.md` curto (como rodar e como adicionar um projeto, apontando para `data/projetos.js`).
- [ ] **Step 4:** `npm install` (instala as devDependencies) e `npx playwright install chromium firefox webkit`. Depois, `npm test` → PASS.
- [ ] **Step 5:** `node scripts/servir.mjs 5173` em segundo plano; `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/README.md` → `200`, e `.../../etc/passwd` → `404` ou `403`. Encerrar o servidor.
- [ ] **Step 6: Commit** `Base do projeto, servidor estático e preferências`.

---

### Task 2: Dados e textos bilíngues

**Files:**
- Create: `data/projetos.js`, `data/perfil.js`, `js/i18n.js`, `tests/unit/dados.test.js`, `tests/unit/i18n.test.js`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `data/projetos.js`: `export const projetos: Projeto[]`, onde
    `Projeto = { id: string /* slug, [a-z0-9-] */, titulo: string, ano: number, stack: string[], resumo: Bil, minhaParte: Bil, equipe: Bil, repo: string, online: string, imagens: { src: string, alt: Bil }[], destaque: null | { src: string, poster: string, alt: Bil } }` e `Bil = { pt: string, en: string }`.
  - `data/perfil.js`: `export const perfil = { nome: "Guilherme Ryuki", formacao: Bil, dialogo: Bil, sobre: Bil, avatar: "assets/avatar.svg", contatos: { email, github, linkedin }, curriculo: "" }`
  - `js/i18n.js`:
    - `export const textos = { pt: Record<string,string>, en: Record<string,string> }`
    - `detectarIdioma(linguas: readonly string[]) -> "pt" | "en"` (o primeiro item que comece com `pt` → `"pt"`; caso contrário, `"en"`)
    - `traduzir(chave: string, idioma: "pt"|"en") -> string` (chave ausente devolve a própria chave)
    - `textoDe(campo: Bil, idioma) -> string`
    - `aplicarTextos(raiz: ParentNode, idioma) -> void`: `[data-i18n]` recebe `textContent`; `[data-i18n-attr]` usa o formato `"aria-label:chave;title:chave"`; também define `document.documentElement.lang` como `"pt-BR"` ou `"en"`.
  - Chaves mínimas em `textos`: `nav.projetos`, `nav.sobre`, `nav.contato`, `botao.modoJogo` ("▶ Modo jogo" / "▶ Game mode"), `botao.modoNormal`, `botao.idioma`, `projeto.minhaParte`, `projeto.equipamento`, `projeto.repo`, `projeto.online`, `contato.titulo`, `contato.email`, `tela.inicio`, `aviso.telaAtual` (usado pela região aria-live, com `{tela}`), `pular.conteudo`.

- [ ] **Step 1: Escrever os testes que falham.**
  - `dados.test.js`:
    - `todo projeto tem os campos obrigatórios`: para cada projeto, `id` casa com `/^[a-z0-9-]+$/`, `titulo` não é vazio, `stack.length >= 1` e `imagens.length >= 1`.
    - `todo texto bilíngue tem pt e en não vazios`: percorre recursivamente `projetos` e `perfil`, e todo objeto com chave `pt` também precisa ter `en`, ambos com string `trim()` não vazia.
    - `ids são únicos`.
    - `ordem inicial`: `projetos.map(p=>p.id)` começa com `["kfka","gotham-knights","casasabor"]`.
    - `imagens existem no disco`: todo `src` (e `destaque.src`/`poster`) existe com `fs.existsSync`. **Marque este teste com `{ todo: true }` até a Tarefa 7.**
    - `contatos`: valores iguais aos das Global Constraints; `curriculo === ""`.
  - `i18n.test.js`:
    - `pt e en têm exatamente as mesmas chaves`.
    - `nenhum valor vazio`.
    - `detectarIdioma(["pt-BR","en"]) === "pt"`, `detectarIdioma(["en-US","pt-BR"]) === "en"`, `detectarIdioma([]) === "en"`.
    - `traduzir("nao.existe","pt") === "nao.existe"`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Escrever os módulos. Os textos de `resumo`, `minhaParte`, `dialogo` e `sobre` entram como **rascunho provisório** e são substituídos na Tarefa 7. Os `src` de imagem apontam para `assets/projetos/<id>-1.webp`, `-2.webp` (KFKA, CasaSabor), e `gotham-knights-1.webp` mais `destaque: { src: "assets/projetos/gotham-knights.mp4", poster: "assets/projetos/gotham-knights-1.webp" }`.
- [ ] **Step 4:** `npm test` → PASS (o teste de imagens aparece como TODO).
- [ ] **Step 5: Commit** `Dados dos projetos, perfil e textos em PT/EN`.

---

### Task 3: Página no modo sutil e painel de projetos

**Files:**
- Create: `index.html`, `css/base.css`, `css/sutil.css`, `js/projetos.js`, `js/main.js`, `assets/avatar.svg`, `tests/e2e/sutil.spec.js`, `tests/unit/projetos.test.js`

**Interfaces:**
- Consumes: `projetos`, `perfil`, `textoDe`, `traduzir`, `aplicarTextos` (Tarefa 2) e `lerPreferencia`/`CHAVE_IDIOMA` (Tarefa 1).
- Produces:
  - `js/projetos.js`:
    - `validarProjeto(p: unknown) -> string[]` (lista de erros; vazia quando é válido)
    - `renderizarMenu(lista: HTMLUListElement, projetos, idioma, ativoId: string) -> void`: cada `li > button[type=button][data-projeto=<id>]`, com o botão ativo marcado por `aria-current="true"`
    - `renderizarPainel(painel: HTMLElement, projeto, idioma) -> void`: título `h3`, resumo, bloco "Minha parte" com classe `minha-parte`, lista `stack`, imagens/vídeo e links `repo`/`online` só quando não vazios. Com uma única mídia, nenhum controle de galeria.
    - `renderizarPerfil(raiz: ParentNode, perfil, idioma) -> void`: diálogo, sobre e contatos (o currículo só aparece se não estiver vazio)
  - `index.html`, com IDs estáveis usados por tarefas futuras: `#topo`, `#inicio` (avatar + `.dialogo`), `#projetos` (com `ul#menu-projetos` e `section#painel-projeto`), `#sobre`, `#contato`, `button#botao-modo`, `button#botao-idioma`, `main#conteudo`, `div#aviso-tela[aria-live=polite]` (visualmente oculto) e o link "pular para o conteúdo".
  - `js/main.js` exporta `iniciar()` e mantém o estado `{ idioma, modo, projetoAtivo }`. Uma função `rerenderizar()` reaplica textos, menu, painel e perfil.
  - Avatar provisório: SVG 16×16 em blocos com `shape-rendering="crispEdges"`, figura neutra (sem rosto detalhado), exibido em 96–128px com `image-rendering: pixelated`.

- [ ] **Step 1: Escrever os testes que falham.**
  - `projetos.test.js`: `validarProjeto({})` devolve erros que mencionam `id`, `titulo`, `imagens`; para cada `p` de `projetos`, `validarProjeto(p)` devolve `[]`.
  - `sutil.spec.js`:
    - `abre no modo sutil`: `html` não tem `data-modo="jogo"` (com `localStorage` limpo).
    - `primeiro projeto já selecionado`: `#menu-projetos [aria-current="true"]` tem `data-projeto="kfka"` e `#painel-projeto h3` contém "KFKA".
    - `clicar troca o painel`: clicar em `[data-projeto="gotham-knights"]` faz o `h3` conter "Gotham Knights" e passa o `aria-current` para esse botão.
    - `teclado no menu`: com Tab até um botão do menu e Enter, o painel troca.
    - `links vazios não aparecem`: com `page.route` servindo um `data/projetos.js` alternativo, com um projeto de `online:""`, `repo:""` e uma imagem só, o painel não tem `a[href=""]`, nem link de repo/online, nem controle de galeria.
    - `sem rolagem horizontal`: nas larguras 360, 768 e 1440, `document.documentElement.scrollWidth <= window.innerWidth`.
    - `contatos`: existem `a[href="mailto:ryuki.gui@gmail.com"]`, `a[href="https://github.com/GuiRyuki"]` e `a[href="https://www.linkedin.com/in/guiryuki"]`; nenhum link de currículo.
    - `âncora no modo sutil`: abrir `/#sobre` deixa `#sobre` dentro da viewport.
- [ ] **Step 2:** `npm test` e `npm run test:e2e -- --project=chromium` → FAIL.
- [ ] **Step 3:** Implementar. Layout do sutil conforme a spec §6 e o mockup `docs/superpowers/mockups/tema-rpg.html` (opção "sutil"): topo com borda inferior fina; apresentação com avatar à esquerda e caixa de diálogo com borda dupla (`box-shadow` inset) e ▼; projetos em duas colunas (menu com ▶ no ativo | painel) que viram uma coluna abaixo de 700px; margem lateral de 16px no celular. Fontes via Google Fonts com `preconnect` e `display=swap`. Imagens com `loading="lazy"`, `width`/`height` definidos e `alt` do idioma atual.
- [ ] **Step 4:** Testes → PASS no chromium.
- [ ] **Step 5: Commit** `Página no modo sutil com menu e painel de projetos`.

---

### Task 4: Troca de idioma

**Files:**
- Modify: `js/main.js`
- Create: `tests/e2e/idioma.spec.js`

**Interfaces:**
- Consumes: `detectarIdioma`, `aplicarTextos` e `rerenderizar()`; `lerPreferencia`/`salvarPreferencia` com `CHAVE_IDIOMA`.
- Produces: `definirIdioma(idioma: "pt"|"en") -> void` em `main.js` (rerenderiza, salva e mantém o projeto ativo). O idioma inicial é a preferência salva ou, na falta dela, `detectarIdioma(navigator.languages)`.

- [ ] **Step 1: Escrever os testes que falham** (`idioma.spec.js`):
  - `primeira visita segue o navegador`: contexto com `locale: "pt-BR"` → `html[lang="pt-BR"]`; `locale: "en-US"` → `html[lang="en"]`.
  - `trocar troca tudo`: começando em PT, clicar em `#botao-idioma`. `html[lang="en"]`, o texto de `#botao-modo` vem de `textos.en["botao.modoJogo"]`, o `alt` das imagens do painel bate com `alt.en`, e nenhum elemento `[data-i18n]` fica com texto igual à própria chave nem vazio.
  - `não recarrega`: registrar um `window.__marca = 1` antes de trocar e verificar que ele continua existindo depois.
  - `mantém o projeto ativo`: selecionar CasaSabor, trocar o idioma e conferir que CasaSabor continua `aria-current`.
  - `persiste`: trocar para EN e recarregar → continua `lang="en"`.
- [ ] **Step 2:** `npm run test:e2e -- --project=chromium tests/e2e/idioma.spec.js` → FAIL.
- [ ] **Step 3:** Implementar `definirIdioma` e ligar o botão. O rótulo do botão mostra o idioma de destino ("EN" quando está em PT) e tem `aria-label` traduzido.
- [ ] **Step 4:** Testes → PASS.
- [ ] **Step 5: Commit** `Troca de idioma PT/EN`.

---

### Task 5: Modo jogo: visual e alternância

**Files:**
- Create: `js/modo.js`, `css/jogo.css`, `tests/e2e/modo.spec.js`
- Modify: `index.html` (link para `css/jogo.css`), `js/main.js`

**Interfaces:**
- Consumes: `CHAVE_MODO` e as funções de preferências.
- Produces:
  - `aplicarModo(modo: "sutil"|"jogo", opcoes?: { animar?: boolean }) -> void` em `js/modo.js`: define `document.documentElement.dataset.modo`. Com `animar` e sem `prefers-reduced-motion`, adiciona a classe `transicao-modo` no `<html>` por 350ms (piscada em degraus, `steps()`).
  - `definirModo(modo) -> void` em `main.js`: aplica, salva e atualiza o rótulo e o `aria-pressed` de `#botao-modo`. Despacha `document` → `CustomEvent("modo-mudou", { detail: { modo } })`, que é ouvido pela Tarefa 6.

- [ ] **Step 1: Escrever os testes que falham** (`modo.spec.js`):
  - `alterna e volta`: clicar em `#botao-modo` → `html[data-modo="jogo"]` e `aria-pressed="true"`; clicar de novo → sem `data-modo="jogo"`.
  - `persiste`: ativar o jogo e recarregar → continua `data-modo="jogo"`.
  - `localStorage bloqueado`: `addInitScript` que faz `localStorage.getItem`/`setItem` lançarem erro. A página abre no sutil, o botão alterna e `page.on("pageerror")` não registra nada.
  - `movimento reduzido`: com `reducedMotion: "reduce"`, alternar não adiciona `transicao-modo`.
  - `paleta do jogo`: no modo jogo, a cor de fundo calculada da moldura é uma das cores da paleta das Global Constraints.
- [ ] **Step 2:** → FAIL.
- [ ] **Step 3:** Implementar o visual do jogo conforme a spec §6 e o mockup (opção "imersivo"): moldura com borda grossa e borda dupla, caixas `.box`, fonte pixelada só em títulos e menus. O texto longo continua em Instrument Sans com no mínimo 16px. Contraste AA entre cada par texto/fundo usado.
- [ ] **Step 4:** → PASS.
- [ ] **Step 5: Commit** `Modo jogo: visual e alternância`.

---

### Task 6: Modo jogo em tela única

**Files:**
- Create: `js/telas.js`, `tests/unit/telas.test.js`, `tests/e2e/telas.spec.js`
- Modify: `js/main.js`, `css/jogo.css`, `index.html` (menu do jogo, se for preciso um elemento próprio)

**Interfaces:**
- Consumes: o evento `modo-mudou`, `projetos`, `traduzir("aviso.telaAtual")` e `definirIdioma`.
- Produces (`js/telas.js`):
  - `idsDeTela(projetos) -> string[]` = `["inicio", ...projetos.map(p=>p.id), "sobre", "contato"]`
  - `telaDoHash(hash: string, ids: string[]) -> string` (`"#sobre"` → `"sobre"`; vazio ou inválido → `"inicio"`)
  - `proximoIndice(atual: number, delta: 1|-1, total: number) -> number` (dá a volta nas pontas)
  - `iniciarTelas({ projetos, aoMostrar(id) }) -> { mostrar(id: string): void, telaAtual(): string, encerrar(): void }`
    - No modo jogo: menu `ul#menu-jogo` com um item por id (exceto `inicio`). ↑/↓ movem o cursor ▶ e Enter/clique mostram a tela. Telas de projeto reutilizam `#painel-projeto`, e as demais seções recebem `hidden`.
    - Ao mostrar: atualiza `history.replaceState` com `#id`, move o foco para o título da tela (`tabindex="-1"`) e escreve em `#aviso-tela`.
    - `encerrar()` remove todos os `hidden` que adicionou e, ao voltar ao sutil, rola até a seção (ou o projeto) que estava ativa.

- [ ] **Step 1: Escrever os testes que falham.**
  - `telas.test.js`: `telaDoHash("#sobre", ids) === "sobre"`, `telaDoHash("#xyz", ids) === "inicio"`, `telaDoHash("", ids) === "inicio"`; `proximoIndice(0,-1,5) === 4`, `proximoIndice(4,1,5) === 0`; `idsDeTela(projetos)` começa com `"inicio"` e termina com `"sobre","contato"`.
  - `telas.spec.js` (todos começando no modo jogo):
    - `uma tela por vez`: só uma entre `#inicio`, `#sobre`, `#contato` e o painel fica visível; a página não rola (`document.scrollingElement.scrollHeight <= innerHeight + 1`).
    - `teclado`: focar o menu, ↓ duas vezes e Enter → mostra o segundo item; o foco vai para o `h2`/`h3` da tela; `#aviso-tela` contém o nome da tela.
    - `âncora`: abrir `/#contato` → tela de contato; abrir `/#xyz` → tela inicial.
    - `troca de idioma mantém a tela`: na tela `gotham-knights`, trocar o idioma → continua nela, com o cursor no mesmo item.
    - `celular 360px em inglês`: idioma EN, tela `kfka`. Sem rolagem horizontal; a área de conteúdo tem `overflow-y` `auto` e consegue rolar até o último elemento; o menu continua visível.
    - `voltar ao sutil`: na tela `sobre`, trocar para o sutil → todas as seções visíveis e `#sobre` na viewport.
- [ ] **Step 2:** → FAIL.
- [ ] **Step 3:** Implementar. No celular (até 700px), o menu vira uma faixa horizontal com rolagem no topo da moldura. O conteúdo ocupa o resto da altura (`100dvh`) e rola por dentro.
- [ ] **Step 4:** `npm test` e `npm run test:e2e` (os três navegadores) → PASS.
- [ ] **Step 5: Commit** `Modo jogo em tela única com navegação por teclado`.

---

### Task 7: Conteúdo real (prints, vídeo e textos)

**Files:**
- Create: `scripts/capturar.mjs`, `assets/projetos/*`
- Modify: `data/projetos.js`, `data/perfil.js`, `tests/unit/dados.test.js` (tirar o `todo`)

**Interfaces:**
- Consumes: o esquema da Tarefa 2.
- Produces: imagens finais e textos-rascunho para revisão do Guilherme.

- [ ] **Step 1:** Subir cada projeto localmente **sem alterar nenhum arquivo versionado deles**:
  - KFKA: `C:\Users\ryuki\Documents\GitHub\Projeto3\src\Entrega 2\Frontend` → `npm ci && npm run dev` (só o front, com os dados de exemplo; não subir backend).
  - Batman: `C:\Users\ryuki\Documents\GitHub\batman_-gotham-nights` → `npm ci && npm run dev` (porta 3000).
  - CasaSabor: `C:\Users\ryuki\Documents\GitHub\CasaSabor` → servir a pasta com `node scripts/servir.mjs` deste repositório, apontando para ela (aceitar um argumento opcional de raiz em `servir.mjs`), ou abrir o `index.html`.
  - Se `npm ci` mudar arquivos versionados (ex.: lockfile), desfazer com `git checkout -- <arquivo>` naquele repositório.
- [ ] **Step 2:** `scripts/capturar.mjs <url> <saida.png> [largura=1440] [altura=900]` com Playwright. Capturar 2 telas representativas do KFKA (home e um painel interno), 2 do CasaSabor (index e almoço) e 1 do Batman em jogo. Converter para WebP com até 1600px de largura e no máximo cerca de 200KB cada (o Chromium do Playwright pode reencodar via canvas `toDataURL("image/webp")`, ou use `cwebp` se existir). **Nenhum print pode conter dado pessoal real.**
- [ ] **Step 3:** Vídeo do Batman: `recordVideo` do Playwright durante 6–8s de jogo (andar, pular, lançar batarangue via `page.keyboard`/`mouse`). Converter para `.mp4` com `ffmpeg`, se existir; senão manter o `.webm` gerado e ajustar `destaque.src`. No máximo 2MB. No site, ele é exibido com `muted loop playsinline autoplay`, mas com `prefers-reduced-motion` mostra só o poster.
- [ ] **Step 4:** Textos-rascunho:
  - `minhaParte` de cada projeto, a partir de `git log --author="Guilherme" --stat` em cada repo. Base conhecida: Batman, 11 de 19 commits (lobby/menu, telas de fim, pontuação, áudio, fundos das fases, refatoração); CasaSabor, a página Almoço (HTML, imagens e ajuste de layout pelo Figma); KFKA (confirmado pelo usuário): protótipo e entrega de POO do sistema, documentação (README e fichas de uso de IA) e ajustes no protótipo do Figma. **Ele não criou telas em React, então não pode dizer que fez telas ou front-end do KFKA.**
  - `sobre`, `formacao` e `dialogo` a partir de `C:\Users\ryuki\Downloads\Curriculo_Guilherme_Ryuki_Nov2026.pdf` (ler com a skill de PDF). Texto curto, em PT e EN, sem jargão de marketing.
  - Equipe: Batman, 4 pessoas; os outros, confirmar pelo `git shortlog -sn`.
- [ ] **Step 5:** Tirar o `todo` do teste de imagens; `npm test` → PASS.
- [ ] **Step 6: Commit** `Conteúdo real: prints, vídeo e textos-rascunho`.

---

### Task 8: Critérios de aceite

**Files:**
- Create: `tests/e2e/aceite.spec.js`, `scripts/lighthouse.mjs`
- Modify: o que for preciso para passar

**Interfaces:**
- Consumes: tudo.

- [ ] **Step 1: Escrever os testes.**
  - `aceite.spec.js` → `projeto novo só pelo arquivo de dados` (spec §9.4): `page.route` serve um `data/projetos.js` com um 4º projeto de teste (`id:"teste"`, uma imagem existente). Ele aparece no menu do sutil, no menu do jogo, em PT e em EN, com âncora `#teste` funcionando no jogo. **Sem alterar arquivos do repo.**
  - `teclado de ponta a ponta`: só com Tab/Enter/setas, trocar o idioma, entrar no modo jogo, visitar todas as telas e voltar ao sutil.
  - `scripts/lighthouse.mjs`: roda o Lighthouse (pacote `lighthouse` + Chrome do Playwright via `chromePath`) contra `http://localhost:5173/`, uma vez com `localStorage` limpo (sutil) e outra com `portfolio.modo="jogo"` definido antes do carregamento. O throttling de celular padrão simula 4G. Falha se qualquer categoria ficar abaixo de 90 ou se o LCP passar de 2000ms.
- [ ] **Step 2:** `npm run test:e2e` (3 navegadores) e `node scripts/lighthouse.mjs` → registrar as notas.
- [ ] **Step 3:** Corrigir o que falhar (contraste, tamanho de imagem, fontes etc.) até tudo passar.
- [ ] **Step 4:** Conferir manualmente, com um print de cada, os dois modos × dois idiomas × 360px e 1440px (8 prints em `test-results/`, que não são versionados). Verificar contra a lista anti-"cara de IA" das Global Constraints.
- [ ] **Step 5: Commit** `Critérios de aceite verificados`, com as notas do Lighthouse na mensagem.
