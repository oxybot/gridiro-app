import { createContext, useContext, useEffect, useReducer, type Context, type Dispatch, type ReactNode } from "react";
import type { DocumentDispatchAction, DocumentState, ViewAction, ViewState } from "../model/types";
import { loadDocument, saveDocument } from "./documentReducer";
import { createInitialViewState, viewReducer } from "./viewReducer";
import { createDocumentHistory, historyReducer } from "./historyReducer";

const DocumentStateContext = createContext<DocumentState | null>(null);
const DocumentDispatchContext = createContext<Dispatch<DocumentDispatchAction> | null>(null);
const DocumentHistoryContext = createContext<{ canUndo: boolean; canRedo: boolean } | null>(null);
const ViewStateContext = createContext<ViewState | null>(null);
const ViewDispatchContext = createContext<Dispatch<ViewAction> | null>(null);

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

const useRequiredContext = <T,>(context: Context<T | null>, name: string): T => {
  const value = useContext(context);
  if (value === null) {
    throw new Error(`${name} must be used within a DiagramProvider`);
  }
  return value;
};

export const useDocumentState = () => useRequiredContext(DocumentStateContext, "useDocumentState");
export const useDocumentDispatch = () => useRequiredContext(DocumentDispatchContext, "useDocumentDispatch");
export const useDocumentHistory = () => useRequiredContext(DocumentHistoryContext, "useDocumentHistory");
export const useViewState = () => useRequiredContext(ViewStateContext, "useViewState");
export const useViewDispatch = () => useRequiredContext(ViewDispatchContext, "useViewDispatch");
