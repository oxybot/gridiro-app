import { useEffect, useRef, type ChangeEvent } from "react";
import { Canvas } from "./components/Canvas";
import { DiagramProvider, useDocumentDispatch, useDocumentHistory, useDocumentState, useViewDispatch, useViewState } from "./state/DiagramProvider";
import { defaultZoomIndex, getContentBounds, zoomLevels } from "./model/geometry";
import { deserializeDocument, serializeDocument } from "./model/serialization";
import { ContextMenu } from "./components/ContextMenu";
import { ElementEditor } from "./components/ElementEditor";

const viewportPadding = 40;

function Diagram() {
  const documentState = useDocumentState();
  const dispatchDocument = useDocumentDispatch();
  const { canUndo, canRedo } = useDocumentHistory();
  const viewState = useViewState();
  const dispatchView = useViewDispatch();
  const diagramRef = useRef<HTMLElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

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

  const exportDocument = () => {
    const blob = new Blob([serializeDocument(documentState)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gridiro-diagram.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDocument = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const document = deserializeDocument(await file.text());
      dispatchDocument({ type: "replaceDocument", document });
      dispatchView({ type: "setEditing", editing: null });
      dispatchView({ type: "closeMenu" });
    } catch {
      window.alert("This file is not a valid Gridiro diagram.");
    } finally {
      event.target.value = "";
    }
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
        <div className="toolbar toolbar-document" onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={exportDocument} aria-label="Export diagram" title="Export diagram">↓</button>
          <button type="button" onClick={() => importInputRef.current?.click()} aria-label="Import diagram" title="Import diagram">↑</button>
          <input ref={importInputRef} type="file" accept="application/json,.json" hidden onChange={importDocument} />
        </div>
        <Canvas />
        <ContextMenu />
        <ElementEditor />
        <div className="toolbar toolbar-view" onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => dispatchDocument({ type: "undo" })} disabled={!canUndo} aria-label="Undo last change">↶</button>
          <button type="button" onClick={() => dispatchDocument({ type: "redo" })} disabled={!canRedo} aria-label="Redo last change">↷</button>
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

