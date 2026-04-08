import IconMask from "../ui/IconMask";

const platforms = [
  {
    src: "/images/index/698a9ae1710dbd90c0a79baa_Platform meta trader Big 1.webp",
    alt: "MetaTrader 5 trading platform logo",
  },
  {
    src: "/images/index/698a9b282501a0ac03aafc68_Platform Tradelocker Big 1.webp",
    alt: "TradeLocker logo",
  },
  {
    src: "/images/index/698a992ab1779b4fb0a5146f_Platform volumetrical Big 1.webp",
    alt: "Volumetric Trading logo",
  },
  {
    src: "/images/index/698a9c9f94f281caca7539f6_Platform match trader Big 1.webp",
    alt: "Match Trader platform logo",
  },
  {
    src: "/images/index/698a9cd5f14f18ecc2bd502e_Platform CTrader Big 1.webp",
    alt: "cTrader logo",
  },
];

const features = [
  {
    icon: "https://cdn.prod.website-files.com/692d3a3e37a293dd19f3b43e/69378a34fe245ff4e73f724e_icon-lightning.webp",
    label: "Lightning fast execution",
  },
  {
    icon: "https://cdn.prod.website-files.com/692d3a3e37a293dd19f3b43e/69378a341dd979d7cb006bd9_icon-cross-arrow.webp",
    label: "Raw Spreads from 0.1 pips",
  },
  {
    icon: "https://cdn.prod.website-files.com/692d3a3e37a293dd19f3b43e/69378a34543185a64a97e1b1_icon-bitcoin.webp",
    label: "0$ commissions on indices and cryptos",
  },
];

export default function PlatformSection() {
  return (
    <section className="py-20 bg-[var(--background-default)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--global-text)]">
            Trade with your favorite{" "}
            <span className="text-[var(--primary-default)]">
              Trading Platforms
            </span>
          </h2>
        </div>

        {/* Platform logo grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {platforms.map((p) => (
            <div
              key={p.src}
              className="flex items-center justify-center bg-[var(--background-secondary)] border border-[var(--border-normal)] rounded-xl overflow-hidden p-2 h-24"
            >
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>

        {/* Trade on */}
        <p className="text-sm font-semibold text-center text-[var(--global-text)] mb-8">
          Trade on:{" "}
          <span className="text-[var(--text-white-50)]">
            FX pairs / stocks / ETFs / crypto pairs
          </span>
        </p>

        {/* Feature bullets */}
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <IconMask
                url={f.icon}
                size="1.25rem"
                color="var(--primary-default)"
              />
              <span className="font-semibold text-[var(--global-text)]">
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
