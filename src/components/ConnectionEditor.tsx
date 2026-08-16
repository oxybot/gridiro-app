import type { MouseEvent } from "react";
import type { Connection, ConnectionStyle, ElementColor } from "../model/types";
import { useDocumentDispatch, useViewDispatch } from "../state/DiagramProvider";

type ConnectionEditorProps = {
  connection: Connection;
};

export function ConnectionEditor({ connection }: ConnectionEditorProps) {
  const dispatchView = useViewDispatch();
  const dispatchDocument = useDocumentDispatch();
  const updateConnection = (changes: Partial<Connection>) => {
    dispatchView({ type: "setEditing", editing: { kind: "connection", connection: { ...connection, ...changes } } });
    dispatchDocument({ type: "updateConnection", connectionId: connection.id, changes });
  };

  return (
    <aside className="editor" onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
      <div className="editor-header">
        <h2>Edit connection</h2>
        <button className="close-editor" type="button" onClick={() => dispatchView({ type: "setEditing", editing: null })} aria-label="Close editor">×</button>
      </div>
      <label>
        Label
        <input
          type="text"
          value={connection.label}
          onChange={(event) => updateConnection({ label: event.target.value })}
        />
      </label>
      <fieldset>
        <legend>Color</legend>
        <div className="color-options">
          {(["gray", "blue", "green", "yellow", "red"] as ElementColor[]).map((color) => (
            <button
              className={connection.color === color ? "selected" : ""}
              type="button"
              key={color}
              onClick={() => updateConnection({ color })}
              style={{ backgroundColor: color }}
              aria-label={`Select ${color} color`}
            ></button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Style</legend>
        <div className="connection-style-options">
          {(["solid", "dashed"] as ConnectionStyle[]).map((style) => (
            <button
              className={connection.style === style ? "selected" : ""}
              type="button"
              key={style}
              onClick={() => updateConnection({ style })}
              aria-label={`Select ${style} style`}
            >
              <svg viewBox="0 0 24 24" width="48" height="24">
                <line x1={2} y1={12} x2={22} y2={12} stroke="var(--gray-9)" strokeWidth={2} strokeDasharray={style === "dashed" ? "4 3" : undefined} />
              </svg>
            </button>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}
