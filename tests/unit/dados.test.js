import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { projetos } from "../../data/projetos.js";
import { perfil } from "../../data/perfil.js";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function textosBilingues(valor, achados = []) {
  if (Array.isArray(valor)) {
    for (const item of valor) textosBilingues(item, achados);
  } else if (valor && typeof valor === "object") {
    if ("pt" in valor) achados.push(valor);
    for (const item of Object.values(valor)) textosBilingues(item, achados);
  }
  return achados;
}

test("todo projeto tem os campos obrigatórios", () => {
  assert.ok(projetos.length >= 1);
  for (const projeto of projetos) {
    assert.match(projeto.id, /^[a-z0-9-]+$/);
    assert.notEqual(projeto.titulo.trim(), "", `titulo de ${projeto.id}`);
    assert.ok(projeto.stack.length >= 1, `stack de ${projeto.id}`);
    assert.ok(projeto.imagens.length >= 1, `imagens de ${projeto.id}`);
  }
});

test("todo texto bilíngue tem pt e en não vazios", () => {
  const achados = textosBilingues([projetos, perfil]);
  assert.ok(achados.length > 0);
  for (const texto of achados) {
    for (const idioma of ["pt", "en"]) {
      assert.equal(typeof texto[idioma], "string", JSON.stringify(texto));
      assert.notEqual(texto[idioma].trim(), "", JSON.stringify(texto));
    }
  }
});

test("ids são únicos", () => {
  const ids = projetos.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("ordem inicial", () => {
  assert.deepEqual(
    projetos.map((p) => p.id).slice(0, 3),
    ["kfka", "gotham-knights", "casasabor"],
  );
});

test("imagens existem no disco", { todo: true }, () => {
  for (const projeto of projetos) {
    const arquivos = projeto.imagens.map((imagem) => imagem.src);
    if (projeto.destaque) arquivos.push(projeto.destaque.src, projeto.destaque.poster);
    for (const arquivo of arquivos) {
      assert.ok(fs.existsSync(path.join(raiz, arquivo)), `falta ${arquivo}`);
    }
  }
});

test("contatos", () => {
  assert.deepEqual(perfil.contatos, {
    email: "ryuki.gui@gmail.com",
    github: "https://github.com/GuiRyuki",
    linkedin: "https://www.linkedin.com/in/guiryuki",
  });
  assert.equal(perfil.curriculo, "");
});
