// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import { useEffect, useState, type MouseEvent } from "react";
import type { IsoflowIcon } from "../assets/isoflowIcons";
import type { Node } from "../model/types";
import { useDocumentDispatch, useViewDispatch } from "../state";

type NodeEditorProps = {
  node: Node;
};

export function NodeEditor({ node }: NodeEditorProps) {
  const dispatchView = useViewDispatch();
  const dispatchDocument = useDocumentDispatch();
  // Loaded on demand so the full icon set isn't fetched/parsed until the editor opens.
  const [icons, setIcons] = useState<IsoflowIcon[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("../assets/isoflowIcons").then((module) => {
      if (!cancelled) setIcons(module.isoflowIcons.icons);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const updateNode = (changes: Partial<Node>) => {
    dispatchView({ type: "setEditing", editing: { kind: "node", node: { ...node, ...changes } } });
    dispatchDocument({ type: "previewUpdateNode", nodeId: node.id, changes });
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
            onFocus={() => dispatchDocument({ type: "startEdit" })}
            onBlur={() => dispatchDocument({ type: "finishEdit" })}
          onChange={(event) => updateNode({ label: event.target.value })}
        />
      </label>
      <fieldset>
        <legend>Icon</legend>
        <div className="options options-icons">
          {icons?.map((icon) => (
            <button
              className={node.icon.id === icon.id ? "selected" : ""}
              type="button"
              key={icon.id}
              onClick={() => {
                dispatchDocument({ type: "startEdit" });
                updateNode({ icon });
                dispatchDocument({ type: "finishEdit" });
              }}
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
