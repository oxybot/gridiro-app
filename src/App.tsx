import { useRef } from "react";
import { DiagramCanvas } from "./components/DiagramCanvas";
import { DiagramOverlays } from "./components/DiagramOverlays";
import { useAppReducer } from "./appReducer";
import { zoomLevels } from "./model/geometry";

export default function App() {
  const [state, dispatch] = useAppReducer();
  const diagramRef = useRef<HTMLElement>(null);

  const zoomFromCenter = (type: "zoomIn" | "zoomOut") => {
    const rect = diagramRef.current?.getBoundingClientRect();
    const center = rect ? { x: rect.width / 2, y: rect.height / 2 } : { x: 0, y: 0 };
    dispatch({ type, center });
  };

  return (
    <>
      <section>
        <h1>Gridiro App <small>Hackathon</small></h1>
      </section>
      <section className="diagram" ref={diagramRef} onClick={() => dispatch({ type: "closeMenu" })}>
        <DiagramCanvas
          state={state}
          dispatch={dispatch}
        />
        <DiagramOverlays
          menu={state.menu}
          pan={state.pan}
          editing={state.editing}
          dispatch={dispatch}
        />
        <div className="zoom-controls" onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => zoomFromCenter("zoomOut")} disabled={state.zoomIndex === 0} aria-label="Zoom out">−</button>
          <span>{Math.round(zoomLevels[state.zoomIndex] * 100)}%</span>
          <button type="button" onClick={() => zoomFromCenter("zoomIn")} disabled={state.zoomIndex === zoomLevels.length - 1} aria-label="Zoom in">+</button>
        </div>
      </section>
    </>
  );
}
