import { useState } from "react";
import Button from "../ui/Button";
import IconMask from "../ui/IconMask";

const ARROW_ICON =
  "https://cdn.prod.website-files.com/692d3a3e37a293dd19f3b43e/692fa452ca73ac3398155143_arrow-right.webp";

type FormStatus = "idle" | "success" | "error";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // Placeholder: just show success state
    setStatus("success");
    setEmail("");
  }

  return (
    <section className="py-20 bg-[var(--background-default)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Discord CTA */}
          <div className="flex flex-col justify-between bg-[var(--background-secondary)] border border-[var(--border-normal)] rounded-2xl p-8 gap-6">
            <h3 className="text-2xl md:text-3xl font-bold text-[var(--global-text)]">
              Level up. Join our Community.
            </h3>
            <Button
              as="a"
              href="#"
              variant="featured"
              className="self-start gap-2"
            >
              Get Started
              <IconMask
                url={ARROW_ICON}
                size="0.9rem"
                color="var(--primary-text)"
              />
            </Button>
          </div>

          {/* Email CTA */}
          <div className="flex flex-col justify-between bg-[var(--background-secondary)] border border-[var(--border-normal)] rounded-2xl p-8 gap-6">
            <h3 className="text-2xl md:text-3xl font-bold text-[var(--global-text)]">
              Exclusive Discounts &amp; Giveaways
            </h3>

            {status === "success" ? (
              <p className="text-[var(--global-text)] font-medium">
                Thank you! Your submission has been received!
              </p>
            ) : status === "error" ? (
              <p className="text-red-400 font-medium">
                Oops! Something went wrong while submitting the form.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 bg-[var(--background-default)] border border-[var(--border-normal)] rounded-lg px-4 py-3 text-[var(--global-text)] placeholder:text-[var(--text-white-50)] focus:outline-none focus:border-[var(--primary-default)]"
                />
                <button
                  type="submit"
                  className="bg-[var(--primary-default)] text-[var(--primary-text)] font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
