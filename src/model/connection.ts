import type { Connection } from "./types";

export const createConnection = (sourceId: string, targetId: string): Connection => ({
  id: crypto.randomUUID(),
  sourceId,
  targetId,
  color: "blue",
  style: "solid",
  label: "",
});
