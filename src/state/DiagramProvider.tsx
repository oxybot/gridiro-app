// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import { useEffect, useReducer, type ReactNode } from "react";
import { loadDocument, saveDocument } from "./documentReducer";
import { createInitialViewState, viewReducer } from "./viewReducer";
import { createDocumentHistory, historyReducer } from "./historyReducer";
import { DocumentStateContext, DocumentDispatchContext, DocumentHistoryContext, ViewStateContext, ViewDispatchContext } from "./contexts";

export function DiagramProvider({ children }: { children: ReactNode }) {
  const [documentHistory, dispatchDocument] = useReducer(historyReducer, undefined, () => createDocumentHistory(loadDocument()));
  const [viewState, dispatchView] = useReducer(viewReducer, undefined, createInitialViewState);

  useEffect(() => {
    saveDocument(documentHistory.present);
  }, [documentHistory.present]);

  return (
    <DocumentStateContext.Provider value={documentHistory.present}>
      <DocumentDispatchContext.Provider value={dispatchDocument}>
        <DocumentHistoryContext.Provider value={{ canUndo: documentHistory.past.length > 0, canRedo: documentHistory.future.length > 0 }}>
          <ViewStateContext.Provider value={viewState}>
            <ViewDispatchContext.Provider value={dispatchView}>
              {children}
            </ViewDispatchContext.Provider>
          </ViewStateContext.Provider>
        </DocumentHistoryContext.Provider>
      </DocumentDispatchContext.Provider>
    </DocumentStateContext.Provider>
  );
}
