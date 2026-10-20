/**
 * Configurações editáveis do site: textos, endereço, horários, FAQ e fotos.
 * Altere à vontade — nada aqui é secreto.
 */
export const site = {
  name: "MCLM",
  fullName: "Ministério Cristão",
  tagline: "Acervo de pregações e estudos bíblicos",
  heroTitle: { lead: "Palavra que transforma", emphasis: "vidas" },
  heroText:
    "Um acervo das mensagens pregadas e dos estudos bíblicos da nossa igreja — para reler, meditar e guardar no coração.",

  address: {
    line1: "Rua Exemplo, 123 — Centro",
    line2: "Cidade — UF, 00000-000",
    mapsUrl: "https://maps.google.com",
  },

  services: [
    { day: "Domingo", time: "18h", label: "Culto de celebração" },
    { day: "Quarta-feira", time: "19h30", label: "Estudo bíblico" },
  ],

  social: [
    { label: "Instagram", url: "https://instagram.com" },
    { label: "YouTube", url: "https://youtube.com" },
  ],

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
      q: "O que é este acervo?",
      a: "É o registro escrito das pregações de domingo e dos estudos bíblicos da semana: resumo, versículos, pontos principais, frases marcantes e a transcrição completa de cada mensagem.",
    },
    {
      q: "Qual a diferença entre Pregações e Estudos?",
      a: "Pregações são as mensagens dos cultos de domingo. Estudos são os encontros bíblicos durante a semana, muitas vezes organizados em séries que percorrem um livro ou tema.",
    },
    {
      q: "Os resumos substituem a mensagem?",
      a: "Não. Eles ajudam a relembrar e aprofundar. A transcrição completa fica disponível ao final de cada página para quem quiser ler a mensagem na íntegra.",
    },
    {
      q: "Como encontro uma mensagem específica?",
      a: "Nas páginas de Pregações e Estudos você pode buscar por palavra-chave e filtrar por pregador, série ou livro da Bíblia.",
    },
    {
      q: "Qual tradução bíblica é usada?",
      a: "Os versículos citados seguem a tradução Almeida. Sempre que possível, confira o texto em sua Bíblia.",
    },
  ],
} as const;
