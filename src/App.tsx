import { useLayoutEffect, useRef, useState } from "react";
import { isoflowIcons, type IsoflowIcon } from "./assets/isoflowIcons";

const grid = {
  width: 80,
  height: 50,
};

const midWidth = grid.width / 2;
const midHeight = grid.height / 2;

type Node = {
  id: string;
  x: number;
  y: number;
  label: string;
  icon: IsoflowIcon;
};

type Connection = {
  sourceId: string;
  targetId: string;
};

type ConnectionDraft = {
  sourceId: string;
  pointerPosition: { x: number; y: number };
};

type DragState = {
  node: Node;
  pointerOffset: { x: number; y: number };
};

type PanState = {
  pointerPosition: { x: number; y: number };
  startPosition: { x: number; y: number };
};

type MenuState = {
  isOpen: boolean;
  x: number;
  y: number;
  side: "left" | "right";
  kind: "empty" | "node";
  node?: Node;
};

const labelPaddingX = 4;
const labelPaddingY = 2;

const createNode = (x: number, y: number): Node => ({
  id: crypto.randomUUID(),
  x,
  y,
  label: "New node",
  icon: isoflowIcons.icons[0],
});

function NodeLabel({ label, y }: { label: string; y: number }) {
  const textRef = useRef<SVGTextElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (textRef.current) {
      const { width, height } = textRef.current.getBBox();
      setBox({ width, height });
    }
  }, [label]);

  return (
    <>
      <rect
        className="node-label-bg"
        x={-box.width / 2 - labelPaddingX}
        y={y - box.height / 2 - labelPaddingY}
        width={box.width + labelPaddingX * 2}
        height={box.height + labelPaddingY * 2}
      />
      <text ref={textRef} className="node-label" x="0" y={y}>{label}</text>
    </>
  );
}

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
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

  const snapToIsoGrid = (localX: number, localY: number) => {
    const offsetX = localX - midWidth;
    const offsetY = localY - midHeight;

    const isoU = (offsetX / midWidth + offsetY / midHeight) / 2;
    const isoV = (offsetX / midWidth - offsetY / midHeight) / 2;

    const snappedU = Math.round(isoU);
    const snappedV = Math.round(isoV);

    return {
      x: (snappedU + snappedV) * midWidth + midWidth,
      y: (snappedU - snappedV) * midHeight + midHeight,
    };
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
          onContextMenu={handleSvgContextMenu}
          onDoubleClick={handleSvgDoubleClick}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width={grid.width} height={grid.height} patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x} ${pan.y})`}>
              <path className="grid" d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`} />
            </pattern>
          </defs>
          <rect
            className="grid-surface"
            width="100%"
            height="100%"
            fill="url(#grid)"
            onPointerDown={handleGridPointerDown}
            onPointerMove={handleGridPointerMove}
            onPointerUp={handleGridPointerUp}
          />

          <g transform={`translate(${pan.x} ${pan.y})`}>
            {/* Hover indicator */}
            <path
              className="hover"
              d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`}
              transform={`translate(${hoverPos.x - midWidth} ${hoverPos.y - midHeight})`}
              style={{ opacity: isHovering ? 1 : 0 }}
            />

            {/* Connections */}
            {connections.map((connection) => {
              const source = nodes.find((node) => node.id === connection.sourceId);
              const target = nodes.find((node) => node.id === connection.targetId);
              if (!source || !target) {
                return null;
              }

              return <line className="connection" key={`${connection.sourceId}-${connection.targetId}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} />;
            })}
            {connectionDraft && (() => {
              const source = nodes.find((node) => node.id === connectionDraft.sourceId);
              if (!source) {
                return null;
              }

              return <line className="connection draft" x1={source.x} y1={source.y} x2={connectionDraft.pointerPosition.x} y2={connectionDraft.pointerPosition.y} />;
            })()}

            {/* Menu selection */}
            {menu.isOpen && (
              <path
                className="menu-selection"
                d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`}
                transform={`translate(${menu.x - midWidth} ${menu.y - midHeight})`}
              />
            )}

            {/* Nodes */}
            {nodes.map((node) => (
            <g
              key={node.id}
              className="node"
              transform={`translate(${node.x} ${node.y})`}
            >
              <ellipse cx="0" cy="0" rx={0.3 * midWidth} ry={0.3 * midHeight} stroke="black" fill="white" />
              <line className="node-label-line" y2={-1.3 * grid.height} />
              <image
                className="node-icon"
                href={node.icon.url}
                x={-midWidth}
                y={midHeight - (node.icon.height / node.icon.width * grid.width)}
                width={grid.width}
                preserveAspectRatio="xMidYMax meet"
              />
              <NodeLabel label={node.label} y={-1.3 * grid.height} />
              <path
                className="node-drag-handle"
                d={`M 0 ${-midHeight} L ${midWidth} 0 0 ${midHeight} ${-midWidth} 0 Z`}
                onPointerDown={(event) => handleNodePointerDown(event, node)}
                onPointerMove={handleNodePointerMove}
                onPointerUp={handleNodePointerUp}
                onClick={(event) => handleNodeClick(event, node)}
              />
            </g>
            ))}
          </g>
        </svg>
        {menu.isOpen && (
          <div
            className={`diagram-menu ${menu.side}`}
            style={{ left: menu.x + pan.x, top: menu.y + pan.y }}
            onClick={(event) => event.stopPropagation()}
          >
            {menu.kind === "empty" ? (
              <>
                <button type="button" onClick={handleAddNode}>Add node</button>
                <button type="button">Add text</button>
                <button type="button">Add group</button>
              </>
            ) : (
              <>
                <button type="button" onClick={handleEditNode}>Edit node</button>
                <button type="button" onClick={handleAddConnection}>Add connection</button>
                <button type="button" onClick={handleRemoveNode}>Remove node</button>
              </>
            )}
          </div>
        )}
        {editingNode && (
          <aside className="node-editor" onClick={(event) => event.stopPropagation()}>
            <div className="node-editor-header">
              <h2>Edit node</h2>
              <button className="close-editor" type="button" onClick={() => setEditingNode(null)} aria-label="Close editor">×</button>
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
      </section>
    </>
  )
}
