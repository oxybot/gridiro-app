import type { MouseEvent } from "react";
import { isoflowIcons } from "../assets/isoflowIcons";
import type { Node } from "../model/types";
import { useDocumentDispatch, useViewDispatch } from "../state/DiagramProvider";

type NodeEditorProps = {
  node: Node;
};

export function NodeEditor({ node }: NodeEditorProps) {
  const dispatchView = useViewDispatch();
  const dispatchDocument = useDocumentDispatch();
  const updateNode = (changes: Partial<Node>) => {
    dispatchView({ type: "setEditing", editing: { kind: "node", node: { ...node, ...changes } } });
    dispatchDocument({ type: "updateNode", nodeId: node.id, changes });
  };

  return (
    <aside className="editor" onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
      <div className="editor-header">
        <h2>Edit node</h2>
        <button className="close-editor" type="button" onClick={() => dispatchView({ type: "setEditing", editing: null })} aria-label="Close editor">×</button>
      </div>
      <label>
        Label
        <input
          type="text"
          value={node.label}
          onChange={(event) => updateNode({ label: event.target.value })}
        />
      </label>
      <fieldset>
        <legend>Icon</legend>
        <div className="options">
          {isoflowIcons.icons.map((icon) => (
            <button
              className={node.icon.id === icon.id ? "selected" : ""}
              type="button"
              key={icon.id}
              onClick={() => updateNode({ icon })}
              aria-label={`Select ${icon.name} icon`}
            >
              <img src={icon.url} alt={icon.name} />
            </button>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}
