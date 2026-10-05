# Refeições a Dois

Aplicação web privada, *mobile first*, para o Diogo e a namorada planearem almoços e jantares, gerirem receitas e gerarem a lista de compras.

**Stack:** React 19 · TypeScript · Tailwind CSS 4 · Vite · Zustand · dnd-kit · jsPDF.

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

Login (conta única partilhada): utilizador `casal`, palavra-passe `comida2026`. Para mudar, ver abaixo.

## Publicação (GitHub Pages)

1. *Settings → Pages → Build and deployment → Source: GitHub Actions*.
2. Cada push para `main` corre `.github/workflows/deploy.yml` (testes + build + publicação).
3. Endereço: `https://rdiogoorodrigues.github.io/food/`.

### Mudar o utilizador/palavra-passe

1. `npm run hash-password -- casal "nova-palavra-passe"`
2. *Settings → Secrets and variables → Actions*:
   - Secret `VITE_PASSWORD_HASH` = hash gerado
   - Variable `VITE_USERNAME` (opcional, por defeito `casal`)
3. Re-executar o workflow. As sessões abertas terminam automaticamente.

## Dados e segurança

- Os dados ficam no `localStorage` de **cada dispositivo** (sem servidor). Dois telemóveis não partilham planos nem listas; use *Definições → Exportar/Importar* para passar dados entre dispositivos.
- O login é uma barreira simples: num site estático, quem inspecionar o código JavaScript consegue contorná-lo. Não guardar nada sensível.

## Estrutura

```
src/
  auth/            login, utilizadores
  components/      UI partilhada (Sheet, botões, toast, navegação de semana)
  data/            receitas iniciais, sopa, lanches
  features/        planner, recipes, shopping, breakfast, snacks, history, settings
  lib/             gerador, lista de compras, plano alimentar, datas, histórico, PDF
  store/           estado (Zustand) e persistência local
```
