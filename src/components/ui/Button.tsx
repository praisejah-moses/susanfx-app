import React from "react";

type ButtonVariant = "featured" | "white" | "dark-gray" | "login";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  as?: "button" | "a";
  href?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  featured:
    "bg-[var(--primary-default)] text-[var(--primary-text)] hover:opacity-90 hover:scale-105 active:scale-95",
  white: "bg-white text-black hover:opacity-90 hover:scale-105 active:scale-95",
  "dark-gray":
    "bg-(--foreground-default) text-white border border-[var(--border-normal)] hover:opacity-90 hover:scale-105 active:scale-95",
  login:
    "bg-[var(--background-secondary)] text-[var(--global-text)] border border-[var(--border-normal)] hover:opacity-90 hover:scale-105 active:scale-95",
};

export default function Button({
  variant = "featured",
  as = "button",
  href,
  target,
  rel,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-smooth cursor-pointer";
  const cls = `${base} ${variantClasses[variant]} ${className}`;

  if (as === "a" && href) {
    return (
      <a href={href} target={target} rel={rel} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
