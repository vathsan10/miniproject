import { useEffect, useState } from "react";

// Splits text into words, each wrapped in an overflow-hidden clip box;
// the inner span slides up from translateY(115%)/opacity:0 to
// translateY(0)/opacity:1, staggered per word - the clip-mask reveal
// used for every heading. Re-fires whenever `text` changes (e.g. a
// carousel swapping captions).
export default function RevealText({
  text,
  as: Tag = "span",
  wordStagger = 90,
  duration = 800,
  delay = 0,
  className = "",
  style,
  play = true,
}) {
  const [visible, setVisible] = useState(false);
  const words = text.split(" ");

  useEffect(() => {
    setVisible(false);
    if (!play) return;
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [text, play]);

  return (
    <Tag className={className} style={style}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            overflow: "hidden",
            paddingBottom: "0.14em",
            marginBottom: "-0.14em",
            verticalAlign: "top",
          }}
        >
          <span
            style={{
              display: "inline-block",
              transform: visible ? "translateY(0)" : "translateY(115%)",
              opacity: visible ? 1 : 0,
              transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * wordStagger}ms, opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * wordStagger}ms`,
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
