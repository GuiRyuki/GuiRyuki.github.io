// Critérios de aceite do documento de design (§9) que ainda não tinham um
// teste próprio: projeto novo só pelo arquivo de dados, uso só com teclado,
// nenhuma rolagem horizontal e texto alternativo nos dois idiomas.

import { test, expect } from "@playwright/test";
import { projetos } from "../../data/projetos.js";
import { textos } from "../../js/i18n.js";

test.use({ locale: "pt-BR", reducedMotion: "reduce" });

// Quarto projeto, que existe só durante o teste. Usa uma imagem que já está
// no repositório e deixa `online` vazio e `repo` de fora.
const PROJETO_DE_TESTE = {
  id: "teste",
  titulo: "Projeto de teste",
  ano: 2026,
  stack: ["HTML", "Teste"],
  resumo: { pt: "Resumo do projeto de teste.", en: "Summary of the test project." },
  minhaParte: { pt: "Tudo, em português.", en: "Everything, in English." },
  equipe: { pt: "sozinho", en: "solo" },
  online: "",
  imagens: [
    {
      src: "assets/projetos/casasabor-1.webp",
      alt: { pt: "Imagem do projeto de teste", en: "Image of the test project" },
    },
  ],
  destaque: null,
};

// Entrega um data/projetos.js com o projeto a mais, sem mexer no arquivo real.
async function servirComProjetoDeTeste(page) {
  const corpo = `export const projetos = ${JSON.stringify([...projetos, PROJETO_DE_TESTE])};`;
  await page.route("**/data/projetos.js", (rota) =>
    rota.fulfill({ contentType: "text/javascript; charset=utf-8", body: corpo }),
  );
}

async function conferirPainelDeTeste(page, idioma) {
  const painel = page.locator("#painel-projeto");
  await expect(painel.locator("h3")).toHaveText(PROJETO_DE_TESTE.titulo);
  await expect(painel.locator(".painel-dados")).toHaveText(
    `2026, ${PROJETO_DE_TESTE.equipe[idioma]}`,
  );
  await expect(painel.locator(".painel-resumo")).toHaveText(PROJETO_DE_TESTE.resumo[idioma]);
  await expect(painel.locator(".minha-parte p")).toHaveText(PROJETO_DE_TESTE.minhaParte[idioma]);
  await expect(painel.locator(".stack li")).toHaveText(PROJETO_DE_TESTE.stack);
  const imagem = painel.locator(".midia img");
  await expect(imagem).toHaveAttribute("alt", PROJETO_DE_TESTE.imagens[0].alt[idioma]);
  await expect.poll(() => imagem.evaluate((el) => el.naturalWidth)).toBeGreaterThan(0);
  // Uma imagem só e nenhum link: nada de controles nem de link vazio.
  await expect(painel.locator(".galeria-controles")).toHaveCount(0);
  await expect(painel.locator("a")).toHaveCount(0);
}

test("projeto novo só pelo arquivo de dados", async ({ page }) => {
  const erros = [];
  page.on("pageerror", (erro) => erros.push(erro.message));
  page.on("console", (mensagem) => {
    if (["error", "warning"].includes(mensagem.type())) erros.push(mensagem.text());
  });
  await servirComProjetoDeTeste(page);

  // Modo sutil, em português: é o quarto item do menu, depois do CasaSabor.
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  const itensSutil = page.locator("#menu-projetos button[data-projeto]");
  await expect(itensSutil).toHaveCount(4);
  await expect(itensSutil.nth(3)).toContainText(PROJETO_DE_TESTE.titulo);
  await expect(itensSutil.nth(3)).toContainText("HTML, Teste");
  await itensSutil.nth(3).click();
  await expect(itensSutil.nth(3)).toHaveAttribute("aria-current", "true");
  await conferirPainelDeTeste(page, "pt");

  // Modo sutil, em inglês.
  await page.locator("#botao-idioma").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await conferirPainelDeTeste(page, "en");

  // Modo jogo, em inglês: entra no menu ▶ entre os projetos e as outras telas.
  await page.locator("#botao-modo").click();
  await expect(page.locator("html")).toHaveAttribute("data-modo", "jogo");
  await expect(page.locator("#menu-jogo [data-tela]")).toHaveText([
    "KFKA",
    "Batman: Gotham Knights",
    "CasaSabor",
    PROJETO_DE_TESTE.titulo,
    textos.en["sobre.titulo"],
    textos.en["contato.titulo"],
  ]);
  const itemJogo = page.locator('#menu-jogo [data-tela="teste"]');
  await itemJogo.click();
  await expect(itemJogo).toHaveAttribute("aria-selected", "true");
  await expect(page).toHaveURL(/#teste$/);
  await conferirPainelDeTeste(page, "en");

  // Modo jogo, em português.
  await page.locator("#botao-idioma").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(itemJogo).toHaveAttribute("aria-selected", "true");
  await conferirPainelDeTeste(page, "pt");

  // A âncora #teste abre direto a tela do projeto no modo jogo (o modo ficou
  // salvo) e, de volta ao sutil, seleciona o projeto.
  await page.goto("/#sobre");
  await page.goto("/#teste");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-modo", "jogo");
  await expect(page.locator('#menu-jogo [data-tela="teste"]')).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator("#painel-projeto")).toBeVisible();
  await expect(page.locator("#sobre")).toBeHidden();
  await conferirPainelDeTeste(page, "pt");

  await page.locator("#botao-modo").click();
  await expect(page.locator("html")).not.toHaveAttribute("data-modo", "jogo");
  await expect(
    page.locator('#menu-projetos [aria-current="true"]'),
  ).toHaveAttribute("data-projeto", "teste");
  await conferirPainelDeTeste(page, "pt");

  expect(erros).toEqual([]);
});

// Aperta a tecla até o foco chegar ao elemento. Falha se ele nunca chegar.
async function teclarAte(page, tecla, seletor) {
  const alvo = page.locator(seletor);
  for (let vez = 0; vez < 60; vez++) {
    if (await alvo.evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press(tecla);
  }
  await expect(alvo, `foco em ${seletor}`).toBeFocused();
  return alvo;
}

// O elemento com foco precisa mostrar um contorno (e não ter sido escondido).
async function focoVisivel(page) {
  const contorno = await page.evaluate(() => {
    const estilo = getComputedStyle(document.activeElement);
    return { estilo: estilo.outlineStyle, largura: parseFloat(estilo.outlineWidth) };
  });
  expect(contorno.estilo).not.toBe("none");
  expect(contorno.largura).toBeGreaterThanOrEqual(2);
  await expect(page.locator(":focus")).toBeInViewport();
}

test("teclado de ponta a ponta", async ({ page, browserName }) => {
  // O WebKit segue o padrão do Safari: o Tab passa por botões e campos, mas
  // pula os links (no Safari de verdade, Option+Tab ou a preferência "Tab
  // destaca cada item" incluem os links; o WebKit de teste não tem esse
  // atalho). Nele, o teste leva o foco ao link direto e segue no teclado.
  const tabPulaLinks = browserName === "webkit";
  const TAB = "Tab";
  const TAB_VOLTA = "Shift+Tab";
  async function irAteLink(tecla, seletor) {
    if (!tabPulaLinks) return teclarAte(page, tecla, seletor);
    const link = page.locator(seletor);
    expect(await link.evaluate((el) => el.tabIndex)).toBe(0);
    await link.focus();
    await expect(link).toBeFocused();
    return link;
  }

  await page.goto("/");
  await expect(page.locator("#painel-projeto h3")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");

  // O primeiro Tab cai no link de pular para o conteúdo.
  if (tabPulaLinks) await irAteLink(TAB, ".pular");
  else await page.keyboard.press(TAB);
  await expect(page.locator(".pular")).toBeFocused();
  await focoVisivel(page);

  // Idioma: PT -> EN.
  await teclarAte(page, TAB, "#botao-idioma");
  await focoVisivel(page);
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#botao-idioma")).toBeFocused();

  // Modo: sutil -> jogo. O foco continua no botão.
  await teclarAte(page, TAB, "#botao-modo");
  await focoVisivel(page);
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-modo", "jogo");
  await expect(page.locator("#botao-modo")).toBeFocused();
  await expect(page.locator("#inicio")).toBeVisible();

  // Menu ▶: seta para baixo anda, Enter abre. Passa por todas as telas.
  const telas = [
    ["kfka", "#painel-projeto h3", "KFKA"],
    ["gotham-knights", "#painel-projeto h3", "Batman: Gotham Knights"],
    ["casasabor", "#painel-projeto h3", "CasaSabor"],
    ["sobre", "#titulo-sobre", textos.en["sobre.titulo"]],
    ["contato", "#titulo-contato", textos.en["contato.titulo"]],
  ];
  await teclarAte(page, TAB, "#menu-jogo");
  await focoVisivel(page);
  for (const [id, seletorDoTitulo, titulo] of telas) {
    await page.keyboard.press("ArrowDown");
    await expect(page.locator(`#menu-jogo [data-tela="${id}"]`)).toHaveClass(/cursor/);
    await page.keyboard.press("Enter");
    await expect(page.locator(`#menu-jogo [data-tela="${id}"]`)).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    // O foco vai para o título da tela aberta, com contorno.
    await expect(page.locator(seletorDoTitulo)).toHaveText(titulo);
    await expect(page.locator(seletorDoTitulo)).toBeFocused();
    await focoVisivel(page);
    // Volta ao menu com Shift+Tab.
    await teclarAte(page, TAB_VOLTA, "#menu-jogo");
  }

  // Dentro de uma tela, os links também são alcançados só com Tab.
  await irAteLink(TAB, '[data-contato="email"]');
  await focoVisivel(page);

  // A tela inicial é aberta pelo nome no topo.
  await irAteLink(TAB_VOLTA, ".nome a");
  await focoVisivel(page);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#inicio$/);
  await expect(page.locator("#inicio")).toBeVisible();
  await expect(page.locator("#contato")).toBeHidden();

  // Idioma de volta para o português, ainda no modo jogo.
  await teclarAte(page, TAB, "#botao-idioma");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");

  // Modo: jogo -> sutil. A página inteira volta a aparecer.
  await teclarAte(page, TAB, "#botao-modo");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).not.toHaveAttribute("data-modo", "jogo");
  await expect(page.locator("#botao-modo")).toBeFocused();
  for (const seletor of ["#inicio", "#projetos", "#sobre", "#contato", ".topo-nav"]) {
    await expect(page.locator(seletor), seletor).toBeVisible();
  }
  await expect(page.locator("#menu-jogo")).toBeHidden();

  // No sutil, o menu de projetos responde ao Tab e ao Enter.
  await teclarAte(page, TAB, '[data-projeto="casasabor"]');
  await focoVisivel(page);
  await page.keyboard.press("Enter");
  await expect(page.locator("#painel-projeto h3")).toHaveText("CasaSabor");
});

// Abre a página com modo e idioma já salvos, como numa segunda visita.
async function abrirCom(page, modo, idioma, caminho = "/") {
  await page.addInitScript(
    ([modoSalvo, idiomaSalvo]) => {
      try {
        localStorage.setItem("portfolio.modo", modoSalvo);
        localStorage.setItem("portfolio.idioma", idiomaSalvo);
      } catch {}
    },
    [modo, idioma],
  );
  await page.goto(caminho);
  await expect(page.locator("html")).toHaveAttribute("data-modo", modo);
  await expect(page.locator("html")).toHaveAttribute("lang", idioma === "pt" ? "pt-BR" : "en");
  await expect(page.locator("#painel-projeto h3")).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
}

async function semRolagemHorizontal(page, contexto) {
  const medidas = await page.evaluate(() => ({
    total: document.scrollingElement.scrollWidth,
    janela: document.documentElement.clientWidth,
  }));
  expect(medidas.total, contexto).toBeLessThanOrEqual(medidas.janela);
}

const LARGURAS = [
  { width: 360, height: 740 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 2560, height: 1440 },
];

for (const modo of ["sutil", "jogo"]) {
  for (const idioma of ["pt", "en"]) {
    test(`sem rolagem horizontal de 360px a 2560px (${modo}, ${idioma})`, async ({ page }) => {
      await abrirCom(page, modo, idioma);
      for (const tamanho of LARGURAS) {
        await page.setViewportSize(tamanho);
        const contexto = `${modo} ${idioma} ${tamanho.width}px`;
        await semRolagemHorizontal(page, contexto);

        // Cada projeto, e no modo jogo cada tela, também cabe na largura.
        if (modo === "jogo") {
          for (const id of [...projetos.map((projeto) => projeto.id), "sobre", "contato"]) {
            const item = page.locator(`#menu-jogo [data-tela="${id}"]`);
            await item.scrollIntoViewIfNeeded();
            await item.click();
            await expect(item).toHaveAttribute("aria-selected", "true");
            await semRolagemHorizontal(page, `${contexto} #${id}`);
            const area = await page.locator("#tela").evaluate((el) => ({
              total: el.scrollWidth,
              largura: el.clientWidth,
            }));
            expect(area.total, `${contexto} #${id} (área)`).toBeLessThanOrEqual(area.largura);
          }
          await page.locator(".nome a").click();
          await expect(page.locator("#inicio")).toBeVisible();
        } else {
          for (const projeto of projetos) {
            await page.locator(`[data-projeto="${projeto.id}"]`).click();
            await expect(page.locator("#painel-projeto h3")).toHaveText(projeto.titulo);
            await semRolagemHorizontal(page, `${contexto} ${projeto.id}`);
          }
        }
      }
    });
  }
}

for (const idioma of ["pt", "en"]) {
  test(`toda imagem tem texto alternativo no idioma da página (${idioma})`, async ({ page }) => {
    await abrirCom(page, "sutil", idioma);
    const outro = idioma === "pt" ? "en" : "pt";

    // Avatar da apresentação; o da ficha é decorativo (o nome vem ao lado).
    await expect(page.locator("#inicio img.avatar")).toHaveAttribute(
      "alt",
      textos[idioma]["avatar.alt"],
    );

    for (const projeto of projetos) {
      await page.locator(`[data-projeto="${projeto.id}"]`).click();
      await expect(page.locator("#painel-projeto h3")).toHaveText(projeto.titulo);
      const midias = [...(projeto.destaque ? [projeto.destaque] : []), ...projeto.imagens];
      for (const [indice, midia] of midias.entries()) {
        expect(midia.alt.pt.trim(), `${projeto.id} alt pt`).not.toBe("");
        expect(midia.alt.en.trim(), `${projeto.id} alt en`).not.toBe("");
        expect(midia.alt[idioma]).not.toBe(midia.alt[outro]);
        if (midias.length > 1) {
          await page.locator("#painel-projeto .galeria-botao").nth(indice).click();
        }
        const elemento = page.locator("#painel-projeto .midia > *");
        const atributo = (await elemento.evaluate((el) => el.tagName)) === "VIDEO" ? "aria-label" : "alt";
        await expect(elemento).toHaveAttribute(atributo, midia.alt[idioma]);
      }
    }

    // Nenhuma imagem da página fica sem o atributo alt.
    await expect(page.locator("img:not([alt])")).toHaveCount(0);
  });
}

test("no celular, a tela aberta pelo menu rola com as setas do teclado", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await abrirCom(page, "jogo", "en");
  const area = page.locator("#tela");

  // "Sobre mim" não tem nenhum link ou botão dentro: quem rola é o teclado,
  // a partir do título que recebeu o foco.
  await page.locator("#menu-jogo").focus();
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter");
  await expect(page.locator("#titulo-sobre")).toBeFocused();
  const medidas = await area.evaluate((el) => ({ total: el.scrollHeight, altura: el.clientHeight }));
  expect(medidas.total).toBeGreaterThan(medidas.altura);

  for (let vez = 0; vez < 40; vez++) await page.keyboard.press("ArrowDown");
  await expect.poll(() => area.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await expect(page.locator(".sobre-texto")).toBeInViewport();
  await expect
    .poll(() => area.evaluate((el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 2))
    .toBe(true);
});
