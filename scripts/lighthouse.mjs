// Roda o Lighthouse nos dois modos do site e falha se alguma nota ficar
// abaixo de 90 ou se o LCP passar de 2 segundos.
// Uso: node scripts/lighthouse.mjs [url=http://127.0.0.1:5173/]
//
// O Chrome é o Chromium que o Playwright já baixou. A configuração é a padrão
// do Lighthouse: celular, com a rede 4G e o processador lento simulados.
// Se o servidor local não estiver no ar, o script sobe o scripts/servir.mjs e
// derruba no final.

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import { chromium } from "@playwright/test";
// O puppeteer-core vem junto com o Lighthouse; aqui ele só grava o
// localStorage antes da auditoria.
import puppeteer from "puppeteer-core";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const URL_DO_SITE = process.argv[2] ?? "http://127.0.0.1:5173/";
const NOTA_MINIMA = 90;
const LCP_MAXIMO = 2000;
const CATEGORIAS = ["performance", "accessibility", "best-practices", "seo"];
const MODOS = ["sutil", "jogo"];

async function noAr(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

// Devolve o processo do servidor quando foi este script que subiu.
async function garantirServidor() {
  if (await noAr(URL_DO_SITE)) return null;
  const porta = new URL(URL_DO_SITE).port || "80";
  const servidor = spawn(process.execPath, [resolve(RAIZ, "scripts/servir.mjs"), porta], {
    stdio: "ignore",
  });
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    if (await noAr(URL_DO_SITE)) return servidor;
    await new Promise((resolver) => setTimeout(resolver, 100));
  }
  servidor.kill();
  throw new Error(`O servidor não respondeu em ${URL_DO_SITE}`);
}

async function comPagina(porta, acao) {
  const navegador = await puppeteer.connect({ browserURL: `http://127.0.0.1:${porta}` });
  const pagina = await navegador.newPage();
  try {
    await pagina.goto(URL_DO_SITE, { waitUntil: "load" });
    const retorno = await pagina.evaluate(acao);
    // A visita de preparação não pode deixar nada no cache para a auditoria.
    const sessao = await pagina.createCDPSession();
    await sessao.send("Network.clearBrowserCache");
    await sessao.detach();
    return retorno;
  } finally {
    await pagina.close();
    await navegador.disconnect();
  }
}

// Cada modo roda num Chrome novo, com perfil vazio. No modo jogo a
// preferência é gravada antes, e o Lighthouse é avisado para não limpar o
// armazenamento; no sutil ele limpa, como numa primeira visita. Depois da
// auditoria, a página é aberta de novo no mesmo perfil para conferir em que
// modo ela carrega.
async function auditar(modo) {
  const chrome = await launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ["--headless=new", "--no-first-run", "--disable-gpu"],
  });
  try {
    if (modo === "jogo") {
      await comPagina(chrome.port, () => localStorage.setItem("portfolio.modo", "jogo"));
    }
    const resultado = await lighthouse(URL_DO_SITE, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: CATEGORIAS,
      disableStorageReset: modo === "jogo",
    });
    const modoCarregado = await comPagina(
      chrome.port,
      () => document.documentElement.dataset.modo,
    );
    return { lhr: resultado.lhr, modoCarregado };
  } finally {
    try {
      chrome.kill();
    } catch {
      // No Windows, apagar o perfil temporário do Chrome às vezes dá EPERM.
      // A auditoria já terminou, então o erro da limpeza não importa.
    }
  }
}

function resumir(modo, lhr) {
  const notas = Object.fromEntries(
    CATEGORIAS.map((categoria) => [
      categoria,
      Math.round((lhr.categories[categoria].score ?? 0) * 100),
    ]),
  );
  const lcp = Math.round(lhr.audits["largest-contentful-paint"].numericValue);
  const problemas = [];
  for (const [categoria, nota] of Object.entries(notas)) {
    if (nota < NOTA_MINIMA) problemas.push(`${categoria} ${nota} (mínimo ${NOTA_MINIMA})`);
  }
  if (lcp > LCP_MAXIMO) problemas.push(`LCP ${lcp}ms (máximo ${LCP_MAXIMO}ms)`);

  // Auditorias que não tiraram nota máxima, para saber o que consertar.
  const reprovadas = Object.values(lhr.audits)
    .filter(
      (auditoria) =>
        auditoria.score !== null &&
        auditoria.score < 0.9 &&
        ["binary", "numeric", "metricSavings"].includes(auditoria.scoreDisplayMode),
    )
    .map((auditoria) => `${auditoria.id}${auditoria.displayValue ? ` (${auditoria.displayValue})` : ""}`);

  return {
    modo,
    notas,
    lcp,
    fcp: Math.round(lhr.audits["first-contentful-paint"].numericValue),
    tbt: Math.round(lhr.audits["total-blocking-time"].numericValue),
    cls: Number(lhr.audits["cumulative-layout-shift"].numericValue.toFixed(3)),
    reprovadas,
    problemas,
  };
}

const servidor = await garantirServidor();
const resumos = [];
try {
  await mkdir(resolve(RAIZ, "test-results"), { recursive: true });
  for (const modo of MODOS) {
    const { lhr, modoCarregado } = await auditar(modo);
    await writeFile(
      resolve(RAIZ, `test-results/lighthouse-${modo}.json`),
      JSON.stringify(lhr, null, 2),
    );
    const resumo = resumir(modo, lhr);
    if (lhr.runtimeError) resumo.problemas.push(`erro: ${lhr.runtimeError.message}`);
    if (modoCarregado !== modo) {
      resumo.problemas.push(`a página carregou no modo ${modoCarregado}, não no ${modo}`);
    }
    resumos.push(resumo);

    const { notas } = resumo;
    console.log(
      `${modo}: desempenho ${notas.performance}, acessibilidade ${notas.accessibility}, ` +
        `boas práticas ${notas["best-practices"]}, SEO ${notas.seo} | ` +
        `LCP ${resumo.lcp}ms, FCP ${resumo.fcp}ms, TBT ${resumo.tbt}ms, CLS ${resumo.cls}`,
    );
    if (resumo.reprovadas.length > 0) {
      console.log(`  abaixo de 90: ${resumo.reprovadas.join(", ")}`);
    }
  }
} finally {
  servidor?.kill();
}

const falhas = resumos.flatMap((resumo) =>
  resumo.problemas.map((problema) => `${resumo.modo}: ${problema}`),
);
if (falhas.length > 0) {
  console.error(`REPROVADO\n  ${falhas.join("\n  ")}`);
  process.exitCode = 1;
} else {
  console.log(`APROVADO: tudo em ${NOTA_MINIMA}+ e LCP até ${LCP_MAXIMO}ms nos dois modos.`);
}
