import { useEffect, useReducer } from "react";
import { DiagramCanvas } from "./components/DiagramCanvas";
import { DiagramOverlays } from "./components/DiagramOverlays";
import type { AppAction, AppState } from "./diagramTypes";

const diagramStorageKey = "gridiro-diagram";

type StoredDiagram = Pick<AppState, "nodes" | "connections" | "texts">;

const emptyDiagram: StoredDiagram = { nodes: [], connections: [], texts: [] };

const loadDiagram = (): StoredDiagram => {
  try {
    const storedDiagram = localStorage.getItem(diagramStorageKey);
    if (!storedDiagram) {
      return emptyDiagram;
    }

    const diagram = JSON.parse(storedDiagram) as StoredDiagram;
    if (!Array.isArray(diagram.nodes) || !Array.isArray(diagram.connections) || !Array.isArray(diagram.texts)) {
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
  editingNode: null,
  editingText: null,
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
    case "setEditingNode":
      return { ...state, editingNode: action.editingNode };
    case "setEditingText":
      return { ...state, editingText: action.editingText };
  }
};

export default function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState);
  const { nodes, connections, texts } = state;

  useEffect(() => {
    localStorage.setItem(diagramStorageKey, JSON.stringify({ nodes, connections, texts }));
  }, [nodes, connections, texts]);

  return (
    <>
      <section>
        <h1>Gridiro Hackathon App</h1>
      </section>
      <section className="diagram" onClick={() => dispatch({ type: "closeMenu" })}>
        <DiagramCanvas
          nodes={state.nodes}
          connections={state.connections}
          texts={state.texts}
          hoverPos={state.hoverPos}
          isHovering={state.isHovering}
          pan={state.pan}
          panning={state.panning}
          dragging={state.dragging}
          connectionDraft={state.connectionDraft}
          menu={state.menu}
          dispatch={dispatch}
        />
        <DiagramOverlays
          menu={state.menu}
          pan={state.pan}
          editingNode={state.editingNode}
          editingText={state.editingText}
          dispatch={dispatch}
        />
      </section>
    </>
  );
}
