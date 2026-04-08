import Button from "../ui/Button";

export default function SupportSection() {
  return (
    <section className="py-20 bg-[var(--background-default)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Text + buttons */}
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--global-text)] mb-3">
              We're here to help 24/7
            </h2>
            <p className="text-lg font-semibold text-[var(--text-white-50)] mb-8">
              Check our FAQ for quick answers or contact us anytime
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                as="a"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                variant="featured"
              >
                FAQ
              </Button>
              <Button as="a" href="#" variant="dark-gray">
                Contact
              </Button>
            </div>
          </div>

          {/* Desktop illustration */}
          <div className="flex-1 hidden lg:block">
            <img
              src="/images/index/69378ca8bf32ed6d08ae69fb_Support Illustration.webp"
              alt="Support illustration"
              loading="lazy"
              className="w-full object-contain"
            />
          </div>
        </div>

        {/* Mobile illustration */}
        <div className="mt-8 lg:hidden">
          <img
            src="/images/index/693fca9864bca27486ca7f82_Support Illustration Mobile.webp"
            alt="Support illustration"
            loading="lazy"
            className="w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}
