import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Printer,
  Download,
  RotateCcw,
  Check,
  CheckCircle2,
  AlertCircle,
  Bluetooth,
  Settings,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { ThermalReceipt } from "../components/receipt/ThermalReceipt";
import { PrinterModal } from "../components/printer/PrinterModal";
import { useExperienceStore } from "../store/experienceStore";
import { EXPRESSIONS } from "../data/expressions";
import { generateReceiptData } from "../utils/receiptGenerator";
import { downloadReceiptImage } from "../utils/receiptImageExport";
import {
  printThermalReceipt,
  getBluetoothPrinterStatus,
  checkRawBtService,
  getSavedPrintMode,
} from "../utils/thermalPrinter";

export const ReceiptPreview: React.FC = () => {
  const {
    sessionId,
    selectedSocials,
    selectedExpressionIds,
    expressionInputs,
    paperWidth,
    setPaperWidth,
    setStep,
    resetSession,
    isPrinting,
    setIsPrinting,
    hasPrinted,
    setHasPrinted,
  } = useExperienceStore();

  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [btStatus, setBtStatus] = useState(getBluetoothPrinterStatus());
  const [isRawBtReady, setIsRawBtReady] = useState(false);
  const [printFeedback, setPrintFeedback] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    setBtStatus(getBluetoothPrinterStatus());
    checkRawBtService().then((active) => setIsRawBtReady(active));
  }, [isPrinterModalOpen]);

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

  const handlePrint = async () => {
    setIsPrinting(true);
    setPrintFeedback(null);
    try {
      const result = await printThermalReceipt(receiptData);
      setHasPrinted(true);
      setBtStatus(getBluetoothPrinterStatus());

      if (result.method === "bluetooth") {
        setPrintFeedback({
          type: "success",
          text: "Struk langsung dicetak ke thermal printer via Bluetooth (tanpa preview).",
        });
      } else if (result.method === "rawbt") {
        setPrintFeedback({
          type: "success",
          text: "Struk dicetak via RawBT Companion (tanpa preview).",
        });
      } else {
        setPrintFeedback({
          type: "info",
          text: "Membuka dialog cetak browser.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPrintFeedback({
        type: "error",
        text: msg,
      });
      if (msg.includes("belum tersambung") || msg.includes("belum terhubung")) {
        setIsPrinterModalOpen(true);
      }
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadReceiptImage(receiptData);
      setHasPrinted(true);
    } finally {
      setIsDownloading(false);
    }
  };

  const hasAutoPrintedRef = useRef(false);

  useEffect(() => {
    if (!hasAutoPrintedRef.current) {
      hasAutoPrintedRef.current = true;
      handlePrint();
    }

    let resetTimer: ReturnType<typeof setTimeout> | undefined;
    const feedbackTimer = setTimeout(() => {
      setShowSuccessOverlay(true);
      setPrintFeedback({
        type: "success",
        text: "Berhasil! Terima kasih telah berpartisipasi. Kembali ke halaman awal...",
      });
      resetTimer = setTimeout(() => {
        resetSession();
      }, 2000);
    }, 5000);

    return () => {
      clearTimeout(feedbackTimer);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  const isPrinterReady = btStatus.isConnected || isRawBtReady;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 sm:px-12 py-10 flex flex-col justify-between overflow-y-auto">
      {showSuccessOverlay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#FAF8F5] text-nordic-ink rounded-2xl p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-semibold">Selesai!</h3>
            <p className="text-sm text-nordic-muted">
              Terima kasih telah berpartisipasi. Kembali ke halaman awal...
            </p>
          </div>
        </div>
      )}
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-nordic-border/50">
        <div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-nordic-ink">
            Your receipt
          </h2>
          <p className="text-sm text-nordic-muted mt-1">
            A physical document of your digital expressions and systemic risks.
          </p>
        </div>

        {/* Top Right Controls: Printer Status & Paper Width */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Printer Setting Badge */}
          <button
            onClick={() => setIsPrinterModalOpen(true)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors ${
              isPrinterReady
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-white text-nordic-muted border-nordic-border hover:border-nordic-ink"
            }`}
            title="Buka pengaturan thermal printer"
          >
            {btStatus.isConnected ? (
              <Bluetooth size={14} className="text-blue-600" />
            ) : (
              <Printer size={14} />
            )}
            <span>
              {btStatus.isConnected
                ? `${btStatus.deviceName || "Thermal Printer"}`
                : isRawBtReady
                  ? "RawBT Siap"
                  : "Setup Printer"}
            </span>
          </button>

          {/* Paper width selector */}
          <div className="flex items-center space-x-1 bg-nordic-surface p-1 rounded-full text-xs">
            <button
              onClick={() => setPaperWidth("58mm")}
              className={`px-2.5 py-1 rounded-full transition-all ${
                paperWidth === "58mm"
                  ? "bg-white text-nordic-ink shadow-subtle font-medium"
                  : "text-nordic-muted hover:text-nordic-ink"
              }`}
            >
              58mm
            </button>
            <button
              onClick={() => setPaperWidth("80mm")}
              className={`px-2.5 py-1 rounded-full transition-all ${
                paperWidth === "80mm"
                  ? "bg-white text-nordic-ink shadow-subtle font-medium"
                  : "text-nordic-muted hover:text-nordic-ink"
              }`}
            >
              80mm
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Receipt Left + Actions Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-8">
        {/* Left: Thermal Receipt */}
        <div className="lg:col-span-6 flex justify-center py-2">
          <ThermalReceipt receipt={receiptData} />
        </div>

        {/* Right: Actions */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold tracking-tight text-nordic-ink">
              {hasPrinted ? "Result generated" : "Ready to output"}
            </h3>
            <p className="text-sm sm:text-base text-nordic-muted leading-relaxed">
              {hasPrinted
                ? "Your thermal receipt has been outputted. Keep this physical artifact with you as proof of your digital transaction."
                : "Print directly to your thermal printer without preview dialog."}
            </p>
          </div>

          {/* Feedback Alert if any */}
          {printFeedback && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center space-x-2 border ${
                printFeedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : printFeedback.type === "error"
                    ? "bg-amber-50 text-amber-900 border-amber-300"
                    : "bg-blue-50 text-blue-800 border-blue-200"
              }`}
            >
              {printFeedback.type === "success" ? (
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle size={16} className="shrink-0 text-amber-600" />
              )}
              <span className="leading-snug">{printFeedback.text}</span>
            </div>
          )}

          {/* Connection prompt if not connected */}
          {!isPrinterReady && (
            <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-lg text-xs text-neutral-700 flex items-center justify-between">
              <span>Printer thermal belum terhubung.</span>
              <button
                onClick={() => setIsPrinterModalOpen(true)}
                className="underline font-semibold text-neutral-900 hover:text-black ml-2"
              >
                Hubungkan Sekarang
              </button>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                size="xl"
                variant="accent"
                icon={<Printer size={18} />}
                onClick={handlePrint}
                disabled={isPrinting}
                className="w-full sm:flex-1"
              >
                {isPrinting ? "Mencetak..." : "Print receipt"}
              </Button>

              <Button
                size="xl"
                variant="secondary"
                icon={<Download size={18} />}
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full sm:flex-1"
              >
                {isDownloading ? "Saving..." : "Save image"}
              </Button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-nordic-muted pt-1">
              <span>Mode: Direct Thermal (ESC/POS tanpa preview)</span>
              <button
                type="button"
                onClick={() => setIsPrinterModalOpen(true)}
                className="underline hover:text-nordic-ink"
              >
                Ubah printer
              </button>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-3 border-t border-nordic-border/50">
              <Button
                size="md"
                variant="outline"
                onClick={() => setStep("selection")}
                className="text-xs"
              >
                Edit choices
              </Button>

              <Button
                size="md"
                variant="ghost"
                icon={<RotateCcw size={14} />}
                iconPosition="left"
                onClick={resetSession}
                className="text-xs text-nordic-muted"
              >
                Start a new experience
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Printer Modal */}
      <PrinterModal isOpen={isPrinterModalOpen} onClose={() => setIsPrinterModalOpen(false)} />
    </div>
  );
};
