import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CHAVE_IDIOMA,
  CHAVE_MODO,
  lerPreferencia,
  salvarPreferencia,
} from "../../js/preferencias.js";

// Armazenamento falso em memória, com a mesma interface usada do Storage.
function criarArmazenamentoFalso() {
  const dados = new Map();
  return {
    getItem: (chave) => (dados.has(chave) ? dados.get(chave) : null),
    setItem: (chave, valor) => {
      dados.set(chave, String(valor));
    },
  };
}

// Armazenamento que falha sempre, como o localStorage bloqueado pelo navegador.
function criarArmazenamentoQuebrado() {
  const falhar = () => {
    throw new DOMException("Acesso negado", "SecurityError");
  };
  return { getItem: falhar, setItem: falhar };
}

test("lerPreferencia retorna o padrão quando não há valor", () => {
  const fake = criarArmazenamentoFalso();
  assert.equal(lerPreferencia("x", "sutil", fake), "sutil");
});

test("salva e lê o valor", () => {
  const fake = criarArmazenamentoFalso();
  salvarPreferencia("x", "jogo", fake);
  assert.equal(lerPreferencia("x", "sutil", fake), "jogo");
});

test("não quebra quando o armazenamento lança erro", () => {
  const quebrado = criarArmazenamentoQuebrado();
  assert.equal(lerPreferencia("x", "sutil", quebrado), "sutil");
  assert.doesNotThrow(() => salvarPreferencia("x", "jogo", quebrado));
});

test("não quebra quando localStorage não existe", () => {
  // Simula um ambiente sem localStorage (ou com o acesso bloqueado), seja qual
  // for a versão do Node, e restaura a propriedade original ao final.
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new DOMException("Acesso negado", "SecurityError");
    },
  });
  try {
    assert.equal(lerPreferencia("x", "sutil", undefined), "sutil");
    assert.equal(lerPreferencia("x", "sutil"), "sutil");
    assert.doesNotThrow(() => salvarPreferencia("x", "jogo", undefined));
    delete globalThis.localStorage;
    assert.equal(lerPreferencia("x", "sutil"), "sutil");
    assert.doesNotThrow(() => salvarPreferencia("x", "jogo"));
  } finally {
    if (original) {
      Object.defineProperty(globalThis, "localStorage", original);
    } else {
      delete globalThis.localStorage;
    }
  }
});

test("as chaves têm os nomes combinados", () => {
  assert.equal(CHAVE_MODO, "portfolio.modo");
  assert.equal(CHAVE_IDIOMA, "portfolio.idioma");
});
