/**
 * Web Bluetooth ESC/POS Thermal Printer Driver
 */

// Web Bluetooth API Type Declarations
interface BluetoothRemoteGATTCharacteristic {
  properties: {
    write?: boolean;
    writeWithoutResponse?: boolean;
    notify?: boolean;
  };
  writeValue(value: BufferSource): Promise<void>;
  writeValueWithoutResponse(value: BufferSource): Promise<void>;
}

interface BluetoothRemoteGATTService {
  getCharacteristics(): Promise<BluetoothRemoteGATTCharacteristic[]>;
}

interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryServices(): Promise<BluetoothRemoteGATTService[]>;
}

interface BluetoothDevice extends EventTarget {
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
}

interface RequestDeviceOptions {
  filters?: Array<{ services?: string[]; name?: string; namePrefix?: string }>;
  optionalServices?: string[];
  acceptAllDevices?: boolean;
}

interface BluetoothNavigator extends Navigator {
  bluetooth?: {
    requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
  };
}

// Well-known BLE Service UUIDs used by thermal receipt printers
const KNOWN_PRINTER_SERVICES = [
  "000018f0-0000-1000-8000-00805f9b34fb", // Standard ESC/POS Service
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2", // PeriPage / Xprinter BLE
  "49535343-fe7d-4ae5-8fa9-9fafd205e455", // ISSC / Microchip Transparent UART
  "0000ff00-0000-1000-8000-00805f9b34fb", // Common Chinese Thermal POS
  "0000ae00-0000-1000-8000-00805f9b34fb", // POS-58 / PT-210 series
  "0000af00-0000-1000-8000-00805f9b34fb", // Zjiang series
];

let cachedDevice: BluetoothDevice | null = null;
let cachedCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

export interface BluetoothPrinterStatus {
  isSupported: boolean;
  isConnected: boolean;
  deviceName: string | null;
}

export function isWebBluetoothSupported(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as BluetoothNavigator;
  return !!nav.bluetooth && typeof nav.bluetooth.requestDevice === "function";
}

export function getBluetoothPrinterStatus(): BluetoothPrinterStatus {
  return {
    isSupported: isWebBluetoothSupported(),
    isConnected: !!(cachedDevice?.gatt?.connected && cachedCharacteristic),
    deviceName: cachedDevice?.name || null,
  };
}

/**
 * Connect to a Bluetooth thermal printer.
 * Prompts user with browser Bluetooth device picker (required 1x by browser security).
 */
export async function connectBluetoothPrinter(): Promise<string> {
  if (!isWebBluetoothSupported()) {
    throw new Error("Web Bluetooth tidak didukung di browser ini. Gunakan Chrome on Android.");
  }

  const nav = navigator as BluetoothNavigator;
  if (!nav.bluetooth) {
    throw new Error("Bluetooth API tidak tersedia.");
  }

  // Request device with popular thermal printer service UUIDs
  const device = await nav.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: KNOWN_PRINTER_SERVICES,
  });

  if (!device.gatt) {
    throw new Error("Device tidak memiliki antarmuka GATT.");
  }

  device.addEventListener("gattserverdisconnected", () => {
    cachedCharacteristic = null;
    console.warn("Bluetooth thermal printer terputus.");
  });

  const server = await device.gatt.connect();
  let writableChar: BluetoothRemoteGATTCharacteristic | null = null;

  // Try finding a writable characteristic in known services
  const services = await server.getPrimaryServices();
  for (const service of services) {
    try {
      const characteristics = await service.getCharacteristics();
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          writableChar = char;
          break;
        }
      }
    } catch {
      // Continue search in next service
    }
    if (writableChar) break;
  }

  if (!writableChar) {
    throw new Error("Tidak dapat menemukan characteristic penulisan data pada printer ini.");
  }

  cachedDevice = device;
  cachedCharacteristic = writableChar;

  return device.name || "Thermal Printer";
}

/**
 * Disconnect current printer
 */
export function disconnectBluetoothPrinter(): void {
  if (cachedDevice?.gatt?.connected) {
    cachedDevice.gatt.disconnect();
  }
  cachedDevice = null;
  cachedCharacteristic = null;
}

/**
 * Send raw ESC/POS bytes to the connected Bluetooth thermal printer
 */
export async function printViaBluetooth(bytes: Uint8Array): Promise<boolean> {
  if (!cachedCharacteristic || !cachedDevice?.gatt?.connected) {
    // If not connected yet, try connecting first (will prompt device selection)
    await connectBluetoothPrinter();
  }

  if (!cachedCharacteristic) {
    throw new Error("Printer Bluetooth belum terhubung.");
  }

  // Chunk bytes to fit within standard BLE MTU limits (100 bytes per chunk)
  // Use acknowledged writes when available: write-without-response silently
  // drops packets when the printer buffer is full, causing broken image rows.
  const chunkSize = 100;
  const useAcked = !!cachedCharacteristic.properties.write;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.slice(offset, offset + chunkSize);
    if (useAcked) {
      await cachedCharacteristic.writeValue(chunk);
    } else {
      await cachedCharacteristic.writeValueWithoutResponse(chunk);
    }
    // Interval to allow thermal printer buffer to process
    await new Promise((resolve) => setTimeout(resolve, useAcked ? 10 : 40));
  }

  return true;
}
