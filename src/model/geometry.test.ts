import { describe, expect, it } from "vitest";
import { getContentBounds, grid, snapToIsoGrid, surfaceExtentsFromPoint } from "./geometry";
import type { DocumentState } from "./types";

const emptyDocument: DocumentState = {
  nodes: [],
  connections: [],
  texts: [],
  surfaces: [],
};

describe("snapToIsoGrid", () => {
  it("snaps the grid origin to the center cell", () => {
    expect(snapToIsoGrid({ x: grid.width / 2, y: grid.height / 2 })).toEqual({
      x: grid.width / 2,
      y: grid.height / 2,
    });
  });

  it("snaps nearby points to the nearest isometric cell", () => {
    expect(snapToIsoGrid({ x: 80, y: 50 })).toEqual({ x: 80, y: 50 });
    expect(snapToIsoGrid({ x: 119, y: 49 })).toEqual({ x: 120, y: 25 });
  });
});

describe("surfaceExtentsFromPoint", () => {
  it("converts an isometric point into width and height extents", () => {
    expect(surfaceExtentsFromPoint(120, 25)).toEqual({ width: 2, height: 1 });
  });
});

describe("getContentBounds", () => {
  it("returns null for an empty document", () => {
    expect(getContentBounds(emptyDocument)).toBeNull();
  });

  it("includes node, text, and surface extents", () => {
    const bounds = getContentBounds({
      ...emptyDocument,
      nodes: [{
        id: "node-1",
        x: 160,
        y: 100,
        label: "Node",
        icon: { id: "test", name: "Test", url: "test.svg", width: 1, height: 1 },
      }],
      texts: [{ id: "text-1", x: 400, y: 300, content: "Text", orientation: "horizontal", size: "medium" }],
      surfaces: [{
        id: "surface-1",
        x1: 0,
        y1: 100,
        x2: 160,
        y2: 100,
        squared: false,
        backgroundColor: "gray",
        label: "",
      }],
    });

    expect(bounds).toEqual({ minX: -80, minY: 0, maxX: 480, maxY: 350 });
  });
});
