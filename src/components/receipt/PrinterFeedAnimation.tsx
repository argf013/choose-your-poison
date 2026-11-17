import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ThermalReceipt } from "./ThermalReceipt";
import { ReceiptData } from "../../types";
import { useExperienceStore } from "../../store/experienceStore";
import { sounds } from "../../utils/audio";

interface PrinterFeedAnimationProps {
  receipt: ReceiptData;
  onPrintComplete?: () => void;
}

export const PrinterFeedAnimation: React.FC<PrinterFeedAnimationProps> = ({
  receipt,
  onPrintComplete,
}) => {
  const [printProgress, setPrintProgress] = useState(0);
  const [isFeedDone, setIsFeedDone] = useState(false);
  const audioEnabled = useExperienceStore((state) => state.audioEnabled);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 4;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setIsFeedDone(true);
        if (onPrintComplete) onPrintComplete();
      }
      setPrintProgress(current);

      if (audioEnabled && current % 12 === 0) {
        sounds.playPrinterPulse();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [audioEnabled, onPrintComplete]);

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Sleek Minimalist Slot */}
      <div className="w-full bg-[#242321] text-[#FAF8F5] p-2.5 rounded-t-lg shadow-subtle relative z-20">
        <div className="flex items-center justify-between text-[11px] text-[#A6A29A] px-2 mb-1.5">
          <span className="flex items-center space-x-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                !isFeedDone ? "bg-nordic-accent animate-pulse" : "bg-emerald-400"
              }`}
            />
            <span>{isFeedDone ? "Ready" : "Printing..."}</span>
          </span>
          <span className="font-mono text-[10px]">{printProgress}%</span>
        </div>

        <div className="w-full h-1.5 bg-[#141413] rounded-full overflow-hidden flex items-center justify-center">
          <div className="w-full h-[1px] bg-[#33312D]" />
        </div>
      </div>

      {/* Paper emerging smoothly */}
      <div className="w-full overflow-hidden relative pt-0.5 max-h-[540px] flex justify-center">
        <motion.div
          initial={{ y: -380, opacity: 0.9 }}
          animate={{
            y: `${(printProgress / 100) * 0 - (100 - printProgress) * 3.5}px`,
            opacity: 1,
          }}
          transition={{ ease: "easeOut", duration: 0.05 }}
          className="origin-top"
        >
          <ThermalReceipt receipt={receipt} />
        </motion.div>
      </div>
    </div>
  );
};
