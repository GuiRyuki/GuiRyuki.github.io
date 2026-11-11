import { test } from "node:test";
import assert from "node:assert/strict";
import { projetos } from "../../data/projetos.js";
import { idsDeTela, proximoIndice, telaDoHash } from "../../js/telas.js";

const ids = idsDeTela(projetos);

test("idsDeTela começa no início, passa pelos projetos e termina em sobre e contato", () => {
  assert.equal(ids[0], "inicio");
  assert.deepEqual(ids.slice(-2), ["sobre", "contato"]);
  assert.deepEqual(ids.slice(1, -2), projetos.map((projeto) => projeto.id));
});

test("telaDoHash devolve a tela da âncora", () => {
  assert.equal(telaDoHash("#sobre", ids), "sobre");
  assert.equal(telaDoHash("#kfka", ids), "kfka");
  assert.equal(telaDoHash("sobre", ids), "sobre");
});

test("telaDoHash cai na tela inicial com âncora vazia ou desconhecida", () => {
  assert.equal(telaDoHash("#xyz", ids), "inicio");
  assert.equal(telaDoHash("", ids), "inicio");
  assert.equal(telaDoHash("#", ids), "inicio");
  assert.equal(telaDoHash(undefined, ids), "inicio");
  assert.equal(telaDoHash("#%E0%A4%A", ids), "inicio");
});

test("telaDoHash troca o apelido pela tela para onde ele aponta", () => {
  // "#projetos" é uma seção do modo sutil; no jogo ela vira a tela de um projeto.
  assert.equal(telaDoHash("#projetos", ids, { projetos: "gotham-knights" }), "gotham-knights");
  assert.equal(telaDoHash("projetos", ids, { projetos: "kfka" }), "kfka");
  // O apelido não atrapalha as âncoras que já são telas.
  assert.equal(telaDoHash("#sobre", ids, { projetos: "kfka" }), "sobre");
});

test("telaDoHash cai na tela inicial quando o apelido não leva a uma tela", () => {
  assert.equal(telaDoHash("#projetos", ids), "inicio");
  assert.equal(telaDoHash("#projetos", ids, { projetos: undefined }), "inicio");
  assert.equal(telaDoHash("#projetos", ids, { projetos: "nao-existe" }), "inicio");
  // Nomes herdados de Object.prototype não viram apelido.
  assert.equal(telaDoHash("#constructor", ids, {}), "inicio");
});

test("proximoIndice dá a volta nas pontas", () => {
  assert.equal(proximoIndice(0, -1, 5), 4);
  assert.equal(proximoIndice(4, 1, 5), 0);
  assert.equal(proximoIndice(1, 1, 5), 2);
  assert.equal(proximoIndice(3, -1, 5), 2);
});

test("proximoIndice sem cursor (-1) entra pela ponta do lado da seta", () => {
  assert.equal(proximoIndice(-1, 1, 5), 0);
  assert.equal(proximoIndice(-1, -1, 5), 4);
});
