import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../ui/Logo";
import Button from "../ui/Button";
import { useMobileMenu } from "../../hooks/useMobileMenu";

export default function Navbar() {
  const { isOpen, toggle, close } = useMobileMenu();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--background-default)]/95 backdrop-blur-sm shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Logo height={36} />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg font-medium text-sm text-[var(--global-text)] border border-[var(--border-normal)] hover:opacity-80 transition-opacity"
            >
              Log In
            </Link>
            <Button as="a" href="#get-funded" variant="featured">
              Get Funded
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={toggle}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 bg-white transition-transform duration-300 origin-center ${
                isOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-white transition-transform duration-300 origin-center ${
                isOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[var(--background-secondary)] border-t border-[var(--border-normal)] px-4 py-4 flex flex-col gap-3">
          <Link
            to="/login"
            onClick={close}
            className="px-5 py-2.5 rounded-lg font-medium text-sm text-[var(--global-text)] border border-[var(--border-normal)] text-center"
          >
            Log In
          </Link>
          <a
            href="#get-funded"
            onClick={close}
            className="px-5 py-2.5 rounded-lg font-medium text-sm bg-[var(--primary-default)] text-[var(--primary-text)] text-center"
          >
            Get Funded
          </a>
        </div>
      )}
    </nav>
  );
}
