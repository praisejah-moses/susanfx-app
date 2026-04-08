import { useState } from "react";
import IconMask from "../ui/IconMask";
import Button from "../ui/Button";
import { useClipboard } from "../../hooks/useClipboard";

const LOCK_ICON =
  "https://cdn.prod.website-files.com/692d3a3e37a293dd19f3b43e/692e4659e7e3af88f0bdb7e3_icon-lock.webp";
const COPY_ICON =
  "https://cdn.prod.website-files.com/692d3a3e37a293dd19f3b43e/692e4659e7e3af88f0bdb7db_icon-copy.webp";
const CHECK_ICON =
  "https://cdn.prod.website-files.com/692d3a3e37a293dd19f3b43e/692e4659e7e3af88f0bdb7dc_icon-check.webp";

// --- Data ---
type ModelKey = "1-step" | "2-step" | "3-step" | "instant" | "goat-blitz";
type TypeKey = "goat" | "standard" | "pro";
type PlatformKey =
  | "tradelocker"
  | "volumetrica"
  | "matchtrader"
  | "ctrader"
  | "metatrader5";

const models: { key: ModelKey; label: string; badge?: string }[] = [
  { key: "1-step", label: "1 step" },
  { key: "2-step", label: "2 step" },
  { key: "3-step", label: "3 step" },
  { key: "instant", label: "Instant", badge: "Most Popular" },
];

const accountTypes: { key: TypeKey; label: string; badge?: string }[] = [
  { key: "goat", label: "GOAT", badge: "Most Popular" },
  { key: "pro", label: "PRO", badge: "New" },
];

const platforms: { key: PlatformKey; label: string }[] = [
  { key: "tradelocker", label: "TradeLocker" },
  { key: "volumetrica", label: "Volumetrica" },
  { key: "matchtrader", label: "MatchTrader" },
  { key: "ctrader", label: "cTrader" },
  { key: "metatrader5", label: "MetaTrader 5" },
];

const tableRows = [
  { label: "Profit Target Phase 1", value: "8%", icon: CHECK_ICON },
  { label: "Profit Target Phase 2", value: "5%", icon: CHECK_ICON },
  { label: "Maximum Daily Loss", value: "3%", icon: CHECK_ICON },
  { label: "Maximum Loss", value: "6%", icon: CHECK_ICON },
  { label: "Leverage", value: "Up to 1:100", icon: CHECK_ICON },
  { label: "Rewards", value: "Bi-weekly", icon: CHECK_ICON },
  { label: "Profit Split", value: "80%–100% add-on", icon: CHECK_ICON },
];

const paymentLogosCard = [
  {
    src: "/images/index/695b3e10f0fa7619c8e6060f_Visa Logo SVG.svg",
    alt: "Visa",
  },
  {
    src: "/images/index/695b3e108af41cce3859a451_Paypal Logo SVG.svg",
    alt: "PayPal",
  },
  {
    src: "/images/index/695b3e10af60660a2f2d892a_Bitcoin Logo SVG.svg",
    alt: "Bitcoin",
  },
  {
    src: "/images/index/695b3e10e9659036df9d47eb_MasterCard Logo SVG.svg",
    alt: "MasterCard",
  },
  {
    src: "/images/index/695b3e101382c75a488606a8_American Express Logo SVG.svg",
    alt: "Amex",
  },
  {
    src: "/images/index/695b3e103d3896edb9b80666_Skrill Logo SVG.svg",
    alt: "Skrill",
  },
];

function CopyCode({ code }: { code: string }) {
  const { copied, copy } = useClipboard();
  return (
    <button
      onClick={() => copy(code)}
      className="inline-flex items-center gap-1.5 bg-[var(--background-default)] border border-[var(--border-normal)] rounded-lg px-3 py-1.5 text-xs font-mono text-[var(--primary-default)] hover:opacity-80 transition-opacity"
    >
      <span className="font-bold">{code}</span>
      <IconMask
        url={copied ? CHECK_ICON : COPY_ICON}
        size="0.8rem"
        color="var(--primary-default)"
      />
    </button>
  );
}

export default function AccountsSection() {
  const [model, setModel] = useState<ModelKey>("instant");
  const [type, setType] = useState<TypeKey>("goat");
  const [platform, setPlatform] = useState<PlatformKey>("metatrader5");

  return (
    <section id="get-funded" className="py-20 bg-[var(--background-default)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-sm text-[var(--text-white-50)] mb-3">
            <IconMask
              url={LOCK_ICON}
              size="1rem"
              color="var(--primary-default)"
            />
            <span>Reward Guaranteed</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--global-text)]">
            Choose Your Account
          </h2>
        </div>

        {/* Promo banners */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="flex items-center gap-3 bg-[var(--background-secondary)] border border-[var(--primary-default)]/30 rounded-xl px-5 py-3">
            <span className="text-xs text-[var(--text-white-50)]">
              Limited Time
            </span>
            <span className="text-[var(--primary-default)] font-bold">
              50% OFF
            </span>
            <span className="text-xs text-[var(--text-white-50)]">CODE:</span>
            <CopyCode code="EASTER50" />
          </div>
          <div className="flex items-center gap-3 bg-[var(--background-secondary)] border border-[var(--border-normal)] rounded-xl px-5 py-3">
            <span className="text-xs text-[var(--text-white-50)]">
              50% OFF for New Customers
            </span>
            <span className="text-xs text-[var(--text-white-50)]">CODE:</span>
            <CopyCode code="FIRSTSFX" />
          </div>
        </div>

        {/* Selectors + Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: selectors */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Model selector */}
            <div>
              <p className="text-sm text-[var(--text-white-50)] mb-2 uppercase tracking-wider">
                Account Model
              </p>
              <div className="flex flex-wrap gap-2">
                {models.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setModel(m.key)}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      model === m.key
                        ? "bg-[var(--primary-default)] text-[var(--primary-text)]"
                        : "bg-[var(--background-secondary)] border border-[var(--border-normal)] text-[var(--global-text)] hover:border-[var(--primary-default)]/50"
                    }`}
                  >
                    {m.label}
                    {m.badge && model === m.key && (
                      <span className="absolute -top-2 -right-1 text-xs bg-[var(--background-secondary)] border border-[var(--primary-default)] text-[var(--primary-default)] rounded-full px-1.5 py-0.5 leading-none">
                        {m.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Type selector */}
            <div>
              <p className="text-sm text-[var(--text-white-50)] mb-2 uppercase tracking-wider">
                Account Type
              </p>
              <div className="flex flex-wrap gap-2">
                {accountTypes.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setType(t.key)}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      type === t.key
                        ? "bg-[var(--primary-default)] text-[var(--primary-text)]"
                        : "bg-[var(--background-secondary)] border border-[var(--border-normal)] text-[var(--global-text)] hover:border-[var(--primary-default)]/50"
                    }`}
                  >
                    {t.label}
                    {t.badge && (
                      <span
                        className={`absolute -top-2 -right-1 text-xs rounded-full px-1.5 py-0.5 leading-none ${
                          t.badge === "New"
                            ? "bg-emerald-500 text-white"
                            : "bg-[var(--background-secondary)] border border-[var(--primary-default)] text-[var(--primary-default)]"
                        }`}
                      >
                        {t.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform selector */}
            <div>
              <p className="text-sm text-[var(--text-white-50)] mb-2 uppercase tracking-wider">
                Platform
              </p>
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPlatform(p.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      platform === p.key
                        ? "bg-[var(--primary-default)] text-[var(--primary-text)]"
                        : "bg-[var(--background-secondary)] border border-[var(--border-normal)] text-[var(--global-text)] hover:border-[var(--primary-default)]/50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-[var(--background-secondary)] border border-[var(--border-normal)] rounded-2xl overflow-hidden">
              {tableRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between px-5 py-3.5 ${
                    i !== tableRows.length - 1
                      ? "border-b border-[var(--border-normal)]"
                      : ""
                  } ${i % 2 === 0 ? "" : "bg-[var(--background-default)]/30"}`}
                >
                  <div className="flex items-center gap-2 text-sm text-[var(--text-white-50)]">
                    <IconMask
                      url={row.icon}
                      size="0.9rem"
                      color="var(--primary-default)"
                    />
                    {row.label}
                  </div>
                  <span className="text-sm font-semibold text-[var(--global-text)]">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer perks */}
            <div className="flex flex-wrap gap-4 text-sm text-[var(--text-white-50)]">
              {[
                "News Trading",
                "Weekend Holding",
                "Unlimited Trading Period",
              ].map((p) => (
                <span key={p} className="flex items-center gap-1.5">
                  <span className="text-[var(--primary-default)] font-bold">
                    ✓
                  </span>
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Right: pricing card */}
          <div className="flex flex-col gap-4">
            <div className="bg-[var(--background-secondary)] border border-[var(--primary-default)]/30 rounded-2xl p-6 flex flex-col gap-4">
              <div className="text-xs text-[var(--text-white-50)] uppercase tracking-wider">
                100K Account
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[var(--global-text)]">
                  $419
                </span>
                <span className="text-lg text-[var(--text-white-50)] line-through">
                  $838
                </span>
              </div>
              <Button
                as="a"
                href="#"
                variant="featured"
                className="w-full justify-center py-3 text-base"
              >
                Get Funded
              </Button>
              <div className="flex flex-wrap gap-2 justify-center">
                {paymentLogosCard.map((logo) => (
                  <img
                    key={logo.alt}
                    src={logo.src}
                    alt={logo.alt}
                    className="h-5 w-auto opacity-70"
                  />
                ))}
              </div>
            </div>

            {/* Limited time dark banner */}
            <div className="bg-[#111] border border-[var(--border-normal)] rounded-2xl p-5 flex flex-col gap-3">
              <p className="text-xs text-[var(--text-white-50)] uppercase tracking-wider">
                New to sFX?
              </p>
              <p className="text-2xl font-bold text-[var(--primary-default)]">
                50% OFF
              </p>
              <CopyCode code="FIRSTSFX" />
              <Button
                as="a"
                href="#get-funded"
                variant="featured"
                className="w-full justify-center"
              >
                Get Funded
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
