// Ponto de entrada da página: guarda o estado e redesenha o que depende dele.

import { projetos as todosOsProjetos } from "../data/projetos.js";
import { perfil } from "../data/perfil.js";
import { aplicarTextos, detectarIdioma, traduzir } from "./i18n.js";
import { aplicarModo } from "./modo.js";
import {
  CHAVE_IDIOMA,
  CHAVE_MODO,
  lerPreferencia,
  salvarPreferencia,
} from "./preferencias.js";
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

const IDIOMAS = ["pt", "en"];

// Vale a preferência salva; sem ela (ou com um valor que o site não conhece),
// vale o idioma do navegador.
function idiomaInicial() {
  const salvo = lerPreferencia(CHAVE_IDIOMA, null);
  return IDIOMAS.includes(salvo) ? salvo : detectarIdioma(navigator.languages);
}

// Troca o idioma sem recarregar a página. O projeto ativo fica no estado,
// então continua o mesmo depois de redesenhar.
export function definirIdioma(idioma) {
  if (!IDIOMAS.includes(idioma)) return;
  estado.idioma = idioma;
  salvarPreferencia(CHAVE_IDIOMA, idioma);
  rerenderizar();
}

const MODOS = ["sutil", "jogo"];

// Só "sutil" e "jogo" valem; qualquer outro valor salvo abre no modo sutil.
function modoInicial() {
  const salvo = lerPreferencia(CHAVE_MODO, "sutil");
  return MODOS.includes(salvo) ? salvo : "sutil";
}

// O botão é um interruptor e o rótulo diz para onde ele leva. A chave do
// texto fica no data-i18n, então a troca de idioma mantém o rótulo certo.
function atualizarBotaoModo() {
  const botao = document.getElementById("botao-modo");
  const noJogo = estado.modo === "jogo";
  botao.dataset.i18n = noJogo ? "botao.modoNormal" : "botao.modoJogo";
  botao.textContent = traduzir(botao.dataset.i18n, estado.idioma);
  botao.setAttribute("aria-pressed", String(noJogo));
}

// Mostra o modo no <html> e no botão, sem salvar nem avisar ninguém.
function mostrarModo(modo, opcoes) {
  estado.modo = modo;
  aplicarModo(modo, opcoes);
  atualizarBotaoModo();
}

export function definirModo(modo) {
  if (!MODOS.includes(modo)) return;
  mostrarModo(modo, { animar: true });
  salvarPreferencia(CHAVE_MODO, modo);
  document.dispatchEvent(new CustomEvent("modo-mudou", { detail: { modo } }));
}

// O conteúdo é montado depois que o navegador já tentou rolar até a âncora,
// então a rolagem é refeita com a página no tamanho final.
function rolarAteAncora() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (id) document.getElementById(id)?.scrollIntoView();
}

export function iniciar() {
  estado.idioma = idiomaInicial();
  mostrarModo(modoInicial());
  rerenderizar();

  document.getElementById("botao-modo").addEventListener("click", () => {
    definirModo(estado.modo === "jogo" ? "sutil" : "jogo");
  });

  document.getElementById("botao-idioma").addEventListener("click", () => {
    definirIdioma(estado.idioma === "pt" ? "en" : "pt");
  });

  document.getElementById("menu-projetos").addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-projeto]");
    if (botao) selecionarProjeto(botao.dataset.projeto);
  });

  rolarAteAncora();
}
