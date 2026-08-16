import type { AppState, Point } from "./types";

export const grid = {
  width: 80,
  height: 50,
};

export const midWidth = grid.width / 2;
export const midHeight = grid.height / 2;

// Three zoom levels; index 1 is the default 100% level.
export const zoomLevels = [0.75, 1, 1.5];
export const defaultZoomIndex = 1;

export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

// Approximate bounding box of every element, padded for icons/labels/surface edges, used to fit the view to content.
export const getContentBounds = (state: Pick<AppState, "nodes" | "texts" | "surfaces">): Bounds | null => {
  const xs: number[] = [];
  const ys: number[] = [];

  state.nodes.forEach((node) => {
    xs.push(node.x - grid.width, node.x + grid.width);
    ys.push(node.y - grid.height * 2, node.y + grid.height);
  });
  state.texts.forEach((text) => {
    xs.push(text.x - grid.width, text.x + grid.width);
    ys.push(text.y - grid.height, text.y + grid.height);
  });
  state.surfaces.forEach((surface) => {
    xs.push(surface.x1 - grid.width, surface.x2 + grid.width);
    ys.push(surface.y1 - grid.height, surface.y2 + grid.height);
  });

  if (xs.length === 0) return null;
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
};

export const snapToIsoGrid = (local: Point): Point => {
  const offsetX = local.x - midWidth;
  const offsetY = local.y - midHeight;

  const isoU = (offsetX / midWidth + offsetY / midHeight) / 2;
  const isoV = (offsetX / midWidth - offsetY / midHeight) / 2;

  const snappedU = Math.round(isoU);
  const snappedV = Math.round(isoV);

  return {
    x: (snappedU + snappedV) * midWidth + midWidth,
    y: (snappedU - snappedV) * midHeight + midHeight,
  };
};

// Inverts the bottom corner's formula to recover width/height from a local point.
export const surfaceExtentsFromPoint = (localX: number, localY: number) => ({
  width: (localX / midWidth + localY / midHeight) / 2,
  height: (localX / midWidth - localY / midHeight) / 2,
});
