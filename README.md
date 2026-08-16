# Gridiro

Gridiro is a web app for creating good-looking application architecture diagrams on an isometric grid.

> Live: [gridiro.app](https://gridiro.app)
>
> This is an early alpha — expect rough edges and breaking changes.

## Features

- Isometric diagram canvas with pan and grid snapping
- Nodes with selectable icons and labels, connected by lines
- Text labels with configurable orientation and size
- Surfaces (background groups) with editable label, background color, and squared/diamond shape
- Right-click context menus to add, edit, and remove elements

## Getting started

```bash
pnpm install
pnpm dev
```

## Scripts

- `pnpm dev` — start the Vite dev server
- `pnpm build` — type-check and build for production
- `pnpm lint` — run Oxlint
- `pnpm preview` — preview the production build locally

## Project structure

```
src/
  App.tsx           # top-level layout
  appReducer.ts      # diagram state and actions
  model/              # diagram domain types and element factories
  components/          # canvas, overlays, and per-element rendering
  assets/                # icon set
```
