import { useInView } from "../../hooks/useInView";
import { useSpring } from "../../hooks/useSpring";

// Fade+rise entrance, played once when the element scrolls into view -
// the "Inview" primitive used for cards, list rows, and stat cells.
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  tension = 200,
  friction = 26,
  className = "",
  style,
  as: Tag = "div",
  ...rest
}) {
  const [ref, inView] = useInView({ delay });
  const values = useSpring(inView ? { opacity: 1, y: 0 } : { opacity: 0, y }, { tension, friction });

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ ...style, opacity: values.opacity, transform: `translateY(${values.y}px)` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
