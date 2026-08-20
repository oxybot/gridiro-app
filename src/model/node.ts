import { isoflowIcons } from "../assets/isoflowIcons";
import { midWidth, midHeight } from "./geometry";
import type { Node } from "./types";

export const createNode = (x: number, y: number): Node => ({
  id: crypto.randomUUID(),
  x,
  y,
  label: "",
  icon: isoflowIcons.icons[0],
});

export const getNodeBounds = (node: Node) => {
  return {
    minX: node.x - midWidth,
    minY: node.y - midHeight,
    maxX: node.x + midWidth,
    maxY: node.y + midHeight
  };
};
