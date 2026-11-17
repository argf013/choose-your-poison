export type ScreenStep = "welcome" | "introduction" | "selection" | "reflection" | "receipt";

export interface ExpressionItem {
  id: string;
  code: string; // e.g. "01", "02"
  title: string;
  subtitle: string;
  description: string;
  risks: string[];
  primaryRisk: string;
  consequenceQuote: string;
  category: "visual" | "voice" | "spatial" | "intimate" | "civic";
  iconName: string;
}

export interface ReceiptData {
  sessionId: string;
  timestamp: string; // Formatted date e.g. 09 NOV 2026, 14:22:05
  isoDate: string;
  selectedExpressions: ExpressionItem[];
  hiddenCosts: string[];
  terminalLocation: string;
  paperWidth: "58mm" | "80mm";
  checksum: string;
}
