# Portfólio de Guilherme Ryuki

Site estático e bilíngue (português e inglês), feito com HTML, CSS e JavaScript
puros (módulos ES). Não tem framework, bundler nem etapa de build: o que está
no repositório é o que vai ao ar.

## Como rodar

É preciso ter o Node.js instalado (só para o servidor local e os testes).

```
npm install
npm run servir
```

Depois, abra http://localhost:5173 no navegador.

## Testes

```
npm test            # testes unitários (node --test)
npm run test:e2e    # testes de ponta a ponta (Playwright)
node scripts/lighthouse.mjs   # Lighthouse nos dois modos (notas 90+ e LCP até 2s)
```

Na primeira vez, instale os navegadores do Playwright:

```
npx playwright install chromium firefox webkit
```

## Como adicionar um projeto

Os projetos ficam em `data/projetos.js`. Para incluir um novo, adicione um item
à lista desse arquivo, seguindo o formato dos que já existem. A ordem da lista
é a ordem em que os projetos aparecem no site.

## Fontes

As fontes ficam em `assets/fontes/` e são servidas pelo próprio site. São os
arquivos do Google Fonts no recorte latino, sem alteração, todos sob a licença
SIL Open Font License 1.1. O aviso de direitos autorais e o texto da licença
de cada família estão ao lado dos arquivos:

- Pixelify Sans: `assets/fontes/OFL-pixelify-sans.txt`
- Instrument Sans: `assets/fontes/OFL-instrument-sans.txt`
- IBM Plex Mono: `assets/fontes/OFL-ibm-plex-mono.txt` (nome reservado: "Plex")
- Silkscreen: `assets/fontes/OFL-silkscreen.txt`
