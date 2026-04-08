interface LogoProps {
  className?: string;
  height?: number;
}

export default function Logo({ className = "", height = 32 }: LogoProps) {
  return (
    <a href="/" className={`inline-flex items-center ${className}`}>
      <img
        src="/images/shared/logo.png"
        alt="SusanFX Trader"
        height={height}
        style={{ height: `${height}px`, width: "auto" }}
      />
    </a>
  );
}
