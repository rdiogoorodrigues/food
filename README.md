# Refeições a Dois

Aplicação web privada, *mobile first*, para o Diogo e a namorada planearem almoços e jantares, gerirem receitas e gerarem a lista de compras.

**Stack:** React 19 · TypeScript · Tailwind CSS 4 · Vite · Zustand · dnd-kit · Supabase (opcional) · jsPDF.

## Funcionalidades

- **Hoje (plano do Diogo)** — as 5 refeições do dia (pequeno-almoço, almoço, lanche, jantar, ceia) com horários e porções individuais, botão para marcar cada uma como cumprida, adesão semanal (objetivo ≥ 80%) e o que preparar na véspera (overnight oats, ovos cozidos, pudim de chia). Almoços/jantares fora do plano mostram a regra do prato; pizza e take away aparecem como excepções planeadas.
- **Plano alimentar** — Dias 1/2/3 em rotação contínua. Ao gerar a semana, de segunda a quinta (configurável) o almoço e o jantar do casal são os do plano e contam para as quotas; o gerador completa os restantes dias, mantendo pizza à sexta e um take away. A etiqueta “Dia N” em cada dia do calendário permite mudar o dia do plano manualmente. Porções só para o Diogo; as receitas do casal estão em quantidades para dois e em peso cru.
- **Semana** — calendário semanal (almoço + jantar), com a nota fixa “Sopa” ao jantar (base courgete, cenoura, cebola + couve/espinafres/nabo/grão).
  - Tocar num dia para escolher receita, trocar, copiar, mover/trocar com outro dia ou remover.
  - Arrastar receitas da faixa “Arrastar receitas para o calendário” ou entre dias (no telemóvel: toque longo).
  - Ao colocar uma receita ao jantar pergunta *“Existem sobras para almoço do dia seguinte?”* — se sim, cria o almoço de sobras e duplica as quantidades na lista de compras.
- **Gerar Semana Automática** — ver algoritmo abaixo.
- **Lista de compras** — inclui pequeno-almoço, lanche e ceia do plano do Diogo; consolidada por secção (Carne, Peixe, Legumes, Fruta, Lacticínios, Mercearia, Congelados), soma quantidades (`500 g + 700 g = 1,2 kg`), marcar como comprado, itens extra, imprimir e exportar PDF.
- **Receitas** — cartões, pesquisa por nome, filtros (favoritas, Bimby, categoria), formulário simples.
- **Pequenos-almoços**, **Lanches** (com sugestões saciantes proteína + fruta), **Histórico** (últimas semanas, frequência de cada receita, receitas nunca feitas), **Definições** (quotas, panelas de sopa, janela anti-repetição, exportar/importar cópia JSON).

## Algoritmo de geração

14 refeições por semana:

| Slot | Regra |
|---|---|
| Sexta, jantar | Pizza (fixo) |
| 1 aleatório | Take Away |
| 11 cozinhados | 3 peixe · 3 carne branca · 2 carne vermelha · 3 vegetariano (configurável) |
| restantes (1) | Almoço de sobras do jantar anterior (preferência dias úteis e receitas que aguentam bem) |

Penalizações na escolha de cada receita: usada nos últimos 14 dias, repetida na semana, massa seguida de massa, refeições “semelhantes” seguidas (partilham etiqueta: caril, bolonhesa, bacalhau, salmão…). Bónus para favoritas. São feitas 400 tentativas aleatórias e escolhida a de melhor pontuação. O histórico é o próprio plano guardado (todas as datas), por isso nada se perde.

Se não houver receitas suficientes numa categoria, a app avisa (ex.: só existem 3 receitas de carne branca para 3 refeições semanais com bloqueio de 2 semanas — **adicionem mais receitas de frango/peru**).

## Desenvolvimento

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # testes do gerador e da lista de compras
npm run build
```

Login inicial (modo local): `diogo` / `refeicoes` e `namorada` / `refeicoes`. **Mudem-nas** (ver abaixo).

## Publicação (GitHub Pages)

1. *Settings → Pages → Source: GitHub Actions*.
2. Gerar os hashes das palavras-passe: `npm run hash-password -- diogo "palavra-passe"`.
3. *Settings → Secrets and variables → Actions*:
   - Secrets: `VITE_DIOGO_PASSWORD_HASH`, `VITE_PARTNER_PASSWORD_HASH`
   - Variables (opcional): `VITE_PARTNER_USERNAME`, `VITE_PARTNER_NAME`
4. Push para `main` → o workflow `.github/workflows/deploy.yml` testa, compila e publica.

## Segurança e sincronização — ler antes de usar

- **Modo local (por defeito):** os dados ficam no `localStorage` de cada dispositivo. *O telemóvel do Diogo e o da namorada não partilham dados.* O login é apenas uma barreira cosmética: num site estático, quem abrir o código JavaScript pode contorná-lo. Não guardem nada sensível.
- **Modo Supabase (recomendado para uso a dois):** autenticação real e dados partilhados em tempo real.
  1. Criar projeto gratuito em supabase.com.
  2. Executar `supabase/schema.sql` no SQL Editor.
  3. *Authentication → Users*: criar as duas contas (email + palavra-passe). **Desativar “Allow new users to sign up”** — caso contrário qualquer pessoa pode criar conta e ler os dados.
  4. Definir as variáveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DIOGO_EMAIL`, `VITE_PARTNER_EMAIL`.
  5. No login continua a usar-se o nome de utilizador (`diogo`); a app traduz para o email.

  Sincronização: o estado é um único documento JSON, *last-write-wins*. Para duas pessoas é suficiente; edições simultâneas no mesmo segundo podem sobrepor-se.

## Estrutura

```
src/
  auth/            login, utilizadores
  components/      UI partilhada (Sheet, botões, toast, navegação de semana)
  data/            receitas iniciais, sopa, lanches
  features/        planner, recipes, shopping, breakfast, snacks, history, settings
  lib/             gerador, lista de compras, datas, histórico, PDF, Supabase
  store/           estado (Zustand) e persistência local/Supabase
supabase/schema.sql
```
