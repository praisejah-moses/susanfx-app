import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../ui/Logo";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: authentication hook can be wired here
  }

  return (
    <div className="relative flex flex-col items-center w-full max-w-sm pt-4 px-4 bg-[var(--background-default)] rounded-3xl border border-[var(--border-normal)]">
      <Logo height={52} />

      <h5 className="text-xl font-semibold mt-8 text-[var(--global-text)]">
        Welcome
      </h5>

      <form className="flex flex-col gap-3 w-full py-3" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="w-full flex flex-col gap-2">
          <p className="text-sm font-medium text-[var(--global-text)]">Email</p>
          <div className="relative w-full">
            <input
              required
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[var(--strokes-default)] rounded-lg px-3 py-[10px] outline-none focus:border-[var(--primary-default)] bg-[var(--background-default)] text-[var(--global-text)] placeholder:text-[var(--text-white-50)] text-sm hover:bg-[var(--background-secondary)]"
            />
          </div>
        </div>

        {/* Password */}
        <div className="w-full flex flex-col gap-2">
          <p className="text-sm font-medium text-[var(--global-text)]">
            Password
          </p>
          <div className="relative w-full">
            <input
              required
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[var(--strokes-default)] rounded-lg px-3 py-[10px] pr-10 outline-none focus:border-[var(--primary-default)] bg-[var(--background-default)] text-[var(--global-text)] placeholder:text-[var(--text-white-50)] text-sm hover:bg-[var(--background-secondary)]"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--global-text)] focus:outline-none"
            >
              {showPassword ? (
                // Eye open SVG
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path
                    d="M2.5 10c0-2.5 3.333-5.833 7.5-5.833 4.167 0 7.5 3.333 7.5 5.833 0 2.5-3.333 5.833-7.5 5.833-4.167 0-7.5-3.333-7.5-5.833z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              ) : (
                // Eye slashed SVG
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path
                    d="M2.5 10c0-2.5 3.333-5.833 7.5-5.833 4.167 0 7.5 3.333 7.5 5.833 0 2.5-3.333 5.833-7.5 5.833-4.167 0-7.5-3.333-7.5-5.833z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.75 3.75l12.5 12.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <Link
          to="/forgot-password"
          className="text-sm text-[var(--primary-default)] hover:underline transition-all self-start"
        >
          Forgot Password?
        </Link>

        {/* Submit */}
        <button
          type="submit"
          className="h-9 py-3 px-[18px] text-sm font-semibold flex items-center justify-center gap-2 bg-[var(--primary-default)] text-[var(--primary-text)] hover:opacity-70 rounded-lg transition-opacity"
        >
          Login
        </button>
      </form>

      <p className="text-sm text-[var(--global-text)] mb-6">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-[var(--primary-default)] cursor-pointer ml-1"
        >
          Create one
        </Link>
      </p>

      <div className="text-xs pb-4 text-[var(--global-text)] text-center">
        By logging in you accept the{" "}
        <a href="#" className="text-[var(--primary-default)] underline">
          Terms &amp; Conditions
        </a>
      </div>
    </div>
  );
}
