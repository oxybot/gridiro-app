// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import type { Connection } from "./types";

export const createConnection = (sourceId: string, targetId: string): Connection => ({
  id: crypto.randomUUID(),
  sourceId,
  targetId,
  color: "blue",
  style: "solid",
  label: "",
});
