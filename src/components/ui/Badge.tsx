import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "dark" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "sm",
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center font-mono font-medium tracking-widest uppercase select-none";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles = {
    default: "bg-nordic-surface text-nordic-ink border border-nordic-border",
    accent: "bg-nordic-accent/10 text-nordic-accent border border-nordic-accent/30",
    dark: "bg-nordic-ink text-nordic-bg",
    outline: "bg-transparent text-nordic-muted border border-nordic-border",
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
