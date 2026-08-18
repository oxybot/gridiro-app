import { useEffect, useRef } from "react";
import { Canvas } from "./components/Canvas";
import { ContextMenu } from "./components/ContextMenu";
import { DocumentToolbar } from "./components/DocumentToolbar";
import { ElementEditor } from "./components/ElementEditor";
import { ViewToolbar } from "./components/ViewToolbar";
import { defaultZoomIndex, getContentBounds, zoomLevels } from "./model/geometry";
import { DiagramProvider, useDocumentDispatch, useDocumentState, useViewDispatch } from "./state/DiagramProvider";

const viewportPadding = 40;

function Diagram() {
  const documentState = useDocumentState();
  const dispatchDocument = useDocumentDispatch();
  const dispatchView = useViewDispatch();
  const diagramRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;

      event.preventDefault();
      dispatchDocument({ type: event.shiftKey ? "redo" : "undo" });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatchDocument]);

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

  useEffect(() => {
    fitToContent();
  }, []);

  return (
    <>
      <section>
        <h1>Gridiro App <small>Hackathon mode</small></h1>
      </section>
      <section className="diagram" ref={diagramRef} onClick={() => dispatchView({ type: "closeMenu" })}>
        <DocumentToolbar />
        <Canvas />
        <ContextMenu />
        <ElementEditor />
        <ViewToolbar diagramRef={diagramRef} onFitToContent={fitToContent} />
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

