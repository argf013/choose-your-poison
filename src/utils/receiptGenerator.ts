import { ExpressionInputs, ExpressionItem, ReceiptData } from "../types";
import { INSTALLATION_INFO } from "../data/expressions";

export function formatInstallationDate(timestamp: number = Date.now()): {
  formatted: string;
  iso: string;
  timeOnly: string;
} {
  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, "0");
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  const secs = String(d.getSeconds()).padStart(2, "0");

  return {
    formatted: `${day} ${month} ${year} - ${hours}:${mins}:${secs}`,
    iso: d.toISOString(),
    timeOnly: `${hours}:${mins}:${secs}`,
  };
}

export function generateReceiptData(
  sessionId: string,
  selectedExpressions: ExpressionItem[],
  paperWidth: "58mm" | "80mm" = "58mm",
  selectedSocials: string[] = [],
  expressionInputs: ExpressionInputs = {},
  socialHandles: Record<string, string> = {}
): ReceiptData {
  const { formatted, iso } = formatInstallationDate();

  // Create deterministic checksum based on session ID and selections
  const seed = `${sessionId}:${selectedExpressions.map((e) => e.code).join(",")}:${iso.slice(0, 10)}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const checksum = `YP-${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}`;

  const hiddenCosts = [
    "Your facial & biometric geometry.",
    "Your contextual & temporal opinions.",
    "Your spatial patterns and physical habits.",
    "Your domestic boundaries and intimate records.",
    "Your civic sovereignty and digital dossier.",
  ];

  return {
    sessionId,
    timestamp: formatted,
    isoDate: iso,
    selectedSocials,
    socialHandles,
    selectedExpressions,
    expressionInputs,
    hiddenCosts,
    terminalLocation: INSTALLATION_INFO.location,
    paperWidth,
    checksum,
  };
}

/**
 * ESC/POS Thermal Command Buffer Generator
 * Prepares raw ESC/POS byte sequence for future direct serial / WebUSB / WebBluetooth thermal printer integration
 */
export function generateEscPosBuffer(receipt: ReceiptData): Uint8Array {
  const ESC = 0x1b;
  const GS = 0x1d;
  const LF = 0x0a;

  const commands: number[] = [
    ESC,
    0x40, // Initialize printer
    ESC,
    0x61,
    0x01, // Center align
    ESC,
    0x45,
    0x01, // Bold ON
  ];

  const appendText = (text: string) => {
    for (let i = 0; i < text.length; i++) {
      commands.push(text.charCodeAt(i));
    }
    commands.push(LF);
  };

  appendText("--------------------------------");
  appendText("      CHOOSE YOUR POISON        ");
  appendText("FREEDOM OF EXPRESSION TERMINAL  ");
  appendText("--------------------------------");

  commands.push(ESC, 0x45, 0x00); // Bold OFF
  commands.push(ESC, 0x61, 0x00); // Left align

  appendText(`SESSION: ${receipt.sessionId}`);
  appendText(`DATE   : ${receipt.timestamp}`);
  appendText(`LOC    : ${receipt.terminalLocation}`);
  appendText("");
  appendText("YOUR SELECTIONS:");
  appendText("");

  receipt.selectedExpressions.forEach((item) => {
    appendText(`[${item.code}] ${item.title}`);
    appendText(`     RISK: ${item.primaryRisk}`);
    appendText("");
  });

  appendText("--------------------------------");
  appendText("THE HIDDEN COST:");
  appendText("Your privacy.");
  appendText("Your identity.");
  appendText("Your digital footprint.");
  appendText("--------------------------------");
  appendText("");

  commands.push(ESC, 0x61, 0x01); // Center align
  appendText("YOU CHOSE YOUR POISON.");
  appendText("You knew the risks.");
  appendText("You made the choice.");
  appendText("");
  appendText(`VERIFICATION: ${receipt.checksum}`);
  appendText("--------------------------------");
  appendText("THANK YOU FOR YOUR EXPRESSION.");
  appendText("--------------------------------");

  // Feed & paper cut
  commands.push(LF, LF, LF, LF);
  commands.push(GS, 0x56, 0x41, 0x10); // Cut paper

  return new Uint8Array(commands);
}
