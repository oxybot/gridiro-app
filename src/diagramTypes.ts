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

export type Point = {
  x: number;
  y: number;
};

export type ConnectionDraft = {
  sourceId: string;
  pointerPosition: Point;
};

export type MenuState = {
  isOpen: boolean;
  x: number;
  y: number;
  side: "left" | "right";
  kind: "empty" | "node";
  node?: Node;
};

export type DragState = {
  node: Node;
  pointerOffset: Point;
};

export type PanState = {
  pointerPosition: Point;
  startPosition: Point;
};

export type AppState = {
  nodes: Node[];
  connections: Connection[];
  hoverPos: Point;
  isHovering: boolean;
  draggingNode: DragState | null;
  pan: Point;
  panning: PanState | null;
  connectionDraft: ConnectionDraft | null;
  menu: MenuState;
  editingNode: Node | null;
};

export type AppAction =
  | { type: "addNode"; node: Node }
  | { type: "moveNode"; nodeId: string; position: Point }
  | { type: "updateNode"; node: Node }
  | { type: "removeNode"; nodeId: string }
  | { type: "addConnection"; connection: Connection }
  | { type: "setHoverPos"; position: Point }
  | { type: "setHovering"; isHovering: boolean }
  | { type: "setDraggingNode"; draggingNode: DragState | null }
  | { type: "setPan"; pan: Point }
  | { type: "setPanning"; panning: PanState | null }
  | { type: "setConnectionDraft"; connectionDraft: ConnectionDraft | null }
  | { type: "setMenu"; menu: MenuState }
  | { type: "closeMenu" }
  | { type: "setEditingNode"; editingNode: Node | null };

