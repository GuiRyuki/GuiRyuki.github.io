// Único ponto do site que acessa o localStorage. Todo acesso fica dentro de
// try/catch porque o navegador pode bloquear o armazenamento (aba anônima,
// cookies desativados) e o site precisa continuar funcionando sem ele.

export const CHAVE_MODO = "portfolio.modo";
export const CHAVE_IDIOMA = "portfolio.idioma";

// O padrão é resolvido dentro do try: só de ler `globalThis.localStorage`
// alguns navegadores já lançam erro.
function resolverArmazenamento(armazenamento) {
  return armazenamento ?? globalThis.localStorage;
}

export function lerPreferencia(chave, padrao, armazenamento) {
  try {
    const valor = resolverArmazenamento(armazenamento).getItem(chave);
    return valor === null || valor === undefined ? padrao : valor;
  } catch {
    return padrao;
  }
}

export function salvarPreferencia(chave, valor, armazenamento) {
  try {
    resolverArmazenamento(armazenamento).setItem(chave, valor);
  } catch {
    // Sem armazenamento disponível, a preferência vale só para esta visita.
  }
}
