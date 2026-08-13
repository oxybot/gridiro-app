import { useLayoutEffect, useRef, useState } from "react";
import { isoflowIcons, type IsoflowIcon } from "./assets/isoflowIcons";

const grid = {
  width: 80,
  height: 50,
};

const midWidth = grid.width / 2;
const midHeight = grid.height / 2;

type Node = {
  x: number;
  y: number;
  label: string;
  icon: IsoflowIcon;
};

type DragState = {
  node: Node;
  pointerOffset: { x: number; y: number };
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
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [draggingNode, setDraggingNode] = useState<DragState | null>(null);
  const didDragRef = useRef(false);
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

    setHoverPos(snapToIsoGrid(localX, localY));
  };

  const getPointerPosition = (event: React.PointerEvent<SVGElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) {
      return null;
    }

    const rect = svg.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handleNodePointerDown = (event: React.PointerEvent<SVGGElement>, node: Node) => {
    event.stopPropagation();
    const pointerPosition = getPointerPosition(event);
    if (!pointerPosition) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    didDragRef.current = false;
    setDraggingNode({
      node,
      pointerOffset: { x: pointerPosition.x - node.x, y: pointerPosition.y - node.y },
    });
    closeMenu();
  };

  const handleNodePointerMove = (event: React.PointerEvent<SVGGElement>) => {
    if (!draggingNode) {
      return;
    }

    const pointerPosition = getPointerPosition(event);
    if (!pointerPosition) {
      return;
    }

    const snappedPoint = snapToIsoGrid(
      pointerPosition.x - draggingNode.pointerOffset.x,
      pointerPosition.y - draggingNode.pointerOffset.y,
    );
    if (snappedPoint.x === draggingNode.node.x && snappedPoint.y === draggingNode.node.y) {
      return;
    }

    didDragRef.current = true;
    const updatedNode = { ...draggingNode.node, ...snappedPoint };
    setDraggingNode({ ...draggingNode, node: updatedNode });
    setNodes((previousNodes) =>
      previousNodes.map((node) => node === draggingNode.node ? updatedNode : node),
    );
  };

  const handleNodePointerUp = (event: React.PointerEvent<SVGGElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDraggingNode(null);
  };

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    event.stopPropagation();

    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const snappedPoint = snapToIsoGrid(localX, localY);
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

  const closeMenu = () => {
    setMenu((previous) => ({ ...previous, isOpen: false }));
  };

  const handleAddNode = () => {
    setNodes((previousNodes) => [...previousNodes, { x: menu.x, y: menu.y, label: "New node", icon: isoflowIcons.icons[0] }]);
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
      previousNodes.map((node) => node.x === editingNode.x && node.y === editingNode.y ? updatedNode : node),
    );
  };

  const handleRemoveNode = () => {
    if (!menu.node) {
      return;
    }

    setNodes((previousNodes) =>
      previousNodes.filter((node) => node.x !== menu.node?.x || node.y !== menu.node?.y),
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
          onClick={handleSvgClick}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width={grid.width} height={grid.height} patternUnits="userSpaceOnUse">
              <path className="grid" d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Hover indicator */}
          <path
            className="hover"
            d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`}
            transform={`translate(${hoverPos.x - midWidth} ${hoverPos.y - midHeight})`}
            style={{ opacity: isHovering ? 1 : 0 }}
          />

          {/* Menu selection */}
          {menu.isOpen && (
            <path
              className="menu-selection"
              d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`}
              transform={`translate(${menu.x - midWidth} ${menu.y - midHeight})`}
            />
          )}

          {/* Nodes */}
          {nodes.map((node, index) => (
            <g
              key={index}
              className="node"
              transform={`translate(${node.x} ${node.y})`}
              onPointerDown={(event) => handleNodePointerDown(event, node)}
              onPointerMove={handleNodePointerMove}
              onPointerUp={handleNodePointerUp}
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
            </g>
          ))}
        </svg>
        {menu.isOpen && (
          <div
            className={`diagram-menu ${menu.side}`}
            style={{ left: menu.x, top: menu.y }}
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
