// Servidor estático mínimo para desenvolvimento e para os testes de ponta a
// ponta. Serve a raiz do repositório, do mesmo jeito que o GitHub Pages.
// Uso: node scripts/servir.mjs [porta]

import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORTA = Number(process.argv[2]) || 5173;

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
};

function responder(resposta, status, texto) {
  resposta.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  resposta.end(texto);
}

// Converte o caminho da URL em um caminho de arquivo dentro da raiz.
// Retorna null quando o pedido tenta sair da raiz ou é inválido.
function resolverCaminho(url) {
  let caminho;
  try {
    caminho = decodeURIComponent(url.split(/[?#]/)[0]);
  } catch {
    return null;
  }
  if (caminho.includes("\0") || caminho.split(/[\/]/).includes("..")) {
    return null;
  }
  const arquivo = resolve(join(RAIZ, caminho));
  if (arquivo !== RAIZ && !arquivo.startsWith(RAIZ + sep)) {
    return null;
  }
  return arquivo;
}

const servidor = createServer(async (pedido, resposta) => {
  let arquivo = resolverCaminho(pedido.url ?? "/");
  if (arquivo === null) {
    responder(resposta, 403, "403 Acesso negado");
    return;
  }

  try {
    let info = await stat(arquivo);
    if (info.isDirectory()) {
      arquivo = join(arquivo, "index.html");
      info = await stat(arquivo);
    }
    resposta.writeHead(200, {
      "Content-Type":
        TIPOS[extname(arquivo).toLowerCase()] ?? "application/octet-stream",
      "Content-Length": info.size,
      "Cache-Control": "no-store",
    });
    if (pedido.method === "HEAD") {
      resposta.end();
      return;
    }
    createReadStream(arquivo)
      .on("error", () => resposta.destroy())
      .pipe(resposta);
  } catch {
    responder(resposta, 404, "404 Arquivo não encontrado");
  }
});

servidor.listen(PORTA, () => {
  console.log(`Servindo ${RAIZ} em http://localhost:${PORTA}`);
});
