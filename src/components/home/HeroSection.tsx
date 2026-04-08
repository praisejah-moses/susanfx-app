import IconMask from "../ui/IconMask";
import Button from "../ui/Button";

const PEOPLE_ICON =
  "https://cdn.prod.website-files.com/692d3a3e37a293dd19f3b43e/692e4659e7e3af88f0bdb7e7_icon-people.webp";
const STARS_ICON =
  "https://cdn.prod.website-files.com/692d3a3e37a293dd19f3b43e/692e4659e7e3af88f0bdb7e0_icon-stars.webp";
const ARROW_ICON =
  "https://cdn.prod.website-files.com/692d3a3e37a293dd19f3b43e/692e4659e7e3af88f0bdb7d8_icon-arrow-right.webp";
const TROPHY_ICON =
  "https://cdn.prod.website-files.com/692d3a3e37a293dd19f3b43e/692e4659e7e3af88f0bdb7d5_icon-trophy.webp";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 bg-[var(--background-default)] overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--background-default)] via-[#0f0f0f] to-[#111] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="flex flex-col gap-6">
            {/* Rating badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-[var(--background-secondary)] border border-[var(--border-normal)] rounded-full px-4 py-2 text-sm text-[var(--global-text)]">
                <IconMask
                  url={PEOPLE_ICON}
                  size="1rem"
                  color="var(--primary-default)"
                />
                <span>
                  250K+{" "}
                  <span className="text-[var(--primary-default)] font-semibold">
                    Traders
                  </span>{" "}
                  Trust Susanfx
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[var(--background-secondary)] border border-[var(--border-normal)] rounded-full px-4 py-2 text-sm text-[var(--global-text)]">
                <IconMask
                  url={STARS_ICON}
                  size="1rem"
                  color="var(--primary-default)"
                />
                <span>
                  4.8 Stars{" "}
                  <span className="text-[var(--primary-default)]">From</span> 5k
                  Verified Reviews
                </span>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--global-text)] leading-tight">
              Trade like{" "}
              <span className="text-[var(--primary-default)]">
                the Greatest
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-[var(--text-white-50)] max-w-lg">
              <strong className="text-[var(--global-text)]">
                Get Paid 100% on Demand
              </strong>
              <br />
              Up to $2M Simulated Capital
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Button
                as="a"
                href="#get-funded"
                variant="featured"
                className="gap-2 text-base px-6 py-3"
              >
                Get Funded
                <IconMask
                  url={ARROW_ICON}
                  size="1rem"
                  color="var(--primary-text)"
                />
              </Button>
              <div className="flex items-center gap-2 text-sm text-[var(--global-text)]">
                <IconMask
                  url={TROPHY_ICON}
                  size="1.1rem"
                  color="var(--primary-default)"
                />
                <span>Reward Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Right illustration */}
          <div className="flex justify-center lg:justify-end">
            <img
              src="/images/index/692fafcbfe6219ef08586b22_Homepage Hero Illustration.webp"
              alt="SusanFX Trading Dashboard"
              className="w-full max-w-xl lg:max-w-none rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
