import { NodeEditor } from "./NodeEditor";
import { TextEditor } from "./TextEditor";
import { SurfaceEditor } from "./SurfaceEditor";
import { ConnectionEditor } from "./ConnectionEditor";
import { useViewState } from "../state/DiagramProvider";

export function ElementEditor() {
  const { editing } = useViewState();

  if (!editing) return null;

  switch (editing.kind) {
    case "node":
      return <NodeEditor node={editing.node} />;
    case "text":
      return <TextEditor text={editing.text} />;
    case "surface":
      return <SurfaceEditor surface={editing.surface} />;
    case "connection":
      return <ConnectionEditor connection={editing.connection} />;
  }
}
