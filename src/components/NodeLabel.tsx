import { useLayoutEffect, useRef, useState } from "react";

const labelPaddingX = 4;
const labelPaddingY = 2;

export function NodeLabel({ label, y }: { label: string; y: number }) {
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
