import type { Dispatch, MouseEvent } from "react";
import { isoflowIcons } from "../assets/isoflowIcons";
import type { AppAction, MenuState, Node, Point, TextElement, TextOrientation, TextSize } from "../diagramTypes";
import { createNode } from "../diagramNode";
import { createText } from "../diagramText";

type DiagramOverlaysProps = {
  menu: MenuState;
  pan: Point;
  editingNode: Node | null;
  editingText: TextElement | null;
  dispatch: Dispatch<AppAction>;
};

export function DiagramOverlays({
  menu,
  pan,
  editingNode,
  editingText,
  dispatch,
}: DiagramOverlaysProps) {
  const closeMenu = () => dispatch({ type: "closeMenu" });
  const updateEditingNode = (changes: Partial<Node>) => {
    if (!editingNode) return;
    dispatch({ type: "setEditingNode", editingNode: { ...editingNode, ...changes } });
    dispatch({ type: "updateNode", nodeId: editingNode.id, changes });
  };
  const updateEditingText = (changes: Partial<TextElement>) => {
    if (!editingText) return;
    dispatch({ type: "setEditingText", editingText: { ...editingText, ...changes } });
    dispatch({ type: "updateText", textId: editingText.id, changes });
  };

  return (
    <>
      {menu.isOpen && (
        <div
          className={`diagram-menu ${menu.side}`}
          style={{ left: menu.x + pan.x, top: menu.y + pan.y }}
          onClick={(event) => event.stopPropagation()}
        >
          {menu.kind === "empty" ? (
            <>
              <button type="button" onClick={() => { dispatch({ type: "addNode", node: createNode(menu.x, menu.y) }); closeMenu(); }}>Add node</button>
              <button type="button" onClick={() => { dispatch({ type: "addText", text: createText(menu.x, menu.y) }); closeMenu(); }}>Add text</button>
              <button type="button">Add group</button>
            </>
          ) : menu.kind === "node" ? (
            <>
              <button type="button" onClick={() => { if (menu.node) { dispatch({ type: "setEditingNode", editingNode: menu.node }); dispatch({ type: "setEditingText", editingText: null }); } closeMenu(); }}>Edit node</button>
              <button type="button" onClick={() => { if (menu.node) dispatch({ type: "setConnectionDraft", connectionDraft: { sourceId: menu.node.id, pointerPosition: { x: menu.node.x, y: menu.node.y } } }); closeMenu(); }}>Add connection</button>
              <button type="button" onClick={() => { if (menu.node) dispatch({ type: "removeNode", nodeId: menu.node.id }); closeMenu(); }}>Remove node</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => { if (menu.text) { dispatch({ type: "setEditingText", editingText: menu.text }); dispatch({ type: "setEditingNode", editingNode: null }); } closeMenu(); }}>Edit text</button>
              <button type="button" onClick={() => { if (menu.text) dispatch({ type: "removeText", textId: menu.text.id }); closeMenu(); }}>Remove text</button>
            </>
          )}
        </div>
      )}
      {editingNode && (
        <aside className="node-editor" onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
          <div className="node-editor-header">
            <h2>Edit node</h2>
            <button className="close-editor" type="button" onClick={() => dispatch({ type: "setEditingNode", editingNode: null })} aria-label="Close editor">×</button>
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
            <button className="close-editor" type="button" onClick={() => dispatch({ type: "setEditingText", editingText: null })} aria-label="Close editor">×</button>
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
            {(["horizontal", "vertical"] as TextOrientation[]).map((orientation) => (
              <label className="radio-option" key={orientation}>
                <input
                  type="radio"
                  name="text-orientation"
                  checked={editingText.orientation === orientation}
                  onChange={() => updateEditingText({ orientation })}
                />
                {orientation}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Size</legend>
            {(["small", "medium", "large"] as TextSize[]).map((size) => (
              <label className="radio-option" key={size}>
                <input
                  type="radio"
                  name="text-size"
                  checked={editingText.size === size}
                  onChange={() => updateEditingText({ size })}
                />
                {size}
              </label>
            ))}
          </fieldset>
        </aside>
      )}
    </>
  );
}
