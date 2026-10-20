# Acervo MCLM — pregações e estudos bíblicos

Site (Next.js + Tailwind + Supabase) que transforma transcrições em páginas editoriais com
resumo, versículos, pontos principais e frases marcantes, geradas pela API do Claude.
Acesso direto, sem login. O site não aparece em buscadores (noindex + robots.txt).

## 1. Pré-requisitos

- **Node.js 20 ou superior** — https://nodejs.org (versão LTS)
- Uma conta gratuita no **Supabase** — https://supabase.com
- Uma chave da **API da Anthropic** — https://console.anthropic.com

## 2. Configurar o Supabase

1. Crie um projeto novo.
2. Abra **SQL Editor**, cole todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**.
3. Em **Project Settings → API**, copie a *Project URL* e a chave **service_role** (secreta).

## 3. Variáveis de ambiente

Edite o `.env.local` (modelo em `.env.example`):

| Variável | O que é |
| --- | --- |
| `SUPABASE_URL` | Project URL do passo 2.3 |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role — usada **só no servidor** |
| `PAINEL_SENHA` | *(opcional)* senha para entrar no `/painel`. Vazio = painel aberto |
| `ANTHROPIC_API_KEY` | *(opcional)* chave da API do Claude. Vazio = **modo grátis** (copiar/colar no claude.ai) |
| `AI_MODEL` | Modelo (padrão `claude-opus-5-5`) |
| `BIBLE_TEXT_SOURCE` | `ai` (a IA escreve o versículo na ARA) ou `bible-api` (texto exato da Almeida de domínio público, grafia antiga) |

## 4. Rodar no computador

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

## 5. Colocar no ar (Vercel)

1. Suba a pasta para um repositório no GitHub.
2. Em https://vercel.com, importe o repositório.
3. Cadastre as mesmas variáveis de ambiente do `.env.local`.
4. Deploy. O limite de 300 s por requisição (`maxDuration`) já está configurado para transcrições longas.

> **Atenção:** sem `PAINEL_SENHA`, qualquer pessoa que tiver o endereço do site consegue abrir o `/painel`
> e editar ou excluir mensagens. Defina uma senha antes de divulgar o site.

## Como usar

1. **Painel → + Nova**: cole o texto ou envie `.txt`, `.docx` ou `.pdf`; escolha categoria, data, pregador e série.
2. **Modo grátis** (sem `ANTHROPIC_API_KEY`): clique em **Continuar → Copiar pedido**, cole no claude.ai,
   copie a resposta e cole de volta no painel → **Criar rascunho**.
   **Modo automático** (com chave): **Gerar resumo** — a barra mostra o progresso e o rascunho é salvo sozinho.
3. **Revisar**: edite qualquer campo (reordene/adicione/remova versículos, pontos e frases) e clique em **Publicar**.

Só itens **publicados** aparecem nas páginas de leitura.

## Personalizar

- **Logo**: substitua [`public/logo.png`](public/logo.png) (PNG/SVG branco com fundo transparente).
- **Fotos**: coloque imagens em `public/images/` com os nomes `hero.jpg`, `destaque.jpg`, `pregacoes.jpg`,
  `estudos.jpg` e `faq.jpg`. Prefira fotos com luz quente (madeira, janela, texturas), ~2000 px de largura.
  Enquanto não existirem, aparece um degradê quente.
- **Endereço, horários, textos, FAQ, redes sociais**: [`lib/config.ts`](lib/config.ts).
- **Cores e fontes**: [`tailwind.config.ts`](tailwind.config.ts) e [`app/globals.css`](app/globals.css).
- **Aparecer no Google** (se um dia quiser): remova `app/robots.ts`, o `robots` em `app/layout.tsx`
  e o cabeçalho `X-Robots-Tag` em `next.config.mjs`.

## Estrutura

```
app/
  (site)/            páginas de leitura: home, pregacoes, estudos, mensagem/[slug]
  painel/            lista, nova mensagem e editor
  api/extract        lê .txt/.docx/.pdf
  api/generate       chama a IA com progresso em tempo real e salva rascunho
components/          header, rodapé, cards, carrossel, filtros…
lib/ai.ts            prompt e chamada à API do Claude
lib/config.ts        textos e dados da igreja
lib/supabase/        acesso ao banco (somente servidor)
supabase/schema.sql  banco de dados
```
