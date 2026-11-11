// Validação dos dados e montagem do menu, do painel de projeto e do perfil.
// Tudo é criado com createElement/textContent: nenhum dado vira HTML cru.

import { textoDe, traduzir } from "./i18n.js";

// Proporção reservada para prints e vídeo, para o layout não pular enquanto
// a mídia carrega.
const LARGURA_MIDIA = 1280;
const ALTURA_MIDIA = 720;

// Com o tipo declarado, o navegador que não toca o formato nem baixa o arquivo.
const TIPOS_DE_VIDEO = { webm: "video/webm", mp4: "video/mp4" };

function movimentoReduzido() {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function textoPreenchido(valor) {
  return typeof valor === "string" && valor.trim() !== "";
}

function bilingue(valor) {
  return (
    valor !== null &&
    typeof valor === "object" &&
    textoPreenchido(valor.pt) &&
    textoPreenchido(valor.en)
  );
}

// Devolve a lista de problemas do projeto; vazia quando ele pode ser exibido.
export function validarProjeto(p) {
  if (p === null || typeof p !== "object" || Array.isArray(p)) {
    return ["o projeto precisa ser um objeto"];
  }
  const erros = [];

  if (!textoPreenchido(p.id) || !/^[a-z0-9-]+$/.test(p.id)) {
    erros.push("id: use só letras minúsculas, números e hífen");
  }
  if (!textoPreenchido(p.titulo)) erros.push("titulo: texto obrigatório");
  if (!Number.isInteger(p.ano)) erros.push("ano: número inteiro obrigatório");
  if (!Array.isArray(p.stack) || p.stack.length === 0 || !p.stack.every(textoPreenchido)) {
    erros.push("stack: lista com pelo menos uma tecnologia");
  }
  for (const campo of ["resumo", "minhaParte", "equipe"]) {
    if (!bilingue(p[campo])) erros.push(`${campo}: precisa de texto em pt e en`);
  }
  for (const campo of ["repo", "online"]) {
    if (p[campo] !== undefined && typeof p[campo] !== "string") {
      erros.push(`${campo}: precisa ser texto (vazio esconde o link)`);
    }
  }

  if (!Array.isArray(p.imagens) || p.imagens.length === 0) {
    erros.push("imagens: lista com pelo menos uma imagem");
  } else {
    p.imagens.forEach((imagem, indice) => {
      if (!textoPreenchido(imagem?.src)) erros.push(`imagens[${indice}].src: obrigatório`);
      if (!bilingue(imagem?.alt)) erros.push(`imagens[${indice}].alt: precisa de pt e en`);
    });
  }

  if (p.destaque !== null && p.destaque !== undefined) {
    if (!textoPreenchido(p.destaque.src)) erros.push("destaque.src: obrigatório");
    if (!textoPreenchido(p.destaque.poster)) erros.push("destaque.poster: obrigatório");
    if (!bilingue(p.destaque.alt)) erros.push("destaque.alt: precisa de pt e en");
  }

  return erros;
}

function criar(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

export function renderizarMenu(lista, projetos, idioma, ativoId) {
  // Se o foco estava num item, ele volta para o mesmo item depois de remontar.
  const focado = lista.contains(document.activeElement)
    ? document.activeElement.dataset.projeto
    : null;

  const itens = projetos.map((projeto) => {
    const item = document.createElement("li");
    const botao = criar("button", "menu-item");
    botao.type = "button";
    botao.dataset.projeto = projeto.id;
    if (projeto.id === ativoId) botao.setAttribute("aria-current", "true");
    botao.append(
      criar("span", "menu-item-titulo", projeto.titulo),
      criar("span", "menu-item-stack", projeto.stack.join(", ")),
    );
    item.append(botao);
    return item;
  });
  lista.replaceChildren(...itens);

  if (focado !== null) {
    for (const botao of lista.querySelectorAll("button")) {
      if (botao.dataset.projeto === focado) botao.focus();
    }
  }
}

// O vídeo de destaque vem antes das imagens: é o que mais mostra o projeto.
function midiasDe(projeto) {
  const midias = projeto.imagens.map((imagem) => ({ tipo: "imagem", ...imagem }));
  if (projeto.destaque) midias.unshift({ tipo: "video", ...projeto.destaque });
  return midias;
}

function criarMidia(midia, idioma) {
  const alt = textoDe(midia.alt, idioma);
  if (midia.tipo === "video") {
    const video = document.createElement("video");
    video.poster = midia.poster;
    // Os controles ficam sempre à mostra: dá para pausar o vídeo que toca
    // sozinho e para dar play quando ele começa parado.
    video.controls = true;
    // O atributo muted (e não só a propriedade) é o que libera o autoplay.
    video.setAttribute("muted", "");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", ""); // o Firefox não reflete a propriedade
    // Com movimento reduzido, o vídeo fica parado no poster e nem é baixado.
    if (movimentoReduzido()) {
      video.preload = "none";
    } else {
      video.autoplay = true;
    }
    video.width = LARGURA_MIDIA;
    video.height = ALTURA_MIDIA;
    video.setAttribute("aria-label", alt);

    const fonte = document.createElement("source");
    fonte.src = midia.src;
    const tipo = TIPOS_DE_VIDEO[midia.src.split(".").pop().toLowerCase()];
    if (tipo) fonte.type = tipo;
    // O arquivo só é ligado ao vídeo depois que a página termina de carregar:
    // assim ele não disputa banda com o conteúdo nem segura o evento load.
    if (document.readyState === "complete") {
      video.append(fonte);
    } else {
      window.addEventListener("load", () => video.append(fonte), { once: true });
    }
    return video;
  }
  const imagem = document.createElement("img");
  imagem.loading = "lazy";
  imagem.decoding = "async";
  imagem.width = LARGURA_MIDIA;
  imagem.height = ALTURA_MIDIA;
  imagem.alt = alt;
  imagem.src = midia.src;
  return imagem;
}

// O vídeo que sai da página para de tocar antes de ser trocado.
function pausarVideos(raiz) {
  for (const video of raiz.querySelectorAll("video")) video.pause();
}

function criarGaleria(projeto, idioma) {
  const midias = midiasDe(projeto);
  const galeria = criar("div", "galeria");
  const moldura = criar("div", "midia");
  moldura.append(criarMidia(midias[0], idioma));
  galeria.append(moldura);
  if (midias.length < 2) return galeria;

  const controles = criar("div", "galeria-controles");
  controles.setAttribute("role", "group");
  controles.setAttribute("aria-label", traduzir("galeria.rotulo", idioma));
  midias.forEach((midia, indice) => {
    const botao = criar("button", "galeria-botao", String(indice + 1));
    botao.type = "button";
    botao.setAttribute(
      "aria-label",
      traduzir("galeria.item", idioma)
        .replace("{n}", indice + 1)
        .replace("{total}", midias.length),
    );
    if (indice === 0) botao.setAttribute("aria-current", "true");
    botao.addEventListener("click", () => {
      pausarVideos(moldura);
      moldura.replaceChildren(criarMidia(midia, idioma));
      for (const outro of controles.children) outro.removeAttribute("aria-current");
      botao.setAttribute("aria-current", "true");
    });
    controles.append(botao);
  });
  galeria.append(controles);
  return galeria;
}

function criarLink(tipo, href, texto) {
  const link = criar("a", "", texto);
  link.href = href;
  link.dataset.link = tipo;
  link.rel = "noopener";
  return link;
}

export function renderizarPainel(painel, projeto, idioma) {
  const titulo = criar("h3", "painel-titulo", projeto.titulo);
  titulo.id = "painel-titulo";
  painel.setAttribute("aria-labelledby", titulo.id);

  const dados = criar(
    "p",
    "painel-dados",
    `${projeto.ano}, ${textoDe(projeto.equipe, idioma)}`,
  );

  const minhaParte = criar("div", "minha-parte");
  minhaParte.append(
    criar("h4", "", traduzir("projeto.minhaParte", idioma)),
    criar("p", "", textoDe(projeto.minhaParte, idioma)),
  );

  const equipamento = criar("div", "equipamento");
  const stack = criar("ul", "stack");
  stack.append(...projeto.stack.map((tecnologia) => criar("li", "", tecnologia)));
  equipamento.append(criar("h4", "", traduzir("projeto.equipamento", idioma)), stack);

  const partes = [
    titulo,
    dados,
    criarGaleria(projeto, idioma),
    criar("p", "painel-resumo", textoDe(projeto.resumo, idioma)),
    minhaParte,
    equipamento,
  ];

  const links = [];
  if (projeto.repo) links.push(criarLink("repo", projeto.repo, traduzir("projeto.repo", idioma)));
  if (projeto.online) {
    links.push(criarLink("online", projeto.online, traduzir("projeto.online", idioma)));
  }
  if (links.length > 0) {
    const paragrafo = criar("p", "painel-links");
    paragrafo.append(...links);
    partes.push(paragrafo);
  }

  pausarVideos(painel);
  painel.replaceChildren(...partes);
}

function preencher(raiz, seletor, texto) {
  for (const elemento of raiz.querySelectorAll(seletor)) elemento.textContent = texto;
}

function semProtocolo(url) {
  return url.replace(/^https?:\/\/(www\.)?/, "");
}

export function renderizarPerfil(raiz, perfil, idioma) {
  preencher(raiz, '[data-perfil="nome"]', perfil.nome);
  preencher(raiz, '[data-perfil="primeiro-nome"]', perfil.nome.split(" ")[0]);
  preencher(raiz, '[data-perfil="dialogo"]', textoDe(perfil.dialogo, idioma));
  preencher(raiz, '[data-perfil="formacao"]', textoDe(perfil.formacao, idioma));
  preencher(raiz, '[data-perfil="sobre"]', textoDe(perfil.sobre, idioma));
  for (const imagem of raiz.querySelectorAll('img[data-perfil="avatar"]')) {
    if (imagem.getAttribute("src") !== perfil.avatar) imagem.src = perfil.avatar;
  }

  const { email, github, linkedin } = perfil.contatos;
  const contatos = [
    ["email", traduzir("contato.email", idioma), `mailto:${email}`, email],
    ["github", "GitHub", github, semProtocolo(github)],
    ["linkedin", "LinkedIn", linkedin, semProtocolo(linkedin)],
  ];
  if (perfil.curriculo) {
    contatos.push([
      "curriculo",
      traduzir("contato.curriculo", idioma),
      perfil.curriculo,
      traduzir("contato.baixarCurriculo", idioma),
    ]);
  }

  for (const lista of raiz.querySelectorAll('[data-perfil="contatos"]')) {
    const itens = contatos.map(([tipo, rotulo, href, texto]) => {
      const item = document.createElement("li");
      const link = criar("a", "", texto);
      link.href = href;
      link.dataset.contato = tipo;
      if (tipo === "curriculo") link.download = "";
      item.append(criar("span", "contato-rotulo", rotulo), link);
      return item;
    });
    lista.replaceChildren(...itens);
  }
}
