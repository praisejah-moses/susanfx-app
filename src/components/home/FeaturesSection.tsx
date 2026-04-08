import IconMask from "../ui/IconMask";
import Button from "../ui/Button";

const TROPHY_ICON =
  "https://cdn.prod.website-files.com/692d3a3e37a293dd19f3b43e/692e4659e7e3af88f0bdb7d5_icon-trophy.webp";
const ARROW_ICON =
  "https://cdn.prod.website-files.com/692d3a3e37a293dd19f3b43e/692e4659e7e3af88f0bdb7d8_icon-arrow-right.webp";

const featureCards = [
  {
    title: "100% Profit Split Available",
    desc: "Get Paid within 24 hours or we pay an extra $1000",
    bg: "/images/index/6980681c5a01f1fccbe6229f_Card Feature BG New 1.webp",
  },
  {
    title: "Reward Guarantee",
    desc: "Get Paid within 2 business days or we pay an extra $1000",
    bg: "/images/index/6980681cf44b747475a9fe98_Card Feature BG New 2.webp",
  },
  {
    title: "Paid on Demand Available",
    desc: "Get Paid within 24 hours or we pay an extra $1000",
    bg: "/images/index/6980681c1fa0e662b4f14744_Card Feature BG New 3.webp",
  },
];

const withdrawCards = [
  {
    logo: "/images/index/69328362c2661d2765d00bad_Skrill Logo Big.svg",
    label: "REWARDS WITH SKRILL",
    desc: "Fast & secure withdrawals via Skrill",
  },
  {
    logo: "/images/index/69328362e6cb3a7ef6c7883f_Rise Logo Big.svg",
    label: "REWARDS WITH RISE",
    desc: "Instant payouts with Rise platform",
  },
  {
    logo: "/images/index/693283627c96b8c9233f3cbf_Crypto Logo Big.svg",
    label: "CRYPTO",
    desc: "Withdraw rewards in cryptocurrency",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-[var(--background-default)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top heading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--global-text)] leading-tight">
              Trading
              <br />
              <span className="text-[var(--text-white-50)]">
                But with less risk
              </span>
              <br />
              With More Capital
              <br />
              And More Reward
            </h2>
          </div>
          <div className="flex flex-col gap-4 justify-center">
            <p className="text-[var(--text-white-50)] text-lg">
              Simulated Capital with Real Rewards. Paid Fast &amp; Secure.
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <Button
                as="a"
                href="#get-funded"
                variant="featured"
                className="gap-2"
              >
                Get Funded
                <IconMask
                  url={ARROW_ICON}
                  size="0.9rem"
                  color="var(--primary-text)"
                />
              </Button>
              <span className="text-sm text-[var(--text-white-50)]">
                Join 240,000+ Traders
              </span>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className="relative overflow-hidden rounded-2xl p-6 min-h-[200px] flex flex-col justify-end border border-[var(--border-normal)]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${card.bg}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10">
                <p className="font-bold text-[var(--global-text)] text-base mb-1">
                  {card.title}
                </p>
                <p className="text-sm text-[var(--text-white-50)]">
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Withdraw section */}
        <div className="bg-[var(--background-secondary)] border border-[var(--border-normal)] rounded-2xl p-8">
          <div className="text-center mb-6">
            <p className="text-3xl font-bold text-[var(--global-text)] mb-1">
              $16,000,000+ Paid to Traders
            </p>
            <p className="text-[var(--text-white-50)]">Withdraw with…</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {withdrawCards.map((w) => (
              <div
                key={w.label}
                className="flex flex-col items-center gap-3 bg-[var(--background-default)] border border-[var(--border-normal)] rounded-xl p-5 text-center"
              >
                <img src={w.logo} alt={w.label} className="h-8 w-auto" />
                <p className="text-xs font-bold text-[var(--global-text)] uppercase tracking-wide">
                  {w.label}
                </p>
                <p className="text-xs text-[var(--text-white-50)]">{w.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <Button
              as="a"
              href="#get-funded"
              variant="featured"
              className="text-base px-8 py-3 gap-2"
            >
              Get Funded
            </Button>
            <div className="flex items-center gap-2 text-sm text-[var(--global-text)]">
              <IconMask
                url={TROPHY_ICON}
                size="1rem"
                color="var(--primary-default)"
              />
              Reward Guaranteed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
