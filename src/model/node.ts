// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import blockUrl from "../assets/isoflow/block.svg";
import { midWidth, midHeight } from "./geometry";
import type { Node } from "./types";

// Kept in sync with the "block" entry in assets/isoflowIcons.ts, imported directly
// so creating a node doesn't pull in the whole icon set (see NodeEditor's lazy loader).
const defaultIcon = { id: "block", name: "Block", url: blockUrl, width: 551.6, height: 343.8 };

export const createNode = (x: number, y: number): Node => ({
  id: crypto.randomUUID(),
  x,
  y,
  label: "",
  icon: defaultIcon,
});

export const getNodeBounds = (node: Node) => {
  return {
    minX: node.x - midWidth,
    minY: node.y - midHeight,
    maxX: node.x + midWidth,
    maxY: node.y + midHeight
  };
};
