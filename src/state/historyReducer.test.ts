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

  it("records a drag as one history entry after preview updates", () => {
    const initial = createDocumentHistory({ ...emptyDocument, nodes: [node("node-1")] });
    const started = historyReducer(initial, { type: "startMove" });
    const previewed = historyReducer(started, { type: "previewMoveNode", nodeId: "node-1", position: { x: 80, y: 50 } });
    const previewedAgain = historyReducer(previewed, { type: "previewMoveNode", nodeId: "node-1", position: { x: 160, y: 100 } });
    const finished = historyReducer(previewedAgain, { type: "finishMove" });
    const undone = historyReducer(finished, { type: "undo" });

    expect(previewedAgain.past).toHaveLength(0);
    expect(finished.past).toEqual([initial.present]);
    expect(undone.present).toEqual(initial.present);
  });

  it("records a surface resize as one history entry", () => {
    const surface = {
      id: "surface-1",
      x1: 0,
      y1: 50,
      x2: 160,
      y2: 50,
      squared: false,
      backgroundColor: "gray" as const,
      label: "",
    };
    const initial = createDocumentHistory({ ...emptyDocument, surfaces: [surface] });
    const started = historyReducer(initial, { type: "startMove" });
    const previewed = historyReducer(started, { type: "previewUpdateSurface", surfaceId: surface.id, changes: { x2: 240, y2: 100 } });
    const previewedAgain = historyReducer(previewed, { type: "previewUpdateSurface", surfaceId: surface.id, changes: { x2: 320, y2: 150 } });
    const finished = historyReducer(previewedAgain, { type: "finishMove" });
    const undone = historyReducer(finished, { type: "undo" });

    expect(previewedAgain.past).toHaveLength(0);
    expect(finished.past).toEqual([initial.present]);
    expect(undone.present).toEqual(initial.present);
  });

  it("records a text edit as one history entry after preview updates", () => {
    const initial = createDocumentHistory({ ...emptyDocument, nodes: [node("node-1")] });
    const started = historyReducer(initial, { type: "startEdit" });
    const previewed = historyReducer(started, { type: "previewUpdateNode", nodeId: "node-1", changes: { label: "N" } });
    const previewedAgain = historyReducer(previewed, { type: "previewUpdateNode", nodeId: "node-1", changes: { label: "Node" } });
    const finished = historyReducer(previewedAgain, { type: "finishEdit" });
    const undone = historyReducer(finished, { type: "undo" });

    expect(previewedAgain.past).toHaveLength(0);
    expect(finished.past).toEqual([initial.present]);
    expect(undone.present).toEqual(initial.present);
  });

  it("records an icon change as one history entry", () => {
    const initial = createDocumentHistory({ ...emptyDocument, nodes: [node("node-1")] });
    const icon = { id: "new-icon", name: "New icon", url: "new.svg", width: 2, height: 2 };
    const started = historyReducer(initial, { type: "startEdit" });
    const previewed = historyReducer(started, { type: "previewUpdateNode", nodeId: "node-1", changes: { icon } });
    const finished = historyReducer(previewed, { type: "finishEdit" });
    const undone = historyReducer(finished, { type: "undo" });

    expect(finished.present.nodes[0].icon).toEqual(icon);
    expect(finished.past).toEqual([initial.present]);
    expect(undone.present).toEqual(initial.present);
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
