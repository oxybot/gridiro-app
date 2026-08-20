import { grid } from "./geometry";
import type { TextElement } from "./types";

export const createText = (x: number, y: number): TextElement => ({
  id: crypto.randomUUID(),
  x,
  y,
  content: "Text",
  orientation: "horizontal",
  size: "medium",
});

export const getTextBounds = (point: TextElement) => {
  return {
    minX: point.x - grid.width,
    minY: point.y - grid.height,
    maxX: point.x + grid.width,
    maxY: point.y + grid.height
  };
};
