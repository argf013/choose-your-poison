import React from "react";
import { KioskContainer } from "./components/layout/KioskContainer";
import { useExperienceStore } from "./store/experienceStore";

// Expose store globally for kiosk debugging / automated testing
if (typeof window !== "undefined") {
  (window as unknown as { __store: typeof useExperienceStore }).__store = useExperienceStore;
}

export function App() {
  return <KioskContainer />;
}

export default App;
