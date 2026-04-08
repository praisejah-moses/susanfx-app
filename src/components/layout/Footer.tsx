import Logo from "../ui/Logo";

const companyLinks = [
  { label: "About", href: "#" },
  { label: "Affiliate", href: "#" },
  { label: "Contact", href: "#" },
];

const policyLinks = [
  { label: "Terms & Conditions", href: "#", target: "_blank" },
  { label: "Privacy Policy", href: "#", target: "_blank" },
];

const paymentLogos = [
  "/images/index/6937d0ffd2484199754bfe71_Visa Logo Footer.svg",
  "/images/index/6937d0ff74ab8803d5ecf0a2_Paypal Logo Footer.svg",
  "/images/index/6937d0ffda69af5dd1b79b25_Bitcoin Logo Footer.svg",
  "/images/index/6937d0ff92466dce50f00190_Master Card Logo Footer.svg",
  "/images/index/6937d0ff4388f056c2a12ed8_American Express Logo Footer.svg",
  "/images/index/6937d0ff4357d0c0496802cc_Skrill Logo Footer.svg",
];

const paymentAlts = [
  "Visa",
  "PayPal",
  "Bitcoin",
  "MasterCard",
  "Amex",
  "Skrill",
];

export default function Footer() {
  return (
    <footer className="bg-[var(--background-secondary)] border-t border-[var(--border-normal)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Logo height={36} />
            <p className="text-sm text-[var(--text-white-50)]">
              ©2026 SusanFxTrader. All rights reserved.
            </p>
            {/* Payment logos */}
            <div className="flex flex-wrap gap-3 items-center mt-2">
              {paymentLogos.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={paymentAlts[i]}
                  height={24}
                  className="h-6 w-auto opacity-70"
                />
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--global-text)] mb-3 uppercase tracking-wider">
              Company
            </h4>
            <ul className="flex flex-col gap-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[var(--text-white-50)] hover:text-[var(--global-text)] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--global-text)] mb-3 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="flex flex-col gap-2">
              {policyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.target}
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--text-white-50)] hover:text-[var(--global-text)] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
