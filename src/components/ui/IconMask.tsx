interface IconMaskProps {
  url: string;
  size?: string;
  className?: string;
  color?: string;
}

export default function IconMask({
  url,
  size = "1.25rem",
  className = "",
  color,
}: IconMaskProps) {
  return (
    <span
      className={`icon-mask inline-block shrink-0 ${className}`}
      style={{
        maskImage: `url('${url}')`,
        WebkitMaskImage: `url('${url}')`,
        width: size,
        height: size,
        backgroundColor: color || "currentColor",
      }}
    />
  );
}
