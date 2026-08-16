import type { Dispatch, MouseEvent } from "react";
import { isoflowIcons } from "../assets/isoflowIcons";
import type { AppAction, Connection, ConnectionStyle, EditingElement, ElementColor, MenuState, Node, Point, Surface, TextElement, TextOrientation, TextSize } from "../model/types";
import { createNode } from "../model/node";
import { createText } from "../model/text";
import { createSurface } from "../model/surface";
import { grid } from "../model/geometry";

type DiagramOverlaysProps = {
  menu: MenuState;
  pan: Point;
  zoom: number;
  editing: EditingElement | null;
  dispatch: Dispatch<AppAction>;
};

export function DiagramOverlays({
  menu,
  pan,
  zoom,
  editing,
  dispatch,
}: DiagramOverlaysProps) {
  const closeMenu = () => dispatch({ type: "closeMenu" });
  const editingNode = editing?.kind === "node" ? editing.node : null;
  const editingText = editing?.kind === "text" ? editing.text : null;
  const editingSurface = editing?.kind === "surface" ? editing.surface : null;
  const editingConnection = editing?.kind === "connection" ? editing.connection : null;
  const updateEditingNode = (changes: Partial<Node>) => {
    if (!editingNode) return;
    dispatch({ type: "setEditing", editing: { kind: "node", node: { ...editingNode, ...changes } } });
    dispatch({ type: "updateNode", nodeId: editingNode.id, changes });
  };
  const updateEditingText = (changes: Partial<TextElement>) => {
    if (!editingText) return;
    dispatch({ type: "setEditing", editing: { kind: "text", text: { ...editingText, ...changes } } });
    dispatch({ type: "updateText", textId: editingText.id, changes });
  };
  const updateEditingSurface = (changes: Partial<Surface>) => {
    if (!editingSurface) return;
    dispatch({ type: "setEditing", editing: { kind: "surface", surface: { ...editingSurface, ...changes } } });
    dispatch({ type: "updateSurface", surfaceId: editingSurface.id, changes });
  };
  const updateEditingConnection = (changes: Partial<Connection>) => {
    if (!editingConnection) return;
    dispatch({ type: "setEditing", editing: { kind: "connection", connection: { ...editingConnection, ...changes } } });
    dispatch({ type: "updateConnection", connectionId: editingConnection.id, changes });
  };

  return (
    <>
      {menu.isOpen && (
        <div
          className={`diagram-menu ${menu.side}`}
          style={{ left: menu.x * zoom + pan.x, top: menu.y * zoom + pan.y }}
          onClick={(event) => event.stopPropagation()}
        >
          {menu.kind === "empty" ? (
            <>
              <button type="button" onClick={() => { dispatch({ type: "addNode", node: createNode(menu.x, menu.y) }); closeMenu(); }}>Add node</button>
              <button type="button" onClick={() => { dispatch({ type: "addText", text: createText(menu.x, menu.y) }); closeMenu(); }}>Add text</button>
              <button type="button" onClick={() => { dispatch({ type: "addSurface", surface: createSurface(menu.x, menu.y) }); closeMenu(); }}>Add surface</button>
            </>
          ) : menu.kind === "node" ? (
            <>
              <button type="button" onClick={() => { if (menu.node) dispatch({ type: "setEditing", editing: { kind: "node", node: menu.node } }); closeMenu(); }}>Edit node</button>
              <button type="button" onClick={() => { if (menu.node) dispatch({ type: "setConnectionDraft", connectionDraft: { sourceId: menu.node.id, pointerPosition: { x: menu.node.x, y: menu.node.y } } }); closeMenu(); }}>Add connection</button>
              <button type="button" onClick={() => { if (menu.node) dispatch({ type: "removeNode", nodeId: menu.node.id }); closeMenu(); }}>Remove node</button>
            </>
          ) : menu.kind === "text" ? (
            <>
              <button type="button" onClick={() => { if (menu.text) dispatch({ type: "setEditing", editing: { kind: "text", text: menu.text } }); closeMenu(); }}>Edit text</button>
              <button type="button" onClick={() => { if (menu.text) dispatch({ type: "removeText", textId: menu.text.id }); closeMenu(); }}>Remove text</button>
            </>
          ) : menu.kind === "surface" ? (
            <>
              <button type="button" onClick={() => { if (menu.surface) dispatch({ type: "setEditing", editing: { kind: "surface", surface: menu.surface } }); closeMenu(); }}>Edit surface</button>
              <button type="button" onClick={() => { if (menu.surface) dispatch({ type: "removeSurface", surfaceId: menu.surface.id }); closeMenu(); }}>Remove surface</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => { if (menu.connection) dispatch({ type: "setEditing", editing: { kind: "connection", connection: menu.connection } }); closeMenu(); }}>Edit connection</button>
              <button type="button" onClick={() => { if (menu.connection) dispatch({ type: "removeConnection", connectionId: menu.connection.id }); closeMenu(); }}>Remove connection</button>
            </>
          )}
        </div>
      )}
      {editingNode && (
        <aside className="node-editor" onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
          <div className="node-editor-header">
            <h2>Edit node</h2>
            <button className="close-editor" type="button" onClick={() => dispatch({ type: "setEditing", editing: null })} aria-label="Close editor">×</button>
          </div>
          <label>
            Label
            <input
              type="text"
              value={editingNode.label}
              onChange={(event) => updateEditingNode({ label: event.target.value })}
            />
          </label>
          <fieldset>
            <legend>Icon</legend>
            <div className="icon-options">
              {isoflowIcons.icons.map((icon) => (
                <button
                  className={editingNode.icon.id === icon.id ? "selected" : ""}
                  type="button"
                  key={icon.id}
                  onClick={() => updateEditingNode({ icon })}
                  aria-label={`Select ${icon.name} icon`}
                >
                  <img src={icon.url} alt={icon.name} />
                </button>
              ))}
            </div>
          </fieldset>
        </aside>
      )}
      {editingText && (
        <aside className="node-editor" onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
          <div className="node-editor-header">
            <h2>Edit text</h2>
            <button className="close-editor" type="button" onClick={() => dispatch({ type: "setEditing", editing: null })} aria-label="Close editor">×</button>
          </div>
          <label>
            Content
            <input
              type="text"
              value={editingText.content}
              onChange={(event) => updateEditingText({ content: event.target.value })}
            />
          </label>
          <fieldset>
            <legend>Orientation</legend>
            <div className="orientation-options">
              {(["horizontal", "vertical"] as TextOrientation[]).map((orientation) => (
                <button
                  className={editingText.orientation === orientation ? "selected" : ""}
                  type="button"
                  key={orientation}
                  onClick={() => updateEditingText({ orientation })}
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
                  className={editingText.size === size ? "selected" : ""}
                  type="button"
                  key={size}
                  onClick={() => updateEditingText({ size })}
                  aria-label={`Select ${size} size`}
                >
                  <span className={`size-preview size-preview-${size}`}>{size === "small" ? "S" : size === "medium" ? "M" : "L"}</span>
                </button>
              ))}
            </div>
          </fieldset>
        </aside>
      )}
      {editingSurface && (
        <aside className="node-editor" onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
          <div className="node-editor-header">
            <h2>Edit surface</h2>
            <button className="close-editor" type="button" onClick={() => dispatch({ type: "setEditing", editing: null })} aria-label="Close editor">×</button>
          </div>
          <label>
            Label
            <input
              type="text"
              value={editingSurface.label}
              onChange={(event) => updateEditingSurface({ label: event.target.value })}
            />
          </label>
          <fieldset>
            <legend>Background color</legend>
            <div className="color-options">
              {(["gray", "blue", "green", "yellow", "red"] as ElementColor[]).map((color) => (
                <button
                  className={editingSurface.backgroundColor === color ? "selected" : ""}
                  type="button"
                  key={color}
                  onClick={() => updateEditingSurface({ backgroundColor: color })}
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color} background`}
                ></button>
              ))}
            </div>
          </fieldset>
          <label>
            <input
              type="checkbox"
              checked={editingSurface.squared}
              onChange={(event) => updateEditingSurface({ squared: event.target.checked })}
            />
            Squared
          </label>
        </aside>
      )}
      {editingConnection && (
        <aside className="node-editor" onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
          <div className="node-editor-header">
            <h2>Edit connection</h2>
            <button className="close-editor" type="button" onClick={() => dispatch({ type: "setEditing", editing: null })} aria-label="Close editor">×</button>
          </div>
          <label>
            Label
            <input
              type="text"
              value={editingConnection.label}
              onChange={(event) => updateEditingConnection({ label: event.target.value })}
            />
          </label>
          <fieldset>
            <legend>Color</legend>
            <div className="color-options">
              {(["gray", "blue", "green", "yellow", "red"] as ElementColor[]).map((color) => (
                <button
                  className={editingConnection.color === color ? "selected" : ""}
                  type="button"
                  key={color}
                  onClick={() => updateEditingConnection({ color })}
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
                  className={editingConnection.style === style ? "selected" : ""}
                  type="button"
                  key={style}
                  onClick={() => updateEditingConnection({ style })}
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
      )}
    </>
  );
}
