import { test, expect } from "@playwright/test";

const painel = "#painel-projeto";

test("abre no modo sutil", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(`${painel} h3`)).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-modo", "jogo");
});

test("primeiro projeto já selecionado", async ({ page }) => {
  await page.goto("/");
  const ativo = page.locator('#menu-projetos [aria-current="true"]');
  await expect(ativo).toHaveCount(1);
  await expect(ativo).toHaveAttribute("data-projeto", "kfka");
  await expect(page.locator(`${painel} h3`)).toContainText("KFKA");
});

test("clicar troca o painel", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-projeto="gotham-knights"]').click();
  await expect(page.locator(`${painel} h3`)).toContainText("Gotham Knights");
  const ativo = page.locator('#menu-projetos [aria-current="true"]');
  await expect(ativo).toHaveCount(1);
  await expect(ativo).toHaveAttribute("data-projeto", "gotham-knights");
});

test("teclado no menu", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(`${painel} h3`)).toContainText("KFKA");
  const alvo = page.locator('[data-projeto="casasabor"]');
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    if (await alvo.evaluate((el) => el === document.activeElement)) break;
  }
  await expect(alvo).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(`${painel} h3`)).toContainText("CasaSabor");
  await expect(alvo).toHaveAttribute("aria-current", "true");
  // Trocar de projeto não pode tirar o foco do menu.
  await expect(alvo).toBeFocused();
});

test("galeria aparece quando há mais de uma mídia", async ({ page }) => {
  await page.goto("/");
  const controles = page.locator(`${painel} .galeria-controles button`);
  await expect(controles).toHaveCount(2);
  await expect(page.locator(`${painel} .midia img`)).toHaveAttribute("src", /kfka-1/);
  await controles.nth(1).click();
  await expect(page.locator(`${painel} .midia img`)).toHaveAttribute("src", /kfka-2/);
  await expect(controles.nth(1)).toHaveAttribute("aria-current", "true");
  await expect(controles.nth(0)).not.toHaveAttribute("aria-current", "true");
});

test("links vazios não aparecem", async ({ page }) => {
  const alternativo = `export const projetos = [{
    id: "teste",
    titulo: "Projeto de teste",
    ano: 2026,
    stack: ["HTML"],
    resumo: { pt: "Resumo de teste.", en: "Test summary." },
    minhaParte: { pt: "Tudo.", en: "Everything." },
    equipe: { pt: "Sozinho", en: "Solo" },
    repo: "",
    online: "",
    imagens: [{ src: "assets/projetos/teste.webp", alt: { pt: "Tela de teste", en: "Test screen" } }],
    destaque: null,
  }];`;
  await page.route("**/data/projetos.js", (rota) =>
    rota.fulfill({ contentType: "text/javascript; charset=utf-8", body: alternativo }),
  );
  await page.goto("/");
  await expect(page.locator(`${painel} h3`)).toContainText("Projeto de teste");
  await expect(page.locator(`${painel} .minha-parte`)).toBeVisible();
  await expect(page.locator(`${painel} img`)).toHaveCount(1);
  await expect(page.locator('a[href=""]')).toHaveCount(0);
  await expect(page.locator(`${painel} a`)).toHaveCount(0);
  await expect(page.locator(`${painel} .galeria-controles`)).toHaveCount(0);
});

test("links de repositório aparecem quando preenchidos", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.locator(`${painel} a[href="https://github.com/2026-2-NADS2/Projeto3"]`),
  ).toBeVisible();
});

for (const largura of [360, 768, 1440]) {
  test(`sem rolagem horizontal em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 800 });
    await page.goto("/");
    await expect(page.locator(`${painel} h3`)).toBeVisible();
    for (const id of ["kfka", "gotham-knights", "casasabor"]) {
      await page.locator(`[data-projeto="${id}"]`).click();
      const medidas = await page.evaluate(() => ({
        conteudo: document.documentElement.scrollWidth,
        janela: window.innerWidth,
      }));
      expect(medidas.conteudo, id).toBeLessThanOrEqual(medidas.janela);
    }
  });
}

test("contatos", async ({ page }) => {
  await page.goto("/");
  const contato = page.locator("#contato");
  await expect(contato.locator('a[href="mailto:ryuki.gui@gmail.com"]')).toBeVisible();
  await expect(contato.locator('a[href="https://github.com/GuiRyuki"]')).toBeVisible();
  await expect(
    contato.locator('a[href="https://www.linkedin.com/in/guiryuki"]'),
  ).toBeVisible();
  await expect(page.locator("[data-contato='curriculo']")).toHaveCount(0);
  await expect(page.locator("a[download], a[href$='.pdf']")).toHaveCount(0);
});

test("âncora no modo sutil", async ({ page }) => {
  await page.goto("/#sobre");
  await expect(page.locator("#sobre")).toBeInViewport();
});

test("estrutura estável para as próximas tarefas", async ({ page }) => {
  await page.goto("/");
  for (const seletor of [
    "header#topo",
    "main#conteudo",
    "#inicio .dialogo",
    "#projetos ul#menu-projetos",
    "#projetos section#painel-projeto",
    "#sobre",
    "#contato",
    "button#botao-modo",
    "button#botao-idioma",
    'div#aviso-tela[aria-live="polite"]',
    'a[href="#conteudo"]',
  ]) {
    await expect(page.locator(seletor), seletor).toHaveCount(1);
  }
});

test("nada de erro no console além das imagens que ainda não existem", async ({ page }) => {
  const erros = [];
  page.on("pageerror", (erro) => erros.push(erro.message));
  await page.goto("/");
  await expect(page.locator(`${painel} h3`)).toBeVisible();
  expect(erros).toEqual([]);
});

test("estilos do sutil só valem fora do modo jogo", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(`${painel} h3`)).toBeVisible();
  const medir = () =>
    page.evaluate(() => ({
      sombra: getComputedStyle(document.querySelector(".dialogo")).boxShadow,
      colunas: getComputedStyle(document.querySelector(".projetos-grade"))
        .gridTemplateColumns.split(" ").length,
      bordaTopo: getComputedStyle(document.getElementById("topo")).borderBottomStyle,
    }));

  const antes = await medir();
  expect(antes.sombra).not.toBe("none");
  expect(antes.colunas).toBe(2);
  expect(antes.bordaTopo).toBe("solid");

  await page.evaluate(() => (document.documentElement.dataset.modo = "jogo"));
  const noJogo = await medir();
  expect(noJogo.sombra).toBe("none");
  expect(noJogo.colunas).toBe(1);
  expect(noJogo.bordaTopo).toBe("none");

  await page.evaluate(() => delete document.documentElement.dataset.modo);
  expect(await medir()).toEqual(antes);
});
