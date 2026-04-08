import IconMask from "../ui/IconMask";
import Button from "../ui/Button";

const SHIELD_ICON =
  "https://cdn.prod.website-files.com/692d3a3e37a293dd19f3b43e/692e4659e7e3af88f0bdb7dd_icon-shield.webp";
const ARROW_RIGHT_ICON =
  "https://cdn.prod.website-files.com/692d3a3e37a293dd19f3b43e/692e4659e7e3af88f0bdb7d8_icon-arrow-right.webp";

const steps = [
  {
    img: "/images/index/693240330f7b6093e29534ef_HIW Unlock Capital.webp",
    title: "Unlock capital",
    desc: "Get Funded with our Capital",
    arrow: true,
  },
  {
    img: "/images/index/69324141d05b4552cc696e90_HIW Trade.webp",
    title: "trade",
    desc: "Trade with your favorite Trading Platform",
    arrow: true,
  },
  {
    img: "/images/index/69324034f3b026991c768053_HIW Earn.webp",
    title: "Earn",
    desc: "Withdraw 100% of your profits",
    arrow: false,
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-[var(--background-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[var(--background-default)] border border-[var(--border-normal)] rounded-full px-4 py-2 text-sm text-[var(--global-text)]">
            <IconMask
              url={SHIELD_ICON}
              size="1rem"
              color="var(--primary-default)"
            />
            Trading Revolutionized. Don't Risk your own Money
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-5">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--global-text)] mb-3">
            How It Works
          </h2>
          <p className="text-[var(--text-white-50)] max-w-xl mx-auto">
            Trade with our simulated Capital and get paid real Rewards
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 mb-10">
          {steps.map((step) => (
            <div key={step.title} className="flex items-center">
              <div className="flex flex-col items-center bg-[var(--background-default)] border border-[var(--border-normal)] rounded-2xl p-6 gap-4 w-64 text-center">
                <img
                  src={step.img}
                  alt={step.title}
                  className="w-28 h-28 object-contain rounded-xl"
                />
                <div>
                  <p className="font-bold text-[var(--global-text)] capitalize text-lg">
                    {step.title}
                  </p>
                  <p className="text-sm text-[var(--text-white-50)] mt-1">
                    {step.desc}
                  </p>
                </div>
              </div>
              {step.arrow && (
                <div className="hidden md:flex mx-2">
                  <IconMask
                    url={ARROW_RIGHT_ICON}
                    size="1.5rem"
                    color="var(--primary-default)"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="flex flex-col items-center gap-3">
          <Button
            as="a"
            href="#get-funded"
            variant="featured"
            className="text-base px-8 py-3"
          >
            Get Funded
          </Button>
          <p className="text-xs text-[var(--text-white-50)]">
            You're not liable for any losses.
          </p>
        </div>
      </div>
    </section>
  );
}
