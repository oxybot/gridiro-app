import { Fullscreen, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { zoomLevels } from "../model/geometry";
import { useDocumentDispatch, useDocumentHistory, useViewDispatch, useViewState } from "../state/DiagramProvider";

type ViewToolbarProps = {
  diagramRef: React.RefObject<HTMLElement | null>;
  onFitToContent: () => void;
};

export function ViewToolbar({
  diagramRef,
  onFitToContent,
}: ViewToolbarProps) {
  const { canUndo, canRedo } = useDocumentHistory();
  const dispatchDocument = useDocumentDispatch();
  const dispatchView = useViewDispatch();
  const viewState = useViewState();

  const zoomPercent = Math.round(zoomLevels[viewState.zoomIndex] * 100);
  const zoomIndex = viewState.zoomIndex;
  const maxZoomIndex = zoomLevels.length - 1;

  function handleUndo() {
    dispatchDocument({ type: "undo" });
  }

  function handleRedo() {
    dispatchDocument({ type: "redo" });
  }

  const zoomFromCenter = (type: "zoomIn" | "zoomOut") => {
    const rect = diagramRef.current?.getBoundingClientRect();
    const center = rect ? { x: rect.width / 2, y: rect.height / 2 } : { x: 0, y: 0 };
    dispatchView({ type, center });
  };

  return (
    <div className="toolbar toolbar-view" onClick={(event) => event.stopPropagation()}>
      <button type="button" onClick={handleUndo} disabled={!canUndo} aria-label="Undo last change">
        <Undo2 size={16} strokeWidth={2.2} aria-hidden="true" />
      </button>
      <button type="button" onClick={handleRedo} disabled={!canRedo} aria-label="Redo last change">
        <Redo2 size={16} strokeWidth={2.2} aria-hidden="true" />
      </button>
      <button type="button" onClick={() => zoomFromCenter("zoomOut")} disabled={zoomIndex === 0} aria-label="Zoom out">
        <ZoomOut size={16} strokeWidth={2.2} aria-hidden="true" />
      </button>
      <span>{zoomPercent}%</span>
      <button type="button" onClick={() => zoomFromCenter("zoomIn")} disabled={zoomIndex === maxZoomIndex} aria-label="Zoom in">
        <ZoomIn size={16} strokeWidth={2.2} aria-hidden="true" />
      </button>
      <button type="button" onClick={onFitToContent} aria-label="Fit diagram to view">
        <Fullscreen size={16} strokeWidth={2.2} aria-hidden="true" />
      </button>
    </div>
  );
}
