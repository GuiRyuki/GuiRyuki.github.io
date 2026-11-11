import { test, expect } from "@playwright/test";
import { textos } from "../../js/i18n.js";

const botaoModo = "#botao-modo";
const html = "html";

// Paleta do modo jogo, na forma que o navegador devolve em getComputedStyle.
const PALETA_JOGO = [
  "rgb(15, 26, 19)", // #0f1a13
  "rgb(22, 38, 27)", // #16261b
  "rgb(61, 122, 76)", // #3d7a4c
  "rgb(155, 188, 138)", // #9bbc8a
  "rgb(230, 238, 214)", // #e6eed6
];

async function abrir(page) {
  await page.goto("/");
  await expect(page.locator("#painel-projeto h3")).toBeVisible();
}

test.use({ locale: "pt-BR" });

test("alterna e volta", async ({ page }) => {
  await abrir(page);
  await expect(page.locator(html)).not.toHaveAttribute("data-modo", "jogo");
  await expect(page.locator(botaoModo)).toHaveAttribute("aria-pressed", "false");

  const eventos = await page.evaluateHandle(() => {
    const lista = [];
    document.addEventListener("modo-mudou", (evento) => lista.push(evento.detail.modo));
    return lista;
  });

  await page.locator(botaoModo).click();
  await expect(page.locator(html)).toHaveAttribute("data-modo", "jogo");
  await expect(page.locator(botaoModo)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(botaoModo)).toHaveText(textos.pt["botao.modoNormal"]);

  await page.locator(botaoModo).click();
  await expect(page.locator(html)).not.toHaveAttribute("data-modo", "jogo");
  await expect(page.locator(botaoModo)).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(botaoModo)).toHaveText(textos.pt["botao.modoJogo"]);

  expect(await eventos.jsonValue()).toEqual(["jogo", "sutil"]);
});

test("o rótulo do botão acompanha o idioma no modo jogo", async ({ page }) => {
  await abrir(page);
  await page.locator(botaoModo).click();
  await page.locator("#botao-idioma").click();
  await expect(page.locator(html)).toHaveAttribute("data-modo", "jogo");
  await expect(page.locator(botaoModo)).toHaveText(textos.en["botao.modoNormal"]);
});

test("persiste", async ({ page }) => {
  await abrir(page);
  await page.locator(botaoModo).click();
  await expect(page.locator(html)).toHaveAttribute("data-modo", "jogo");

  await page.reload();
  // No modo jogo a página abre na tela inicial; o painel fica escondido.
  await expect(page.locator(".dialogo")).toBeVisible();
  await expect(page.locator(html)).toHaveAttribute("data-modo", "jogo");
  await expect(page.locator(botaoModo)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(botaoModo)).toHaveText(textos.pt["botao.modoNormal"]);
});

test("valor desconhecido salvo abre no modo sutil", async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("portfolio.modo", "arcade");
    } catch {}
  });
  await abrir(page);
  await expect(page.locator(html)).not.toHaveAttribute("data-modo", "jogo");
});

test("localStorage bloqueado", async ({ page }) => {
  const erros = [];
  page.on("pageerror", (erro) => erros.push(erro.message));
  await page.addInitScript(() => {
    const bloquear = () => {
      throw new Error("armazenamento bloqueado");
    };
    Storage.prototype.getItem = bloquear;
    Storage.prototype.setItem = bloquear;
  });

  await abrir(page);
  await expect(page.locator(html)).not.toHaveAttribute("data-modo", "jogo");

  await page.locator(botaoModo).click();
  await expect(page.locator(html)).toHaveAttribute("data-modo", "jogo");
  await page.locator(botaoModo).click();
  await expect(page.locator(html)).not.toHaveAttribute("data-modo", "jogo");

  expect(erros).toEqual([]);
});

test("entrar no modo jogo toca a transição e ela termina em menos de 400ms", async ({ page }) => {
  await abrir(page);
  await page.locator(botaoModo).click();
  await expect(page.locator(html)).toHaveClass(/transicao-modo/);
  await page.waitForTimeout(400);
  await expect(page.locator(html)).not.toHaveClass(/transicao-modo/);
});

test.describe("movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });

  test("alternar não adiciona transicao-modo", async ({ page }) => {
    await abrir(page);
    // Registra qualquer passagem da classe pelo <html>, mesmo que rápida.
    await page.evaluate(() => {
      window.__teveTransicao = false;
      new MutationObserver(() => {
        if (document.documentElement.classList.contains("transicao-modo")) {
          window.__teveTransicao = true;
        }
      }).observe(document.documentElement, { attributes: true });
    });

    await page.locator(botaoModo).click();
    await expect(page.locator(html)).toHaveAttribute("data-modo", "jogo");
    await expect(page.locator(html)).not.toHaveClass(/transicao-modo/);
    expect(await page.evaluate(() => window.__teveTransicao)).toBe(false);
  });
});

test.describe("paleta do jogo", () => {
  test.use({ reducedMotion: "reduce" });

  test("a moldura e as caixas usam só cores da paleta", async ({ page }) => {
    await abrir(page);
    await page.locator(botaoModo).click();
    await expect(page.locator(html)).toHaveAttribute("data-modo", "jogo");

    // A moldura é o <body>: a "tela" do portátil, com a borda grossa.
    const moldura = await page.locator("body").evaluate((el) => {
      const estilo = getComputedStyle(el);
      return {
        fundo: estilo.backgroundColor,
        borda: estilo.borderTopColor,
        largura: parseFloat(estilo.borderTopWidth),
      };
    });
    expect(PALETA_JOGO).toContain(moldura.fundo);
    expect(PALETA_JOGO).toContain(moldura.borda);
    expect(moldura.largura).toBeGreaterThanOrEqual(4);

    for (const seletor of [".dialogo", "#menu-jogo", "#painel-projeto"]) {
      const fundo = await page
        .locator(seletor)
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(PALETA_JOGO, seletor).toContain(fundo);
    }
  });

  test("o texto longo continua em Instrument Sans com 16px ou mais", async ({ page }) => {
    await abrir(page);
    await page.locator(botaoModo).click();
    for (const seletor of [".painel-resumo", ".minha-parte p", ".sobre-texto", ".dialogo-texto"]) {
      const estilo = await page.locator(seletor).evaluate((el) => {
        const calculado = getComputedStyle(el);
        return { fonte: calculado.fontFamily, tamanho: parseFloat(calculado.fontSize) };
      });
      expect(estilo.fonte, seletor).toContain("Instrument Sans");
      expect(estilo.tamanho, seletor).toBeGreaterThanOrEqual(16);
    }
  });

  test("não aparece rolagem horizontal em 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await abrir(page);
    await page.locator(botaoModo).click();
    await page.locator("#botao-idioma").click();
    const sobra = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(sobra).toBeLessThanOrEqual(0);
  });
});
