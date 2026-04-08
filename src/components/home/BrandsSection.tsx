const brandLogos = [
  {
    src: "/images/index/692ed6079186810825794947_Brand Logo Benzinga.svg",
    alt: "Benzinga",
  },
  {
    src: "/images/index/692ed607848b4e056f0413aa_Brand Logo Yahoo.svg",
    alt: "Yahoo Finance",
  },
  {
    src: "/images/index/692ed6075eb327586d0279c7_Brand Logo Nasdaq.svg",
    alt: "Nasdaq",
  },
  {
    src: "/images/index/692ed607044de3f0b708561f_Brand Logo Market.svg",
    alt: "Market Watch",
  },
];

const stats = [
  {
    value: "$16 MILLION",
    label: "Paid in rewards",
    featured: true,
    bg: "/images/index/692fb68556f4c57cd11f7838_Brand Illustration Stats 1.webp",
  },
  {
    value: "$2,180",
    label: "Average Reward",
    featured: false,
    bg: "/images/index/692fb684e7b22e8ba06c538f_Brand Illustration Stats 2.webp",
  },
  {
    value: "250,000+",
    label: "Traders using Sfx Worldwide",
    featured: false,
    bg: "/images/index/692fb6857543d624ec45f782_Brand Illustration Stats 3.webp",
  },
];

export default function BrandsSection() {
  return (
    <section className="py-16 bg-[var(--background-default)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Press logos */}
        <div className="flex flex-wrap justify-center items-center gap-8 mb-14">
          {brandLogos.map((logo) => (
            <img
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              className="h-6 w-auto opacity-60 hover:opacity-90 transition-opacity"
            />
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`relative overflow-hidden rounded-2xl p-8 flex flex-col gap-2 min-h-[160px] ${
                stat.featured
                  ? "border border-[var(--primary-default)]/30"
                  : "border border-[var(--border-normal)]"
              } bg-[var(--background-secondary)]`}
            >
              {/* BG image */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-10"
                style={{ backgroundImage: `url('${stat.bg}')` }}
              />
              <div className="relative z-10">
                <p
                  className={`text-3xl md:text-4xl font-bold ${
                    stat.featured
                      ? "text-[var(--primary-default)]"
                      : "text-[var(--global-text)]"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="text-sm text-[var(--text-white-50)] mt-1">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
