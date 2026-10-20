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
    { day: "Domingo", time: "19h", label: "Culto da Família" },
    { day: "Quinta-feira", time: "20h", label: "Culto de Oração" },
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

  faq: [
    {
      q: "Onde fica a igreja?",
      a: "Estamos na R. Jacy Stevaux Villaça, 2-79, no Jd. Contorno, em Bauru (SP). Use o link “Como chegar” no rodapé para abrir o caminho no Waze.",
    },
    {
      q: "Quais são os dias e horários dos cultos?",
      a: "Domingo às 19h, no Culto da Família, e quinta-feira às 20h, no Culto de Oração. Você é muito bem-vindo!",
    },
    {
      q: "O que é este acervo?",
      a: "É o registro escrito das pregações e estudos bíblicos da MCLM: resumo, versículos, pontos principais, frases marcantes e a transcrição completa de cada mensagem.",
    },
    {
      q: "Qual a diferença entre Pregações e Estudos?",
      a: "Pregações são as mensagens dos cultos de domingo. Estudos são os encontros bíblicos durante a semana, muitas vezes organizados em séries que percorrem um livro ou tema.",
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
