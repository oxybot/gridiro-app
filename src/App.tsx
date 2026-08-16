import { useRef } from "react";
import { DiagramCanvas } from "./components/DiagramCanvas";
import { DiagramOverlays } from "./components/DiagramOverlays";
import { DiagramProvider, useDocumentState, useViewDispatch, useViewState } from "./state/DiagramProvider";
import { defaultZoomIndex, getContentBounds, zoomLevels } from "./model/geometry";

const viewportPadding = 40;

function Diagram() {
  const documentState = useDocumentState();
  const viewState = useViewState();
  const dispatchView = useViewDispatch();
  const diagramRef = useRef<HTMLElement>(null);

  const zoomFromCenter = (type: "zoomIn" | "zoomOut") => {
    const rect = diagramRef.current?.getBoundingClientRect();
    const center = rect ? { x: rect.width / 2, y: rect.height / 2 } : { x: 0, y: 0 };
    dispatchView({ type, center });
  };

  const fitToContent = () => {
    const rect = diagramRef.current?.getBoundingClientRect();
    if (!rect) return;

    const bounds = getContentBounds(documentState);
    if (!bounds) {
      dispatchView({ type: "setView", pan: { x: 0, y: 0 }, zoomIndex: defaultZoomIndex });
      return;
    }

    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    const availableWidth = rect.width - viewportPadding * 2;
    const availableHeight = rect.height - viewportPadding * 2;
    const zoomIndex = zoomLevels.reduce((bestIndex, level, index) =>
      contentWidth * level <= availableWidth && contentHeight * level <= availableHeight ? index : bestIndex, 0);
    const zoom = zoomLevels[zoomIndex];
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    dispatchView({
      type: "setView",
      pan: { x: rect.width / 2 - zoom * centerX, y: rect.height / 2 - zoom * centerY },
      zoomIndex,
    });
  };

  return (
    <>
      <section>
        <h1>Gridiro App <small>Hackathon mode</small></h1>
      </section>
      <section className="diagram" ref={diagramRef} onClick={() => dispatchView({ type: "closeMenu" })}>
        <DiagramCanvas />
        <DiagramOverlays />
        <div className="zoom-controls" onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => zoomFromCenter("zoomOut")} disabled={viewState.zoomIndex === 0} aria-label="Zoom out">−</button>
          <span>{Math.round(zoomLevels[viewState.zoomIndex] * 100)}%</span>
          <button type="button" onClick={() => zoomFromCenter("zoomIn")} disabled={viewState.zoomIndex === zoomLevels.length - 1} aria-label="Zoom in">+</button>
          <button type="button" onClick={fitToContent} aria-label="Fit diagram to view">⤢</button>
        </div>
      </section>
    </>
  );
}

export default function App() {
  return (
    <DiagramProvider>
      <Diagram />
    </DiagramProvider>
  );
}

