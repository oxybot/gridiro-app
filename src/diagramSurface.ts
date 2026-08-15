import type { Surface } from "./diagramTypes";
import { grid } from "./diagramGeometry";

export const createSurface = (cellX: number, cellY: number): Surface => {
  return {
    id: crypto.randomUUID(),
    x1: cellX - grid.width,
    y1: cellY,
    x2: cellX + grid.width,
    y2: cellY,
    squared: false,
  };
};
