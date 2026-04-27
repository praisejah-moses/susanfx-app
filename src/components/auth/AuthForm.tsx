import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../ui/Logo";
import { supabase } from "../../utils/supabase";

// List of countries where the trading app is available
const AVAILABLE_COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Ireland",
  "Portugal",
  "Greece",
  "Japan",
  "Singapore",
  "Hong Kong",
  "India",
  "South Africa",
  "United Arab Emirates",
  "Saudi Arabia",
  "Mexico",
  "Brazil",
  "Argentina",
  "Chile",
  "New Zealand",
].sort();

interface AuthFormProps {
  initialMode?: "login" | "signup";
}

export default function AuthForm({ initialMode = "login" }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [refererCode, setRefererCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signupConfirmationEmail, setSignupConfirmationEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
        } else {
          navigate("/dashboard");
        }
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        if (!agreedToTerms) {
          setError("You must agree to the Terms and Conditions");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              first_name: firstName,
              last_name: lastName,
              country: country,
              phone_number: phoneNumber,
              referral_code: refererCode || null,
            },
          },
        });
        if (error) {
          setError(error.message);
        } else {
          // Process referral if code was provided and matches the static code
          if (refererCode && data.user) {
            if (refererCode.toUpperCase() === 'SUSANGETFUNDED') {
              try {
                // For demo purposes, we'll award the bonus directly
                // In a real app, you'd have a proper referral system
                const { error: updateError } = await supabase
                  .from('accounts')
                  .update({ balance: 100.00 })
                  .eq('user_id', data.user.id);

                if (updateError) {
                  console.error('Bonus award error:', updateError);
                }
              } catch (referralErr) {
                console.error('Referral processing failed:', referralErr);
              }
            } else {
              console.log('Invalid referral code provided');
            }
          }

          setError(null);
          setSignupConfirmationEmail(email);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex flex-col items-center w-full max-w-sm px-4 py-6 sm:px-6 sm:py-8 bg-[var(--background-default)] rounded-2xl sm:rounded-3xl border border-[var(--border-normal)] animate-scaleIn">
      <div className="mb-4 sm:mb-6">
        <Logo className="h-12 sm:h-20 w-auto" />
      </div>

      {/* Signup Confirmation Message */}
      {signupConfirmationEmail && (
        <div className="w-full flex flex-col items-center gap-4 sm:gap-6 animate-fadeInUp">
          <div className="mt-6 sm:mt-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-center text-[var(--global-text)]">
            Check your email
          </h2>

          <p className="text-sm sm:text-base text-center text-[var(--text-white-50)]">
            We've sent a confirmation link to:
          </p>

          <p className="text-sm sm:text-base font-medium text-center text-[var(--global-text)] break-all">
            {signupConfirmationEmail}
          </p>

          <p className="text-sm text-center text-[var(--text-white-50)]">
            Click the link in the email to confirm your account. You'll be redirected to your dashboard automatically.
          </p>

          <button
            onClick={() => {
              setSignupConfirmationEmail(null);
              setMode("login");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setFirstName("");
              setLastName("");
              setCountry("");
              setPhoneNumber("");
              setRefererCode("");
              setAgreedToTerms(false);
              setError(null);
            }}
            className="mt-4 text-sm text-[var(--primary-default)] hover:underline transition-all"
          >
            Back to login
          </button>
        </div>
      )}

      {/* Login/Signup Form */}
      {!signupConfirmationEmail && (
        <>
          <h5 className="text-lg sm:text-xl font-semibold text-[var(--global-text)]">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h5>

      {/* Mode toggle */}
      <div className="flex gap-2 mt-6 bg-[var(--background-secondary)] p-1 rounded-lg w-full sm:w-auto">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-md text-sm font-medium transition-all min-h-10 sm:min-h-auto ${
            mode === "login"
              ? "bg-[var(--primary-default)] text-[var(--primary-text)]"
              : "text-[var(--text-white-50)] hover:text-[var(--global-text)]"
          }`}
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError(null);
          }}
          className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-md text-sm font-medium transition-all min-h-10 sm:min-h-auto ${
            mode === "signup"
              ? "bg-[var(--primary-default)] text-[var(--primary-text)]"
              : "text-[var(--text-white-50)] hover:text-[var(--global-text)]"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form
        className="flex flex-col gap-3 sm:gap-4 w-full py-4 sm:py-6"
        onSubmit={handleSubmit}
      >
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
              className="w-full border border-[var(--strokes-default)] rounded-lg px-3 py-[10px] outline-none focus:border-[var(--primary-default)] bg-[var(--background-default)] text-[var(--global-text)] placeholder:text-[var(--text-white-50)] text-sm hover:bg-[var(--background-secondary)] transition-smooth-fast"
            />
          </div>
        </div>

        {/* First Name and Last Name (Signup only) */}
        {mode === "signup" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
            {/* First Name */}
            <div className="w-full flex flex-col gap-2">
              <p className="text-sm font-medium text-[var(--global-text)]">
                First Name
              </p>
              <div className="relative w-full">
                <input
                  required
                  id="first-name"
                  type="text"
                  name="first-name"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-[var(--strokes-default)] rounded-lg px-3 py-[10px] outline-none focus:border-[var(--primary-default)] bg-[var(--background-default)] text-[var(--global-text)] placeholder:text-[var(--text-white-50)] text-sm hover:bg-[var(--background-secondary)] transition-smooth-fast"
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="w-full flex flex-col gap-2">
              <p className="text-sm font-medium text-[var(--global-text)]">
                Last Name
              </p>
              <div className="relative w-full">
                <input
                  required
                  id="last-name"
                  type="text"
                  name="last-name"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-[var(--strokes-default)] rounded-lg px-3 py-[10px] outline-none focus:border-[var(--primary-default)] bg-[var(--background-default)] text-[var(--global-text)] placeholder:text-[var(--text-white-50)] text-sm hover:bg-[var(--background-secondary)] transition-smooth-fast"
                />
              </div>
            </div>
          </div>
        )}

        {/* Country and Phone Number (Signup only) */}
        {mode === "signup" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
            {/* Country */}
            <div className="w-full flex flex-col gap-2">
              <p className="text-sm font-medium text-[var(--global-text)]">
                Country
              </p>
              <div className="relative w-full">
                <select
                  required
                  id="country"
                  name="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-[var(--strokes-default)] rounded-lg px-3 py-[10px] outline-none focus:border-[var(--primary-default)] bg-[var(--background-default)] text-[var(--global-text)] text-sm hover:bg-[var(--background-secondary)] appearance-none cursor-pointer"
                >
                  <option value="">Select a country</option>
                  {AVAILABLE_COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {/* Dropdown arrow icon */}
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-white-50)] pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </div>

            {/* Phone Number */}
            <div className="w-full flex flex-col gap-2">
              <p className="text-sm font-medium text-[var(--global-text)]">
                Phone Number
              </p>
              <div className="relative w-full">
                <input
                  required
                  id="phone-number"
                  type="tel"
                  name="phone-number"
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full border border-[var(--strokes-default)] rounded-lg px-3 py-[10px] outline-none focus:border-[var(--primary-default)] bg-[var(--background-default)] text-[var(--global-text)] placeholder:text-[var(--text-white-50)] text-sm hover:bg-[var(--background-secondary)] transition-smooth-fast"
                />
              </div>
            </div>
          </div>
        )}

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
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[var(--strokes-default)] rounded-lg px-3 py-[10px] pr-10 outline-none focus:border-[var(--primary-default)] bg-[var(--background-default)] text-[var(--global-text)] placeholder:text-[var(--text-white-50)] text-sm hover:bg-[var(--background-secondary)] transition-smooth-fast"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--global-text)] focus:outline-none"
            >
              {showPassword ? (
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

        {/* Referer Code (Signup only) */}
        {mode === "signup" && (
          <div className="w-full flex flex-col gap-2">
            <p className="text-sm font-medium text-[var(--global-text)]">
              Referral Code <span className="text-[var(--text-white-50)] text-xs">(Optional)</span>
            </p>
            <div className="relative w-full">
              <input
                id="refererCode"
                type="text"
                name="refererCode"
                placeholder="Enter referal code to get bonus"
                value={refererCode}
                onChange={(e) => setRefererCode(e.target.value.toUpperCase())}
                className="w-full border border-[var(--strokes-default)] rounded-lg px-3 py-[10px] outline-none focus:border-[var(--primary-default)] bg-[var(--background-default)] text-[var(--global-text)] placeholder:text-[var(--text-white-50)] text-sm hover:bg-[var(--background-secondary)] transition-smooth-fast"
              />
            </div>
          </div>
        )}

        {/* Confirm Password (Signup only) */}
        {mode === "signup" && (
          <div className="w-full flex flex-col gap-2">
            <p className="text-sm font-medium text-[var(--global-text)]">
              Confirm Password
            </p>
            <div className="relative w-full">
              <input
                required
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                name="confirm-password"
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-[var(--strokes-default)] rounded-lg px-3 py-[10px] pr-10 outline-none focus:border-[var(--primary-default)] bg-[var(--background-default)] text-[var(--global-text)] placeholder:text-[var(--text-white-50)] text-sm hover:bg-[var(--background-secondary)] transition-smooth-fast"
              />
            </div>
          </div>
        )}

        {/* Forgot password (Login only) */}
        {mode === "login" && (
          <a
            href="#forgot-password"
            className="text-sm text-[var(--primary-default)] hover:underline transition-all self-start"
          >
            Forgot Password?
          </a>
        )}

        {/* Error message */}
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {/* Terms and Conditions Checkbox (Signup only) */}
        {mode === "signup" && (
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              required
              type="checkbox"
              id="agree-terms"
              name="agree-terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border border-[var(--strokes-default)] accent-[var(--primary-default)] cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-[var(--text-white-50)] leading-relaxed">
              I agree to the{" "}
              <a
                href="#terms"
                className="text-[var(--primary-default)] hover:underline"
              >
                Terms &amp; Conditions
              </a>
              {" "}and{" "}
              <a
                href="#privacy"
                className="text-[var(--primary-default)] hover:underline"
              >
                Privacy Policy
              </a>
            </span>
          </label>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 sm:py-3 px-4 sm:px-[18px] text-sm font-semibold flex items-center justify-center gap-2 bg-[var(--primary-default)] text-[var(--primary-text)] hover:opacity-70 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed min-h-11 sm:min-h-[44px]"
        >
          {loading
            ? mode === "login"
              ? "Logging in…"
              : "Creating account…"
            : mode === "login"
              ? "Log In"
              : "Sign Up"}
        </button>
      </form>

      <div className="text-xs sm:text-sm pb-4 sm:pb-6 px-2 text-[var(--global-text)] text-center">
        By {mode === "login" ? "logging in" : "signing up"} you accept the{" "}
        <a href="#" className="text-[var(--primary-default)] underline">
          Terms &amp; Conditions
        </a>
      </div>
        </>
      )}
    </div>
  );
}
