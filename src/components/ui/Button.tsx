import React from "react";
import { useExperienceStore } from "../../store/experienceStore";
import { sounds } from "../../utils/audio";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "outline" | "ghost" | "secondary";
  size?: "sm" | "md" | "lg" | "xl";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "right",
  fullWidth = false,
  className = "",
  disabled = false,
  onClick,
  ...props
}) => {
  const audioEnabled = useExperienceStore((state) => state.audioEnabled);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (audioEnabled) {
      sounds.playClick();
    }
    if (onClick) {
      onClick(e);
    }
  };

  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors duration-150 cursor-pointer select-none focus:outline-none disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-full gap-1.5",
    md: "px-5 py-2.5 text-xs tracking-wider rounded-full gap-2",
    lg: "px-7 py-3.5 text-sm tracking-wider rounded-full gap-2.5",
    xl: "px-8 py-4 text-sm sm:text-base tracking-wide rounded-full gap-3",
  };

  const variantStyles = {
    primary: "bg-nordic-ink text-[#FAF8F5] hover:bg-black active:bg-neutral-800",
    accent: "bg-nordic-accent text-white hover:bg-nordic-accentHover active:bg-amber-700",
    secondary:
      "bg-nordic-surface text-nordic-ink hover:bg-[#E2DDD3] active:bg-[#D9D3C7] border border-nordic-border",
    outline:
      "bg-transparent text-nordic-ink border border-nordic-border hover:border-nordic-ink hover:bg-white active:bg-nordic-surface",
    ghost:
      "bg-transparent text-nordic-muted hover:text-nordic-ink hover:bg-nordic-surface/60 active:bg-nordic-surface",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === "left" && <span className="inline-flex">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <span className="inline-flex">{icon}</span>}
    </button>
  );
};
