import { test, expect } from "@playwright/test";
import { textos } from "../../js/i18n.js";

// Todos os testes começam com o modo jogo já salvo, como numa segunda visita.
async function abrirNoJogo(page, caminho = "/", idioma = "pt") {
  await page.addInitScript((idiomaSalvo) => {
    try {
      // Só na primeira carga: o que o teste mudar depois precisa valer.
      if (localStorage.getItem("portfolio.modo") === null) {
        localStorage.setItem("portfolio.modo", "jogo");
        localStorage.setItem("portfolio.idioma", idiomaSalvo);
      }
    } catch {}
  }, idioma);
  await page.goto(caminho);
  await expect(page.locator("html")).toHaveAttribute("data-modo", "jogo");
  await expect(page.locator("#menu-jogo [data-tela]")).toHaveCount(5);
}

const item = (page, id) => page.locator(`#menu-jogo [data-tela="${id}"]`);

// Quais das quatro "telas" possíveis estão visíveis agora.
async function telasVisiveis(page) {
  const visiveis = [];
  for (const seletor of ["#inicio", "#painel-projeto", "#sobre", "#contato"]) {
    if (await page.locator(seletor).isVisible()) visiveis.push(seletor);
  }
  return visiveis;
}

async function paginaNaoRola(page) {
  const medidas = await page.evaluate(() => ({
    altura: document.scrollingElement.scrollHeight,
    janela: window.innerHeight,
    largura: document.scrollingElement.scrollWidth,
    janelaLargura: document.documentElement.clientWidth,
  }));
  expect(medidas.altura).toBeLessThanOrEqual(medidas.janela + 1);
  expect(medidas.largura).toBeLessThanOrEqual(medidas.janelaLargura);
}

test.use({ locale: "pt-BR", reducedMotion: "reduce" });

test("uma tela por vez", async ({ page }) => {
  await abrirNoJogo(page);
  expect(await telasVisiveis(page)).toEqual(["#inicio"]);
  await paginaNaoRola(page);

  const esperado = {
    kfka: "#painel-projeto",
    "gotham-knights": "#painel-projeto",
    casasabor: "#painel-projeto",
    sobre: "#sobre",
    contato: "#contato",
  };
  for (const [id, seletor] of Object.entries(esperado)) {
    await item(page, id).click();
    await expect(item(page, id)).toHaveAttribute("aria-selected", "true");
    expect(await telasVisiveis(page), id).toEqual([seletor]);
    await expect(page.locator('#menu-jogo [aria-selected="true"]')).toHaveCount(1);
    await paginaNaoRola(page);
  }

  // O menu do jogo substitui a navegação do topo e a lista de projetos.
  await expect(page.locator(".topo-nav")).toBeHidden();
  await expect(page.locator("#menu-projetos")).toBeHidden();
  await expect(page.locator("#botao-modo")).toBeVisible();
  await expect(page.locator("#botao-idioma")).toBeVisible();
});

test("o menu lista os projetos, Sobre mim e Contato", async ({ page }) => {
  await abrirNoJogo(page);
  await expect(page.locator("#menu-jogo [data-tela]")).toHaveText([
    "KFKA",
    "Batman: Gotham Knights",
    "CasaSabor",
    textos.pt["sobre.titulo"],
    textos.pt["contato.titulo"],
  ]);
});

test("teclado", async ({ page }) => {
  await abrirNoJogo(page);
  await page.locator("#menu-jogo").focus();
  await page.keyboard.press("ArrowDown");
  await expect(item(page, "kfka")).toHaveClass(/cursor/);
  await page.keyboard.press("ArrowDown");
  await expect(item(page, "gotham-knights")).toHaveClass(/cursor/);
  // Mover o cursor ainda não troca a tela.
  expect(await telasVisiveis(page)).toEqual(["#inicio"]);

  await page.keyboard.press("Enter");
  await expect(page.locator("#painel-projeto h3")).toHaveText("Batman: Gotham Knights");
  await expect(page.locator("#painel-projeto h3")).toBeFocused();
  await expect(page.locator("#aviso-tela")).toContainText("Batman: Gotham Knights");
  await expect(page).toHaveURL(/#gotham-knights$/);

  // Volta ao menu, dá a volta pela ponta de cima e abre Contato.
  await page.locator("#menu-jogo").focus();
  await page.keyboard.press("ArrowUp");
  await expect(item(page, "kfka")).toHaveClass(/cursor/);
  await page.keyboard.press("ArrowUp");
  await expect(item(page, "contato")).toHaveClass(/cursor/);
  await page.keyboard.press("Enter");
  await expect(page.locator("#contato h2")).toBeFocused();
  await expect(page.locator("#aviso-tela")).toContainText(textos.pt["contato.titulo"]);
  expect(await telasVisiveis(page)).toEqual(["#contato"]);
});

test("o menu diz ao leitor de tela qual item está com o cursor", async ({ page }) => {
  await abrirNoJogo(page);
  const menu = page.locator("#menu-jogo");
  await expect(menu).toHaveAttribute("role", "listbox");
  await expect(menu).not.toHaveAttribute("aria-activedescendant", /.+/);
  await menu.focus();
  await page.keyboard.press("End");
  const idDoItem = await item(page, "contato").getAttribute("id");
  await expect(menu).toHaveAttribute("aria-activedescendant", idDoItem);
});

test("âncora", async ({ page }) => {
  await abrirNoJogo(page, "/#contato");
  expect(await telasVisiveis(page)).toEqual(["#contato"]);
  await expect(item(page, "contato")).toHaveAttribute("aria-selected", "true");

  await page.goto("/#xyz");
  await page.reload();
  await expect(page.locator("#menu-jogo [data-tela]")).toHaveCount(5);
  expect(await telasVisiveis(page)).toEqual(["#inicio"]);
  await expect(page.locator('#menu-jogo [aria-selected="true"]')).toHaveCount(0);
});

test("âncora de projeto abre a tela do projeto", async ({ page }) => {
  await abrirNoJogo(page, "/#casasabor");
  expect(await telasVisiveis(page)).toEqual(["#painel-projeto"]);
  await expect(page.locator("#painel-projeto h3")).toHaveText("CasaSabor");
});

test("o nome no topo volta para a tela inicial", async ({ page }) => {
  await abrirNoJogo(page, "/#sobre");
  await page.locator(".nome a").click();
  await expect(page.locator(".dialogo")).toBeVisible();
  expect(await telasVisiveis(page)).toEqual(["#inicio"]);
  await paginaNaoRola(page);
});

test("troca de idioma mantém a tela", async ({ page }) => {
  await abrirNoJogo(page);
  await item(page, "gotham-knights").click();
  await expect(page.locator("#painel-projeto h3")).toHaveText("Batman: Gotham Knights");

  await page.locator("#botao-idioma").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(await telasVisiveis(page)).toEqual(["#painel-projeto"]);
  await expect(page.locator("#painel-projeto h3")).toHaveText("Batman: Gotham Knights");
  await expect(page.locator("#painel-projeto h4").first()).toHaveText(
    textos.en["projeto.minhaParte"],
  );
  await expect(item(page, "gotham-knights")).toHaveAttribute("aria-selected", "true");
  await expect(item(page, "gotham-knights")).toHaveClass(/cursor/);
  await expect(page.locator("#menu-jogo .cursor")).toHaveCount(1);
  await expect(item(page, "sobre")).toHaveText(textos.en["sobre.titulo"]);
  await expect(page).toHaveURL(/#gotham-knights$/);
});

test("celular 360px em inglês", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await abrirNoJogo(page, "/", "en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await item(page, "kfka").click();
  await expect(page.locator("#painel-projeto h3")).toHaveText("KFKA");
  await paginaNaoRola(page);

  const area = page.locator("#tela");
  expect(await area.evaluate((el) => getComputedStyle(el).overflowY)).toBe("auto");
  // O conteúdo é maior que a moldura e não vaza para os lados.
  const medidas = await area.evaluate((el) => ({
    alturaTotal: el.scrollHeight,
    altura: el.clientHeight,
    larguraTotal: el.scrollWidth,
    largura: el.clientWidth,
  }));
  expect(medidas.alturaTotal).toBeGreaterThan(medidas.altura);
  expect(medidas.larguraTotal).toBeLessThanOrEqual(medidas.largura);

  const ultimo = page.locator("#painel-projeto > :last-child");
  await expect(ultimo).not.toBeInViewport();
  await area.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await expect(ultimo).toBeInViewport({ ratio: 1 });

  // A moldura e o menu não saem do lugar com a rolagem interna.
  await expect(page.locator("#menu-jogo")).toBeInViewport({ ratio: 1 });
  await expect(item(page, "kfka")).toBeInViewport({ ratio: 1 });
  await expect(page.locator("#botao-modo")).toBeInViewport({ ratio: 1 });
  await paginaNaoRola(page);

  // A faixa do menu rola de lado até o último item, que continua tocável.
  await item(page, "contato").scrollIntoViewIfNeeded();
  await item(page, "contato").click();
  expect(await telasVisiveis(page)).toEqual(["#contato"]);
  await expect(item(page, "contato")).toBeInViewport({ ratio: 1 });
  await paginaNaoRola(page);
});

test("celular: abrir com âncora deixa o item da tela à vista na faixa do menu", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await abrirNoJogo(page, "/#contato", "en");
  await page.evaluate(() => document.fonts.ready);
  await expect(item(page, "contato")).toBeInViewport({ ratio: 1 });
  await paginaNaoRola(page);
});

test("voltar ao sutil", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await abrirNoJogo(page);
  await item(page, "sobre").click();
  await page.locator("#botao-modo").click();
  await expect(page.locator("html")).not.toHaveAttribute("data-modo", "jogo");

  for (const seletor of [
    "#inicio",
    "#projetos",
    "#menu-projetos",
    "#painel-projeto",
    "#sobre",
    "#contato",
    ".topo-nav",
  ]) {
    await expect(page.locator(seletor), seletor).toBeVisible();
  }
  await expect(page.locator("#menu-jogo")).toBeHidden();
  await expect(page.locator("main [hidden]:not(.nav-jogo)")).toHaveCount(0);
  await expect(page.locator("#sobre")).toBeInViewport();
  await expect(page.locator("#titulo-sobre")).toBeInViewport();
});

test("voltar ao sutil numa tela de projeto mostra o projeto", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await abrirNoJogo(page);
  await item(page, "casasabor").click();
  await page.locator("#botao-modo").click();
  await expect(page.locator("html")).not.toHaveAttribute("data-modo", "jogo");
  await expect(page.locator("#painel-projeto h3")).toHaveText("CasaSabor");
  await expect(page.locator("#painel-projeto h3")).toBeInViewport();
  await expect(page.locator('#menu-projetos [aria-current="true"]')).toContainText("CasaSabor");
});

test("entrar no jogo pelo botão abre a tela inicial e sair devolve a página", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#painel-projeto h3")).toBeVisible();
  await expect(page.locator("#menu-jogo")).toBeHidden();
  await page.locator("#botao-modo").click();
  expect(await telasVisiveis(page)).toEqual(["#inicio"]);
  // Entrar no modo jogo não leva o foco para dentro da tela: quem usou o
  // botão pelo teclado continua nele e desfaz com a mesma tecla.
  await expect(page.locator("#tela :focus")).toHaveCount(0);
  await page.locator("#botao-modo").click();
  expect(await telasVisiveis(page)).toEqual(["#inicio", "#painel-projeto", "#sobre", "#contato"]);
});

test("âncora de projeto no modo sutil seleciona o projeto", async ({ page }) => {
  await page.goto("/#gotham-knights");
  await expect(page.locator("#painel-projeto h3")).toHaveText("Batman: Gotham Knights");
  await expect(page.locator("#painel-projeto h3")).toBeInViewport();
});
