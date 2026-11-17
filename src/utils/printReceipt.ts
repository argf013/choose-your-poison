/**
 * Browser-based printing handler for thermal receipts
 */
export function printReceiptDocument(): Promise<boolean> {
  return new Promise((resolve) => {
    // Add print trigger class to body
    document.body.classList.add("printing-active");

    const afterPrintHandler = () => {
      document.body.classList.remove("printing-active");
      window.removeEventListener("afterprint", afterPrintHandler);
      resolve(true);
    };

    window.addEventListener("afterprint", afterPrintHandler);

    // Give browser a short tick to layout print styles
    setTimeout(() => {
      window.print();

      // Fallback for browsers that don't trigger afterprint reliably
      setTimeout(() => {
        document.body.classList.remove("printing-active");
        resolve(true);
      }, 1500);
    }, 120);
  });
}
