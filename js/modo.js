// Liga e desliga o visual do modo jogo. O CSS muda tudo a partir do atributo
// data-modo no <html>; aqui só entram o atributo e a piscada da troca.

const DURACAO_TRANSICAO = 350;

let temporizador = null;

function movimentoReduzido() {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function aplicarModo(modo, { animar = false } = {}) {
  const raiz = document.documentElement;
  raiz.dataset.modo = modo === "jogo" ? "jogo" : "sutil";

  clearTimeout(temporizador);
  raiz.classList.remove("transicao-modo");
  if (!animar || movimentoReduzido()) return;

  raiz.classList.add("transicao-modo");
  temporizador = setTimeout(() => {
    raiz.classList.remove("transicao-modo");
  }, DURACAO_TRANSICAO);
}
