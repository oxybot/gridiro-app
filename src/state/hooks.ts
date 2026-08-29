// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import { useContext, type Context } from "react";
import { DocumentStateContext, DocumentDispatchContext, DocumentHistoryContext, ViewStateContext, ViewDispatchContext } from "./contexts";

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
