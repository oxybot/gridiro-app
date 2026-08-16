import { isoflowIcons } from "../assets/isoflowIcons";
import type { Node } from "./types";

export const createNode = (x: number, y: number): Node => ({
  id: crypto.randomUUID(),
  x,
  y,
  label: "New node",
  icon: isoflowIcons.icons[0],
});
