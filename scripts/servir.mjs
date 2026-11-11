// Servidor estático mínimo para desenvolvimento e para os testes de ponta a
// ponta. Serve a raiz do repositório, do mesmo jeito que o GitHub Pages.
// Uso: node scripts/servir.mjs [porta] [raiz]
// A raiz é opcional e serve para abrir outra pasta estática (por exemplo, um
// projeto vizinho na hora de tirar os prints).

import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = process.argv[3]
  ? resolve(process.argv[3])
  : resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORTA = Number(process.argv[2]) || 5173;

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
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

// Interpreta "Range: bytes=inicio-fim". Devolve null quando não há pedido de
// trecho (ou ele vem num formato que este servidor ignora) e "invalido" quando
// o trecho fica fora do arquivo.
function lerTrecho(cabecalho, tamanho) {
  const partes = /^bytes=(\d*)-(\d*)$/.exec(cabecalho ?? "");
  if (!partes || (partes[1] === "" && partes[2] === "")) return null;
  let inicio;
  let fim;
  if (partes[1] === "") {
    // "bytes=-N": os últimos N bytes.
    inicio = Math.max(0, tamanho - Number(partes[2]));
    fim = tamanho - 1;
  } else {
    inicio = Number(partes[1]);
    fim = partes[2] === "" ? tamanho - 1 : Math.min(Number(partes[2]), tamanho - 1);
  }
  if (inicio > fim || inicio >= tamanho) return "invalido";
  return { inicio, fim };
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
    const cabecalhos = {
      "Content-Type":
        TIPOS[extname(arquivo).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": "no-store",
      "Accept-Ranges": "bytes",
    };

    // Pedido de um trecho do arquivo (Range). O Safari só toca vídeo se o
    // servidor responder assim, como o GitHub Pages responde.
    const trecho = lerTrecho(pedido.headers.range, info.size);
    if (trecho === "invalido") {
      resposta.writeHead(416, { "Content-Range": `bytes */${info.size}` });
      resposta.end();
      return;
    }
    if (trecho) {
      cabecalhos["Content-Range"] = `bytes ${trecho.inicio}-${trecho.fim}/${info.size}`;
      cabecalhos["Content-Length"] = trecho.fim - trecho.inicio + 1;
      resposta.writeHead(206, cabecalhos);
    } else {
      cabecalhos["Content-Length"] = info.size;
      resposta.writeHead(200, cabecalhos);
    }
    if (pedido.method === "HEAD" || info.size === 0) {
      resposta.end();
      return;
    }
    createReadStream(arquivo, trecho ? { start: trecho.inicio, end: trecho.fim } : {})
      .on("error", () => resposta.destroy())
      .pipe(resposta);
  } catch {
    responder(resposta, 404, "404 Arquivo não encontrado");
  }
});

servidor.listen(PORTA, () => {
  console.log(`Servindo ${RAIZ} em http://localhost:${PORTA}`);
});
