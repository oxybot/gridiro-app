import { useEffect, useReducer } from "react";
import { DiagramCanvas } from "./components/DiagramCanvas";
import { DiagramOverlays } from "./components/DiagramOverlays";
import type { AppAction, AppState } from "./diagramTypes";

const diagramStorageKey = "gridiro-diagram";

type StoredDiagram = Pick<AppState, "nodes" | "connections">;

const loadDiagram = (): StoredDiagram => {
  try {
    const storedDiagram = localStorage.getItem(diagramStorageKey);
    if (!storedDiagram) {
      return { nodes: [], connections: [] };
    }

    const diagram = JSON.parse(storedDiagram) as StoredDiagram;
    if (!Array.isArray(diagram.nodes) || !Array.isArray(diagram.connections)) {
      return { nodes: [], connections: [] };
    }

    return diagram;
  } catch {
    return { nodes: [], connections: [] };
  }
};

const createInitialState = (): AppState => ({
  ...loadDiagram(),
  hoverPos: { x: 0, y: 0 },
  isHovering: false,
  draggingNode: null,
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
      return { ...state, nodes: state.nodes.map((node) => node.id === action.node.id ? action.node : node) };
    case "removeNode":
      return {
        ...state,
        nodes: state.nodes.filter((node) => node.id !== action.nodeId),
        connections: state.connections.filter((connection) => connection.sourceId !== action.nodeId && connection.targetId !== action.nodeId),
      };
    case "addConnection":
      return { ...state, connections: [...state.connections, action.connection] };
    case "setHoverPos":
      return { ...state, hoverPos: action.position };
    case "setHovering":
      return { ...state, isHovering: action.isHovering };
    case "setDraggingNode":
      return { ...state, draggingNode: action.draggingNode };
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
  }
};

export default function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState);
  const { nodes, connections } = state;

  useEffect(() => {
    localStorage.setItem(diagramStorageKey, JSON.stringify({ nodes, connections }));
  }, [nodes, connections]);

  return (
    <>
      <section>
        <h1>Gridiro Hackathon App</h1>
      </section>
      <section className="diagram" onClick={() => dispatch({ type: "closeMenu" })}>
        <DiagramCanvas
          nodes={state.nodes}
          connections={state.connections}
          hoverPos={state.hoverPos}
          isHovering={state.isHovering}
          pan={state.pan}
          panning={state.panning}
          draggingNode={state.draggingNode}
          connectionDraft={state.connectionDraft}
          menu={state.menu}
          dispatch={dispatch}
        />
        <DiagramOverlays
          menu={state.menu}
          pan={state.pan}
          editingNode={state.editingNode}
          dispatch={dispatch}
        />
      </section>
    </>
  );
}
