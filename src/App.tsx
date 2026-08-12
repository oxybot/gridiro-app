import { useState } from "react";

const grid = {
  width: 80,
  height: 60,
};

const midWidth = grid.width / 2;
const midHeight = grid.height / 2;

type Node = {
  x: number;
  y: number;
};

type MenuState = {
  isOpen: boolean;
  x: number;
  y: number;
  side: "left" | "right";
  kind: "empty" | "node";
  node?: Node;
};

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [menu, setMenu] = useState<MenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    side: "left" as "left" | "right",
    kind: "empty",
  });

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

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const snappedPoint = snapToIsoGrid(localX, localY);
    const side = snappedPoint.x > 2 * rect.width / 3 ? "right" : "left";
    const node = nodes.find((currentNode) => currentNode.x === snappedPoint.x && currentNode.y === snappedPoint.y);

    setHoverPos(snappedPoint);
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
    setNodes((previousNodes) => [...previousNodes, { x: menu.x, y: menu.y }]);
    closeMenu();
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
        <h1>Welcome to the Gridiro Hackathon App</h1>
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
              style={{ opacity: isHovering ? 1 : 0 }}
            />
          )}


          {/* Nodes */}
          {nodes.map((node, index) => (
            <g key={index} transform={`translate(${node.x} ${node.y})`}>
              <ellipse cx="0" cy="0" rx={0.3 * midWidth} ry={0.3 * midHeight} stroke="black" fill="white" />
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
                <button type="button">Edit node</button>
                <button type="button" onClick={handleRemoveNode}>Remove node</button>
              </>
            )}
          </div>
        )}
      </section>
    </>
  )
}
