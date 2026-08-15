import type { IsoflowIcon } from "./assets/isoflowIcons";

export type Node = {
  id: string;
  x: number;
  y: number;
  label: string;
  icon: IsoflowIcon;
};

export type TextOrientation = "horizontal" | "vertical";
export type TextSize = "small" | "medium" | "large";

export type TextElement = {
  id: string;
  x: number;
  y: number;
  content: string;
  orientation: TextOrientation;
  size: TextSize;
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
  kind: "empty" | "node" | "text";
  node?: Node;
  text?: TextElement;
};

// A dragged element is looked up by id from the nodes/texts arrays, so only its kind, id and pointer offset need tracking.
export type DraggingElement = {
  kind: "node" | "text";
  id: string;
  pointerOffset: Point;
};

export type PanState = {
  pointerPosition: Point;
  startPosition: Point;
};

export type EditingElement =
  | { kind: "node"; node: Node }
  | { kind: "text"; text: TextElement };

export type AppState = {
  nodes: Node[];
  connections: Connection[];
  texts: TextElement[];
  hoverPos: Point;
  isHovering: boolean;
  dragging: DraggingElement | null;
  pan: Point;
  panning: PanState | null;
  connectionDraft: ConnectionDraft | null;
  menu: MenuState;
  editing: EditingElement | null;
};

export type AppAction =
  | { type: "addNode"; node: Node }
  | { type: "moveNode"; nodeId: string; position: Point }
  | { type: "updateNode"; nodeId: string; changes: Partial<Node> }
  | { type: "removeNode"; nodeId: string }
  | { type: "addText"; text: TextElement }
  | { type: "moveText"; textId: string; position: Point }
  | { type: "updateText"; textId: string; changes: Partial<TextElement> }
  | { type: "removeText"; textId: string }
  | { type: "addConnection"; connection: Connection }
  | { type: "setHoverPos"; position: Point }
  | { type: "setHovering"; isHovering: boolean }
  | { type: "setDragging"; dragging: DraggingElement | null }
  | { type: "setPan"; pan: Point }
  | { type: "setPanning"; panning: PanState | null }
  | { type: "setConnectionDraft"; connectionDraft: ConnectionDraft | null }
  | { type: "setMenu"; menu: MenuState }
  | { type: "closeMenu" }
  | { type: "setEditing"; editing: EditingElement | null };

