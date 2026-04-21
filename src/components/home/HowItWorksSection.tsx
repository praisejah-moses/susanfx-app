import IconMask from "../ui/IconMask";
import Button from "../ui/Button";

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
    <section
      className="py-20 bg-white relative overflow-hidden animate-fadeInUp"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%23000000' stroke-width='0.5' opacity='0.03'/%3E%3C/svg%3E")`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-5">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-3">
            How It Works
          </h2>
          <p className="text-black max-w-xl mx-auto">
            Trade with our simulated Capital and get paid real Rewards
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 mb-10">
          {steps.map((step) => (
            <div key={step.title} className="flex items-center">
              <div className="flex flex-col items-center bg-[#f7f7f7] rounded-2xl p-6 gap-4 w-64 text-center">
                <img
                  src={step.img}
                  alt={step.title}
                  className="w-28 h-28 object-contain rounded-xl"
                />
                <div>
                  <p className="font-bold text-black capitalize text-lg">
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
                </div>
              </div>
              {step.arrow && (
                <div className="hidden md:flex mx-2">
                  <IconMask
                    url="images/index/692fa452ca73ac3398155143_arrow-right.webp"
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
            href="/auth"
            variant="featured"
            className="text-base px-8 py-3"
          >
            Get Funded
          </Button>
          <p className="text-xs text-black">
            You're not liable for any losses.
          </p>
        </div>
      </div>
    </section>
  );
}
