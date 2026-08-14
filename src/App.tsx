import { useEffect, useState } from "react";
import { isoflowIcons } from "./assets/isoflowIcons";
import { DiagramCanvas } from "./components/DiagramCanvas";
import { DiagramOverlays } from "./components/DiagramOverlays";
import type { Connection, ConnectionDraft, MenuState, Node } from "./diagramTypes";
import { snapToIsoGrid } from "./diagramGeometry";

type DragState = {
  node: Node;
  pointerOffset: { x: number; y: number };
};

type PanState = {
  pointerPosition: { x: number; y: number };
  startPosition: { x: number; y: number };
};

const diagramStorageKey = "gridiro-diagram";

type StoredDiagram = {
  nodes: Node[];
  connections: Connection[];
};

const loadDiagram = (): StoredDiagram => {
  try {
    const storedDiagram = localStorage.getItem(diagramStorageKey);
    if (!storedDiagram) {
      return { nodes: [], connections: [] };
    }

    const diagram = JSON.parse(storedDiagram) as StoredDiagram;
    if (!Array.isArray(diagram.nodes) || !Array.isArray(diagram.connections)) {
      return { nodes: [], connections: [] };
    }

    return diagram;
  } catch {
    return { nodes: [], connections: [] };
  }
};

const createNode = (x: number, y: number): Node => ({
  id: crypto.randomUUID(),
  x,
  y,
  label: "New node",
  icon: isoflowIcons.icons[0],
});

export default function App() {
  const [diagram, setDiagram] = useState<StoredDiagram>(loadDiagram);
  const { nodes, connections } = diagram;
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [draggingNode, setDraggingNode] = useState<DragState | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState<PanState | null>(null);
  const [connectionDraft, setConnectionDraft] = useState<ConnectionDraft | null>(null);
  const [menu, setMenu] = useState<MenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    side: "left" as "left" | "right",
    kind: "empty",
  });
  const [editingNode, setEditingNode] = useState<Node | null>(null);

  useEffect(() => {
    localStorage.setItem(diagramStorageKey, JSON.stringify(diagram));
  }, [diagram]);

  const setNodes = (update: Node[] | ((nodes: Node[]) => Node[])) => {
    setDiagram((previousDiagram) => ({
      ...previousDiagram,
      nodes: typeof update === "function" ? update(previousDiagram.nodes) : update,
    }));
  };

  const setConnections = (update: Connection[] | ((connections: Connection[]) => Connection[])) => {
    setDiagram((previousDiagram) => ({
      ...previousDiagram,
      connections: typeof update === "function" ? update(previousDiagram.connections) : update,
    }));
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;

    setHoverPos(snapToIsoGrid(localX - pan.x, localY - pan.y));
    if (connectionDraft) {
      setConnectionDraft({
        ...connectionDraft,
        pointerPosition: { x: localX - pan.x, y: localY - pan.y },
      });
    }
  };

  const getPointerPosition = (event: React.PointerEvent<SVGElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) {
      return null;
    }

    const rect = svg.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const getGridPosition = (event: React.PointerEvent<SVGElement>) => {
    const pointerPosition = getPointerPosition(event);
    if (!pointerPosition) {
      return null;
    }

    return { x: pointerPosition.x - pan.x, y: pointerPosition.y - pan.y };
  };

  const handleGridPointerDown = (event: React.PointerEvent<SVGRectElement>) => {
    if (event.button !== 0) {
      return;
    }

    if (connectionDraft) {
      setConnectionDraft(null);
      return;
    }

    const pointerPosition = getPointerPosition(event);
    if (!pointerPosition) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setPanning({ pointerPosition, startPosition: pan });
    closeMenu();
  };

  const handleGridPointerMove = (event: React.PointerEvent<SVGRectElement>) => {
    if (!panning) {
      return;
    }

    const pointerPosition = getPointerPosition(event);
    if (!pointerPosition) {
      return;
    }

    setPan({
      x: panning.startPosition.x + pointerPosition.x - panning.pointerPosition.x,
      y: panning.startPosition.y + pointerPosition.y - panning.pointerPosition.y,
    });
  };

  const handleGridPointerUp = (event: React.PointerEvent<SVGRectElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setPanning(null);
  };

  const handleNodePointerDown = (event: React.PointerEvent<SVGPathElement>, node: Node) => {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();
    if (connectionDraft) {
      return;
    }

    const gridPosition = getGridPosition(event);
    if (!gridPosition) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingNode({
      node,
      pointerOffset: { x: gridPosition.x - node.x, y: gridPosition.y - node.y },
    });
    closeMenu();
  };

  const handleNodePointerMove = (event: React.PointerEvent<SVGPathElement>) => {
    if (!draggingNode) {
      return;
    }

    const gridPosition = getGridPosition(event);
    if (!gridPosition) {
      return;
    }

    const snappedPoint = snapToIsoGrid(
      gridPosition.x - draggingNode.pointerOffset.x,
      gridPosition.y - draggingNode.pointerOffset.y,
    );
    if (snappedPoint.x === draggingNode.node.x && snappedPoint.y === draggingNode.node.y) {
      return;
    }

    const updatedNode = { ...draggingNode.node, ...snappedPoint };
    setDraggingNode({ ...draggingNode, node: updatedNode });
    setNodes((previousNodes) =>
      previousNodes.map((node) => node === draggingNode.node ? updatedNode : node),
    );
  };

  const handleNodePointerUp = (event: React.PointerEvent<SVGPathElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDraggingNode(null);
  };

  const handleNodeClick = (event: React.MouseEvent<SVGPathElement>, node: Node) => {
    event.stopPropagation();
    if (!connectionDraft || node.id === connectionDraft.sourceId) {
      return;
    }

    setConnections((previousConnections) => {
      const connectionExists = previousConnections.some((connection) =>
        (connection.sourceId === connectionDraft.sourceId && connection.targetId === node.id)
        || (connection.sourceId === node.id && connection.targetId === connectionDraft.sourceId),
      );
      if (connectionExists) {
        return previousConnections;
      }

      return [...previousConnections, { sourceId: connectionDraft.sourceId, targetId: node.id }];
    });
    setConnectionDraft(null);
  };

  const handleSvgContextMenu = (event: React.MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const snappedPoint = snapToIsoGrid(localX - pan.x, localY - pan.y);
    const side = snappedPoint.x > 2 * rect.width / 3 ? "right" : "left";
    const node = nodes.find((currentNode) => currentNode.x === snappedPoint.x && currentNode.y === snappedPoint.y);

    setHoverPos(snappedPoint);
    setEditingNode(null);
    setMenu({
      isOpen: true,
      x: snappedPoint.x,
      y: snappedPoint.y,
      side,
      kind: node ? "node" : "empty",
      node,
    });
  };

  const handleSvgDoubleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const snappedPoint = snapToIsoGrid(
      event.clientX - rect.left - pan.x,
      event.clientY - rect.top - pan.y,
    );

    setNodes((previousNodes) => {
      const hasNode = previousNodes.some((node) => node.x === snappedPoint.x && node.y === snappedPoint.y);
      if (hasNode) {
        return previousNodes;
      }

      return [...previousNodes, createNode(snappedPoint.x, snappedPoint.y)];
    });
    setHoverPos(snappedPoint);
    setEditingNode(null);
    closeMenu();
  };

  const closeMenu = () => {
    setMenu((previous) => ({ ...previous, isOpen: false }));
  };

  const handleAddNode = () => {
    setNodes((previousNodes) => [...previousNodes, createNode(menu.x, menu.y)]);
    closeMenu();
  };

  const handleAddConnection = () => {
    if (!menu.node) {
      return;
    }

    setConnectionDraft({
      sourceId: menu.node.id,
      pointerPosition: { x: menu.node.x, y: menu.node.y },
    });
    closeMenu();
  };

  const handleEditNode = () => {
    if (menu.node) {
      setEditingNode(menu.node);
      closeMenu();
    }
  };

  const updateEditingNode = (changes: Partial<Node>) => {
    if (!editingNode) {
      return;
    }

    const updatedNode = { ...editingNode, ...changes };
    setEditingNode(updatedNode);
    setNodes((previousNodes) =>
      previousNodes.map((node) => node.id === editingNode.id ? updatedNode : node),
    );
  };

  const handleRemoveNode = () => {
    if (!menu.node) {
      return;
    }

    setNodes((previousNodes) =>
      previousNodes.filter((node) => node.id !== menu.node?.id),
    );
    setConnections((previousConnections) =>
      previousConnections.filter((connection) => connection.sourceId !== menu.node?.id && connection.targetId !== menu.node?.id),
    );
    closeMenu();
  };

  return (
    <>
      <section>
        <h1>Gridiro Hackathon App</h1>
      </section>
      <section className="diagram" onClick={closeMenu}>
        <DiagramCanvas
          nodes={nodes}
          connections={connections}
          hoverPos={hoverPos}
          isHovering={isHovering}
          pan={pan}
          connectionDraft={connectionDraft}
          menu={menu}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
          onContextMenu={handleSvgContextMenu}
          onDoubleClick={handleSvgDoubleClick}
          onGridPointerDown={handleGridPointerDown}
          onGridPointerMove={handleGridPointerMove}
          onGridPointerUp={handleGridPointerUp}
          onNodePointerDown={handleNodePointerDown}
          onNodePointerMove={handleNodePointerMove}
          onNodePointerUp={handleNodePointerUp}
          onNodeClick={handleNodeClick}
        />
        <DiagramOverlays
          menu={menu}
          pan={pan}
          editingNode={editingNode}
          onAddNode={handleAddNode}
          onEditNode={handleEditNode}
          onAddConnection={handleAddConnection}
          onRemoveNode={handleRemoveNode}
          onSetEditingNode={setEditingNode}
          onUpdateEditingNode={updateEditingNode}
        />
      </section>
    </>
  );
}
