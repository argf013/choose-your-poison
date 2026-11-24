import React, { useState } from "react";
import { useExperienceStore } from "../../store/experienceStore";
import { ScreenStep } from "../../types";
import { Volume2, VolumeX, RotateCcw, Printer, ArrowDownToLine } from "lucide-react";
import { sounds } from "../../utils/audio";
import { PrinterModal } from "../printer/PrinterModal";
import { usePwaInstall } from "../../utils/usePwaInstall";

const STEPS: { id: ScreenStep; label: string }[] = [
  { id: "introduction", label: "Start" },
  { id: "social", label: "Main Course" },
  { id: "selection", label: "Side Dish" },
  { id: "reflection", label: "Dessert" },
  { id: "receipt", label: "Receipt" },
];

export const KioskHeader: React.FC = () => {
  const { currentStep, jumpToStep, sessionId, audioEnabled, toggleAudio, resetSession } =
    useExperienceStore();
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const { isInstallable, installPwa } = usePwaInstall();

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <>
      <header className="kiosk-header w-full border-b border-nordic-border/70 bg-nordic-bg/90 backdrop-blur-md px-6 lg:px-12 py-3.5 flex items-center justify-between z-30 select-none">
        {/* Brand / Title */}
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-sm tracking-tight text-nordic-ink">
            CHOOSE YOUR POISON
          </span>
        </div>

        {/* Clean Minimal Step Track */}
        <nav className="kiosk-nav hidden md:flex items-center space-x-1 sm:space-x-2 text-xs">
          {STEPS.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isPassed = idx < currentStepIndex;

            return (
              <button
                key={step.id}
                onClick={() => {
                  if (audioEnabled) sounds.playClick();
                  jumpToStep(step.id);
                }}
                className={`flex items-center px-3 py-1 rounded-full transition-all text-xs cursor-pointer ${
                  isActive
                    ? "bg-nordic-ink text-[#FAF8F5] font-medium"
                    : isPassed
                      ? "text-nordic-ink hover:bg-nordic-surface/80"
                      : "text-nordic-muted/50 hover:text-nordic-muted"
                }`}
              >
                <span>{step.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Session ID, Install Button, Printer & Sound */}
        <div className="kiosk-controls flex items-center space-x-2.5 text-xs text-nordic-muted">
          {/* PWA Install Button (appears if installable) */}
          {isInstallable && (
            <button
              onClick={installPwa}
              title="Install Kiosk PWA ke Layar Utama Tablet"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-nordic-ink text-[#FAF8F5] text-[11px] font-medium hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <ArrowDownToLine size={13} />
              <span>Install App</span>
            </button>
          )}

          <span className="font-mono text-[11px] text-nordic-mutedLight hidden sm:inline">
            {sessionId}
          </span>

          {/* Printer Setup Button for Operator */}
          <button
            onClick={() => setIsPrinterModalOpen(true)}
            title="Pengaturan Thermal Printer"
            className="p-1.5 text-nordic-muted hover:text-nordic-ink rounded-full hover:bg-nordic-surface transition-colors"
            aria-label="Printer Settings"
          >
            <Printer size={16} />
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            title={audioEnabled ? "Mute audio" : "Enable audio"}
            className="p-1.5 text-nordic-muted hover:text-nordic-ink rounded-full hover:bg-nordic-surface transition-colors"
            aria-label="Toggle Sound"
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Reset button if navigated past start */}
          {currentStep !== "welcome" && (
            <button
              onClick={() => {
                if (window.confirm("Restart session?")) resetSession();
              }}
              title="Restart session"
              className="p-1.5 text-nordic-muted hover:text-nordic-accent rounded-full hover:bg-nordic-surface transition-colors"
              aria-label="Restart"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </header>

      {/* Printer Modal */}
      <PrinterModal isOpen={isPrinterModalOpen} onClose={() => setIsPrinterModalOpen(false)} />
    </>
  );
};
