export type ScreenStep =
  | "welcome"
  | "introduction"
  | "social"
  | "selection"
  | "reflection"
  | "receipt";

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

export interface IdentityData {
  name: string;
  birthPlaceDate: string;
  address: string;
  school: string;
  graduation: string;
}

export interface ExpressionInputs {
  facePhoto?: string;
  mindText?: string;
  locationText?: string;
  lifeText?: string;
  identity?: IdentityData;
}

export interface ReceiptData {
  sessionId: string;
  timestamp: string; // Formatted date e.g. 09 NOV 2026, 14:22:05
  isoDate: string;
  selectedSocials: string[];
  socialHandles?: Record<string, string>;
  selectedExpressions: ExpressionItem[];
  expressionInputs: ExpressionInputs;
  hiddenCosts: string[];
  terminalLocation: string;
  paperWidth: "58mm" | "80mm";
  checksum: string;
}
