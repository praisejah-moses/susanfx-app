interface LogoProps {
  className?: string;
  height?: number;
}

export default function Logo({ className = "", height }: LogoProps) {
  const imgClasses = height
    ? `h-[${height}px] w-auto`
    : `h-8 w-auto ${className}`;

  return (
    <a href="/" className={`inline-flex items-center ${height ? className : ''}`}>
      <img
        src="/images/shared/logo.svg"
        alt="SusanFX Trader"
        className={imgClasses}
        style={height ? { height: `${height}px`, width: "auto" } : undefined}
      />
    </a>
  );
}
