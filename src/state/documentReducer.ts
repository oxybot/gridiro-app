import type { DocumentAction, DocumentState } from "../model/types";
import { deserializeDocument, emptyDocument, serializeDocument } from "../model/serialization";

const diagramStorageKey = "gridiro-diagram";

export const loadDocument = (): DocumentState => {
  try {
    const storedDocument = localStorage.getItem(diagramStorageKey);
    if (!storedDocument) {
      return emptyDocument;
    }

    return deserializeDocument(storedDocument);
  } catch {
    return emptyDocument;
  }
};

export const saveDocument = (state: DocumentState) => {
  localStorage.setItem(diagramStorageKey, serializeDocument(state));
};

export const documentReducer = (state: DocumentState, action: DocumentAction): DocumentState => {
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
    case "addConnection":
      return { ...state, connections: [...state.connections, action.connection] };
    case "updateConnection":
      return { ...state, connections: state.connections.map((connection) => connection.id === action.connectionId ? { ...connection, ...action.changes } : connection) };
    case "removeConnection":
      return { ...state, connections: state.connections.filter((connection) => connection.id !== action.connectionId) };
    case "replaceDocument":
      return action.document;
  }
};
