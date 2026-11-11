// Tira o print de uma página com o Playwright (Chromium).
// Uso: node scripts/capturar.mjs <url> <saida.png|saida.webp> [largura=1440] [altura=900] [rolagem=0]
// A rolagem (em px) serve para fotografar um trecho mais abaixo na página.
//
// Quando a saída termina em .webp, o PNG é reencodado dentro do próprio
// Chromium (canvas), com no máximo 1600px de largura e cerca de 200KB.
// Isso dispensa ferramentas externas como cwebp ou ffmpeg.

import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

export const LARGURA_MAXIMA = 1600;
export const TAMANHO_MAXIMO = 200 * 1024;

// Converte um PNG (Buffer) em WebP, baixando a qualidade até caber no limite.
export async function paraWebp(
  navegador,
  png,
  { larguraMaxima = LARGURA_MAXIMA, tamanhoMaximo = TAMANHO_MAXIMO } = {},
) {
  const pagina = await navegador.newPage();
  try {
    const base64 = await pagina.evaluate(
      async ({ dados, larguraMaxima, tamanhoMaximo }) => {
        const imagem = new Image();
        imagem.src = "data:image/png;base64," + dados;
        await imagem.decode();
        const escala = Math.min(1, larguraMaxima / imagem.naturalWidth);
        const tela = document.createElement("canvas");
        tela.width = Math.round(imagem.naturalWidth * escala);
        tela.height = Math.round(imagem.naturalHeight * escala);
        const contexto = tela.getContext("2d");
        contexto.imageSmoothingQuality = "high";
        contexto.drawImage(imagem, 0, 0, tela.width, tela.height);

        let saida = "";
        for (let qualidade = 0.9; qualidade >= 0.3; qualidade -= 0.05) {
          saida = tela.toDataURL("image/webp", qualidade).split(",")[1];
          // Cada 4 caracteres de base64 guardam 3 bytes.
          if ((saida.length * 3) / 4 <= tamanhoMaximo) break;
        }
        return saida;
      },
      { dados: png.toString("base64"), larguraMaxima, tamanhoMaximo },
    );
    return Buffer.from(base64, "base64");
  } finally {
    await pagina.close();
  }
}

// Grava o print no disco, convertendo para WebP quando a extensão pedir.
export async function salvarPrint(navegador, png, saida) {
  const dados = saida.toLowerCase().endsWith(".webp")
    ? await paraWebp(navegador, png)
    : png;
  await writeFile(saida, dados);
  return dados.length;
}

async function principal() {
  const [url, saida, largura = "1440", altura = "900", rolagem = "0"] =
    process.argv.slice(2);
  if (!url || !saida) {
    console.error(
      "Uso: node scripts/capturar.mjs <url> <saida.png|saida.webp> [largura=1440] [altura=900] [rolagem=0]",
    );
    process.exit(1);
  }

  const navegador = await chromium.launch();
  try {
    const pagina = await navegador.newPage({
      viewport: { width: Number(largura), height: Number(altura) },
    });
    await pagina.goto(url, { waitUntil: "networkidle" });
    await pagina.evaluate(() => document.fonts.ready);
    if (Number(rolagem) > 0) {
      await pagina.evaluate((y) => window.scrollTo(0, y), Number(rolagem));
      await pagina.waitForLoadState("networkidle");
    }
    const png = await pagina.screenshot({ type: "png" });
    const bytes = await salvarPrint(navegador, png, saida);
    console.log(`${saida}: ${Math.round(bytes / 1024)}KB`);
  } finally {
    await navegador.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await principal();
}
