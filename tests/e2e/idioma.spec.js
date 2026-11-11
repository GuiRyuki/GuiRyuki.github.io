import { test, expect } from "@playwright/test";
import { textos } from "../../js/i18n.js";
import { projetos } from "../../data/projetos.js";

const painel = "#painel-projeto";
const botaoIdioma = "#botao-idioma";

async function abrir(page) {
  await page.goto("/");
  await expect(page.locator(`${painel} h3`)).toBeVisible();
}

test.describe("primeira visita segue o navegador", () => {
  for (const [locale, lang] of [
    ["pt-BR", "pt-BR"],
    ["en-US", "en"],
  ]) {
    test.describe(locale, () => {
      test.use({ locale });

      test(`navegador em ${locale} abre com lang="${lang}"`, async ({ page }) => {
        await abrir(page);
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        const idioma = lang === "en" ? "en" : "pt";
        await expect(page.locator("#botao-modo")).toHaveText(textos[idioma]["botao.modoJogo"]);
      });
    });
  }
});

test.describe("começando em português", () => {
  test.use({ locale: "pt-BR" });

  test("trocar troca tudo", async ({ page }) => {
    await abrir(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await page.locator(botaoIdioma).click();

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("#botao-modo")).toHaveText(textos.en["botao.modoJogo"]);

    const kfka = projetos.find((projeto) => projeto.id === "kfka");
    const alts = kfka.imagens.map((imagem) => imagem.alt.en);
    const imagens = page.locator(`${painel} img`);
    expect(await imagens.count()).toBeGreaterThan(0);
    for (const alt of await imagens.evaluateAll((lista) => lista.map((img) => img.alt))) {
      expect(alts).toContain(alt);
    }

    const traduzidos = await page
      .locator("[data-i18n]")
      .evaluateAll((lista) =>
        lista.map((el) => ({ chave: el.dataset.i18n, texto: el.textContent.trim() })),
      );
    expect(traduzidos.length).toBeGreaterThan(0);
    for (const { chave, texto } of traduzidos) {
      expect(texto, chave).not.toBe("");
      expect(texto, chave).not.toBe(chave);
      expect(texto, chave).toBe(textos.en[chave]);
    }
  });

  test("o botão mostra o idioma de destino e tem rótulo traduzido", async ({ page }) => {
    await abrir(page);
    const botao = page.locator(botaoIdioma);
    await expect(botao).toHaveText(textos.pt["botao.idioma"]);
    await expect(botao).toHaveAttribute("aria-label", textos.pt["botao.idiomaRotulo"]);

    await botao.click();
    await expect(botao).toHaveText(textos.en["botao.idioma"]);
    await expect(botao).toHaveAttribute("aria-label", textos.en["botao.idiomaRotulo"]);

    await botao.click();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(botao).toHaveText(textos.pt["botao.idioma"]);
  });

  test("não recarrega", async ({ page }) => {
    await abrir(page);
    await page.evaluate(() => (window.__marca = 1));
    await page.locator(botaoIdioma).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(await page.evaluate(() => window.__marca)).toBe(1);
  });

  test("mantém o projeto ativo", async ({ page }) => {
    await abrir(page);
    await page.locator('[data-projeto="casasabor"]').click();
    await expect(page.locator(`${painel} h3`)).toContainText("CasaSabor");

    await page.locator(botaoIdioma).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    const ativo = page.locator('#menu-projetos [aria-current="true"]');
    await expect(ativo).toHaveCount(1);
    await expect(ativo).toHaveAttribute("data-projeto", "casasabor");
    await expect(page.locator(`${painel} h3`)).toContainText("CasaSabor");
  });

  test("persiste", async ({ page }) => {
    await abrir(page);
    await page.locator(botaoIdioma).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.reload();
    await expect(page.locator(`${painel} h3`)).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("#botao-modo")).toHaveText(textos.en["botao.modoJogo"]);
  });

  test("preferência salva inválida cai na detecção do navegador", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("portfolio.idioma", "fr"));
    await abrir(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  });

  test("funciona sem localStorage", async ({ page }) => {
    const erros = [];
    page.on("pageerror", (erro) => erros.push(erro.message));
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new Error("bloqueado");
        },
      });
    });
    await abrir(page);
    await page.locator(botaoIdioma).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(erros).toEqual([]);
  });
});
