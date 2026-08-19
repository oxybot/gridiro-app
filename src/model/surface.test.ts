import { describe, expect, it } from "vitest";
import { getSurfaceBounds } from "./surface";
import type { Surface } from "./types";

function createSurface(x1: number, y1: number, x2: number, y2: number): Surface {
  return {
    id: "surface-1",
    x1,
    y1,
    x2,
    y2,
    squared: false,
    backgroundColor: "gray" as const,
    label: "",
  };
}

describe("getSurfaceBounds", () => {
  it("returns the bounds of a standard surface diamond", () => {
    const actual: Surface = createSurface(0, 50, 160, 50);
    expect(getSurfaceBounds(actual))
      .toEqual({ minX: 0, minY: 0, maxX: 160, maxY: 100 });
  });

  it ("returns the bounds of a standard surface diamond with negative coordinates", () => {
    const actual: Surface = createSurface(-160, -50, 0, -50);
    expect(getSurfaceBounds(actual))
      .toEqual({ minX: -160, minY: -100, maxX: 0, maxY: 0 });
  });

  it("returns the bounds of a surface diamond with a negative slope", () => {
    const actual: Surface = createSurface(0, 50, 160, 0);
    expect(getSurfaceBounds(actual))
      .toEqual({ minX: 0, minY: -25, maxX: 160, maxY: 75 });
  });

  it("returns the bounds of a surface diamond with a positive slope", () => {
    const actual: Surface = createSurface(0, 0, 160, 50);
    expect(getSurfaceBounds(actual))
      .toEqual({ minX: 0, minY: -25, maxX: 160, maxY: 75 });
  });
});
