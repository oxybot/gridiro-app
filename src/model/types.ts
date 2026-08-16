import type { IsoflowIcon } from "../assets/isoflowIcons";

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
  id: string;
  sourceId: string;
  targetId: string;
  color: ElementColor;
  style: ConnectionStyle;
  label: string;
};

export type ConnectionStyle = "solid" | "dashed";

export type Surface = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  squared: boolean;
  backgroundColor: ElementColor;
  label: string;
};

export type ElementColor = "gray" | "blue" | "green" | "yellow" | "red";

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
  kind: "empty" | "node" | "text" | "surface" | "connection";
  node?: Node;
  text?: TextElement;
  surface?: Surface;
  connection?: Connection;
};

// A dragged element is looked up by id from the nodes/texts/surfaces arrays, so only its kind, id and pointer offset need tracking.
export type DraggingElement = {
  kind: "node" | "text" | "surface";
  id: string;
  pointerOffset: Point;
};

export type SurfaceCorner = "top" | "left" | "right" | "bottom";

export type ResizingSurface = {
  surfaceId: string;
  corner: SurfaceCorner;
};

export type PanState = {
  pointerPosition: Point;
  startPosition: Point;
};

export type EditingElement =
  | { kind: "node"; node: Node }
  | { kind: "text"; text: TextElement }
  | { kind: "surface"; surface: Surface }
  | { kind: "connection"; connection: Connection };

export type DocumentState = {
  nodes: Node[];
  connections: Connection[];
  texts: TextElement[];
  surfaces: Surface[];
};

export type ViewState = {
  hoverPos: Point;
  isHovering: boolean;
  dragging: DraggingElement | null;
  resizingSurface: ResizingSurface | null;
  selectedSurfaceId: string | null;
  pan: Point;
  panning: PanState | null;
  zoomIndex: number;
  connectionDraft: ConnectionDraft | null;
  menu: MenuState;
  editing: EditingElement | null;
};

export type DocumentAction =
  | { type: "addNode"; node: Node }
  | { type: "moveNode"; nodeId: string; position: Point }
  | { type: "updateNode"; nodeId: string; changes: Partial<Node> }
  | { type: "removeNode"; nodeId: string }
  | { type: "addText"; text: TextElement }
  | { type: "moveText"; textId: string; position: Point }
  | { type: "updateText"; textId: string; changes: Partial<TextElement> }
  | { type: "removeText"; textId: string }
  | { type: "addSurface"; surface: Surface }
  | { type: "updateSurface"; surfaceId: string; changes: Partial<Surface> }
  | { type: "moveSurface"; surfaceId: string; position: Point }
  | { type: "resizeSurface"; surfaceId: string; size: { width: number; height: number } }
  | { type: "removeSurface"; surfaceId: string }
  | { type: "addConnection"; connection: Connection }
  | { type: "updateConnection"; connectionId: string; changes: Partial<Connection> }
  | { type: "removeConnection"; connectionId: string };

export type HistoryAction =
  | { type: "undo" }
  | { type: "redo" }
  | { type: "startMove" }
  | { type: "previewMoveNode"; nodeId: string; position: Point }
  | { type: "previewMoveText"; textId: string; position: Point }
  | { type: "previewMoveSurface"; surfaceId: string; position: Point }
  | { type: "finishMove" }
  | { type: "startEdit" }
  | { type: "previewUpdateNode"; nodeId: string; changes: Partial<Node> }
  | { type: "previewUpdateText"; textId: string; changes: Partial<TextElement> }
  | { type: "previewUpdateSurface"; surfaceId: string; changes: Partial<Surface> }
  | { type: "previewUpdateConnection"; connectionId: string; changes: Partial<Connection> }
  | { type: "finishEdit" };

export type DocumentDispatchAction = DocumentAction | HistoryAction;

export type ViewAction =
  | { type: "setSelectedSurface"; surfaceId: string | null }
  | { type: "setResizingSurface"; resizingSurface: ResizingSurface | null }
  | { type: "setHoverPos"; position: Point }
  | { type: "setHovering"; isHovering: boolean }
  | { type: "setDragging"; dragging: DraggingElement | null }
  | { type: "setPan"; pan: Point }
  | { type: "setPanning"; panning: PanState | null }
  | { type: "zoomIn"; center: Point }
  | { type: "zoomOut"; center: Point }
  | { type: "setView"; pan: Point; zoomIndex: number }
  | { type: "setConnectionDraft"; connectionDraft: ConnectionDraft | null }
  | { type: "setMenu"; menu: MenuState }
  | { type: "closeMenu" }
  | { type: "setEditing"; editing: EditingElement | null };

