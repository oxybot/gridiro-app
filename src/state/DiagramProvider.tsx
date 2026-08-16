import { createContext, useContext, useEffect, useReducer, type Context, type Dispatch, type ReactNode } from "react";
import type { DocumentAction, DocumentState, ViewAction, ViewState } from "../model/types";
import { documentReducer, loadDocument, saveDocument } from "./documentReducer";
import { createInitialViewState, viewReducer } from "./viewReducer";

const DocumentStateContext = createContext<DocumentState | null>(null);
const DocumentDispatchContext = createContext<Dispatch<DocumentAction> | null>(null);
const ViewStateContext = createContext<ViewState | null>(null);
const ViewDispatchContext = createContext<Dispatch<ViewAction> | null>(null);

export function DiagramProvider({ children }: { children: ReactNode }) {
  const [documentState, dispatchDocument] = useReducer(documentReducer, undefined, loadDocument);
  const [viewState, dispatchView] = useReducer(viewReducer, undefined, createInitialViewState);

  useEffect(() => {
    saveDocument(documentState);
  }, [documentState]);

  return (
    <DocumentStateContext.Provider value={documentState}>
      <DocumentDispatchContext.Provider value={dispatchDocument}>
        <ViewStateContext.Provider value={viewState}>
          <ViewDispatchContext.Provider value={dispatchView}>
            {children}
          </ViewDispatchContext.Provider>
        </ViewStateContext.Provider>
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
export const useViewState = () => useRequiredContext(ViewStateContext, "useViewState");
export const useViewDispatch = () => useRequiredContext(ViewDispatchContext, "useViewDispatch");
