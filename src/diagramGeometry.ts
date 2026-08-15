import type { Point } from "./diagramTypes";

export const grid = {
  width: 80,
  height: 50,
};

export const midWidth = grid.width / 2;
export const midHeight = grid.height / 2;

export const snapToIsoGrid = (local: Point): Point => {
  const offsetX = local.x - midWidth;
  const offsetY = local.y - midHeight;

  const isoU = (offsetX / midWidth + offsetY / midHeight) / 2;
  const isoV = (offsetX / midWidth - offsetY / midHeight) / 2;

  const snappedU = Math.round(isoU);
  const snappedV = Math.round(isoV);

  return {
    x: (snappedU + snappedV) * midWidth + midWidth,
    y: (snappedU - snappedV) * midHeight + midHeight,
  };
};

// Inverts the bottom corner's formula to recover width/height from a local point.
export const surfaceExtentsFromPoint = (localX: number, localY: number) => ({
  width: (localX / midWidth + localY / midHeight) / 2,
  height: (localX / midWidth - localY / midHeight) / 2,
});
