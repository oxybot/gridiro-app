import type { MouseEvent } from "react";
import type { ElementColor, Surface } from "../model/types";
import { useDocumentDispatch, useViewDispatch } from "../state/DiagramProvider";

type SurfaceEditorProps = {
  surface: Surface;
};

export function SurfaceEditor({ surface }: SurfaceEditorProps) {
  const dispatchView = useViewDispatch();
  const dispatchDocument = useDocumentDispatch();
  const updateSurface = (changes: Partial<Surface>) => {
    dispatchView({ type: "setEditing", editing: { kind: "surface", surface: { ...surface, ...changes } } });
    dispatchDocument({ type: "updateSurface", surfaceId: surface.id, changes });
  };

  return (
    <aside className="node-editor" onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
      <div className="node-editor-header">
        <h2>Edit surface</h2>
        <button className="close-editor" type="button" onClick={() => dispatchView({ type: "setEditing", editing: null })} aria-label="Close editor">×</button>
      </div>
      <label>
        Label
        <input
          type="text"
          value={surface.label}
          onChange={(event) => updateSurface({ label: event.target.value })}
        />
      </label>
      <fieldset>
        <legend>Background color</legend>
        <div className="color-options">
          {(["gray", "blue", "green", "yellow", "red"] as ElementColor[]).map((color) => (
            <button
              className={surface.backgroundColor === color ? "selected" : ""}
              type="button"
              key={color}
              onClick={() => updateSurface({ backgroundColor: color })}
              style={{ backgroundColor: color }}
              aria-label={`Select ${color} background`}
            ></button>
          ))}
        </div>
      </fieldset>
      <label>
        <input
          type="checkbox"
          checked={surface.squared}
          onChange={(event) => updateSurface({ squared: event.target.checked })}
        />
        Squared
      </label>
    </aside>
  );
}
