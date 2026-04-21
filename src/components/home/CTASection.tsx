import { useState } from "react";
import Button from "../ui/Button";
import IconMask from "../ui/IconMask";

const ARROW_ICON = "/images/index/692fa452ca73ac3398155143_arrow-right.webp";

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
    <section
      className="py-20 bg-white relative overflow-hidden animate-fadeInUp"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='10' y='10' width='40' height='40' fill='none' stroke='%23000000' stroke-width='0.5' opacity='0.04'/%3E%3Ccircle cx='30' cy='30' r='3' fill='%23000000' opacity='0.03'/%3E%3C/svg%3E")`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Discord CTA */}
          <div className="flex flex-col justify-between bg-white border border-gray-200 rounded-2xl p-8 gap-6">
            <h3 className="text-2xl md:text-3xl font-bold text-black">
              Level up. Join our Community.
            </h3>
            {/* <Button
              as="a"
              href="/au"
              variant="featured"
              className="self-start gap-2"
            >
              Get Started
              <IconMask
                url={ARROW_ICON}
                size="0.9rem"
                color="var(--primary-text)"
              />
            </Button> */}
          </div>

          {/* Email CTA */}
          <div className="flex flex-col justify-between bg-white border border-gray-200 rounded-2xl p-8 gap-6">
            <h3 className="text-2xl md:text-3xl font-bold text-black">
              Exclusive Discounts &amp; Giveaways
            </h3>

            {status === "success" ? (
              <p className="text-black font-medium">
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
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
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
