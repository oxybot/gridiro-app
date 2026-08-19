import { Fullscreen, MousePointer2, Move, ZoomIn, ZoomOut } from "lucide-react";
import { zoomLevels } from "../model/geometry";
import { useViewDispatch, useViewState } from "../state/DiagramProvider";

type ViewToolbarProps = {
  diagramRef: React.RefObject<HTMLElement | null>;
  onFitToContent: () => void;
};

export function ViewToolbar({
  diagramRef,
  onFitToContent,
}: ViewToolbarProps) {
  const dispatchView = useViewDispatch();
  const viewState = useViewState();

  const zoomPercent = Math.round(zoomLevels[viewState.zoomIndex] * 100);
  const zoomIndex = viewState.zoomIndex;
  const maxZoomIndex = zoomLevels.length - 1;

  const zoomFromCenter = (type: "zoomIn" | "zoomOut") => {
    const rect = diagramRef.current?.getBoundingClientRect();
    const center = rect ? { x: rect.width / 2, y: rect.height / 2 } : { x: 0, y: 0 };
    dispatchView({ type, center });
  };

  return (
    <div className="toolbar toolbar-view" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={() => dispatchView({ type: "setMode", mode: "selection" })}
        aria-label="Selection mode"
        title="Selection mode"
        aria-pressed={viewState.mode === "selection"}
      >
        <MousePointer2 size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => dispatchView({ type: "setMode", mode: "move" })}
        aria-label="Move mode"
        title="Move mode"
        aria-pressed={viewState.mode === "move"}
      >
        <Move size={16} aria-hidden="true" />
      </button>
      <button type="button" onClick={() => zoomFromCenter("zoomOut")} disabled={zoomIndex === 0} aria-label="Zoom out">
        <ZoomOut size={16} aria-hidden="true" />
      </button>
      <span>{zoomPercent}%</span>
      <button type="button" onClick={() => zoomFromCenter("zoomIn")} disabled={zoomIndex === maxZoomIndex} aria-label="Zoom in">
        <ZoomIn size={16} aria-hidden="true" />
      </button>
      <button type="button" onClick={onFitToContent} aria-label="Fit diagram to view">
        <Fullscreen size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
