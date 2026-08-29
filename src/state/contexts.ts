// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import { createContext, type Dispatch } from "react";
import type { DocumentDispatchAction, DocumentState, ViewAction, ViewState } from "../model/types";

export const DocumentStateContext = createContext<DocumentState | null>(null);
export const DocumentDispatchContext = createContext<Dispatch<DocumentDispatchAction> | null>(null);
export const DocumentHistoryContext = createContext<{ canUndo: boolean; canRedo: boolean } | null>(null);
export const ViewStateContext = createContext<ViewState | null>(null);
export const ViewDispatchContext = createContext<Dispatch<ViewAction> | null>(null);
