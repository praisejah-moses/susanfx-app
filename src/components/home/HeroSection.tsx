import IconMask from "../ui/IconMask";
import Button from "../ui/Button";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-16 bg-(--background-default) overflow-hidden animate-fadeIn">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="flex flex-col gap-6">
            {/* Rating badges */}
            <div className="flex justify-center lg:justify-start flex-wrap gap-3">
              <div className="flex gap-2 bg-(--background-secondary) border border-(--border-normal) rounded-full px-4 py-2 text-sm text-(--global-text)">
                <IconMask
                  url="/images/index/692eaef3cf3cf5f37224a7e8_icon-people.webp"
                  size="1rem"
                  color="var(--primary-default)"
                />
                <span>
                  250K+{" "}
                  <span className="text-(--primary-default) font-semibold">
                    Traders
                  </span>{" "}
                  Trust Susanfx
                </span>
              </div>
              <div className="flex  gap-2 bg-(--background-secondary) border border-(--border-normal) rounded-full px-4 py-2 text-sm text-(--global-text)">
                <IconMask
                  url="/images/index/692eaef3b594d969fb8ce448_icon-stars.webp"
                  size="1rem"
                  color="var(--primary-default)"
                />
                <span>
                  4.8 Stars{" "}
                  <span className="text-(--primary-default)">From</span> 5k
                  Verified Reviews
                </span>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-8xl text-center lg:text-left md:text-6xl lg:text-8xl font-bold text-(--global-text) leading-tight">
              Trade like{" "}
              <span className="text-(--primary-default)">the Greatest</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-center lg:text-left text-(--text-white-50) max-w-lg">
              <strong className="text-(--global-text)">
                Get Paid 100% on Demand
              </strong>
              <br />
              Up to $2M Simulated Capital
            </p>

            {/* CTAs */}
            <div className="flex justify-center lg:justify-start flex-wrap items-center gap-4">
              <Button
                as="a"
                href="/auth"
                variant="featured"
                className="gap-2 text-base px-6 py-3"
              >
                Get Funded
                <IconMask
                  url="/images/index/692fa452ca73ac3398155143_arrow-right.webp"
                  size="1rem"
                  color="var(--primary-text)"
                />
              </Button>
              <div className="flex items-center gap-2 text-sm text-(--global-text)">
                <IconMask
                  url="/images/index/692ed0387f2ed70bd61379bd_icon-trophy.webp"
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
              src="/images/index/692fafcbfe6219ef08586b22_Homepage Hero Illustration.jpg"
              alt="SusanFX Trading Dashboard"
              className=""
            />
          </div>
        </div>
      </div>
    </section>
  );
}
