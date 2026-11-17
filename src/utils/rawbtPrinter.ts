/**
 * RawBT Print Service Driver (Android Companion App)
 * Communicates with the RawBT app running in background on Android / Xiaomi Pad.
 */

const RAWBT_DEFAULT_PORT = 40213;

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Check if RawBT local HTTP service is running and accessible
 */
export async function checkRawBtService(port: number = RAWBT_DEFAULT_PORT): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);

  try {
    const res = await fetch(`http://localhost:${port}/`, {
      method: "GET",
      mode: "no-cors",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.type === "opaque" || res.ok;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}

/**
 * Send print job directly to RawBT background service via Localhost HTTP
 */
export async function printViaRawBtHttp(
  bytes: Uint8Array,
  port: number = RAWBT_DEFAULT_PORT
): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`http://localhost:${port}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-rawbt",
      },
      body: bytes,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("RawBT HTTP POST failed, attempting intent fallback...", err);
    return false;
  }
}

/**
 * Fallback to RawBT Android URI scheme (opens RawBT print service directly)
 */
export function printViaRawBtIntent(bytes: Uint8Array): void {
  const base64 = uint8ArrayToBase64(bytes);
  const rawbtUrl = `rawbt:base64,${base64}`;

  // Create an invisible iframe or trigger location to dispatch to Android app
  const link = document.createElement("a");
  link.href = rawbtUrl;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 500);
}

/**
 * Main RawBT print routine:
 * 1. Tries silent Localhost HTTP (Zero UI / background)
 * 2. If HTTP is disabled in RawBT, falls back to Android RawBT scheme
 */
export async function printViaRawBt(bytes: Uint8Array): Promise<boolean> {
  const httpSuccess = await printViaRawBtHttp(bytes);
  if (httpSuccess) {
    return true;
  }

  // If silent HTTP didn't respond, dispatch via scheme
  printViaRawBtIntent(bytes);
  return true;
}
