# Nook

A cozy home inventory app. Find anything you own, anywhere in your house, even when you've forgotten what you called it.

> _Every thing in its place. Every place in your home._

A cozy home inventory app — find anything you own, anywhere in your house, even when you've forgotten what you called it.

Built as an NX monorepo with a Next.js web app and React Native mobile app sharing core business logic.

---

## What it does

- **Fuzzy search** — finds items even with typos or alternate names
- **"Did you mean...?"** — suggests matches when nothing is found
- **Exact location** — _Kitchen › Left drawer under the sink_
- **Tag synonyms** — saved as "destornillador", searched as "screwdriver"? Still finds it
- **Simple storage** — localStorage for now, ready to grow

---

## Monorepo structure

```
hearth/
├── apps/
│   ├── web/               # Next.js 14 — deploys to Vercel
│   └── mobile/            # Expo (React Native) — iOS & Android
├── packages/
│   ├── core/              # Shared business logic (search, types, utils)
│   ├── ui-tokens/         # Shared design tokens (colors, typography)
│   └── storage/           # Storage abstractions
├── nx.json
└── tsconfig.base.json
```

---

## Tech stack

| Layer      | Web                     | Mobile              |
| ---------- | ----------------------- | ------------------- |
| Framework  | Next.js 14 (App Router) | Expo (React Native) |
| Language   | TypeScript (strict)     | TypeScript (strict) |
| Styling    | Tailwind CSS            | NativeWind          |
| Search     | Fuse.js                 | Fuse.js (shared)    |
| Animation  | Framer Motion           | Reanimated          |
| Components | Storybook               | Storybook           |
| Icons      | Lucide React            | Lucide React Native |

---

## Color palette

```css
--parchment: #f5f0e8 /* background */ --cream: #d9cdbf --taupe: #a6998a
  --olive: #4c591b --bark: #59422e --clay: #734432 --terracotta: #d95043
  --salmon: #d96b62 --sand: #bf926b --mauve: #8c6865;
```

---

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
git clone https://github.com/tu-usuario/hearth.git
cd hearth
npm install
```

### Run the web app

```bash
nx serve web
```

### Run the mobile app

```bash
nx serve mobile
```

### Open Storybook

```bash
nx storybook web      # Component library for web
nx storybook mobile   # Component library for mobile
```

---

## Deploy

The web app deploys automatically to **Vercel** on every push to `main`.

```bash
# Manual deploy
vercel --prod
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## NX useful commands

```bash
nx graph                    # Visualize project dependencies
nx affected:test            # Run tests only for changed code
nx affected:build           # Build only what changed
nx g @nx/react:component    # Generate a new component
```

---

## Roadmap

- [x] Web app (Next.js)
- [x] Typescript
- [x] Fuzzy search with suggestions
- [x] Location picker
- [x] Storybook
- [x] Zustad
- [x] Tanstak
- [ ] React Native app
- [ ] Cloud sync
- [ ] Image upload per item
- [ ] QR code labels for physical boxes

---
