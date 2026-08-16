import type { DocumentAction, DocumentDispatchAction, DocumentState, HistoryAction } from "../model/types";
import { documentReducer } from "./documentReducer";

export const maxHistoryLength = 50;

export type DocumentHistory = {
  past: DocumentState[];
  present: DocumentState;
  future: DocumentState[];
  moveStart: DocumentState | null;
};

export const createDocumentHistory = (document: DocumentState): DocumentHistory => ({
  past: [],
  present: document,
  future: [],
  moveStart: null,
});

const isHistoryAction = (action: DocumentDispatchAction): action is HistoryAction =>
  action.type === "undo" || action.type === "redo";

export const historyReducer = (state: DocumentHistory, action: DocumentDispatchAction): DocumentHistory => {
  if (action.type === "startMove") {
    return state.moveStart ? state : { ...state, moveStart: state.present };
  }

  if (action.type === "startEdit") {
    return state.moveStart ? state : { ...state, moveStart: state.present };
  }

  if (action.type === "previewMoveNode" || action.type === "previewMoveText" || action.type === "previewMoveSurface") {
    const documentAction = action.type === "previewMoveNode"
      ? { type: "moveNode" as const, nodeId: action.nodeId, position: action.position }
      : action.type === "previewMoveText"
        ? { type: "moveText" as const, textId: action.textId, position: action.position }
        : { type: "moveSurface" as const, surfaceId: action.surfaceId, position: action.position };
    return { ...state, present: documentReducer(state.present, documentAction) };
  }

  if (action.type === "previewUpdateNode" || action.type === "previewUpdateText" || action.type === "previewUpdateSurface" || action.type === "previewUpdateConnection") {
    const documentAction = action.type === "previewUpdateNode"
      ? { type: "updateNode" as const, nodeId: action.nodeId, changes: action.changes }
      : action.type === "previewUpdateText"
        ? { type: "updateText" as const, textId: action.textId, changes: action.changes }
        : action.type === "previewUpdateSurface"
          ? { type: "updateSurface" as const, surfaceId: action.surfaceId, changes: action.changes }
          : { type: "updateConnection" as const, connectionId: action.connectionId, changes: action.changes };
    return { ...state, present: documentReducer(state.present, documentAction) };
  }

  if (action.type === "finishMove") {
    if (!state.moveStart || state.moveStart === state.present) {
      return { ...state, moveStart: null };
    }
    return {
      past: [...state.past, state.moveStart].slice(-maxHistoryLength),
      present: state.present,
      future: [],
      moveStart: null,
    };
  }

  if (action.type === "finishEdit") {
    if (!state.moveStart || state.moveStart === state.present) {
      return { ...state, moveStart: null };
    }
    return {
      past: [...state.past, state.moveStart].slice(-maxHistoryLength),
      present: state.present,
      future: [],
      moveStart: null,
    };
  }

  if (action.type === "undo") {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    return {
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future],
      moveStart: null,
    };
  }

  if (action.type === "redo") {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    return {
      past: [...state.past, state.present].slice(-maxHistoryLength),
      present: next,
      future: state.future.slice(1),
      moveStart: null,
    };
  }

  if (isHistoryAction(action)) return state;
  const present = documentReducer(state.present, action as DocumentAction);
  if (present === state.present) return state;

  return {
    past: [...state.past, state.present].slice(-maxHistoryLength),
    present,
    future: [],
    moveStart: null,
  };
};
