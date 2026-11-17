import React, { useState, useEffect } from "react";
import {
  Printer,
  Bluetooth,
  Smartphone,
  Settings,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "../ui/Button";
import {
  PrintMode,
  getSavedPrintMode,
  savePrintMode,
  isAndroidDevice,
  isWebBluetoothSupported,
  getBluetoothPrinterStatus,
  connectBluetoothPrinter,
  disconnectBluetoothPrinter,
  checkRawBtService,
  printTestReceipt,
} from "../../utils/thermalPrinter";
import { useExperienceStore } from "../../store/experienceStore";

interface PrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrinterModal: React.FC<PrinterModalProps> = ({ isOpen, onClose }) => {
  const { paperWidth, setPaperWidth } = useExperienceStore();
  const [selectedMode, setSelectedMode] = useState<PrintMode>(getSavedPrintMode());
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  // Bluetooth state
  const [btStatus, setBtStatus] = useState(getBluetoothPrinterStatus());
  const [isConnectingBt, setIsConnectingBt] = useState(false);

  // RawBT state
  const [isRawBtRunning, setIsRawBtRunning] = useState<boolean | null>(null);
  const [isCheckingRawBt, setIsCheckingRawBt] = useState(false);

  const isAndroid = isAndroidDevice();
  const isBtSupported = isWebBluetoothSupported();

  useEffect(() => {
    if (isOpen) {
      setBtStatus(getBluetoothPrinterStatus());
      if (isAndroid) {
        verifyRawBt();
      }
    }
  }, [isOpen, isAndroid]);

  const verifyRawBt = async () => {
    setIsCheckingRawBt(true);
    const active = await checkRawBtService();
    setIsRawBtRunning(active);
    setIsCheckingRawBt(false);
  };

  const handleModeChange = (mode: PrintMode) => {
    setSelectedMode(mode);
    savePrintMode(mode);
  };

  const handleConnectBluetooth = async () => {
    setIsConnectingBt(true);
    setTestStatus(null);
    try {
      const deviceName = await connectBluetoothPrinter();
      setBtStatus(getBluetoothPrinterStatus());
      setTestStatus(`Terhubung ke ${deviceName}`);
      handleModeChange("bluetooth");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestStatus(`Bluetooth Error: ${msg}`);
    } finally {
      setIsConnectingBt(false);
    }
  };

  const handleDisconnectBluetooth = () => {
    disconnectBluetoothPrinter();
    setBtStatus(getBluetoothPrinterStatus());
    setTestStatus("Bluetooth diputuskan.");
  };

  const handleTestPrint = async () => {
    setIsTesting(true);
    setTestStatus("Mencetak test ticket...");
    try {
      await printTestReceipt(selectedMode, paperWidth);
      setTestStatus("Test print berhasil dikirim!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestStatus(`Gagal: ${msg}`);
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF8F5] text-nordic-ink border border-nordic-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-nordic-border/70 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-nordic-surface rounded-lg text-nordic-ink">
              <Printer size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-nordic-ink leading-tight">
                Konfigurasi Thermal Printer
              </h3>
              <p className="text-xs text-nordic-muted">
                Pengaturan cetak langsung tanpa preview dialog (Xiaomi Pad / Kiosk)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-nordic-muted hover:text-nordic-ink rounded-lg hover:bg-nordic-surface transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Target Environment Badge */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-nordic-surface text-xs text-nordic-muted">
            <div className="flex items-center space-x-2">
              <Smartphone
                size={16}
                className={isAndroid ? "text-emerald-600" : "text-neutral-500"}
              />
              <span>
                Perangkat:{" "}
                <strong>{isAndroid ? "Android Tablet / Xiaomi Pad" : "Desktop / Lainnya"}</strong>
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white border border-nordic-border">
              {paperWidth} Thermal
            </span>
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-nordic-muted">
              Pilih Metode Cetak
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Auto */}
              <button
                type="button"
                onClick={() => handleModeChange("auto")}
                className={`p-3 text-left rounded-lg border transition-all ${
                  selectedMode === "auto"
                    ? "border-nordic-ink bg-white shadow-sm ring-1 ring-nordic-ink"
                    : "border-nordic-border/80 bg-white/60 hover:bg-white"
                }`}
              >
                <div className="font-medium text-sm flex items-center justify-between">
                  <span>Otomatis (Smart)</span>
                  {selectedMode === "auto" && <CheckCircle size={14} className="text-nordic-ink" />}
                </div>
                <div className="text-[11px] text-nordic-muted mt-1 leading-snug">
                  Prioritaskan RawBT jika di Android, atau Bluetooth jika terkoneksi.
                </div>
              </button>

              {/* RawBT Companion */}
              <button
                type="button"
                onClick={() => handleModeChange("rawbt")}
                className={`p-3 text-left rounded-lg border transition-all ${
                  selectedMode === "rawbt"
                    ? "border-nordic-ink bg-white shadow-sm ring-1 ring-nordic-ink"
                    : "border-nordic-border/80 bg-white/60 hover:bg-white"
                }`}
              >
                <div className="font-medium text-sm flex items-center justify-between">
                  <span>RawBT Companion</span>
                  {selectedMode === "rawbt" && (
                    <CheckCircle size={14} className="text-nordic-ink" />
                  )}
                </div>
                <div className="text-[11px] text-nordic-muted mt-1 leading-snug">
                  Background service via localhost:40213. Tanpa dialog sama sekali.
                </div>
              </button>

              {/* Web Bluetooth */}
              <button
                type="button"
                onClick={() => handleModeChange("bluetooth")}
                className={`p-3 text-left rounded-lg border transition-all ${
                  selectedMode === "bluetooth"
                    ? "border-nordic-ink bg-white shadow-sm ring-1 ring-nordic-ink"
                    : "border-nordic-border/80 bg-white/60 hover:bg-white"
                }`}
              >
                <div className="font-medium text-sm flex items-center justify-between">
                  <span>Web Bluetooth</span>
                  {selectedMode === "bluetooth" && (
                    <CheckCircle size={14} className="text-nordic-ink" />
                  )}
                </div>
                <div className="text-[11px] text-nordic-muted mt-1 leading-snug">
                  Direct pairing via Chrome. Tidak butuh install aplikasi lain.
                </div>
              </button>

              {/* Browser Dialog */}
              <button
                type="button"
                onClick={() => handleModeChange("browser")}
                className={`p-3 text-left rounded-lg border transition-all ${
                  selectedMode === "browser"
                    ? "border-nordic-ink bg-white shadow-sm ring-1 ring-nordic-ink"
                    : "border-nordic-border/80 bg-white/60 hover:bg-white"
                }`}
              >
                <div className="font-medium text-sm flex items-center justify-between">
                  <span>Browser Print</span>
                  {selectedMode === "browser" && (
                    <CheckCircle size={14} className="text-nordic-ink" />
                  )}
                </div>
                <div className="text-[11px] text-nordic-muted mt-1 leading-snug">
                  Dialog cetak sistem standar (window.print).
                </div>
              </button>
            </div>
          </div>

          {/* Web Bluetooth Connection Section */}
          <div className="p-4 rounded-lg border border-nordic-border bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-semibold">
                <Bluetooth
                  size={16}
                  className={btStatus.isConnected ? "text-blue-600" : "text-neutral-400"}
                />
                <span>Status Bluetooth</span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  btStatus.isConnected
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                }`}
              >
                {btStatus.isConnected ? `Tersambung: ${btStatus.deviceName}` : "Belum Tersambung"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {!btStatus.isConnected ? (
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Bluetooth size={14} />}
                  onClick={handleConnectBluetooth}
                  disabled={!isBtSupported || isConnectingBt}
                >
                  {isConnectingBt ? "Mencari printer..." : "Hubungkan Printer Bluetooth"}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDisconnectBluetooth}
                  className="text-red-600 hover:text-red-700"
                >
                  Putuskan Bluetooth
                </Button>
              )}

              {!isBtSupported && (
                <span className="text-[11px] text-amber-600 flex items-center space-x-1">
                  <AlertCircle size={12} />
                  <span>Web Bluetooth tidak aktif di browser ini</span>
                </span>
              )}
            </div>
          </div>

          {/* RawBT Service Status (if Android) */}
          {isAndroid && (
            <div className="p-4 rounded-lg border border-nordic-border bg-white space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-nordic-ink">RawBT Local Service (:40213)</span>
                <button
                  onClick={verifyRawBt}
                  disabled={isCheckingRawBt}
                  className="flex items-center space-x-1 text-nordic-muted hover:text-nordic-ink"
                >
                  <RefreshCw size={12} className={isCheckingRawBt ? "animate-spin" : ""} />
                  <span>Cek ulang</span>
                </button>
              </div>
              <p className="text-nordic-muted text-[11px] leading-relaxed">
                {isRawBtRunning
                  ? "✓ RawBT local web server aktif di tablet. Siap mencetak tanpa preview."
                  : "Tips: Di Xiaomi Pad, pastikan aplikasi RawBT terpasang dan opsi 'Web print / Server' aktif."}
              </p>
            </div>
          )}

          {/* Paper Width Options */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-nordic-muted">
              Ukuran Kertas Thermal
            </label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setPaperWidth("58mm")}
                className={`flex-1 py-2 px-3 text-xs rounded-lg border font-medium transition-all ${
                  paperWidth === "58mm"
                    ? "border-nordic-ink bg-nordic-ink text-white"
                    : "border-nordic-border bg-white text-nordic-ink hover:bg-nordic-surface"
                }`}
              >
                58 mm (Standard Mobile / Kiosk)
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth("80mm")}
                className={`flex-1 py-2 px-3 text-xs rounded-lg border font-medium transition-all ${
                  paperWidth === "80mm"
                    ? "border-nordic-ink bg-nordic-ink text-white"
                    : "border-nordic-border bg-white text-nordic-ink hover:bg-nordic-surface"
                }`}
              >
                80 mm (POS Lebar)
              </button>
            </div>
          </div>

          {/* Status Message */}
          {testStatus && (
            <div className="p-3 rounded-lg bg-neutral-100 text-neutral-800 text-xs font-mono border border-neutral-200">
              {testStatus}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-nordic-border/70 flex items-center justify-between bg-white">
          <Button
            size="sm"
            variant="outline"
            icon={<RefreshCw size={14} className={isTesting ? "animate-spin" : ""} />}
            onClick={handleTestPrint}
            disabled={isTesting}
          >
            {isTesting ? "Mencetak..." : "Test Print 1 Lembar"}
          </Button>

          <Button size="sm" variant="accent" onClick={onClose}>
            Selesai &amp; Simpan
          </Button>
        </div>
      </div>
    </div>
  );
};
