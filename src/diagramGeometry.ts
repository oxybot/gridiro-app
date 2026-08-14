export const grid = {
  width: 80,
  height: 50,
};

export const midWidth = grid.width / 2;
export const midHeight = grid.height / 2;

export const snapToIsoGrid = (localX: number, localY: number) => {
  const offsetX = localX - midWidth;
  const offsetY = localY - midHeight;

  const isoU = (offsetX / midWidth + offsetY / midHeight) / 2;
  const isoV = (offsetX / midWidth - offsetY / midHeight) / 2;

  const snappedU = Math.round(isoU);
  const snappedV = Math.round(isoV);

  return {
    x: (snappedU + snappedV) * midWidth + midWidth,
    y: (snappedU - snappedV) * midHeight + midHeight,
  };
};
