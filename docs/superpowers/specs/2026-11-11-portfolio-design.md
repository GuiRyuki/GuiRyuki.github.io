# Portfólio pessoal — documento de design

Data: 2026-11-11 · Autor do pedido: Guilherme Ryuki (GitHub `GuiRyuki`)

## 1. Intenção e o porquê

Guilherme é estudante de Análise e Desenvolvimento de Sistemas na FECAP e está buscando vaga. Ele quer um site pessoal para mostrar os projetos que desenvolveu. O público principal são recrutadores e avaliadores técnicos.

Nos primeiros 30 segundos, o visitante precisa sair com duas impressões: **"essa pessoa tem conhecimento técnico"** e **"vi os projetos dela"**. O site deve ser bonito e responsivo e funcionar bem, sem chamar atenção demais.

A personalidade aparece por uma **temática de RPG de portátil antigo** (caixa de diálogo, cursor ▶, fonte pixelada, avatar em pixel art). Guilherme gosta da estética de Pokémon, mas o site usa só a *linguagem visual do gênero*, sem nada da marca.

## 2. Objetivos

- Mostrar 3 projetos completos com prints reais, stack, contexto e **qual foi a parte do Guilherme** (todos foram feitos em grupo).
- Ter dois modos visuais com o mesmo conteúdo:
  - **Modo sutil (padrão):** site claro, legível e sóbrio, com "sotaque" de jogo nos detalhes.
  - **Modo jogo (imersivo):** a página inteira vira a tela de um portátil antigo.
- Funcionar em português (padrão) e inglês.
- Permitir adicionar um projeto novo editando só um arquivo de dados, sem mexer em layout, CSS ou HTML.
- Mostrar os contatos: e-mail, GitHub e LinkedIn.

## 3. Não objetivos (por enquanto)

- **Currículo em PDF:** fica fora, porque Guilherme ainda vai alterá-lo. A estrutura deve permitir incluí-lo depois com mudança mínima (ex.: um campo `curriculo` nos dados de contato que, quando vazio, não mostra nada).
- **Publicar o site ou os projetos online:** tudo roda em localhost. Não configurar deploy.
- **Demos jogáveis embutidas:** os projetos não estão no ar. O que existe é o link do repositório.
- **Homem do Saco:** descartado, não entra.
- Blog, CMS, formulário de contato com backend, analytics.

## 4. Anti-objetivos (fracasso mesmo que funcione)

- **Cara de IA.** Referência negativa concreta: a Home do projeto da PI (`Projeto3/src/Entrega 2/Frontend/src/css/home.css` e `paginas/Home.jsx`). Ela tem cara de IA por causa disto:
  - receita de seções "hero com texto + imagem → 3 cards de recursos → passos numerados → 3 cards de notícia → faixa escura de contato";
  - tudo é card (fundo branco, borda azul-clara, raio de 12px, sombra suave, grade de 3 colunas);
  - selinhos/tags coloridos e rótulo pequeno em caixa alta e espaçado acima de cada título;
  - fundo pastel alternado por `nth-child` sem significado;
  - fonte Inter e seções centralizadas.
  
  Também evitar: gradiente roxo/azul, glassmorphism, ícone genérico em todo bloco e frases de efeito ("Transformando ideias em código").
- **Uso de propriedade da Nintendo/Pokémon:** nada de nome, personagens, pokébola, sprites, fontes ou sons oficiais. Lembrar o estilo é permitido, copiar não.
- **Barras de habilidade com porcentagem** ("React 80%"). Recrutadores desconfiam disso. Use a lista de tecnologias.
- **Conteúdo desenhado em canvas/imagem.** Todo texto precisa ser HTML real (SEO e leitores de tela).
- **Modo jogo que atrapalha a leitura** ou quebra no celular.

## 5. Restrições e decisões tomadas

### Decididas pelo Guilherme
- Eu (Claude) escrevo o código e Guilherme revisa. **A implementação deve ser feita por agentes rodando no modelo Fable** (pedido explícito).
- Temática de jogo/RPG de portátil, com **alternância entre modos**. O site **abre no modo sutil**.
- Versão em inglês além do português.
- Projetos: **KFKA**, **CasaSabor** e **Batman: Gotham Knights**.
- O avatar em pixel art será gerado por ele. O site reserva o espaço e usa um placeholder até a imagem chegar.
- Contatos: e-mail `ryuki.gui@gmail.com`, GitHub `https://github.com/GuiRyuki`, LinkedIn `https://www.linkedin.com/in/guiryuki`.
- Os prints e o GIF são capturados por Claude, rodando os projetos localmente.
- O "Sobre mim" parte do currículo e é revisado por ele.

### Decididas por Claude (Guilherme pode vetar)
- **Tecnologia:** HTML, CSS e JavaScript puro, sem framework e sem etapa de build. Guilherme domina isso e revisar fica fácil. Abrir o `index.html` com um servidor estático simples precisa bastar.
- **Repositório:** novo, em `C:\Users\ryuki\Documents\GitHub\GuiRyuki.github.io`, pensando no GitHub Pages no futuro (`guiryuki.github.io`). Não criar remoto nem fazer push sem pedido.
- **Dados:** um único arquivo (ex.: `data/projetos.js` ou `.json`) com a lista de projetos. Cada projeto tem textos em PT e EN. Campos sugeridos: `id`, `titulo`, `ano`, `stack[]`, `resumo{pt,en}`, `minhaParte{pt,en}`, `equipe`, `repo`, `online` (opcional, só aparece se preenchido), `imagens[]` (com `alt{pt,en}`), `destaque` (GIF/vídeo opcional).
- **Textos fixos da interface** (menus, botões, rótulos) num dicionário PT/EN separado.
- **Alternância de modo:** um botão visível no topo ("▶ Modo jogo" / "Modo normal"). Ele troca um atributo no `<html>` (ex.: `data-modo="jogo"`) e o CSS muda tudo a partir dele. A escolha fica salva no `localStorage` (envolvido em try/catch). Ao entrar no modo jogo, toca uma transição curta (piscar/fade em degraus, < 400ms) **em vez de** uma tela "PRESS START" que faz esperar. Respeitar `prefers-reduced-motion`.
- **Idioma:** botão PT/EN no topo. A escolha fica salva no `localStorage`. Na primeira visita, usa o idioma do navegador (pt* → PT, qualquer outro → EN). Atualizar `<html lang>`.
- **Prints de projeto em grupo:** cada projeto mostra "Minha parte" com destaque. Rascunho escrito por Claude a partir dos commits do Guilherme e revisado por ele.
- **Avatar:** placeholder em pixel art neutro até a imagem chegar. Usar `image-rendering: pixelated`.

## 6. Como o site é e se comporta

### Estrutura (o mesmo HTML nos dois modos; no modo sutil a página rola normalmente)
1. **Topo:** nome, navegação (Projetos · Sobre · Contato), botão PT/EN e botão de modo.
2. **Apresentação:** avatar ao lado de uma caixa de diálogo com borda dupla ("Olá! Eu sou o Guilherme…") e indicador ▼.
3. **Projetos:** lista/menu com cursor ▶ no item ativo. Ao lado (ou abaixo, no celular), o painel do projeto escolhido: print(s), resumo, "Minha parte", stack ("equipamento") e link do repositório. O primeiro projeto já começa selecionado.
4. **Sobre mim:** a "ficha" de apresentação, com avatar, formação (ADS – FECAP) e texto curto.
5. **Contato:** e-mail, GitHub e LinkedIn.

A ordem dos projetos segue o arquivo de dados. Ordem inicial: KFKA, Batman: Gotham Knights, CasaSabor.

### Modo sutil (padrão)
- Fundo claro e quente (tipo papel, ex.: `#f5f3ec`), texto quase preto e bordas finas. Poucas cores.
- Fonte pixelada (ex.: Pixelify Sans) **só** no nome, nos títulos e nos itens de menu. O texto corrido usa uma sans legível que não seja Inter (ex.: Instrument Sans). Detalhes técnicos (stack, ano) usam mono (ex.: IBM Plex Mono).
- Os elementos de jogo aparecem só nos detalhes: caixa de diálogo, cursor ▶ e ▼.
- Sem cards em grade, sem sombras e sem seções centralizadas.

### Modo jogo (imersivo)
- A página inteira imita a tela de um portátil antigo: paleta esverdeada de 4 a 5 tons (ex.: `#0f1a13`, `#16261b`, `#9bbc8a`, `#e6eed6`), molduras grossas com borda dupla e títulos/menus em fonte pixelada (ex.: Silkscreen/Pixelify Sans).
- O texto longo (resumo, "Minha parte", Sobre) continua numa fonte legível e com tamanho confortável dentro das caixas de diálogo.
- **Uma tela só (decisão do Guilherme):** no modo jogo, a página deixa de rolar como documento. Tudo fica dentro de uma moldura fixa do tamanho da janela. O menu ▶ lista KFKA, Gotham Knights, CasaSabor, Sobre mim e Contato, e escolher um item troca o conteúdo da área principal, mostrando uma "tela" por vez. A apresentação (avatar e caixa de diálogo) é a tela inicial antes de escolher um item.
- O menu funciona por teclado (↑/↓ move o cursor, Enter seleciona), por mouse e por toque.
- **Decisões de Claude para a tela única:**
  - O HTML continua o mesmo. No modo jogo, o JS só mostra a seção ou o projeto ativo e esconde o resto (`hidden`). No modo sutil, tudo volta a aparecer.
  - A navegação do topo vira os itens do próprio menu dentro da moldura. Os botões PT/EN e de modo continuam visíveis na moldura.
  - As âncoras (`#kfka`, `#sobre`, `#contato`…) funcionam nos dois modos: abrir o site com uma âncora no modo jogo já mostra aquela tela, e a tela ativa atualiza a âncora com `history.replaceState`.
  - Ao trocar de tela, o foco vai para o título da tela nova, e uma região `aria-live` educada anuncia a mudança.
  - Se o conteúdo de uma tela for maior que a moldura (comum no celular), a rolagem acontece **dentro** da área de conteúdo, e a moldura e o menu ficam fixos.
  - No celular, o menu vira uma faixa compacta no topo da moldura (rolagem horizontal ou seletor), e o conteúdo fica embaixo.
  - Ao voltar para o modo sutil, a página rola até a seção que estava ativa.
- Sons: nenhum por padrão. Se houver, ficam desligados até o usuário ativar.

### Responsividade e acessibilidade
- No celular (até cerca de 700px), o menu e o painel ficam em uma coluna e as molduras são mantidas. A página não pode ter rolagem horizontal. Use margem lateral de 16px.
- HTML semântico, foco visível, contraste AA nos dois modos, `alt` nas imagens nos dois idiomas, e o menu de projetos acessível (lista de botões com `aria-current`/`aria-selected`).
- As imagens são carregadas com `loading="lazy"` e em tamanho adequado (WebP/PNG otimizado). O GIF do Batman pode virar vídeo `mp4/webm` em loop mudo, se ficar mais leve.

## 7. Conteúdo dos projetos (fontes)

| Projeto | Repositório | Local | Stack | Observações |
|---|---|---|---|---|
| KFKA | `github.com/2026-2-NADS2/Projeto3` | `Documents/GitHub/Projeto3/src/Entrega 2/Frontend` | React 19, Vite, react-router-dom | Plataforma de acompanhamento escolar (professores, famílias, escolas). PI da FECAP, grupo Collision. |
| Batman: Gotham Knights | `github.com/felipenono/batman_-gotham-nights` | `Documents/GitHub/batman_-gotham-nights` | JavaScript, Canvas 2D, Vite, MVC/POO | 3 fases, chefões, pontuação e controles de celular. Equipe de 4. Guilherme tem 11 dos 19 commits. |
| CasaSabor | `github.com/SouzaDuda/CasaSabor` | `Documents/GitHub/CasaSabor` | HTML, CSS | Site da FECAP feito em grupo. Guilherme fez `almoco.html`, entre outras partes (confirmar pelos commits). |

- **Prints:** Claude roda cada projeto localmente e captura de 2 a 3 telas representativas por projeto (desktop). Para o Batman, também um GIF/vídeo curto (5 a 10s) de gameplay.
- **Dados nos prints:** usar só dados fictícios. O front-end do KFKA já roda com dados de exemplo, então não é preciso subir backend nem banco. Nenhum print pode mostrar dados pessoais reais.
- **Repositórios:** os três são públicos (verificado em 2026-11-11). Mesmo assim, `repo` é opcional no esquema, como `online`: se estiver vazio, o link não aparece.
- **"Minha parte":** rascunho a partir de `git log --author` em cada repositório, revisado pelo Guilherme.
- **Sobre mim:** a partir de `C:\Users\ryuki\Downloads\Curriculo_Guilherme_Ryuki_Nov2026.pdf` (versão mais recente). Texto curto, PT e EN.
- **Batman é personagem da DC:** o projeto existe e é trabalho real do Guilherme, então pode aparecer com o nome do repositório. O site do portfólio não deve usar arte da DC fora dos prints do próprio jogo.

## 8. Deixado para quem constrói

- Nomes de arquivos e pastas, organização do CSS (ex.: variáveis por modo) e do JS.
- A escolha exata das fontes (desde que sigam as regras da seção 6 e venham do Google Fonts ou sejam auto-hospedadas) e os tons finais das paletas.
- Microinterações (animação do cursor ▶, texto da caixa de diálogo aparecendo letra por letra), sempre respeitando `prefers-reduced-motion` e nunca atrasando o acesso ao conteúdo.
- Como apresentar várias imagens por projeto (miniaturas, setas etc.).

## 9. Referências visuais

Os mockups da conversa estão em `docs/superpowers/mockups/`. A referência principal é `tema-rpg.html`, com as opções "sutil" e "imersivo", e o site usa as duas, com alternância entre elas. Os mockups são fragmentos e foram feitos para serem vistos dentro do companion visual. `layout-home.html` mostra uma etapa anterior, com estruturas sem tema que foram superadas pela direção RPG.
