import type { IsoflowIcon } from "./assets/isoflowIcons";

export type Node = {
  id: string;
  x: number;
  y: number;
  label: string;
  icon: IsoflowIcon;
};

export type Connection = {
  sourceId: string;
  targetId: string;
};

export type ConnectionDraft = {
  sourceId: string;
  pointerPosition: { x: number; y: number };
};

export type MenuState = {
  isOpen: boolean;
  x: number;
  y: number;
  side: "left" | "right";
  kind: "empty" | "node";
  node?: Node;
};
