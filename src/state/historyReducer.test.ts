import { describe, expect, it } from "vitest";
import type { DocumentState, Node } from "../model/types";
import { createDocumentHistory, historyReducer, maxHistoryLength } from "./historyReducer";

const emptyDocument: DocumentState = { nodes: [], connections: [], texts: [], surfaces: [] };

const node = (id: string): Node => ({
  id,
  x: 0,
  y: 0,
  label: id,
  icon: { id: "test", name: "Test", url: "test.svg", width: 1, height: 1 },
});

describe("historyReducer", () => {
  it("undoes and redoes document changes", () => {
    const initial = createDocumentHistory(emptyDocument);
    const added = historyReducer(initial, { type: "addNode", node: node("node-1") });
    const undone = historyReducer(added, { type: "undo" });
    const redone = historyReducer(undone, { type: "redo" });

    expect(added.present.nodes).toHaveLength(1);
    expect(undone.present).toEqual(emptyDocument);
    expect(redone.present).toEqual(added.present);
    expect(undone.past).toEqual([]);
    expect(redone.future).toEqual([]);
  });

  it("clears redo history after a new document change", () => {
    const initial = createDocumentHistory(emptyDocument);
    const added = historyReducer(initial, { type: "addNode", node: node("node-1") });
    const undone = historyReducer(added, { type: "undo" });
    const changed = historyReducer(undone, { type: "addNode", node: node("node-2") });

    expect(changed.present.nodes.map(({ id }) => id)).toEqual(["node-2"]);
    expect(changed.future).toEqual([]);
  });

  it("caps past history at the configured maximum", () => {
    let history = createDocumentHistory(emptyDocument);
    for (let index = 0; index < maxHistoryLength + 5; index += 1) {
      history = historyReducer(history, { type: "addNode", node: node(`node-${index}`) });
    }

    expect(history.past).toHaveLength(maxHistoryLength);
    expect(history.present.nodes).toHaveLength(maxHistoryLength + 5);
  });
});
