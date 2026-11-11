// Textos-rascunho escritos a partir do histórico de commits de cada
// repositório; aguardam a revisão do Guilherme. Os prints usam só dados
// fictícios.
export const projetos = [
  {
    id: "kfka",
    titulo: "KFKA",
    ano: 2026,
    stack: ["React 19", "Vite", "React Router"],
    resumo: {
      pt: "Plataforma web de acompanhamento escolar para o Ensino Fundamental: o professor registra o desenvolvimento do aluno, a administração da escola revisa e a família lê o que foi publicado. Projeto Interdisciplinar da FECAP.",
      en: "A web platform for tracking school progress in elementary schools: teachers record each student's development, the school administration reviews it and families read what gets published. Interdisciplinary Project at FECAP.",
    },
    minhaParte: {
      pt: "A entrega de Programação Orientada a Objetos: um protótipo e depois uma API do sistema em C# (ASP.NET Core), com o domínio modelado em classes, banco SQLite, login com JWT e 27 testes automatizados. Também cuidei de parte da documentação (README e fichas de uso de IA) e de ajustes no protótipo do Figma. As telas em React dos prints foram feitas por colegas do grupo.",
      en: "The Object-Oriented Programming delivery: a prototype and then an API for the system in C# (ASP.NET Core), with the domain modeled as classes, a SQLite database, JWT login and 27 automated tests. I also handled part of the documentation (README and AI-usage forms) and adjustments to the Figma prototype. The React screens in the screenshots were built by teammates.",
    },
    equipe: {
      pt: "grupo Collision, 5 pessoas (FECAP)",
      en: "Collision group, 5 people (FECAP)",
    },
    repo: "https://github.com/2026-2-NADS2/Projeto3",
    online: "",
    imagens: [
      {
        src: "assets/projetos/kfka-1.webp",
        alt: {
          pt: "Página inicial do KFKA, com o título \"Escola e família, mais próximas.\", os botões \"Conhecer a plataforma\" e \"Já tenho acesso\" e três cartões que explicam o acompanhamento",
          en: "KFKA home page, with the headline \"Escola e família, mais próximas.\" (school and family, closer together), the buttons to get to know the platform or sign in, and three cards explaining how the tracking works",
        },
      },
      {
        src: "assets/projetos/kfka-2.webp",
        alt: {
          pt: "Painel da administração do KFKA, com dados fictícios: menu lateral, contadores de acompanhamentos aguardando revisão, em revisão, devolvidos e publicados, e a fila de revisão",
          en: "KFKA administration dashboard, with made-up data: side menu, counters of reports awaiting review, under review, returned and published, and the review queue",
        },
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
      pt: "Jogo de ação e plataforma para navegador, organizado em MVC com orientação a objetos. Tem 3 fases, chefões, pontuação com recorde salvo e controles para celular.",
      en: "A platform action game for the browser, organized as MVC with object-oriented code. It has 3 levels, bosses, a score with a saved record and mobile controls.",
    },
    minhaParte: {
      pt: "11 dos 19 commits do repositório: o lobby e o menu, as telas de vitória e derrota, o sistema de pontuação, o áudio, os fundos das fases e uma refatoração do código.",
      en: "11 of the repository's 19 commits: the lobby and menu, the victory and defeat screens, the score system, the audio, the level backgrounds and a refactoring of the code.",
    },
    equipe: {
      pt: "4 pessoas (FECAP)",
      en: "4 people (FECAP)",
    },
    repo: "https://github.com/felipenono/batman_-gotham-nights",
    online: "",
    imagens: [
      {
        src: "assets/projetos/gotham-knights-1.webp",
        alt: {
          pt: "Fase 1 de Batman: Gotham Knights, nos telhados de Gotham: Batman salta na frente da lua enquanto um batarangue voa em direção aos inimigos; o painel mostra vidas, saúde, batarangues e 100 pontos",
          en: "Level 1 of Batman: Gotham Knights, on the rooftops of Gotham: Batman jumps in front of the moon while a batarang flies towards the enemies; the HUD shows lives, health, batarangs and 100 points",
        },
      },
    ],
    destaque: {
      src: "assets/projetos/gotham-knights.webm",
      poster: "assets/projetos/gotham-knights-1.webp",
      alt: {
        pt: "Vídeo de 7 segundos, sem som, da fase 1 de Batman: Gotham Knights: Batman anda, pula entre as plataformas e lança batarangues nos inimigos",
        en: "A silent 7-second video of level 1 of Batman: Gotham Knights: Batman walks, jumps between platforms and throws batarangs at the enemies",
      },
    },
  },
  {
    id: "casasabor",
    titulo: "CasaSabor",
    ano: 2026,
    stack: ["HTML", "CSS"],
    resumo: {
      pt: "Site de um restaurante fictício, com uma página para cada refeição do cardápio. Trabalho em grupo da FECAP para praticar versionamento com Git e GitHub.",
      en: "Website for a made-up restaurant, with one page for each meal on the menu. A group assignment at FECAP to practice version control with Git and GitHub.",
    },
    minhaParte: {
      pt: "A página \"Almoço\", que aparece nos prints: escrevi o HTML, adicionei as fotos dos pratos e ajustei o layout no CSS para seguir o Figma.",
      en: "The \"Almoço\" (lunch) page, shown in the screenshots: I wrote the HTML, added the photos of the dishes and adjusted the layout in the CSS to follow the Figma design.",
    },
    equipe: {
      pt: "6 pessoas (FECAP)",
      en: "6 people (FECAP)",
    },
    repo: "https://github.com/SouzaDuda/CasaSabor",
    online: "",
    imagens: [
      {
        src: "assets/projetos/casasabor-1.webp",
        alt: {
          pt: "Topo da página Almoço do CasaSabor: menu do restaurante, o título \"Almoço\" com a frase \"Uma pausa deliciosa no seu dia.\" e a foto de um prato com arroz, feijão, frango grelhado e salada",
          en: "Top of the CasaSabor lunch page: the restaurant's menu bar, the title \"Almoço\" with the line \"Uma pausa deliciosa no seu dia.\" (a delicious break in your day) and a photo of a plate with rice, beans, grilled chicken and salad",
        },
      },
      {
        src: "assets/projetos/casasabor-2.webp",
        alt: {
          pt: "Cardápio de almoço do CasaSabor, com três pratos e seus preços (Prato Executivo, Lasanha à Bolonhesa e Strogonoff de Carne), e o rodapé do site",
          en: "CasaSabor lunch menu, with three dishes and their prices (executive plate, lasagna bolognese and beef stroganoff), and the site footer",
        },
      },
    ],
    destaque: null,
  },
];
