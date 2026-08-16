import { createNode } from "../model/node";
import { createText } from "../model/text";
import { createSurface } from "../model/surface";
import { zoomLevels } from "../model/geometry";
import { useDocumentDispatch, useViewDispatch, useViewState } from "../state/DiagramProvider";

export function ContextMenu() {
  const view = useViewState();
  const dispatchView = useViewDispatch();
  const dispatchDocument = useDocumentDispatch();
  const { menu, pan } = view;
  const zoom = zoomLevels[view.zoomIndex];
  const closeMenu = () => dispatchView({ type: "closeMenu" });

  if (!menu.isOpen) return null;

  return (
    <div
      className={`diagram-menu ${menu.side}`}
      style={{ left: menu.x * zoom + pan.x, top: menu.y * zoom + pan.y }}
      onClick={(event) => event.stopPropagation()}
    >
      {menu.kind === "empty" ? (
        <>
          <button type="button" onClick={() => { dispatchDocument({ type: "addNode", node: createNode(menu.x, menu.y) }); closeMenu(); }}>Add node</button>
          <button type="button" onClick={() => { dispatchDocument({ type: "addText", text: createText(menu.x, menu.y) }); closeMenu(); }}>Add text</button>
          <button type="button" onClick={() => { dispatchDocument({ type: "addSurface", surface: createSurface(menu.x, menu.y) }); closeMenu(); }}>Add surface</button>
        </>
      ) : menu.kind === "node" ? (
        <>
          <button type="button" onClick={() => { if (menu.node) dispatchView({ type: "setEditing", editing: { kind: "node", node: menu.node } }); closeMenu(); }}>Edit node</button>
          <button type="button" onClick={() => { if (menu.node) dispatchView({ type: "setConnectionDraft", connectionDraft: { sourceId: menu.node.id, pointerPosition: { x: menu.node.x, y: menu.node.y } } }); closeMenu(); }}>Add connection</button>
          <button type="button" onClick={() => { if (menu.node) dispatchDocument({ type: "removeNode", nodeId: menu.node.id }); closeMenu(); }}>Remove node</button>
        </>
      ) : menu.kind === "text" ? (
        <>
          <button type="button" onClick={() => { if (menu.text) dispatchView({ type: "setEditing", editing: { kind: "text", text: menu.text } }); closeMenu(); }}>Edit text</button>
          <button type="button" onClick={() => { if (menu.text) dispatchDocument({ type: "removeText", textId: menu.text.id }); closeMenu(); }}>Remove text</button>
        </>
      ) : menu.kind === "surface" ? (
        <>
          <button type="button" onClick={() => { if (menu.surface) dispatchView({ type: "setEditing", editing: { kind: "surface", surface: menu.surface } }); closeMenu(); }}>Edit surface</button>
          <button type="button" onClick={() => { if (menu.surface) dispatchDocument({ type: "removeSurface", surfaceId: menu.surface.id }); closeMenu(); }}>Remove surface</button>
        </>
      ) : (
        <>
          <button type="button" onClick={() => { if (menu.connection) dispatchView({ type: "setEditing", editing: { kind: "connection", connection: menu.connection } }); closeMenu(); }}>Edit connection</button>
          <button type="button" onClick={() => { if (menu.connection) dispatchDocument({ type: "removeConnection", connectionId: menu.connection.id }); closeMenu(); }}>Remove connection</button>
        </>
      )}
    </div>
  );
}
