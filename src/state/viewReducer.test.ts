import { describe, expect, it } from "vitest";
import { createInitialViewState, viewReducer } from "./viewReducer";

describe("viewReducer", () => {
  it("starts at the default zoom and updates view state", () => {
    const initial = createInitialViewState();
    const updated = viewReducer(initial, { type: "setView", pan: { x: 100, y: 40 }, zoomIndex: 2 });

    expect(initial.zoomIndex).toBe(1);
    expect(updated).toMatchObject({ pan: { x: 100, y: 40 }, zoomIndex: 2 });
  });

  it("keeps the viewport center fixed while zooming", () => {
    const initial = { ...createInitialViewState(), pan: { x: 20, y: 30 } };
    const zoomed = viewReducer(initial, { type: "zoomIn", center: { x: 200, y: 150 } });

    expect(zoomed.zoomIndex).toBe(2);
    expect(zoomed.pan).toEqual({ x: -70, y: -30 });
  });

  it("clamps zoom at both ends", () => {
    const initial = createInitialViewState();
    const zoomedOut = viewReducer(initial, { type: "zoomOut", center: { x: 0, y: 0 } });
    const zoomedIn = viewReducer(
      viewReducer(zoomedOut, { type: "zoomOut", center: { x: 0, y: 0 } }),
      { type: "zoomIn", center: { x: 0, y: 0 } },
    );

    expect(zoomedOut.zoomIndex).toBe(0);
    expect(zoomedIn.zoomIndex).toBe(1);
  });

  it("replaces and toggles selected elements", () => {
    const initial = createInitialViewState();
    const selected = viewReducer(initial, {
      type: "setSelection",
      selectedElements: [{ kind: "node", id: "node-1" }],
    });
    const expanded = viewReducer(selected, { type: "toggleSelection", element: { kind: "text", id: "text-1" } });
    const reduced = viewReducer(expanded, { type: "toggleSelection", element: { kind: "node", id: "node-1" } });

    expect(expanded.selectedElements).toEqual([{ kind: "node", id: "node-1" }, { kind: "text", id: "text-1" }]);
    expect(reduced.selectedElements).toEqual([{ kind: "text", id: "text-1" }]);
  });

  it("tracks an in-progress marquee selection", () => {
    const initial = createInitialViewState();
    const selectionBox = { start: { x: 20, y: 30 }, end: { x: 100, y: 90 } };
    const selecting = viewReducer(initial, { type: "setSelectionBox", selectionBox });
    const finished = viewReducer(selecting, { type: "setSelectionBox", selectionBox: null });

    expect(selecting.selectionBox).toEqual(selectionBox);
    expect(finished.selectionBox).toBeNull();
  });
});
