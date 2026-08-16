import { isoflowIcons } from "../assets/isoflowIcons";
import type { Node } from "./types";

export const createNode = (x: number, y: number): Node => ({
  id: crypto.randomUUID(),
  x,
  y,
  label: "",
  icon: isoflowIcons.icons[0],
});
