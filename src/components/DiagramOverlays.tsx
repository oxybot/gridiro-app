import type { Dispatch, MouseEvent, SetStateAction } from "react";
import { isoflowIcons } from "../assets/isoflowIcons";
import type { MenuState, Node } from "../diagramTypes";

type DiagramOverlaysProps = {
  menu: MenuState;
  pan: { x: number; y: number };
  editingNode: Node | null;
  onAddNode: () => void;
  onEditNode: () => void;
  onAddConnection: () => void;
  onRemoveNode: () => void;
  onSetEditingNode: Dispatch<SetStateAction<Node | null>>;
  onUpdateEditingNode: (changes: Partial<Node>) => void;
};

export function DiagramOverlays({
  menu,
  pan,
  editingNode,
  onAddNode,
  onEditNode,
  onAddConnection,
  onRemoveNode,
  onSetEditingNode,
  onUpdateEditingNode,
}: DiagramOverlaysProps) {
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
              <button type="button" onClick={onAddNode}>Add node</button>
              <button type="button">Add text</button>
              <button type="button">Add group</button>
            </>
          ) : (
            <>
              <button type="button" onClick={onEditNode}>Edit node</button>
              <button type="button" onClick={onAddConnection}>Add connection</button>
              <button type="button" onClick={onRemoveNode}>Remove node</button>
            </>
          )}
        </div>
      )}
      {editingNode && (
        <aside className="node-editor" onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
          <div className="node-editor-header">
            <h2>Edit node</h2>
            <button className="close-editor" type="button" onClick={() => onSetEditingNode(null)} aria-label="Close editor">×</button>
          </div>
          <label>
            Label
            <input
              type="text"
              value={editingNode.label}
              onChange={(event) => onUpdateEditingNode({ label: event.target.value })}
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
                  onClick={() => onUpdateEditingNode({ icon })}
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
