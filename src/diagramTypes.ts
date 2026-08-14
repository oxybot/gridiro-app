import { isoflowIcons, type IsoflowIcon } from "./assets/isoflowIcons";

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

export type DragState = {
  node: Node;
  pointerOffset: { x: number; y: number };
};

export type PanState = {
  pointerPosition: { x: number; y: number };
  startPosition: { x: number; y: number };
};

export type AppState = {
  nodes: Node[];
  connections: Connection[];
  hoverPos: { x: number; y: number };
  isHovering: boolean;
  draggingNode: DragState | null;
  pan: { x: number; y: number };
  panning: PanState | null;
  connectionDraft: ConnectionDraft | null;
  menu: MenuState;
  editingNode: Node | null;
};

export type AppAction =
  | { type: "addNode"; node: Node }
  | { type: "moveNode"; node: Node }
  | { type: "updateNode"; node: Node }
  | { type: "removeNode"; nodeId: string }
  | { type: "addConnection"; connection: Connection }
  | { type: "setHoverPos"; position: { x: number; y: number } }
  | { type: "setHovering"; isHovering: boolean }
  | { type: "setDraggingNode"; draggingNode: DragState | null }
  | { type: "setPan"; pan: { x: number; y: number } }
  | { type: "setPanning"; panning: PanState | null }
  | { type: "setConnectionDraft"; connectionDraft: ConnectionDraft | null }
  | { type: "setMenu"; menu: MenuState }
  | { type: "closeMenu" }
  | { type: "setEditingNode"; editingNode: Node | null };

export const createNode = (x: number, y: number): Node => ({
  id: crypto.randomUUID(),
  x,
  y,
  label: "New node",
  icon: isoflowIcons.icons[0],
});
