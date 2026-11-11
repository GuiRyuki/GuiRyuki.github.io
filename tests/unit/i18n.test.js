import { test } from "node:test";
import assert from "node:assert/strict";
import { textos, detectarIdioma, traduzir, textoDe, aplicarTextos } from "../../js/i18n.js";

const chavesMinimas = [
  "nav.projetos",
  "nav.sobre",
  "nav.contato",
  "botao.modoJogo",
  "botao.modoNormal",
  "botao.idioma",
  "projeto.minhaParte",
  "projeto.equipamento",
  "projeto.repo",
  "projeto.online",
  "contato.titulo",
  "contato.email",
  "tela.inicio",
  "aviso.telaAtual",
  "pular.conteudo",
];

test("pt e en têm exatamente as mesmas chaves", () => {
  assert.deepEqual(Object.keys(textos.pt).sort(), Object.keys(textos.en).sort());
});

test("as chaves mínimas existem", () => {
  for (const chave of chavesMinimas) assert.ok(chave in textos.pt, chave);
});

test("nenhum valor vazio", () => {
  for (const idioma of ["pt", "en"]) {
    for (const [chave, valor] of Object.entries(textos[idioma])) {
      assert.equal(typeof valor, "string", `${idioma}:${chave}`);
      assert.notEqual(valor.trim(), "", `${idioma}:${chave}`);
    }
  }
});

test("detectarIdioma escolhe pelo primeiro idioma da lista", () => {
  assert.equal(detectarIdioma(["pt-BR", "en"]), "pt");
  assert.equal(detectarIdioma(["en-US", "pt-BR"]), "en");
  assert.equal(detectarIdioma([]), "en");
});

test("traduzir devolve o texto do idioma ou a própria chave", () => {
  assert.equal(traduzir("botao.modoJogo", "pt"), "▶ Modo jogo");
  assert.equal(traduzir("botao.modoJogo", "en"), "▶ Game mode");
  assert.equal(traduzir("nao.existe", "pt"), "nao.existe");
});

test("aviso.telaAtual tem o marcador {tela} nos dois idiomas", () => {
  assert.ok(textos.pt["aviso.telaAtual"].includes("{tela}"));
  assert.ok(textos.en["aviso.telaAtual"].includes("{tela}"));
});

test("textoDe devolve o texto do idioma pedido", () => {
  const campo = { pt: "Olá", en: "Hello" };
  assert.equal(textoDe(campo, "pt"), "Olá");
  assert.equal(textoDe(campo, "en"), "Hello");
});

test("aplicarTextos troca textos, atributos e o lang do documento", () => {
  const comTexto = { dataset: { i18n: "nav.sobre" }, textContent: "" };
  const atributos = {};
  const comAtributo = {
    dataset: { i18nAttr: "aria-label:nav.contato;title:pular.conteudo" },
    setAttribute: (nome, valor) => { atributos[nome] = valor; },
  };
  const raiz = {
    querySelectorAll: (seletor) => (seletor === "[data-i18n]" ? [comTexto] : [comAtributo]),
  };
  globalThis.document = { documentElement: { lang: "" } };
  try {
    aplicarTextos(raiz, "en");
    assert.equal(comTexto.textContent, "About");
    assert.deepEqual(atributos, { "aria-label": "Contact", title: "Skip to content" });
    assert.equal(document.documentElement.lang, "en");
    aplicarTextos(raiz, "pt");
    assert.equal(comTexto.textContent, "Sobre");
    assert.equal(document.documentElement.lang, "pt-BR");
  } finally {
    delete globalThis.document;
  }
});
