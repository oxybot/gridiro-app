import type { Surface } from "./types";
import { grid, midHeight } from "./geometry";

export const createSurface = (cellX: number, cellY: number): Surface => {
  return {
    id: crypto.randomUUID(),
    x1: cellX - grid.width,
    y1: cellY,
    x2: cellX + grid.width,
    y2: cellY,
    squared: false,
    backgroundColor: "gray",
    label: "",
  };
};

export const getSurfaceBounds = (surface: Surface) => {
  const deltaX = surface.x2 - surface.x1;
  const deltaY = surface.y2 - surface.y1;
  const a = deltaX / grid.width - deltaY / grid.height;
  return {
    minX: surface.x1,
    maxX: surface.x2,
    minY: surface.y1 - a * midHeight,
    maxY: surface.y2 + a * midHeight
  };
}
