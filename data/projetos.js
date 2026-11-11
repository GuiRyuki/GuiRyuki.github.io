// Textos de resumo e minhaParte são rascunho provisório (revisão na Tarefa 7).
export const projetos = [
  {
    id: "kfka",
    titulo: "KFKA",
    ano: 2026,
    stack: ["React 19", "Vite", "React Router"],
    resumo: {
      pt: "Plataforma de acompanhamento do progresso escolar para professores, famílias e escolas. Projeto interdisciplinar da FECAP.",
      en: "A platform for tracking school progress, made for teachers, families and schools. Interdisciplinary project at FECAP.",
    },
    minhaParte: {
      pt: "Protótipo e entrega de POO do sistema, documentação (README e formulários de uso de IA) e ajustes no protótipo do Figma.",
      en: "The OOP prototype and delivery of the system, documentation (README and AI-usage forms) and adjustments to the Figma prototype.",
    },
    equipe: {
      pt: "Grupo Collision (FECAP)",
      en: "Collision group (FECAP)",
    },
    repo: "https://github.com/2026-2-NADS2/Projeto3",
    online: "",
    imagens: [
      {
        src: "assets/projetos/kfka-1.webp",
        alt: { pt: "Tela do KFKA", en: "KFKA screen" },
      },
      {
        src: "assets/projetos/kfka-2.webp",
        alt: { pt: "Outra tela do KFKA", en: "Another KFKA screen" },
      },
    ],
    destaque: null,
  },
  {
    id: "gotham-knights",
    titulo: "Batman: Gotham Knights",
    ano: 2026,
    stack: ["JavaScript", "Canvas 2D", "Vite", "MVC/POO"],
    resumo: {
      pt: "Jogo de ação e plataforma com 3 fases, chefões, pontuação e controles para celular.",
      en: "A platform action game with 3 levels, bosses, a score system and mobile controls.",
    },
    minhaParte: {
      pt: "11 dos 19 commits: lobby e menu, telas de fim de jogo, pontuação, áudio, fundos das fases e refatoração.",
      en: "11 of the 19 commits: lobby and menu, end screens, score, audio, level backgrounds and refactoring.",
    },
    equipe: {
      pt: "4 pessoas",
      en: "4 people",
    },
    repo: "https://github.com/felipenono/batman_-gotham-nights",
    online: "",
    imagens: [
      {
        src: "assets/projetos/gotham-knights-1.webp",
        alt: {
          pt: "Tela do jogo Batman: Gotham Knights",
          en: "Screen from the game Batman: Gotham Knights",
        },
      },
    ],
    destaque: {
      src: "assets/projetos/gotham-knights.mp4",
      poster: "assets/projetos/gotham-knights-1.webp",
      alt: {
        pt: "Vídeo curto do jogo Batman: Gotham Knights em ação",
        en: "Short video of the game Batman: Gotham Knights in action",
      },
    },
  },
  {
    id: "casasabor",
    titulo: "CasaSabor",
    ano: 2026,
    stack: ["HTML", "CSS"],
    resumo: {
      pt: "Site de um restaurante, feito como trabalho em grupo na FECAP.",
      en: "A restaurant website, built as a group assignment at FECAP.",
    },
    minhaParte: {
      pt: "A página \"Almoço\": HTML, imagens e layout seguindo o Figma.",
      en: "The \"Almoço\" (lunch) page: HTML, images and layout following the Figma design.",
    },
    equipe: {
      pt: "Trabalho em grupo (FECAP)",
      en: "Group assignment (FECAP)",
    },
    repo: "https://github.com/SouzaDuda/CasaSabor",
    online: "",
    imagens: [
      {
        src: "assets/projetos/casasabor-1.webp",
        alt: { pt: "Tela do site CasaSabor", en: "CasaSabor website screen" },
      },
      {
        src: "assets/projetos/casasabor-2.webp",
        alt: {
          pt: "Outra tela do site CasaSabor",
          en: "Another CasaSabor website screen",
        },
      },
    ],
    destaque: null,
  },
];
