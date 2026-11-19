import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperienceStore } from "../../store/experienceStore";
import { KioskHeader } from "./KioskHeader";
import { KioskFooter } from "./KioskFooter";
import { Welcome } from "../../screens/Welcome";
import { Introduction } from "../../screens/Introduction";
import { SocialSelection } from "../../screens/SocialSelection";
import { Selection } from "../../screens/Selection";
import { Reflection } from "../../screens/Reflection";
import { ReceiptPreview } from "../../screens/ReceiptPreview";
import { ThermalReceipt } from "../receipt/ThermalReceipt";
import { EXPRESSIONS } from "../../data/expressions";
import { generateReceiptData } from "../../utils/receiptGenerator";
import { sounds } from "../../utils/audio";

export const KioskContainer: React.FC = () => {
  const {
    currentStep,
    setStep,
    selectedSocials,
    selectedExpressionIds,
    expressionInputs,
    sessionId,
    paperWidth,
    resetSession,
    toggleExpression,
    audioEnabled,
  } = useExperienceStore();

  // Selected expressions and receipt data for print target
  const selectedExpressions = useMemo(
    () => EXPRESSIONS.filter((item) => selectedExpressionIds.includes(item.id)),
    [selectedExpressionIds]
  );

  const receiptData = useMemo(
    () =>
      generateReceiptData(
        sessionId,
        selectedExpressions,
        paperWidth,
        selectedSocials,
        expressionInputs
      ),
    [sessionId, selectedExpressions, paperWidth, selectedSocials, expressionInputs]
  );

  // Keyboard navigation & kiosk shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "Escape") {
        if (currentStep !== "welcome") {
          if (window.confirm("Return to start screen?")) {
            resetSession();
          }
        }
      }

      // Selection quick numbers 1 - 5
      if (currentStep === "selection") {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 5) {
          const target = EXPRESSIONS[num - 1];
          if (target) {
            if (audioEnabled) {
              const willSelect = !selectedExpressionIds.includes(target.id);
              sounds.playSelect(willSelect);
            }
            toggleExpression(target.id);
          }
        }
      }

      // Enter key flow progression
      if (e.key === "Enter") {
        if (currentStep === "welcome") {
          setStep("introduction");
        } else if (currentStep === "selection" && selectedExpressionIds.length > 0) {
          setStep("reflection");
        } else if (currentStep === "reflection") {
          setStep("receipt");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, selectedExpressionIds, audioEnabled, setStep, resetSession, toggleExpression]);

  const renderCurrentScreen = () => {
    switch (currentStep) {
      case "welcome":
        return <Welcome key="welcome" />;
      case "introduction":
        return <Introduction key="introduction" />;
      case "social":
        return <SocialSelection key="social" />;
      case "selection":
        return <Selection key="selection" />;
      case "reflection":
        return <Reflection key="reflection" />;
      case "receipt":
        return <ReceiptPreview key="receipt" />;
      default:
        return <Welcome key="welcome-fallback" />;
    }
  };

  return (
    <div className="relative h-screen w-screen flex flex-col justify-between overflow-hidden bg-nordic-bg text-nordic-ink">
      {/* Top Header */}
      <KioskHeader />

      {/* Main Dynamic Viewport with Framer Motion Screen Transitions */}
      <main className="flex-1 w-full flex flex-col relative overflow-hidden z-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="flex-1 w-full flex flex-col overflow-hidden"
          >
            {renderCurrentScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Footer */}
      <KioskFooter />

      {/* PURE PRINT TARGET: Hidden during screen display, strictly visible during window.print() */}
      <div id="printable-receipt-target" className="hidden">
        <ThermalReceipt receipt={receiptData} isPrintVersion={true} />
      </div>
    </div>
  );
};
