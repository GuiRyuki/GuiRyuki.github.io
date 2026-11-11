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

test("nada de erro no console nem arquivo faltando", async ({ page }) => {
  const erros = [];
  page.on("pageerror", (erro) => erros.push(erro.message));
  page.on("response", (resposta) => {
    if (resposta.status() >= 400) erros.push(`${resposta.status()} ${resposta.url()}`);
  });
  await page.goto("/");
  await expect(page.locator(`${painel} h3`)).toBeVisible();
  for (const id of ["kfka", "gotham-knights", "casasabor"]) {
    await page.locator(`[data-projeto="${id}"]`).click();
    await expect(page.locator(`${painel} .midia > *`)).toHaveCount(1);
    await page.waitForLoadState("networkidle");
  }
  expect(erros).toEqual([]);
});

test("estilos do sutil só valem fora do modo jogo", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(`${painel} h3`)).toBeVisible();
  // Valores que só o sutil.css define; o modo jogo monta os próprios.
  const medir = () =>
    page.evaluate(() => ({
      papel: getComputedStyle(document.querySelector(".dialogo")).backgroundColor,
      menu: getComputedStyle(document.getElementById("menu-projetos")).position,
      bordaTopo: getComputedStyle(document.getElementById("topo")).borderBottomWidth,
      bordaTitulo: getComputedStyle(document.querySelector(".secao > h2")).borderTopStyle,
    }));

  const antes = await medir();
  expect(antes.papel).toBe("rgb(255, 255, 255)");
  expect(antes.menu).toBe("sticky");
  expect(antes.bordaTopo).toBe("1px");
  expect(antes.bordaTitulo).toBe("solid");

  await page.evaluate(() => (document.documentElement.dataset.modo = "jogo"));
  const noJogo = await medir();
  expect(noJogo.papel).not.toBe(antes.papel);
  expect(noJogo.menu).toBe("static");
  expect(noJogo.bordaTopo).not.toBe("1px");
  expect(noJogo.bordaTitulo).toBe("none");

  await page.evaluate(() => delete document.documentElement.dataset.modo);
  expect(await medir()).toEqual(antes);
});

test("vídeo de destaque toca sozinho, mudo e em repetição", async ({ page, browserName }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.locator('[data-projeto="gotham-knights"]').click();
  const video = page.locator(`${painel} .midia video`);
  await expect(video).toHaveAttribute("poster", /gotham-knights-1\.webp$/);
  await expect(video).toHaveAttribute("autoplay", "");
  await expect(video).toHaveAttribute("muted", "");
  await expect(video).toHaveAttribute("loop", "");
  await expect(video).toHaveAttribute("playsinline", "");
  await expect(video).toHaveJSProperty("muted", true);
  const fonte = video.locator("source");
  await expect(fonte).toHaveAttribute("src", "assets/projetos/gotham-knights.webm");
  await expect(fonte).toHaveAttribute("type", "video/webm");
  // O WebKit de teste no Windows vem sem decodificador de WebM; o Safari de
  // verdade toca. Nos outros dois, confere que o vídeo anda de fato.
  if (browserName !== "webkit") {
    await expect
      .poll(() => video.evaluate((el) => el.currentTime), { timeout: 10000 })
      .toBeGreaterThan(0);
  }
});

test("abrir direto no projeto com vídeo não trava o carregamento", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#gotham-knights", { waitUntil: "load" });
  const video = page.locator(`${painel} .midia video`);
  await expect(video.locator("source")).toHaveCount(1);
  await expect(video).toHaveAttribute("poster", /gotham-knights-1.webp$/);
});

test("com movimento reduzido o vídeo fica parado no poster", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator('[data-projeto="gotham-knights"]').click();
  const video = page.locator(`${painel} .midia video`);
  await expect(video).toHaveAttribute("poster", /gotham-knights-1\.webp$/);
  await expect(video).not.toHaveAttribute("autoplay");
  await expect(video).toHaveAttribute("preload", "none");
  await expect(video).toHaveJSProperty("paused", true);
  await expect(video).toHaveJSProperty("currentTime", 0);
  // Quem quiser assistir ainda consegue dar play.
  await expect(video).toHaveAttribute("controls", "");
});

test("prints e poster dos projetos carregam de verdade", async ({ page }) => {
  await page.goto("/");
  for (const id of ["kfka", "gotham-knights", "casasabor"]) {
    await page.locator(`[data-projeto="${id}"]`).click();
    const botoes = page.locator(`${painel} .galeria-controles button`);
    for (let i = 0; i < (await botoes.count()); i++) {
      await botoes.nth(i).click();
      const imagem = page.locator(`${painel} .midia img`);
      if ((await imagem.count()) === 0) continue; // vídeo: o poster é conferido abaixo
      await expect
        .poll(() => imagem.evaluate((el) => el.complete && el.naturalWidth), {
          message: `${id}, mídia ${i + 1}`,
        })
        .toBeGreaterThan(0);
    }
  }
  const poster = await page.request.get("/assets/projetos/gotham-knights-1.webp");
  expect(poster.ok()).toBe(true);
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("o conteúdo do HTML aparece e os contatos vêm como links comuns", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#tela")).toBeVisible();
    await expect(page.locator("#titulo-sobre")).toBeVisible();

    const aviso = page.locator(".sem-js");
    await expect(aviso).toBeVisible();
    // Um parágrafo em português e outro em inglês, cada um com os três contatos.
    for (const paragrafo of [aviso.locator("p:not([lang])"), aviso.locator('p[lang="en"]')]) {
      await expect(paragrafo).toBeVisible();
      for (const href of [
        "mailto:ryuki.gui@gmail.com",
        "https://github.com/GuiRyuki",
        "https://www.linkedin.com/in/guiryuki",
      ]) {
        await expect(paragrafo.locator(`a[href="${href}"]`)).toBeVisible();
      }
    }
  });
});

test("com JavaScript, o aviso de página sem JavaScript não aparece", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(`${painel} h3`)).toBeVisible();
  await expect(page.locator(".sem-js")).toHaveCount(0);
});
