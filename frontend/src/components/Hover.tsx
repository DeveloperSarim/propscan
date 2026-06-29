import { createElement, useState } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";

interface HoverProps {
  as?: ElementType;
  style?: CSSProperties;
  styleHover?: CSSProperties;
  children?: ReactNode;
  [key: string]: unknown;
}

/**
 * Polymorphic element that merges `styleHover` over `style` while hovered —
 * the React equivalent of the design's `style-hover="..."` attribute.
 */
export function Hover({ as = "div", style, styleHover, children, ...rest }: HoverProps) {
  const [hover, setHover] = useState(false);
  return createElement(
    as,
    {
      style: hover && styleHover ? { ...style, ...styleHover } : style,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      ...rest,
    },
    children,
  );
}
