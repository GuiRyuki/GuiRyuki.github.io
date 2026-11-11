export const textos = {
  pt: {
    "nav.projetos": "Projetos",
    "nav.sobre": "Sobre",
    "nav.contato": "Contato",
    "botao.modoJogo": "▶ Modo jogo",
    "botao.modoNormal": "Modo normal",
    "botao.idioma": "English",
    "botao.idiomaRotulo": "English: mudar o idioma do site para inglês",
    "projeto.minhaParte": "Minha parte",
    "projeto.equipamento": "Equipamento",
    "projeto.equipe": "Equipe",
    "projeto.repo": "Repositório",
    "projeto.online": "Ver online",
    "contato.titulo": "Contato",
    "contato.email": "E-mail",
    "tela.inicio": "Início",
    "aviso.telaAtual": "Tela atual: {tela}",
    "pular.conteudo": "Pular para o conteúdo",
    "nav.rotulo": "Seções do site",
    "avatar.alt": "Avatar em pixel art do Guilherme",
    "sobre.titulo": "Sobre mim",
    "contato.curriculo": "Currículo",
    "contato.baixarCurriculo": "Baixar PDF",
    "galeria.rotulo": "Imagens do projeto",
    "galeria.item": "Imagem {n} de {total}",
  },
  en: {
    "nav.projetos": "Projects",
    "nav.sobre": "About",
    "nav.contato": "Contact",
    "botao.modoJogo": "▶ Game mode",
    "botao.modoNormal": "Normal mode",
    "botao.idioma": "Português",
    "botao.idiomaRotulo": "Português: switch the site language to Portuguese",
    "projeto.minhaParte": "My part",
    "projeto.equipamento": "Equipment",
    "projeto.equipe": "Team",
    "projeto.repo": "Repository",
    "projeto.online": "View online",
    "contato.titulo": "Contact",
    "contato.email": "Email",
    "tela.inicio": "Home",
    "aviso.telaAtual": "Current screen: {tela}",
    "pular.conteudo": "Skip to content",
    "nav.rotulo": "Site sections",
    "avatar.alt": "Pixel art avatar of Guilherme",
    "sobre.titulo": "About me",
    "contato.curriculo": "Résumé",
    "contato.baixarCurriculo": "Download PDF",
    "galeria.rotulo": "Project images",
    "galeria.item": "Image {n} of {total}",
  },
};

export function detectarIdioma(linguas) {
  const primeira = linguas[0] ?? "";
  return primeira.toLowerCase().startsWith("pt") ? "pt" : "en";
}

export function traduzir(chave, idioma) {
  return textos[idioma]?.[chave] ?? chave;
}

export function textoDe(campo, idioma) {
  return campo[idioma];
}

// data-i18n="chave" troca o textContent;
// data-i18n-attr="aria-label:chave;title:chave" troca atributos.
export function aplicarTextos(raiz, idioma) {
  for (const elemento of raiz.querySelectorAll("[data-i18n]")) {
    elemento.textContent = traduzir(elemento.dataset.i18n, idioma);
  }
  for (const elemento of raiz.querySelectorAll("[data-i18n-attr]")) {
    for (const par of elemento.dataset.i18nAttr.split(";")) {
      const [atributo, chave] = par.split(":").map((parte) => parte.trim());
      if (atributo && chave) elemento.setAttribute(atributo, traduzir(chave, idioma));
    }
  }
  document.documentElement.lang = idioma === "pt" ? "pt-BR" : "en";
}
