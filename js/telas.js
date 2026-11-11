// Modo jogo em tela única: um menu com cursor ▶ e uma "tela" visível por vez.
// O HTML é o mesmo do modo sutil; aqui as seções que não estão em uso recebem
// `hidden` e, ao sair do modo jogo, tudo volta a aparecer.

import { traduzir } from "./i18n.js";

const TELA_INICIAL = "inicio";

// Seções do HTML que viram telas. Os projetos dividem a seção "projetos":
// o que muda entre eles é o conteúdo do #painel-projeto.
const SECOES = ["inicio", "projetos", "sobre", "contato"];

// Texto do item de menu e nome anunciado das telas que não são projeto.
const CHAVE_DO_NOME = {
  inicio: "tela.inicio",
  sobre: "sobre.titulo",
  contato: "contato.titulo",
};

// Elemento que recebe o foco em cada tela. A tela inicial não tem título,
// então o foco vai para o nome de quem fala na caixa de diálogo.
const SELETOR_DO_TITULO = {
  inicio: "#inicio .dialogo-nome",
  sobre: "#titulo-sobre",
  contato: "#titulo-contato",
};

export function idsDeTela(projetos) {
  return [TELA_INICIAL, ...projetos.map((projeto) => projeto.id), "sobre", "contato"];
}

// "#sobre" -> "sobre". Âncora vazia, malformada ou desconhecida cai na tela
// inicial, para nunca sobrar uma tela vazia.
export function telaDoHash(hash, ids) {
  let id = String(hash ?? "").replace(/^#/, "");
  try {
    id = decodeURIComponent(id);
  } catch {
    return TELA_INICIAL;
  }
  return ids.includes(id) ? id : TELA_INICIAL;
}

// Próxima posição do cursor, dando a volta nas pontas. Sem cursor (-1), a
// seta para baixo entra pelo primeiro item e a seta para cima, pelo último.
export function proximoIndice(atual, delta, total) {
  if (atual < 0) return delta > 0 ? 0 : total - 1;
  return (atual + delta + total) % total;
}

function idiomaDaPagina() {
  return document.documentElement.lang.toLowerCase().startsWith("pt") ? "pt" : "en";
}

// Liga a tela única. Chamar ao entrar no modo jogo e usar `encerrar()` ao sair.
// `aoMostrar(id)` roda antes de a tela aparecer: é a hora de quem chama
// desenhar o projeto escolhido no #painel-projeto.
export function iniciarTelas({ projetos, aoMostrar, idioma = idiomaDaPagina }) {
  const ids = idsDeTela(projetos);
  const idsDoMenu = ids.slice(1);
  const projetoPorId = new Map(projetos.map((projeto) => [projeto.id, projeto]));

  const navegacao = document.querySelector(".nav-jogo");
  const menu = document.getElementById("menu-jogo");
  const area = document.getElementById("tela");
  const aviso = document.getElementById("aviso-tela");

  const escondidas = new Set();
  const comTabindex = new Set();
  let atual = TELA_INICIAL;
  let cursor = -1;

  // Os itens de Sobre e Contato levam data-i18n: a troca de idioma atualiza o
  // texto sem remontar o menu, então o cursor e a seleção ficam onde estavam.
  const itens = idsDoMenu.map((id) => {
    const item = document.createElement("li");
    item.id = `item-jogo-${id}`;
    item.dataset.tela = id;
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", "false");
    const projeto = projetoPorId.get(id);
    if (projeto) {
      item.textContent = projeto.titulo;
    } else {
      item.dataset.i18n = CHAVE_DO_NOME[id];
      item.textContent = traduzir(CHAVE_DO_NOME[id], idioma());
    }
    return item;
  });
  menu.replaceChildren(...itens);
  navegacao.hidden = false;

  function nomeDaTela(id) {
    return projetoPorId.get(id)?.titulo ?? traduzir(CHAVE_DO_NOME[id], idioma());
  }

  function tituloDaTela(id) {
    return document.querySelector(
      projetoPorId.has(id) ? "#painel-projeto h3" : SELETOR_DO_TITULO[id],
    );
  }

  // No celular o menu é uma faixa que rola de lado.
  function trazerCursorParaAVista() {
    itens[cursor]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function moverCursor(indice) {
    cursor = indice;
    itens.forEach((item, posicao) => item.classList.toggle("cursor", posicao === cursor));
    const item = itens[cursor];
    if (item) {
      menu.setAttribute("aria-activedescendant", item.id);
      trazerCursorParaAVista();
    } else {
      menu.removeAttribute("aria-activedescendant");
    }
  }

  function mostrar(id, { focar = true } = {}) {
    atual = ids.includes(id) ? id : TELA_INICIAL;
    aoMostrar?.(atual);

    const secaoVisivel = projetoPorId.has(atual) ? "projetos" : atual;
    for (const idDaSecao of SECOES) {
      const secao = document.getElementById(idDaSecao);
      if (!secao) continue;
      if (idDaSecao === secaoVisivel) {
        if (escondidas.delete(secao)) secao.hidden = false;
      } else if (!secao.hidden) {
        secao.hidden = true;
        escondidas.add(secao);
      }
    }

    for (const item of itens) {
      item.setAttribute("aria-selected", String(item.dataset.tela === atual));
    }
    moverCursor(idsDoMenu.indexOf(atual));
    area.scrollTop = 0;

    if (location.hash !== `#${atual}`) {
      history.replaceState(history.state, "", `#${atual}`);
    }
    aviso.textContent = traduzir("aviso.telaAtual", idioma()).replace(
      "{tela}",
      nomeDaTela(atual),
    );

    if (focar) {
      const titulo = tituloDaTela(atual);
      if (titulo) {
        if (!titulo.hasAttribute("tabindex")) {
          titulo.setAttribute("tabindex", "-1");
          comTabindex.add(titulo);
        }
        titulo.focus({ preventScroll: true });
      }
    }
  }

  const TECLAS = {
    ArrowDown: () => moverCursor(proximoIndice(cursor, 1, itens.length)),
    ArrowRight: () => moverCursor(proximoIndice(cursor, 1, itens.length)),
    ArrowUp: () => moverCursor(proximoIndice(cursor, -1, itens.length)),
    ArrowLeft: () => moverCursor(proximoIndice(cursor, -1, itens.length)),
    Home: () => moverCursor(0),
    End: () => moverCursor(itens.length - 1),
    Enter: () => cursor >= 0 && mostrar(idsDoMenu[cursor]),
    " ": () => cursor >= 0 && mostrar(idsDoMenu[cursor]),
  };

  function aoTeclar(evento) {
    if (evento.altKey || evento.ctrlKey || evento.metaKey) return;
    const acao = TECLAS[evento.key];
    if (!acao) return;
    evento.preventDefault();
    acao();
  }

  function aoClicar(evento) {
    const item = evento.target.closest("[data-tela]");
    if (item) mostrar(item.dataset.tela);
  }

  // Quem sai do menu sem escolher nada encontra o cursor na tela atual.
  function aoSairDoMenu() {
    moverCursor(idsDoMenu.indexOf(atual));
  }

  // Links como o do nome no topo (#inicio) e o botão voltar do navegador.
  function aoMudarHash() {
    mostrar(telaDoHash(location.hash, ids));
  }

  menu.addEventListener("keydown", aoTeclar);
  menu.addEventListener("click", aoClicar);
  menu.addEventListener("focusout", aoSairDoMenu);
  window.addEventListener("hashchange", aoMudarHash);

  // A primeira tela vem da âncora e não rouba o foco de quem acabou de chegar.
  mostrar(telaDoHash(location.hash, ids), { focar: false });

  // A fonte do menu chega depois e alarga os itens; a faixa é ajustada de novo.
  let encerrado = false;
  document.fonts?.ready.then(() => {
    if (!encerrado) trazerCursorParaAVista();
  });

  function encerrar() {
    encerrado = true;
    menu.removeEventListener("keydown", aoTeclar);
    menu.removeEventListener("click", aoClicar);
    menu.removeEventListener("focusout", aoSairDoMenu);
    window.removeEventListener("hashchange", aoMudarHash);

    for (const secao of escondidas) secao.hidden = false;
    escondidas.clear();
    for (const titulo of comTabindex) titulo.removeAttribute("tabindex");
    comTabindex.clear();

    menu.removeAttribute("aria-activedescendant");
    menu.replaceChildren();
    navegacao.hidden = true;
    aviso.textContent = "";

    // De volta à página que rola: vai para onde a pessoa estava. O Safari só
    // deixa a página rolar depois de redesenhar sem a moldura, então a
    // rolagem é repetida no quadro seguinte.
    const alvo =
      atual === TELA_INICIAL
        ? null
        : document.getElementById(projetoPorId.has(atual) ? "projetos" : atual);
    const rolar = () => {
      if (document.documentElement.dataset.modo === "jogo") return;
      if (alvo) alvo.scrollIntoView();
      else window.scrollTo(0, 0);
    };
    rolar();
    requestAnimationFrame(rolar);
  }

  return { mostrar, telaAtual: () => atual, encerrar };
}
