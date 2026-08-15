import type { TextElement } from "./diagramTypes";

export const createText = (x: number, y: number): TextElement => ({
  id: crypto.randomUUID(),
  x,
  y,
  content: "Text",
  orientation: "horizontal",
  size: "medium",
});
