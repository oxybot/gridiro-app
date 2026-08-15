import { useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import type { TextElement } from "../diagramTypes";
import { grid } from "../diagramGeometry";

const textPaddingX = 6;
const textPaddingY = 4;

type DiagramTextLabelProps = {
  text: TextElement;
  selected: boolean;
  onPointerDown: (event: PointerEvent<SVGRectElement>) => void;
  onPointerMove: (event: PointerEvent<SVGRectElement>) => void;
  onPointerUp: (event: PointerEvent<SVGRectElement>) => void;
  onContextMenu: (event: MouseEvent<SVGRectElement>) => void;
};

export function DiagramTextLabel({ text, selected, onPointerDown, onPointerMove, onPointerUp, onContextMenu }: DiagramTextLabelProps) {
  const textRef = useRef<SVGTextElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (textRef.current) {
      const { width, height } = textRef.current.getBBox();
      setBox({ width, height });
    }
  }, [text.content, text.size]);

  return (
    <g transform={`scale(1 ${grid.height / grid.width}) rotate(${text.orientation === "horizontal" ? 45 : -45})`}>
      <rect
        className="text-label-bg"
        x={-box.width / 2 - textPaddingX}
        y={-box.height / 2 - textPaddingY}
        width={box.width + textPaddingX * 2}
        height={box.height + textPaddingY * 2}
      />
      <text ref={textRef}
        className={`text-label text-label-${text.size}`}
        x="0" y="0">
        {text.content}
      </text>
      <rect
        className="menu-selection"
        x={-box.width / 2 - textPaddingX}
        y={-box.height / 2 - textPaddingY}
        width={box.width + textPaddingX * 2}
        height={box.height + textPaddingY * 2}
        style={{ opacity: selected ? 1 : 0 }}
      />
      <rect
        className="drag-handle"
        x={-box.width / 2 - textPaddingX}
        y={-box.height / 2 - textPaddingY}
        width={box.width + textPaddingX * 2}
        height={box.height + textPaddingY * 2}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onContextMenu={onContextMenu}
      />
    </g>
  );
}
