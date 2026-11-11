// Ponto de entrada da página: guarda o estado e redesenha o que depende dele.

import { projetos as todosOsProjetos } from "../data/projetos.js";
import { perfil } from "../data/perfil.js";
import { aplicarTextos, detectarIdioma } from "./i18n.js";
import {
  renderizarMenu,
  renderizarPainel,
  renderizarPerfil,
  validarProjeto,
} from "./projetos.js";

// Projeto com dado faltando fica fora da página e é avisado no console, em
// vez de aparecer quebrado.
const projetos = todosOsProjetos.filter((projeto) => {
  const erros = validarProjeto(projeto);
  if (erros.length > 0) {
    console.warn(`Projeto ignorado (${projeto?.id ?? "sem id"}):`, erros);
  }
  return erros.length === 0;
});

export const estado = {
  idioma: "pt",
  modo: "sutil",
  projetoAtivo: projetos[0]?.id ?? null,
};

export function rerenderizar() {
  aplicarTextos(document, estado.idioma);
  renderizarPerfil(document, perfil, estado.idioma);

  const menu = document.getElementById("menu-projetos");
  const painel = document.getElementById("painel-projeto");
  const ativo = projetos.find((projeto) => projeto.id === estado.projetoAtivo);
  renderizarMenu(menu, projetos, estado.idioma, estado.projetoAtivo);
  if (ativo) renderizarPainel(painel, ativo, estado.idioma);
}

function selecionarProjeto(id) {
  if (id === estado.projetoAtivo) return;
  estado.projetoAtivo = id;
  rerenderizar();
}

// O conteúdo é montado depois que o navegador já tentou rolar até a âncora,
// então a rolagem é refeita com a página no tamanho final.
function rolarAteAncora() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (id) document.getElementById(id)?.scrollIntoView();
}

export function iniciar() {
  estado.idioma = detectarIdioma(navigator.languages);
  rerenderizar();

  document.getElementById("menu-projetos").addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-projeto]");
    if (botao) selecionarProjeto(botao.dataset.projeto);
  });

  rolarAteAncora();
}
