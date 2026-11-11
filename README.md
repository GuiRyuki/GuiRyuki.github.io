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
```

Na primeira vez, instale os navegadores do Playwright:

```
npx playwright install chromium firefox webkit
```

## Como adicionar um projeto

Os projetos ficam em `data/projetos.js`. Para incluir um novo, adicione um item
à lista desse arquivo, seguindo o formato dos que já existem. A ordem da lista
é a ordem em que os projetos aparecem no site.
