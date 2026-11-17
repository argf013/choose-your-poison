import React from "react";

export const KioskFooter: React.FC = () => {
  return (
    <footer className="kiosk-footer w-full border-t border-nordic-border/50 px-6 lg:px-12 py-3 flex items-center justify-between text-xs text-nordic-mutedLight select-none z-20">
      <div>
        <span>CHOOSE YOUR POISON - Interactive Art Installation</span>
      </div>

      <div className="hidden sm:block">
        <span>Freedom of expression and its consequences</span>
      </div>
    </footer>
  );
};
