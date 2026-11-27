---
version: alpha
name: ViajaJunto
description: Design system da interface web responsiva (celular e desktop) do ViajaJunto, planejador colaborativo de viagens. Paleta rubi, bordô e rosa antigo sobre bege claro, estética editorial de turismo (fotos em destaque, títulos em serifa, pílulas e cards flutuantes), tipografia DM Serif Display + Plus Jakarta Sans + Inter, escala de 4 px.
colors:
  red-ruby: '#9B111E'
  red-burgundy: '#6a0d16'
  white: '#FFFFFF'
  rose-vintage: '#C67C82'
  rose-dusty: '#B5827E'
  gray-ink: '#1F1F1F'
  beige-sand: '#E3CAB6'
  beige-light: '#EDE6DF'
  gray-dim: '#5E5E5E'
  brown-espresso: '#36211D'
  green-mint: '#BFDCBC'
  yellow-wheat: '#f4d08d'
  rose-blush: '#F0B6B0'
  blue-mist: '#b6d8f7'
  scrim-burgundy: 'rgba(121, 14, 24, 0.78)'
typography:
  display-hero:
    fontFamily: DM Serif Display
    fontSize: 64px
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: -0.01em
  display-hero-mobile:
    fontFamily: DM Serif Display
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1.08
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.3
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.4
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.25
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: 0.06em
  label-overline:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0.2em
  numeric-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: "'tnum' 1"
  numeric-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    fontFeature: "'tnum' 1"
rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1200px
breakpoints:
  sm: 640px
  lg: 1024px
components:
  page:
    backgroundColor: '{colors.beige-light}'
    textColor: '{colors.gray-ink}'
    typography: '{typography.body-md}'
  page-discovery:
    backgroundColor: '{colors.white}'
    textColor: '{colors.gray-ink}'
    typography: '{typography.body-md}'
  app-bar:
    backgroundColor: '{colors.white}'
    textColor: '{colors.gray-ink}'
    height: 72px
  bottom-nav:
    backgroundColor: '{colors.white}'
    textColor: '{colors.gray-dim}'
    height: 72px
  nav-item:
    textColor: '{colors.gray-dim}'
    typography: '{typography.label-lg}'
  nav-item-active:
    textColor: '{colors.red-burgundy}'
  nav-indicator:
    backgroundColor: '{colors.red-ruby}'
    rounded: '{rounded.full}'
    size: 6px
  page-title:
    textColor: '{colors.red-burgundy}'
    typography: '{typography.headline-lg}'
  page-title-mobile:
    textColor: '{colors.red-burgundy}'
    typography: '{typography.headline-md}'
  hero-banner:
    backgroundColor: '{colors.red-burgundy}'
    textColor: '{colors.white}'
    typography: '{typography.display}'
    rounded: '{rounded.xl}'
    padding: 32px
  button-primary:
    backgroundColor: '{colors.red-ruby}'
    textColor: '{colors.white}'
    typography: '{typography.label-lg}'
    rounded: '{rounded.xs}'
    height: 48px
    padding: 24px
  button-primary-hover:
    backgroundColor: '{colors.red-burgundy}'
    textColor: '{colors.white}'
  button-secondary:
    backgroundColor: '{colors.rose-dusty}'
    textColor: '{colors.brown-espresso}'
    typography: '{typography.label-lg}'
    rounded: '{rounded.xs}'
    height: 48px
    padding: 24px
  button-secondary-hover:
    backgroundColor: '{colors.rose-vintage}'
    textColor: '{colors.brown-espresso}'
  button-compact:
    backgroundColor: '{colors.rose-vintage}'
    textColor: '{colors.gray-ink}'
    typography: '{typography.label-md}'
    rounded: '{rounded.xs}'
    height: 36px
    padding: 12px
  button-danger:
    backgroundColor: '{colors.rose-dusty}'
    textColor: '{colors.brown-espresso}'
    typography: '{typography.label-lg}'
    rounded: '{rounded.xs}'
    height: 48px
    padding: 24px
  button-danger-hover:
    backgroundColor: '{colors.rose-vintage}'
    textColor: '{colors.brown-espresso}'
  button-circle:
    backgroundColor: '{colors.white}'
    textColor: '{colors.red-ruby}'
    rounded: '{rounded.full}'
    size: 48px
  input:
    backgroundColor: '{colors.white}'
    textColor: '{colors.gray-ink}'
    typography: '{typography.body-md}'
    rounded: '{rounded.xs}'
    height: 48px
    padding: 12px
  input-label:
    textColor: '{colors.gray-ink}'
    typography: '{typography.label-md}'
  input-helper:
    textColor: '{colors.gray-dim}'
    typography: '{typography.body-sm}'
  card:
    backgroundColor: '{colors.white}'
    textColor: '{colors.gray-ink}'
    rounded: '{rounded.lg}'
    padding: 24px
  card-title:
    textColor: '{colors.red-burgundy}'
    typography: '{typography.headline-sm}'
  card-compact:
    backgroundColor: '{colors.white}'
    textColor: '{colors.gray-ink}'
    rounded: '{rounded.sm}'
    padding: 16px
  hero-overline:
    textColor: '{colors.red-burgundy}'
    typography: '{typography.label-overline}'
  hero-title:
    textColor: '{colors.red-burgundy}'
    typography: '{typography.display-hero}'
  hero-title-accent:
    textColor: '{colors.red-ruby}'
  floating-card:
    backgroundColor: '{colors.white}'
    textColor: '{colors.gray-ink}'
    typography: '{typography.label-md}'
    rounded: '{rounded.lg}'
    padding: 16px
  search-bar:
    backgroundColor: '{colors.white}'
    textColor: '{colors.gray-ink}'
    typography: '{typography.label-md}'
    rounded: '{rounded.full}'
    height: 80px
  search-field-icon:
    backgroundColor: '{colors.beige-sand}'
    textColor: '{colors.red-ruby}'
    rounded: '{rounded.full}'
    size: 44px
  search-button:
    backgroundColor: '{colors.red-ruby}'
    textColor: '{colors.white}'
    rounded: '{rounded.full}'
    size: 56px
  promo-banner:
    backgroundColor: '{colors.red-burgundy}'
    textColor: '{colors.white}'
    typography: '{typography.headline-md}'
    rounded: '{rounded.xl}'
    padding: 32px
  photo-card:
    backgroundColor: '{colors.beige-sand}'
    rounded: '{rounded.lg}'
    height: 240px
  photo-card-caption:
    backgroundColor: '{colors.scrim-burgundy}'
    textColor: '{colors.white}'
    typography: '{typography.title-md}'
  rating-pill:
    backgroundColor: '{colors.white}'
    textColor: '{colors.gray-ink}'
    typography: '{typography.label-md}'
    rounded: '{rounded.sm}'
  stats-strip:
    backgroundColor: '{colors.white}'
    textColor: '{colors.gray-ink}'
    rounded: '{rounded.xl}'
    padding: 24px
  stat-icon:
    backgroundColor: '{colors.beige-sand}'
    textColor: '{colors.red-ruby}'
    rounded: '{rounded.full}'
    size: 48px
  stat-value:
    textColor: '{colors.gray-ink}'
    typography: '{typography.numeric-lg}'
  money:
    textColor: '{colors.gray-ink}'
    typography: '{typography.numeric-md}'
  chip:
    backgroundColor: '{colors.beige-sand}'
    textColor: '{colors.gray-ink}'
    typography: '{typography.label-md}'
    rounded: '{rounded.xs}'
    height: 32px
    padding: 12px
  chip-selected:
    backgroundColor: '{colors.rose-vintage}'
    textColor: '{colors.gray-ink}'
  badge-planning:
    backgroundColor: '{colors.blue-mist}'
    textColor: '{colors.gray-ink}'
    typography: '{typography.label-sm}'
    rounded: '{rounded.xs}'
  badge-confirmed:
    backgroundColor: '{colors.green-mint}'
    textColor: '{colors.gray-ink}'
  badge-completed:
    backgroundColor: '{colors.beige-sand}'
    textColor: '{colors.gray-ink}'
  alert-success:
    backgroundColor: '{colors.green-mint}'
    textColor: '{colors.gray-ink}'
    typography: '{typography.body-sm}'
    rounded: '{rounded.md}'
    padding: 16px
  alert-warning:
    backgroundColor: '{colors.yellow-wheat}'
    textColor: '{colors.gray-ink}'
  alert-error:
    backgroundColor: '{colors.rose-blush}'
    textColor: '{colors.gray-ink}'
  alert-info:
    backgroundColor: '{colors.blue-mist}'
    textColor: '{colors.gray-ink}'
  tab:
    textColor: '{colors.gray-dim}'
    typography: '{typography.label-lg}'
    height: 48px
  tab-active:
    textColor: '{colors.red-burgundy}'
  progress-track:
    backgroundColor: '{colors.beige-sand}'
    rounded: '{rounded.full}'
    height: 8px
  progress-fill:
    backgroundColor: '{colors.red-ruby}'
    rounded: '{rounded.full}'
  avatar:
    backgroundColor: '{colors.rose-vintage}'
    textColor: '{colors.gray-ink}'
    typography: '{typography.label-md}'
    rounded: '{rounded.full}'
    size: 40px
  divider:
    backgroundColor: '{colors.beige-sand}'
    height: 1px
---

# ViajaJunto — Design System

> Os tokens implementados estão em [`src/styles/tokens.css`](../src/styles/tokens.css). Este documento explica as escolhas e como usá-las. Se um valor mudar, atualize os dois.

## Overview

O ViajaJunto é um planejador colaborativo de viagens: um grupo monta junto o roteiro (destinos e atividades), controla o orçamento, divide as despesas e descobre lugares bem avaliados. A interface é **web responsiva**, pensada para **celular e desktop** desde o início, e em **português do Brasil**.

A personalidade é **calorosa, elegante e organizada**: lembra um caderno de viagem bem cuidado, não um painel corporativo. O rubi traz energia e identidade; o bordô dá profundidade e seriedade; o rosa antigo suaviza; os beges dão calor sem cansar a vista. Cada tela tem uma ação principal clara, números de dinheiro são fáceis de ler e quem é quem no grupo fica sempre visível.

**Direção visual: editorial de turismo**, a mesma linguagem das referências do grupo (sites de viagem premium):

- **Fotografia como protagonista**, em formas orgânicas no topo e em cards de foto com legenda sobre véu escuro.
- Um **título grande em serifa**, com a segunda linha em itálico colorido.
- **Pílulas** para botões e busca, ícones dentro de **círculos tingidos** e cards brancos que **flutuam** sobre a foto com sombra ampla.
- Muito branco e respiro nas telas de descoberta; telas de trabalho (roteiro, orçamento, despesas, membros) usam a mesma linguagem de forma mais contida, sobre o fundo bege claro.

Das referências copiamos **composição, formas, tipografia e ritmo**. As cores são as da paleta abaixo (não o verde das referências).

Densidade **média**: cards espaçados, respiro generoso entre blocos e listas compactas só onde o usuário compara itens (despesas, atividades do dia).

Público: estudantes e jovens adultos planejando viagens em grupo, no celular e no computador. Não há senha nem cadastro: o login é só com o Google.

## Colors

A paleta tem **três cores de marca** (rubi, bordô e rosa antigo), **dois beges**, o **branco** e a **tinta** do texto. Nenhuma cor fora dela entra na interface, exceto os fundos de estado.

Os tokens levam o **nome real da cor**, no formato `família-nome` (`red-ruby`, `rose-vintage`...), e não o papel que ela exerce. O uso de cada cor está na coluna "Uso". Em código, a classe é a do próprio nome: `bg-red-ruby`, `text-red-burgundy`, `border-beige-sand`. Se a marca mudar de cor, o token e a classe precisam ser renomeados junto.

| Token            | Valor     | Nome        | Uso                                                                                                               |
| ---------------- | --------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `red-ruby`       | `#9B111E` | Rubi        | Cor da marca: botões principais, ícones de destaque, barra de progresso, aba ativa, anel de foco, itálico do hero |
| `red-burgundy`   | `#790E18` | Bordô       | Hover dos botões, títulos de página e de card, links, banners de destaque e véu das fotos                         |
| `rose-vintage`   | `#C67C82` | Rosa Antigo | Avatares, chips selecionados e ilustrações. **Nunca como cor de texto**                                           |
| `rose-dusty`     | `#B5827E` | Rosa fosco  | Botões `secondary` e `danger` (texto `brown-espresso`, 4,6:1). **Nunca como cor de texto**                        |
| `brown-espresso` | `#36211D` | Marrom      | Texto dos botões `secondary` e `danger` sobre `rose-dusty`                                                        |
| `beige-sand`     | `#E3CAB6` | Bege        | Bordas, divisórias, chips, trilha de progresso e fundo de foto enquanto carrega                                   |
| `beige-light`    | `#EDE6DF` | Bege claro  | Fundo das telas de trabalho, atrás dos cards (versão mais clara do bege)                                          |
| `white`          | `#FFFFFF` | Branco      | Barra superior, telas de descoberta, cards, busca, campos, modais e menus                                         |
| `gray-ink`       | `#1F1F1F` | Tinta       | Todo o texto principal                                                                                            |
| `gray-dim`       | `#5E5E5E` | Cinza       | Texto secundário: legendas, datas, textos de ajuda                                                                |

**Estados** (`green-mint`, `yellow-wheat`, `rose-blush`, `blue-mist`) são só fundos de alertas e badges, sempre com texto `gray-ink` e um **ícone + texto** que diga o estado. A marca é vermelha, então **a cor nunca é o único sinal**: erro e ação perigosa sempre vêm com ícone, palavra ("Erro", "Excluir") e, nas ações destrutivas, confirmação.

Status da viagem (FR07): **Planejando** usa `blue-mist`, **Confirmada** usa `green-mint` e **Concluída** usa `beige-sand`.

### Contraste (WCAG)

Valores medidos entre as cores da paleta:

| Combinação                                                | Contraste      | Pode usar?                                                      |
| --------------------------------------------------------- | -------------- | --------------------------------------------------------------- |
| Branco sobre Rubi                                         | 8,4:1          | Sim, qualquer tamanho                                           |
| Branco sobre Bordô                                        | 11,1:1         | Sim, qualquer tamanho                                           |
| Rubi como texto sobre branco                              | 8,4:1          | Sim                                                             |
| Rubi como texto sobre bege claro                          | 6,9:1          | Sim                                                             |
| Rubi como texto sobre bege (`beige-sand`)                 | 5,4:1          | Sim                                                             |
| Bordô como texto sobre branco / bege claro                | 11,1:1 / 9,1:1 | Sim                                                             |
| Tinta sobre Rosa Antigo                                   | 5,2:1          | Sim (é o par obrigatório do rosa)                               |
| Branco sobre Rosa Antigo                                  | 3,2:1          | **Não**: abaixo de 4,5:1                                        |
| Marrom (`brown-espresso`) sobre Rosa fosco (`rose-dusty`) | 4,6:1          | Sim, qualquer tamanho (usado nos botões `secondary` e `danger`) |
| Rosa Antigo como texto (sobre branco / bege claro)        | 3,2:1 / 2,6:1  | **Não**                                                         |
| Cinza (`gray-dim`) sobre branco / bege claro              | 6,5:1 / 5,3:1  | Sim                                                             |
| Cinza (`gray-dim`) sobre bege (`beige-sand`)              | 4,1:1          | **Não** para texto pequeno: use `gray-ink`                      |

## Typography

Três famílias, todas com acentos completos do português, **hospedadas no próprio projeto** (pacotes `@fontsource`, sem depender do Google Fonts em tempo de execução):

- **DM Serif Display** (só o título do hero, 400 normal e itálico): serifa de alto contraste, a sensação editorial. Primeira linha em Bordô, segunda linha em **itálico** Rubi (`hero-title-accent`). Nunca use em textos menores que 40 px nem fora do hero.
- **Plus Jakarta Sans** (títulos, 700–800): geométrica e amigável, com cantos suaves que combinam com os raios arredondados.
- **Inter** (texto, rótulos e números, 400–600): muito legível em tamanhos pequenos e com algarismos tabulares, que mantêm colunas de valores alinhadas no orçamento e nas despesas.

### Estilos de texto

Cada estilo é um token do Tailwind (`text-<nome>`), que já define tamanho, altura de linha, peso e espaçamento entre letras. A família entra por uma classe separada.

| Classe                     | Família        | Tamanho | Peso | Uso                                          |
| -------------------------- | -------------- | ------- | ---- | -------------------------------------------- |
| `text-display-hero`        | `font-display` | 64 px   | 400  | Título do hero (desktop)                     |
| `text-display-hero-mobile` | `font-display` | 40 px   | 400  | Título do hero (celular)                     |
| `text-display`             | `font-heading` | 40 px   | 800  | Capa da viagem (`hero-banner`)               |
| `text-headline-lg`         | `font-heading` | 32 px   | 700  | Título de página (desktop)                   |
| `text-headline-md`         | `font-heading` | 24 px   | 700  | Título de página (celular) e de seção grande |
| `text-headline-sm`         | `font-heading` | 20 px   | 700  | Título de card e de seção                    |
| `text-title-md`            | `font-heading` | 16 px   | 700  | Título de item de lista                      |
| `text-body-lg`             | `font-sans`    | 18 px   | 400  | Parágrafo de destaque                        |
| `text-body-md`             | `font-sans`    | 16 px   | 400  | Texto corrido                                |
| `text-body-sm`             | `font-sans`    | 14 px   | 400  | Legendas e textos de ajuda                   |
| `text-label-lg`            | `font-sans`    | 16 px   | 600  | Botões, abas e menu                          |
| `text-label-md`            | `font-sans`    | 14 px   | 600  | Rótulos de campo e botões compactos          |
| `text-label-sm`            | `font-sans`    | 12 px   | 600  | Selos e badges, em caixa alta                |
| `text-label-overline`      | `font-sans`    | 13 px   | 600  | Texto de apoio acima do hero, em caixa alta  |
| `text-numeric-lg`          | `font-sans`    | 28 px   | 700  | Números de destaque (orçamento, saldo)       |
| `text-numeric-md`          | `font-sans`    | 16 px   | 600  | Valores em listas                            |

Os títulos (`h1` a `h6`) já usam `font-heading` por padrão; o corpo usa `font-sans`. Os estilos `numeric` devem vir acompanhados da classe `tabular` (algarismos tabulares).

### Regras

- O hero usa `text-display-hero` no desktop e `text-display-hero-mobile` no celular, em duas linhas curtas (até ~18 caracteres cada).
- Acima do título do hero vai o `hero-overline`: três palavras em caixa alta com pontos ("PLANEJE. DIVIDA. VIAJE."), em Bordô.
- Títulos de página em `headline-lg` no desktop e `headline-md` no celular. `display` só na capa da viagem; no celular ele cai para `headline-lg`.
- Nunca use menos de 14 px para texto e 12 px para rótulos em caixa alta.
- Botões, abas e itens de menu em caixa normal (só a primeira letra maiúscula).
- Todo valor em dinheiro, porcentagem ou contagem usa `numeric-*` + `tabular`, formatado em pt-BR: `R$ 1.250,00`, `23 %`, datas `12 mar. 2027`.
- No máximo três pesos de sans por tela: 400, 600 e 700 (800 só no `display`). A serifa do hero não conta.

## Layout

Web **responsivo, mobile-first**: o CSS base é o do celular, e os breakpoints só acrescentam.

| Faixa   | Largura      | Classe | Grade                                                  | Margens |
| ------- | ------------ | ------ | ------------------------------------------------------ | ------- |
| Celular | até 639 px   | (base) | Coluna única                                           | 16 px   |
| Tablet  | 640–1023 px  | `sm:`  | 8 colunas                                              | 24 px   |
| Desktop | 1024 px ou + | `lg:`  | 12 colunas, container de até 1200 px (`max-w-content`) | 32 px   |

Gutter de 24 px. Toda medida segue a escala de **múltiplos de 4** (a escala padrão do Tailwind: `p-1` = 4 px, `p-6` = 24 px).

- Padding de componentes pequenos (chips, botões compactos): 8 ou 12 px.
- Gap dentro de cards e formulários: 16 ou 24 px. Padding interno do card: 24 px (16 px no `card-compact`).
- Separação entre blocos da página: 32 ou 40 px.
- Alvos de toque com pelo menos 44 × 44 px no celular; botões e campos têm 48 px de altura.
- Nenhuma tela pode ter rolagem horizontal a partir de 360 px de largura.

### Navegação

|                  | Celular                                                                                       | Desktop                                                                                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navegação        | **Barra inferior fixa** (`bottom-nav`) com até 4 destinos: Viagens, Descobrir, Avisos, Perfil | **Barra superior** (`app-bar`, 72 px, branca e sem sombra) com marca e slogan à esquerda, navegação no centro (Minhas viagens, Descobrir, Avaliações) e notificações e avatar à direita |
| Item ativo       | Ícone e rótulo em Bordô                                                                       | Texto em Bordô com um ponto Rubi embaixo (`nav-indicator`)                                                                                                                              |
| Dentro da viagem | Abas com rolagem horizontal (Roteiro, Orçamento, Despesas, Membros)                           | As mesmas abas, todas visíveis                                                                                                                                                          |

### Composição das telas de descoberta

- **Hero (home):** `hero-overline`, `hero-title` + `hero-title-accent` (ex.: "Sua viagem / _começa aqui._"), um parágrafo `body-lg` e os botões `solid` e `outline`, sobre a foto em largura total com um véu claro à esquerda (no celular, a foto vem primeiro).
- **Busca em pílula:** no desktop, sobrepõe a base da foto em 40 px, centralizada, com 4 campos lado a lado. No celular vira um card de raio 24 px com os campos empilhados e o botão de largura total.
- **Faixas de conteúdo:** no desktop, blocos alternados entre um card de destaque (4 colunas) e um carrossel de cards de foto (8 colunas); no celular, uma coluna só.
- **Carrosséis:** rolam na horizontal com `scroll-snap` e mostram parte do próximo card como dica. As setas circulares só aparecem no desktop; no celular, só o gesto.

## Elevation & Depth

A profundidade vem primeiro de **camadas de tom** (cards brancos sobre o fundo bege claro) e só depois de sombras. As sombras são discretas, sempre pretas com pouca opacidade, e crescem com a importância do elemento:

| Classe      | Valor                          | Uso                                                   |
| ----------- | ------------------------------ | ----------------------------------------------------- |
| `shadow-sm` | `0 2px 4px rgba(0,0,0,0.08)`   | Cards em repouso, chips flutuantes                    |
| `shadow-md` | `0 4px 8px rgba(0,0,0,0.10)`   | Card em hover, barra inferior do celular              |
| `shadow-lg` | `0 8px 16px rgba(0,0,0,0.12)`  | Menus suspensos, popovers, botões circulares          |
| `shadow-xl` | `0 12px 24px rgba(0,0,0,0.14)` | Modais, busca em pílula e cards flutuantes sobre foto |

Modais têm um véu `gray-ink` a 40% atrás. Sobre fotos, a legenda fica sobre o véu `scrim-burgundy`, aplicado como gradiente de baixo para cima (de Bordô 78% para transparente, cobrindo o terço de baixo da foto) e é o **único gradiente permitido**. Bordas de 1 px em `beige-sand` separam itens de lista e campos; não use sombra e borda forte no mesmo elemento.

## Shapes

Formas **suaves e acolhedoras**, todas na escala de 4 px:

| Classe            | Raio    | Uso                                                                                                                                          |
| ----------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `rounded-xs`      | 4 px    | Chips, badges, selos, **campos, lista suspensa, caixa de filtros** e o estilo editorial (botões retangulares, cards da home, barra de busca) |
| `rounded-sm`      | 8 px    | Botões compactos, cards compactos, itens do menu                                                                                             |
| `rounded-md`      | 12 px   | Alertas                                                                                                                                      |
| `rounded-lg`      | 16 px   | Cards principais, painéis, modais, cards de foto                                                                                             |
| `rounded-xl`      | 24 px   | Banners e cards grandes de destaque (capa da viagem)                                                                                         |
| `rounded-organic` | 96 px   | Só a foto do hero, com cantos grandes e assimétricos (`rounded-tl-organic rounded-br-organic`)                                               |
| `rounded-full`    | círculo | Pílulas (botão do hero, busca, selos), círculos de ícone, botões circulares, avatares, barras de progresso                                   |

Fotos seguem o raio do card que as contém. A foto do hero é a exceção: usa um **recorte orgânico** (`clip-path` com curvas suaves), sem cantos retos à vista.

## Components

Os tokens do cabeçalho são a referência normativa; abaixo, o comportamento de cada grupo.

- **Botões:** sempre pelos componentes `Button`, `ButtonLink`, `IconButton` e `IconButtonLink`, nunca um `<button>` solto. Todos têm cantos retos (`rounded-xs`); só o botão de notificações é redondo (`shape="round"`), do tamanho do avatar. `button-primary` (Rubi, texto branco; hover Bordô) para **uma** ação principal por tela ou card, como "Nova viagem". `button-secondary` (`rose-dusty`, texto `brown-espresso`; hover `rose-vintage`) para ações alternativas. `button-compact` (`rose-vintage`, texto tinta; hover `rose-dusty`, 36 px) para ações dentro de listas e cards. `button-danger` (`rose-dusty`, texto `brown-espresso`; hover `rose-vintage`, com ícone de lixeira) só para remover ou sair, **sempre com confirmação**: como a marca é vermelha, o perigo não pode depender só da cor. Ícone à esquerda do texto, 20 px, gap de 8 px. Desabilitado: fundo `beige-sand` com texto `gray-ink`, opacidade de 60% e cursor "não permitido" (bem diferente de um botão ativo). Carregando: mantém a cor da variante, com opacidade de 70%.
- **Estilo editorial (home):** `button-solid` (Bordô, texto branco; hover Rubi), `button-outline` (borda Bordô; preenche no hover) e `button-light` (bege, texto Bordô, para fundos Bordô). São retangulares (`rounded-xs`), em `label-sm` maiúsculo. O "Entrar" da barra superior usa o `solid`.
- **Campos (`input`):** rótulo acima, campo branco de 48 px, de cantos retos (`rounded-xs`), com borda de 1 px em `beige-sand`; a lista suspensa e a caixa de filtros (`FilterPanel`) seguem os mesmos cantos, texto de ajuda abaixo. No foco, borda de 2 px em `red-ruby` mais anel de 3 px em `red-ruby` a 35%. No erro, borda em `red-burgundy`, ícone de alerta e uma mensagem que diga como corrigir.
- **Cards:** `card` para conteúdo principal (viagem, resumo do orçamento) e `card-compact` para itens repetidos (atividade, despesa). Card clicável inteiro ganha `shadow-md` no hover e foco visível.
- **Chips:** filtros e categorias de atividade (Passeio, Comida, Hospedagem, Transporte, Outros). `chip-selected` em Rosa Antigo com ícone de check e texto `gray-ink`.
- **Badges de status:** `badge-planning`, `badge-confirmed` e `badge-completed`, em `label-sm` caixa alta, sempre com texto ("PLANEJANDO").
- **Alertas:** `alert-success`, `alert-warning`, `alert-error` e `alert-info`, com ícone à esquerda e texto em `body-sm`.
- **Abas:** navegação dentro da viagem (Roteiro, Orçamento, Despesas, Membros). A aba ativa tem texto Bordô e sublinhado de 3 px em `red-ruby`.
- **Barra de progresso:** trilha `beige-sand` e preenchimento `red-ruby`. Acima de 100% do orçamento, o preenchimento fica cheio e um `alert-warning` explica quanto passou.
- **Avatares:** iniciais em Rosa Antigo, 40 px (32 px em listas densas), empilhados com sobreposição de 4 px e borda de 2 px na cor do fundo.
- **Hero (home):** `hero-overline`, `hero-title` + `hero-title-accent` (ex.: "Sua viagem / _começa aqui._"), um parágrafo `body-lg` e os botões `solid` e `outline`, sobre a foto em largura total com um véu claro à esquerda (no celular, a foto vem primeiro).
- **Busca em pílula (`search-bar`):** 4 campos separados por divisórias verticais de 1 px `beige-sand`; cada campo tem um `search-field-icon` (círculo bege com ícone Rubi), um rótulo em `label-md` e o placeholder em `body-sm` cinza, e o `search-button` redondo com lupa no fim.
- **Cards de foto (`photo-card`):** foto cobrindo o card (proporção 4:5 no desktop), legenda embaixo sobre o véu com o nome em `title-md` branco, `rating-pill` branco com estrela Rubi no canto de baixo à direita e o botão de favorito (coração) no canto de cima à direita. Em viagens do usuário, o selo de status fica no canto de cima à esquerda e o lugar da nota é ocupado pelo número de viajantes.
- **Banner de destaque (`promo-banner`):** foto com véu Bordô da esquerda para a direita, selo em pílula no topo, título `headline-md` com a palavra-chave em `yellow-wheat` (ex.: "faltam 87 dias") e um botão branco em pílula.
- **Faixa de números (`stats-strip`):** card branco em pílula larga com 3 números lado a lado, cada um com um `stat-icon` (círculos em `beige-sand`, `yellow-wheat` e `blue-mist`), valor em `title-md` e legenda em `body-sm`. No celular, vira uma coluna ou rolagem horizontal.
- **Valores:** `stat-value` para destaques (orçamento total, saldo) e `money` para valores em listas, alinhados à direita, sempre com `tabular`.
- **Ícones:** biblioteca **Lucide** (`lucide-react`). Tamanhos: 20 px em botões e 24 px soltos, sempre herdando a cor do texto (`currentColor`). Exemplos: `Plane` (viagem), `MapPin` (destino), `CalendarDays` (datas), `Wallet` (orçamento), `Receipt` (despesa), `Users` (membros), `Bell` (notificações), `Star` (avaliação), `Heart` (favorito). Estado ativo: cor `red-ruby` e traço um pouco mais grosso (`strokeWidth` 2,25). Estrela e coração preenchidos usam `fill="currentColor"`. Não misture outra biblioteca de ícones.

## Como usar os tokens

- Use **somente** as classes geradas pelos tokens: `bg-red-ruby`, `text-red-burgundy`, `bg-white`, `text-gray-dim`, `rounded-md`, `shadow-lg`, `text-headline-lg`, `font-heading`...
- A paleta padrão do Tailwind e as escalas de texto, raio e sombra padrão **estão desativadas**: `bg-red-500`, `text-lg` e `rounded-2xl` não existem.
- Faltou um valor? Crie o token em `src/styles/tokens.css` (e documente aqui), nunca um valor solto. O ESLint barra valores arbitrários (`w-[137px]`) e cores hexadecimais no código.
- Mobile-first: escreva o estilo do celular sem prefixo e acrescente `sm:` (tablet) e `lg:` (desktop).

## Do's and Don'ts

- Faça uma única ação principal (`button-primary`) por tela ou por card.
- Faça todo texto pequeno sobre fundo de marca em branco, sobre Rubi ou Bordô; sobre Rosa Antigo, sempre tinta.
- Faça todos os valores em dinheiro com algarismos tabulares e formato pt-BR (`R$ 1.250,00`).
- Faça os estados (sucesso, aviso, erro, status da viagem, perigo) com ícone e texto além da cor.
- Faça o layout funcionar de 360 px de largura até o desktop, sem rolagem horizontal.
- Faça estados vazios úteis: ícone, uma frase do que fazer e o botão da ação ("Você ainda não tem viagens. Crie a primeira!").
- Mostre ações de edição apenas para quem pode editar (OWNER e EDITOR); para VIEWER, a mesma tela em modo leitura.
- Use fotos reais dos destinos (`photoUrl` da API) sempre que existirem; sem foto, use o bege `beige-sand` com o ícone do destino, nunca uma imagem genérica de banco de imagens.
- Não use cores fora da paleta, gradientes chamativos ou sombras coloridas. O único gradiente permitido é o véu `scrim-burgundy`.
- Não use Rosa Antigo como cor de texto, nem texto branco sobre ele. Nos botões `secondary` e `danger` o fundo é `rose-dusty` com texto `brown-espresso`.
- Não use o cinza (`gray-dim`) sobre o bege `beige-sand`.
- Use a serifa (`font-display`) só no título do hero e nos títulos das faixas editoriais da home e do rodapé; nas telas de trabalho, os títulos são em `font-heading`. Não crie mais de um hero por tela.
- Não misture raios fora da escala (como 6 px ou 10 px) nem cantos retos em componentes interativos.
- Não use emojis no lugar de ícones.
- Não escreva textos de interface em inglês: rótulos, mensagens e datas são em português do Brasil.
