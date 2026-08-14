import type { Dispatch, MouseEvent } from "react";
import { isoflowIcons } from "../assets/isoflowIcons";
import { createNode, type AppAction, type MenuState, type Node } from "../diagramTypes";

type DiagramOverlaysProps = {
  menu: MenuState;
  pan: { x: number; y: number };
  editingNode: Node | null;
  dispatch: Dispatch<AppAction>;
};

export function DiagramOverlays({
  menu,
  pan,
  editingNode,
  dispatch,
}: DiagramOverlaysProps) {
  const closeMenu = () => dispatch({ type: "closeMenu" });
  const updateEditingNode = (changes: Partial<Node>) => {
    if (!editingNode) return;
    const updatedNode = { ...editingNode, ...changes };
    dispatch({ type: "setEditingNode", editingNode: updatedNode });
    dispatch({ type: "updateNode", node: updatedNode });
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
              <button type="button">Add text</button>
              <button type="button">Add group</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => { if (menu.node) dispatch({ type: "setEditingNode", editingNode: menu.node }); closeMenu(); }}>Edit node</button>
              <button type="button" onClick={() => { if (menu.node) dispatch({ type: "setConnectionDraft", connectionDraft: { sourceId: menu.node.id, pointerPosition: { x: menu.node.x, y: menu.node.y } } }); closeMenu(); }}>Add connection</button>
              <button type="button" onClick={() => { if (menu.node) dispatch({ type: "removeNode", nodeId: menu.node.id }); closeMenu(); }}>Remove node</button>
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
    </>
  );
}
