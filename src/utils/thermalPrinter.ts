import { ReceiptData } from "../types";
import { generateEscPosReceipt, EscPosBuilder } from "./escposGenerator";
import {
  isWebBluetoothSupported,
  getBluetoothPrinterStatus,
  connectBluetoothPrinter,
  disconnectBluetoothPrinter,
  printViaBluetooth,
} from "./bluetoothPrinter";
import { printViaRawBt, checkRawBtService } from "./rawbtPrinter";
import { printReceiptDocument } from "./printReceipt";

export type PrintMode = "auto" | "rawbt" | "bluetooth" | "browser";

const STORAGE_KEY_PRINT_MODE = "your_poison_print_mode";

export function getSavedPrintMode(): PrintMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PRINT_MODE);
    if (saved === "auto" || saved === "rawbt" || saved === "bluetooth" || saved === "browser") {
      return saved;
    }
  } catch {
    // Ignore localStorage errors
  }
  return "auto";
}

export function savePrintMode(mode: PrintMode): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRINT_MODE, mode);
  } catch {
    // Ignore localStorage errors
  }
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // Handles normal Android UA and desktop mode on Android tablets (Linux + touch)
  return /Android/i.test(ua) || (navigator.maxTouchPoints > 1 && /Linux/i.test(ua));
}

export interface PrintExecutionResult {
  success: boolean;
  method: "rawbt" | "bluetooth" | "browser";
  message: string;
}

/**
 * Execute direct thermal printing without print preview dialog.
 * NEVER secretly falls back to window.print() unless explicitly requested.
 */
export async function printThermalReceipt(
  receipt: ReceiptData,
  mode: PrintMode = getSavedPrintMode()
): Promise<PrintExecutionResult> {
  const escposBytes = generateEscPosReceipt(receipt);

  // 1. Force Web Bluetooth
  if (mode === "bluetooth") {
    try {
      await printViaBluetooth(escposBytes);
      return {
        success: true,
        method: "bluetooth",
        message: "Struk berhasil dicetak via Bluetooth ESC/POS (tanpa preview).",
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`Gagal mencetak via Bluetooth: ${errorMsg}`);
    }
  }

  // 2. Force RawBT (Android Companion)
  if (mode === "rawbt") {
    try {
      const ok = await printViaRawBt(escposBytes);
      if (!ok) {
        throw new Error("RawBT tidak merespons. Pastikan aplikasi RawBT terpasang dan aktif.");
      }
      return {
        success: true,
        method: "rawbt",
        message: "Job cetak dikirim langsung ke RawBT Companion.",
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`Gagal mencetak via RawBT: ${errorMsg}`);
    }
  }

  // 3. Explicit Browser Print Dialog (HANYA jika user sengaja memilih mode 'browser')
  if (mode === "browser") {
    await printReceiptDocument();
    return {
      success: true,
      method: "browser",
      message: "Print dialog browser dibuka.",
    };
  }

  // 4. SMART AUTO MODE (Tanpa dialog preview):
  // A. Jika printer Bluetooth sudah terkoneksi sebelumnya -> langsung tembak ESC/POS
  const btStatus = getBluetoothPrinterStatus();
  if (btStatus.isConnected) {
    try {
      await printViaBluetooth(escposBytes);
      return {
        success: true,
        method: "bluetooth",
        message: `Struk dicetak via Bluetooth (${btStatus.deviceName || "Printer"}).`,
      };
    } catch (err: unknown) {
      console.warn("Koneksi Bluetooth tersimpan gagal, mencoba alternatif...", err);
    }
  }

  // B. Cek apakah background service RawBT aktif di tablet (port 40213)
  const isRawBtActive = await checkRawBtService();
  if (isRawBtActive) {
    try {
      await printViaRawBt(escposBytes);
      return {
        success: true,
        method: "rawbt",
        message: "Struk dicetak via RawBT Service (tanpa dialog).",
      };
    } catch (err: unknown) {
      console.warn("RawBT print gagal:", err);
    }
  }

  // C. Jika Web Bluetooth didukung di browser ini (Chrome on Android / Xiaomi Pad),
  // langsung buka dialog pilih Bluetooth printer agar langsung terhubung dan mencetak!
  if (isWebBluetoothSupported()) {
    try {
      await connectBluetoothPrinter();
      await printViaBluetooth(escposBytes);
      return {
        success: true,
        method: "bluetooth",
        message: "Printer Bluetooth terhubung & struk langsung dicetak!",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("cancelled") || msg.includes("User cancelled")) {
        throw new Error("Pencarian printer Bluetooth dibatalkan.");
      }
      throw new Error(`Bluetooth error: ${msg}`);
    }
  }

  // D. Jika perangkat Android tapi RawBT belum aktif dan Bluetooth tidak didukung
  if (isAndroidDevice()) {
    // Coba kirim via scheme RawBT
    try {
      await printViaRawBt(escposBytes);
      return {
        success: true,
        method: "rawbt",
        message: "Perintah cetak dikirim ke aplikasi RawBT.",
      };
    } catch {
      // lanjut ke notifikasi setup
    }
  }

  // E. JANGAN otomatis buka window.print()! Beri tahu operator untuk menyiapkan koneksi printer.
  throw new Error(
    "Printer thermal belum tersambung. Silakan klik tombol 'Printer' untuk menghubungkan Bluetooth atau aktifkan RawBT."
  );
}

/**
 * Send a quick test ticket to verify thermal printer connection
 */
export async function printTestReceipt(
  mode: PrintMode = getSavedPrintMode(),
  paperWidth: "58mm" | "80mm" = "58mm"
): Promise<boolean> {
  const builder = new EscPosBuilder(paperWidth);
  builder
    .init()
    .align("center")
    .bold(true)
    .textDoubleSize(true)
    .line("CHOOSE YOUR POISON")
    .textDoubleSize(false)
    .line("THERMAL PRINTER TEST")
    .bold(false)
    .doubleDivider()
    .align("left")
    .line(`MODE:       ${mode.toUpperCase()}`)
    .line(`DEVICE:     ${isAndroidDevice() ? "Android Tab" : "Desktop/Other"}`)
    .line(`TIMESTAMP:  ${new Date().toLocaleTimeString()}`)
    .divider()
    .align("center")
    .bold(true)
    .line("TEST SUCCESSFUL!")
    .line("SILENT PRINT ACTIVE")
    .bold(false)
    .cut(3);

  const bytes = builder.build();

  if (mode === "bluetooth") {
    return printViaBluetooth(bytes);
  }
  if (mode === "rawbt") {
    return printViaRawBt(bytes);
  }
  if (mode === "auto") {
    const bt = getBluetoothPrinterStatus();
    if (bt.isConnected) {
      return printViaBluetooth(bytes);
    }
    const rawbtActive = await checkRawBtService();
    if (rawbtActive) {
      return printViaRawBt(bytes);
    }
    if (isWebBluetoothSupported()) {
      await connectBluetoothPrinter();
      return printViaBluetooth(bytes);
    }
  }

  return printReceiptDocument();
}

export {
  isWebBluetoothSupported,
  getBluetoothPrinterStatus,
  connectBluetoothPrinter,
  disconnectBluetoothPrinter,
  checkRawBtService,
};
