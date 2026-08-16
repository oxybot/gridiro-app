import { useEffect, useReducer, type Dispatch } from "react";
import type { AppAction, AppState } from "./model/types";

const diagramStorageKey = "gridiro-diagram";

export type StoredDiagram = Pick<AppState, "nodes" | "connections" | "texts" | "surfaces">;

const emptyDiagram: StoredDiagram = { nodes: [], connections: [], texts: [], surfaces: [] };

const loadDiagram = (): StoredDiagram => {
  try {
    const storedDiagram = localStorage.getItem(diagramStorageKey);
    if (!storedDiagram) {
      return emptyDiagram;
    }

    const diagram = JSON.parse(storedDiagram) as StoredDiagram;
    if (!Array.isArray(diagram.nodes) || !Array.isArray(diagram.connections) || !Array.isArray(diagram.texts) || !Array.isArray(diagram.surfaces)) {
      return emptyDiagram;
    }

    return diagram;
  } catch {
    return emptyDiagram;
  }
};

const createInitialState = (): AppState => ({
  ...loadDiagram(),
  hoverPos: { x: 0, y: 0 },
  isHovering: false,
  dragging: null,
  resizingSurface: null,
  selectedSurfaceId: null,
  pan: { x: 0, y: 0 },
  panning: null,
  connectionDraft: null,
  menu: {
    isOpen: false,
    x: 0,
    y: 0,
    side: "left",
    kind: "empty",
  },
  editing: null,
});

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "addNode":
      return { ...state, nodes: [...state.nodes, action.node] };
    case "moveNode":
      return {
        ...state,
        nodes: state.nodes.map((node) => node.id === action.nodeId ? { ...node, ...action.position } : node),
      };
    case "updateNode":
      return { ...state, nodes: state.nodes.map((node) => node.id === action.nodeId ? { ...node, ...action.changes } : node) };
    case "removeNode":
      return {
        ...state,
        nodes: state.nodes.filter((node) => node.id !== action.nodeId),
        connections: state.connections.filter((connection) => connection.sourceId !== action.nodeId && connection.targetId !== action.nodeId),
      };
    case "addText":
      return { ...state, texts: [...state.texts, action.text] };
    case "moveText":
      return {
        ...state,
        texts: state.texts.map((text) => text.id === action.textId ? { ...text, ...action.position } : text),
      };
    case "updateText":
      return { ...state, texts: state.texts.map((text) => text.id === action.textId ? { ...text, ...action.changes } : text) };
    case "removeText":
      return { ...state, texts: state.texts.filter((text) => text.id !== action.textId) };
    case "addSurface":
      return { ...state, surfaces: [...state.surfaces, action.surface] };
    case "updateSurface":
      return { ...state, surfaces: state.surfaces.map((surface) => surface.id === action.surfaceId ? { ...surface, ...action.changes } : surface) };
    case "moveSurface":
      return {
        ...state,
        surfaces: state.surfaces.map((surface) => surface.id === action.surfaceId ? { ...surface, ...action.position } : surface),
      };
    case "resizeSurface":
      return {
        ...state,
        surfaces: state.surfaces.map((surface) => surface.id === action.surfaceId ? { ...surface, ...action.size } : surface),
      };
    case "removeSurface":
      return { ...state, surfaces: state.surfaces.filter((surface) => surface.id !== action.surfaceId) };
    case "setSelectedSurface":
      return { ...state, selectedSurfaceId: action.surfaceId };
    case "setResizingSurface":
      return { ...state, resizingSurface: action.resizingSurface };
    case "addConnection":
      return { ...state, connections: [...state.connections, action.connection] };
    case "setHoverPos":
      return { ...state, hoverPos: action.position };
    case "setHovering":
      return { ...state, isHovering: action.isHovering };
    case "setDragging":
      return { ...state, dragging: action.dragging };
    case "setPan":
      return { ...state, pan: action.pan };
    case "setPanning":
      return { ...state, panning: action.panning };
    case "setConnectionDraft":
      return { ...state, connectionDraft: action.connectionDraft };
    case "setMenu":
      return { ...state, menu: action.menu };
    case "closeMenu":
      return { ...state, menu: { ...state.menu, isOpen: false } };
    case "setEditing":
      return { ...state, editing: action.editing };
  }
};

export function useAppReducer(): [AppState, Dispatch<AppAction>] {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState);
  const { nodes, connections, texts, surfaces } = state;

  useEffect(() => {
    localStorage.setItem(diagramStorageKey, JSON.stringify({ nodes, connections, texts, surfaces }));
  }, [nodes, connections, texts, surfaces]);

  return [state, dispatch];
}
