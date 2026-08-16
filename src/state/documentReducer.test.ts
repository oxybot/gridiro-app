import { describe, expect, it } from "vitest";
import { documentReducer } from "./documentReducer";
import type { DocumentState, Node } from "../model/types";

const emptyDocument: DocumentState = {
  nodes: [],
  connections: [],
  texts: [],
  surfaces: [],
};

const node = (id: string, x = 0, y = 0): Node => ({
  id,
  x,
  y,
  label: "Node",
  icon: { id: "test", name: "Test", url: "test.svg", width: 1, height: 1 },
});

describe("documentReducer", () => {
  it("adds, moves, and updates nodes immutably", () => {
    const added = documentReducer(emptyDocument, { type: "addNode", node: node("node-1") });
    const moved = documentReducer(added, { type: "moveNode", nodeId: "node-1", position: { x: 80, y: 50 } });
    const updated = documentReducer(moved, { type: "updateNode", nodeId: "node-1", changes: { label: "API" } });

    expect(added.nodes).toEqual([node("node-1")]);
    expect(moved.nodes[0]).toMatchObject({ x: 80, y: 50 });
    expect(updated.nodes[0]).toMatchObject({ x: 80, y: 50, label: "API" });
    expect(emptyDocument.nodes).toEqual([]);
  });

  it("removes a node and its connected edges", () => {
    const document: DocumentState = {
      ...emptyDocument,
      nodes: [node("source"), node("target")],
      connections: [
        { id: "kept", sourceId: "source", targetId: "target", color: "blue", style: "solid", label: "" },
      ],
    };

    const result = documentReducer(document, { type: "removeNode", nodeId: "source" });

    expect(result.nodes).toEqual([node("target")]);
    expect(result.connections).toEqual([]);
  });

  it("updates and removes connections", () => {
    const document: DocumentState = {
      ...emptyDocument,
      connections: [{ id: "connection-1", sourceId: "a", targetId: "b", color: "blue", style: "solid", label: "" }],
    };

    const updated = documentReducer(document, {
      type: "updateConnection",
      connectionId: "connection-1",
      changes: { color: "red", style: "dashed", label: "events" },
    });
    const removed = documentReducer(updated, { type: "removeConnection", connectionId: "connection-1" });

    expect(updated.connections[0]).toMatchObject({ color: "red", style: "dashed", label: "events" });
    expect(removed.connections).toEqual([]);
  });
});
