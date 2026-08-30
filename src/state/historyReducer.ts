// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import type { DocumentAction, DocumentDispatchAction, DocumentState } from "../model/types";
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

export const historyReducer = (state: DocumentHistory, action: DocumentDispatchAction): DocumentHistory => {
  switch (action.type) {
    case "startMove":
    case "startEdit":
      return state.moveStart ? state : { ...state, moveStart: state.present };

    case "previewMoveNode":
      return { ...state, present: documentReducer(state.present, { type: "moveNode", nodeId: action.nodeId, position: action.position }) };

    case "previewMoveText":
      return { ...state, present: documentReducer(state.present, { type: "moveText", textId: action.textId, position: action.position }) };

    case "previewMoveSurface":
      return { ...state, present: documentReducer(state.present, { type: "moveSurface", surfaceId: action.surfaceId, position: action.position }) };

    case "previewUpdateNode":
      return { ...state, present: documentReducer(state.present, { type: "updateNode", nodeId: action.nodeId, changes: action.changes }) };

    case "previewUpdateText":
      return { ...state, present: documentReducer(state.present, { type: "updateText", textId: action.textId, changes: action.changes }) };

    case "previewUpdateSurface":
      return { ...state, present: documentReducer(state.present, { type: "updateSurface", surfaceId: action.surfaceId, changes: action.changes }) };

    case "previewUpdateConnection":
      return { ...state, present: documentReducer(state.present, { type: "updateConnection", connectionId: action.connectionId, changes: action.changes }) };

    case "finishMove":
    case "finishEdit":
      if (!state.moveStart || state.moveStart === state.present) {
        return { ...state, moveStart: null };
      }
      return {
        past: [...state.past, state.moveStart].slice(-maxHistoryLength),
        present: state.present,
        future: [],
        moveStart: null,
      };

    case "undo": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
        moveStart: null,
      };
    }

    case "redo": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: [...state.past, state.present].slice(-maxHistoryLength),
        present: next,
        future: state.future.slice(1),
        moveStart: null,
      };
    }

    default: {
      const present = documentReducer(state.present, action as DocumentAction);
      if (present === state.present) return state;

      return {
        past: [...state.past, state.present].slice(-maxHistoryLength),
        present,
        future: [],
        moveStart: null,
      };
    }
  }
};
