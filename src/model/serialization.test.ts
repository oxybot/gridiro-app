import { describe, expect, it } from "vitest";
import { deserializeDocument, emptyDocument, serializeDocument } from "./serialization";
import type { DocumentState } from "./types";

const document: DocumentState = {
  nodes: [{
    id: "node-1",
    x: 80,
    y: 50,
    label: "API",
    icon: { id: "test", name: "Test", url: "test.svg", width: 1, height: 1 },
  }],
  connections: [{ id: "connection-1", sourceId: "node-1", targetId: "node-2", color: "red", style: "dashed", label: "events" }],
  texts: [{ id: "text-1", x: 160, y: 100, content: "Text", orientation: "vertical", size: "large" }],
  surfaces: [{ id: "surface-1", x1: 0, y1: 50, x2: 160, y2: 50, squared: true, backgroundColor: "green", label: "Services" }],
};

describe("document serialization", () => {
  it("round-trips a versioned document", () => {
    expect(deserializeDocument(serializeDocument(document))).toEqual(document);
  });

  it("rejects unversioned or incomplete documents", () => {
    const legacy = JSON.stringify({
      nodes: document.nodes,
      connections: [{ sourceId: "node-1", targetId: "node-2" }],
      texts: document.texts,
      surfaces: document.surfaces,
    });

    expect(() => deserializeDocument(legacy)).toThrow("strict version 1 format");
  });

  it("rejects unknown versions and extra fields", () => {
    const parsed = JSON.parse(serializeDocument(document)) as { version: number; document: DocumentState };
    expect(() => deserializeDocument(JSON.stringify({ ...parsed, version: 2 }))).toThrow("strict version 1 format");
    expect(() => deserializeDocument(JSON.stringify({ ...parsed, extra: true }))).toThrow("strict version 1 format");
  });

  it("rejects malformed documents", () => {
    expect(() => deserializeDocument(JSON.stringify({ version: 1, document: { nodes: [] } }))).toThrow("strict version 1 format");
    expect(emptyDocument).toEqual({ nodes: [], connections: [], texts: [], surfaces: [] });
  });
});
