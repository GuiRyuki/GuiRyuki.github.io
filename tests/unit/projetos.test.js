import { test } from "node:test";
import assert from "node:assert/strict";
import { validarProjeto } from "../../js/projetos.js";
import { projetos } from "../../data/projetos.js";

test("projeto vazio devolve erros que citam os campos", () => {
  const erros = validarProjeto({});
  for (const campo of ["id", "titulo", "imagens"]) {
    assert.ok(
      erros.some((erro) => erro.startsWith(campo + ":")),
      "falta citar " + campo,
    );
  }
});

test("valor que não é objeto devolve erro em vez de lançar", () => {
  for (const valor of [null, undefined, "kfka", 3, []]) {
    assert.ok(validarProjeto(valor).length > 0, String(valor));
  }
});

test("todos os projetos do arquivo de dados são válidos", () => {
  for (const projeto of projetos) {
    assert.deepEqual(validarProjeto(projeto), [], projeto.id);
  }
});

test("texto bilíngue incompleto e imagem sem alt são apontados", () => {
  const base = structuredClone(projetos[0]);
  base.resumo = { pt: "Só em português" };
  base.imagens = [{ src: "assets/x.webp" }];
  const erros = validarProjeto(base).join("\n");
  assert.match(erros, /resumo/);
  assert.match(erros, /alt/);
});

test("repo e online podem ficar vazios ou ausentes", () => {
  const base = structuredClone(projetos[0]);
  base.repo = "";
  delete base.online;
  assert.deepEqual(validarProjeto(base), []);
});
