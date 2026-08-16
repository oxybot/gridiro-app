import type { DocumentAction, DocumentDispatchAction, DocumentState, HistoryAction } from "../model/types";
import { documentReducer } from "./documentReducer";

export const maxHistoryLength = 50;

export type DocumentHistory = {
  past: DocumentState[];
  present: DocumentState;
  future: DocumentState[];
};

export const createDocumentHistory = (document: DocumentState): DocumentHistory => ({
  past: [],
  present: document,
  future: [],
});

const isHistoryAction = (action: DocumentDispatchAction): action is HistoryAction =>
  action.type === "undo" || action.type === "redo";

export const historyReducer = (state: DocumentHistory, action: DocumentDispatchAction): DocumentHistory => {
  if (action.type === "undo") {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    return {
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future],
    };
  }

  if (action.type === "redo") {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    return {
      past: [...state.past, state.present].slice(-maxHistoryLength),
      present: next,
      future: state.future.slice(1),
    };
  }

  if (isHistoryAction(action)) return state;
  const present = documentReducer(state.present, action as DocumentAction);
  if (present === state.present) return state;

  return {
    past: [...state.past, state.present].slice(-maxHistoryLength),
    present,
    future: [],
  };
};
