import React, { useState, useMemo, useEffect } from "react";
import {
  Printer,
  Download,
  RotateCcw,
  Settings,
  CheckCircle2,
  AlertCircle,
  Bluetooth,
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
  getSavedPrintMode,
  getBluetoothPrinterStatus,
  checkRawBtService,
  isAndroidDevice,
} from "../utils/thermalPrinter";

export const PrintScreen: React.FC = () => {
  const {
    sessionId,
    selectedSocials,
    selectedExpressionIds,
    expressionInputs,
    paperWidth,
    resetSession,
    isPrinting,
    setIsPrinting,
    hasPrinted,
    setHasPrinted,
  } = useExperienceStore();

  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [btStatus, setBtStatus] = useState(getBluetoothPrinterStatus());
  const [isRawBtReady, setIsRawBtReady] = useState(false);
  const [printFeedback, setPrintFeedback] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const currentMode = getSavedPrintMode();
  const isAndroid = isAndroidDevice();

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
      // If printer not connected, automatically suggest opening settings
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

  // Determine current connection label
  const isPrinterReady = btStatus.isConnected || isRawBtReady;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 sm:px-12 py-10 flex flex-col justify-between overflow-y-auto">
      {/* Header */}
      <div className="pb-6 border-b border-nordic-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-nordic-ink">
            Your thermal receipt
          </h2>
          <p className="text-sm text-nordic-muted mt-1">
            The physical documentation of your digital surrender.
          </p>
        </div>

        {/* Quick Printer Setting Badge */}
        <button
          onClick={() => setIsPrinterModalOpen(true)}
          className={`self-start sm:self-auto flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
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
              ? `Tersambung: ${btStatus.deviceName || "Thermal Printer"}`
              : isRawBtReady
                ? "RawBT Siap (Android)"
                : "⚙️ Setup Printer Thermal (Tanpa Preview)"}
          </span>
        </button>
      </div>

      {/* Main Grid: Centered Receipt + Clean Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-8">
        {/* Left: The Receipt Presentation */}
        <div className="lg:col-span-6 flex justify-center">
          <ThermalReceipt receipt={receiptData} />
        </div>

        {/* Right: Actions */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold tracking-tight text-nordic-ink">
              {hasPrinted ? "Artifact generated" : "Ready to output"}
            </h3>
            <p className="text-sm sm:text-base text-nordic-muted leading-relaxed">
              {hasPrinted
                ? "Your receipt has been generated. Keep this record as evidence of your conscious trade-off."
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
              <span>Printer thermal belum terhubung ke tablet.</span>
              <button
                onClick={() => setIsPrinterModalOpen(true)}
                className="underline font-semibold text-neutral-900 hover:text-black ml-2"
              >
                Hubungkan Sekarang
              </button>
            </div>
          )}

          <div className="space-y-3 pt-1">
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
              <span>Mode: ESC/POS Direct (Tanpa Preview)</span>
              <button
                type="button"
                onClick={() => setIsPrinterModalOpen(true)}
                className="underline hover:text-nordic-ink"
              >
                Ubah mode printer
              </button>
            </div>

            <div className="pt-2">
              <Button
                size="lg"
                variant="outline"
                icon={<RotateCcw size={16} />}
                iconPosition="left"
                onClick={resetSession}
                className="w-full sm:w-auto"
              >
                Start a new experience
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Printer Configuration Modal */}
      <PrinterModal isOpen={isPrinterModalOpen} onClose={() => setIsPrinterModalOpen(false)} />
    </div>
  );
};
