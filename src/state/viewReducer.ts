import type { Point, ViewAction, ViewState } from "../model/types";
import { defaultZoomIndex, zoomLevels } from "../model/geometry";

export const createInitialViewState = (): ViewState => ({
  hoverPos: { x: 0, y: 0 },
  isHovering: false,
  dragging: null,
  resizingSurface: null,
  selectedSurfaceId: null,
  mode: "selection",
  pan: { x: 0, y: 0 },
  panning: null,
  zoomIndex: defaultZoomIndex,
  connectionDraft: null,
  menu: {
    isOpen: false,
    x: 0,
    y: 0,
    side: "left",
    kind: "empty",
  },
  editing: null,
});

// Keeps the grid point under `center` fixed on screen while changing zoom level.
const zoomToIndex = (state: ViewState, index: number, center: Point): ViewState => {
  const zoomIndex = Math.max(0, Math.min(index, zoomLevels.length - 1));
  if (zoomIndex === state.zoomIndex) return state;

  const scaleRatio = zoomLevels[zoomIndex] / zoomLevels[state.zoomIndex];
  return {
    ...state,
    zoomIndex,
    pan: {
      x: center.x - (center.x - state.pan.x) * scaleRatio,
      y: center.y - (center.y - state.pan.y) * scaleRatio,
    },
  };
};

export const viewReducer = (state: ViewState, action: ViewAction): ViewState => {
  switch (action.type) {
    case "setSelectedSurface":
      return { ...state, selectedSurfaceId: action.surfaceId };
    case "setResizingSurface":
      return { ...state, resizingSurface: action.resizingSurface };
    case "setHoverPos":
      return { ...state, hoverPos: action.position };
    case "setHovering":
      return { ...state, isHovering: action.isHovering };
    case "setDragging":
      return { ...state, dragging: action.dragging };
    case "setPan":
      return { ...state, pan: action.pan };
    case "setPanning":
      return { ...state, panning: action.panning };
    case "setMode":
      return { ...state, mode: action.mode };
    case "zoomIn":
      return zoomToIndex(state, state.zoomIndex + 1, action.center);
    case "zoomOut":
      return zoomToIndex(state, state.zoomIndex - 1, action.center);
    case "setView":
      return { ...state, pan: action.pan, zoomIndex: action.zoomIndex };
    case "setConnectionDraft":
      return { ...state, connectionDraft: action.connectionDraft };
    case "setMenu":
      return { ...state, menu: action.menu };
    case "closeMenu":
      return { ...state, menu: { ...state.menu, isOpen: false } };
    case "setEditing":
      return { ...state, editing: action.editing };
  }
};
