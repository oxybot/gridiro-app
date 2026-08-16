import type { MouseEvent } from "react";
import type { TextElement, TextOrientation, TextSize } from "../model/types";
import { grid } from "../model/geometry";
import { useDocumentDispatch, useViewDispatch } from "../state/DiagramProvider";

type TextEditorProps = {
  text: TextElement;
};

export function TextEditor({ text }: TextEditorProps) {
  const dispatchView = useViewDispatch();
  const dispatchDocument = useDocumentDispatch();
  const updateText = (changes: Partial<TextElement>) => {
    dispatchView({ type: "setEditing", editing: { kind: "text", text: { ...text, ...changes } } });
    dispatchDocument({ type: "updateText", textId: text.id, changes });
  };

  return (
    <aside className="node-editor" onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
      <div className="node-editor-header">
        <h2>Edit text</h2>
        <button className="close-editor" type="button" onClick={() => dispatchView({ type: "setEditing", editing: null })} aria-label="Close editor">×</button>
      </div>
      <label>
        Content
        <input
          type="text"
          value={text.content}
          onChange={(event) => updateText({ content: event.target.value })}
        />
      </label>
      <fieldset>
        <legend>Orientation</legend>
        <div className="orientation-options">
          {(["horizontal", "vertical"] as TextOrientation[]).map((orientation) => (
            <button
              className={text.orientation === orientation ? "selected" : ""}
              type="button"
              key={orientation}
              onClick={() => updateText({ orientation })}
              aria-label={`Select ${orientation} orientation`}
            >
              <svg viewBox="0 0 24 20" width="48" height="40">
                <g transform={`translate(12, 10) scale(1 ${grid.height / grid.width}) rotate(${orientation === "horizontal" ? 45 : -45})`}>
                  <text
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize="10"
                    fill="var(--gray-9)"
                  >
                    Text
                  </text>
                </g>
              </svg>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Size</legend>
        <div className="size-options">
          {(["small", "medium", "large"] as TextSize[]).map((size) => (
            <button
              className={text.size === size ? "selected" : ""}
              type="button"
              key={size}
              onClick={() => updateText({ size })}
              aria-label={`Select ${size} size`}
            >
              <span className={`size-preview size-preview-${size}`}>{size === "small" ? "S" : size === "medium" ? "M" : "L"}</span>
            </button>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}
