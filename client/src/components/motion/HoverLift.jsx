import { useState } from "react";
import { useSpring } from "../../hooks/useSpring";
import { useHoverEnabled } from "../../hooks/useHoverEnabled";

// Spring-driven hover lift/scale, disabled on touch. `as` can be any
// component or DOM tag (e.g. React Router's <Link>).
export default function HoverLift({
  as: Tag = "div",
  liftY = -4,
  scale = 1,
  tension = 300,
  friction = 22,
  className = "",
  style,
  children,
  ...rest
}) {
  const hoverEnabled = useHoverEnabled();
  const [hovered, setHovered] = useState(false);
  const spring = useSpring(hovered && hoverEnabled ? { y: liftY, scale } : { y: 0, scale: 1 }, { tension, friction });

  return (
    <Tag
      className={className}
      style={{ ...style, transform: `translateY(${spring.y}px) scale(${spring.scale})` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
