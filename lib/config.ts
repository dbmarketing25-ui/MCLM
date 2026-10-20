/**
 * Configurações editáveis do site: textos, endereço, horários, FAQ e fotos.
 * Altere à vontade — nada aqui é secreto.
 */
export const site = {
  name: "MCLM",
  fullName: "MCLM",
  tagline: "Acervo de pregações e estudos bíblicos",
  slogan: "Jesus tem poder para salvar.",
  heroTitle: { lead: "Palavra que transforma", emphasis: "vidas" },
  heroText:
    "Um acervo das mensagens pregadas e dos estudos bíblicos da MCLM — para reler, meditar e guardar no coração.",

  address: {
    line1: "R. Jacy Stevaux Villaça, 2-79",
    line2: "Jd. Contorno — Bauru, SP",
    mapsUrl: "https://waze.com/ul/h6uj0gvv19",
  },

  services: [
    { day: "Todo domingo", time: "19h", label: "Culto da Família" },
    { day: "Toda quinta-feira", time: "20h", label: "Culto de Oração" },
    { day: "1º domingo do mês", time: "9h", label: "Estudo bíblico" },
    { day: "Último sábado do mês", time: "19h", label: "Culto de jovens" },
  ],

  social: [{ label: "Instagram", url: "https://www.instagram.com/eumissao/" }],

  /**
   * Fotos com luz quente (madeira, luz de janela, texturas).
   * Coloque seus arquivos em /public/images com estes nomes — enquanto não existirem,
   * o site mostra um degradê quente no lugar.
   */
  images: {
    hero: "/images/hero.jpg",
    featured: "/images/destaque.jpg",
    pregacoes: "/images/pregacoes.jpg",
    estudos: "/images/estudos.jpg",
    faq: "/images/faq.jpg",
  },

  /**
   * Vídeos do Instagram exibidos na Home (tocam um de cada vez, automaticamente).
   * Os arquivos ficam em /public/videos (reel-N.mp4 e a capa reel-N.jpg).
   */
  reels: [
    {
      src: "/videos/reel-1.mp4",
      poster: "/videos/reel-1.jpg",
      url: "https://www.instagram.com/reel/CokpowsAtJ9/",
      title: "Tem culto hoje!",
      text: "O convite de sempre: venha cultuar com a gente.",
    },
    {
      src: "/videos/reel-2.mp4",
      poster: "/videos/reel-2.jpg",
      url: "https://www.instagram.com/reel/CwoEvEgIO3p/",
      title: "Isaías 38:20",
      text: "O Senhor veio salvar-me; nós o louvaremos todos os dias de nossa vida na Casa do Senhor.",
    },
    {
      src: "/videos/reel-3.mp4",
      poster: "/videos/reel-3.jpg",
      url: "https://www.instagram.com/reel/C1TGVktNo5S/",
      title: "O que realmente importa?",
      text: "Jesus nos deixou uma missão: honrar a sua palavra e o seu verdadeiro evangelho.",
    },
    {
      src: "/videos/reel-4.mp4",
      poster: "/videos/reel-4.jpg",
      url: "https://www.instagram.com/reel/DT8XV8Tjsm-/",
      title: "O teu grande amor",
      text: "É o que precisamos para viver. Que Deus abençoe a todos!",
    },
  ],

  faq: [
    {
      q: "Onde fica a igreja?",
      a: "Estamos na R. Jacy Stevaux Villaça, 2-79, no Jd. Contorno, em Bauru (SP). Use o link “Como chegar” no rodapé para abrir o caminho no Waze.",
    },
    {
      q: "Quais são os dias e horários dos cultos?",
      a: "O culto acontece todo domingo às 19h, e toda quinta-feira às 20h temos o Culto de Oração. No primeiro domingo de cada mês temos estudo bíblico às 9h, e no último sábado do mês, culto de jovens às 19h. Você é muito bem-vindo!",
    },
    {
      q: "O que é este acervo?",
      a: "É o registro escrito das pregações e estudos bíblicos da MCLM: resumo, versículos, pontos principais, frases marcantes e a transcrição completa de cada mensagem.",
    },
    {
      q: "Qual a diferença entre Pregações e Estudos?",
      a: "Pregações são as mensagens dos cultos de domingo. Estudos são os encontros bíblicos do primeiro domingo de cada mês, às 9h, muitas vezes organizados em séries que percorrem um livro ou tema.",
    },
    {
      q: "Como encontro uma mensagem específica?",
      a: "Nas páginas de Pregações e Estudos você pode buscar por palavra-chave e filtrar por pregador, série ou livro da Bíblia.",
    },
    {
      q: "Como acompanho as novidades da igreja?",
      a: "Siga a MCLM no Instagram, @eumissao — lá publicamos avisos, eventos e trechos das mensagens.",
    },
  ],
} as const;
