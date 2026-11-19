import { ReceiptData } from "../types";

export function downloadReceiptImage(receipt: ReceiptData): Promise<void> {
  return new Promise((resolve) => {
    const scale = 2; // Retina sharpness
    const width = 360 * scale;
    // Calculate required height based on items
    const baseHeight = 580;
    const itemHeight = receipt.selectedExpressions.length * 68;
    const height = (baseHeight + itemHeight) * scale;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve();

    // Scale context for retina clarity
    ctx.scale(scale, scale);

    const w = 360;
    let y = 30;

    // Background paper
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, height / scale);

    // Subtle paper border
    ctx.strokeStyle = "#E5E1D6";
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, w - 20, height / scale - 20);

    // Header
    y += 10;
    ctx.fillStyle = "#000000";
    ctx.font = "bold 16px 'Space Mono', 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("CHOOSE YOUR POISON", w / 2, y);

    y += 16;
    ctx.fillStyle = "#555555";
    ctx.font = "9px 'Space Mono', 'Courier New', monospace";
    ctx.fillText("FREEDOM OF EXPRESSION TERMINAL", w / 2, y);

    // Dashed divider helper
    const drawDashedLine = (posY: number, double = false) => {
      ctx.beginPath();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = "#888888";
      ctx.lineWidth = double ? 1.5 : 1;
      ctx.moveTo(25, posY);
      ctx.lineTo(w - 25, posY);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    y += 18;
    drawDashedLine(y, true);

    // Session Info
    y += 20;
    ctx.textAlign = "left";
    ctx.fillStyle = "#555555";
    ctx.font = "10px 'Space Mono', 'Courier New', monospace";
    ctx.fillText("SESSION:", 25, y);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 10px 'Space Mono', 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText(receipt.sessionId, w - 25, y);

    y += 16;
    ctx.textAlign = "left";
    ctx.fillStyle = "#555555";
    ctx.font = "10px 'Space Mono', 'Courier New', monospace";
    ctx.fillText("TIMESTAMP:", 25, y);
    ctx.fillStyle = "#000000";
    ctx.font = "10px 'Space Mono', 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText(receipt.timestamp, w - 25, y);

    if (receipt.selectedSocials && receipt.selectedSocials.length > 0) {
      y += 16;
      ctx.textAlign = "left";
      ctx.fillStyle = "#555555";
      ctx.font = "10px 'Space Mono', 'Courier New', monospace";
      ctx.fillText("PLATFORMS:", 25, y);
      ctx.fillStyle = "#000000";
      ctx.font = "10px 'Space Mono', 'Courier New', monospace";
      ctx.textAlign = "right";
      ctx.fillText(receipt.selectedSocials.join(", "), w - 25, y);
    }

    y += 18;
    drawDashedLine(y);

    // Recorded Expressions
    y += 20;
    ctx.textAlign = "left";
    ctx.fillStyle = "#444444";
    ctx.font = "bold 10px 'Space Mono', 'Courier New', monospace";
    ctx.fillText("RECORDED EXPRESSIONS & RISKS:", 25, y);

    y += 18;
    receipt.selectedExpressions.forEach((item) => {
      ctx.fillStyle = "#000000";
      ctx.font = "bold 11px 'Space Mono', 'Courier New', monospace";
      ctx.fillText(`[${item.code}] ${item.title}`, 25, y);

      y += 14;
      ctx.fillStyle = "#333333";
      ctx.font = "10px 'Space Mono', 'Courier New', monospace";
      ctx.fillText(`> Risk: ${item.primaryRisk}`, 32, y);

      if (item.id === "share-face" && receipt.expressionInputs?.facePhoto) {
        y += 13;
        ctx.fillStyle = "#000000";
        ctx.fillText("> [Face Photo Captured]", 32, y);
      }
      if (item.id === "speak-mind" && receipt.expressionInputs?.mindText) {
        y += 13;
        ctx.fillStyle = "#000000";
        ctx.fillText(`> "${receipt.expressionInputs.mindText.slice(0, 38)}"`, 32, y);
      }
      if (item.id === "share-location" && receipt.expressionInputs?.locationText) {
        y += 13;
        ctx.fillStyle = "#000000";
        ctx.fillText(`> Loc: ${receipt.expressionInputs.locationText}`, 32, y);
      }
      if (item.id === "share-life" && receipt.expressionInputs?.lifeText) {
        y += 13;
        ctx.fillStyle = "#000000";
        ctx.fillText(`> "${receipt.expressionInputs.lifeText.slice(0, 38)}"`, 32, y);
      }
      if (item.id === "share-identity" && receipt.expressionInputs?.identity?.name) {
        y += 13;
        ctx.fillStyle = "#000000";
        ctx.fillText(`> Name: ${receipt.expressionInputs.identity.name}`, 32, y);
      }

      y += 13;
      ctx.fillStyle = "#666666";
      ctx.font = "italic 9px 'Space Mono', 'Courier New', monospace";
      // Truncate quote if needed to fit line
      const quote = `"${item.consequenceQuote.slice(0, 42)}..."`;
      ctx.fillText(quote, 32, y);

      y += 20;
    });

    drawDashedLine(y);

    // Hidden cost
    y += 20;
    ctx.fillStyle = "#000000";
    ctx.font = "bold 10px 'Space Mono', 'Courier New', monospace";
    ctx.fillText("THE HIDDEN COST:", 25, y);

    const costs = [
      "• Your biometric and facial geometry",
      "• Your permanent digital footprint",
      "• Your private contextual boundaries",
    ];
    costs.forEach((c) => {
      y += 15;
      ctx.fillStyle = "#444444";
      ctx.font = "10px 'Space Mono', 'Courier New', monospace";
      ctx.fillText(c, 25, y);
    });

    y += 20;
    drawDashedLine(y, true);

    // Paradox
    y += 22;
    ctx.textAlign = "center";
    ctx.fillStyle = "#000000";
    ctx.font = "bold 12px 'Space Mono', 'Courier New', monospace";
    ctx.fillText("YOU CHOSE YOUR POISON.", w / 2, y);

    y += 15;
    ctx.fillStyle = "#555555";
    ctx.font = "10px 'Space Mono', 'Courier New', monospace";
    ctx.fillText("You knew the risks.", w / 2, y);
    y += 14;
    ctx.fillText("You made the choice.", w / 2, y);

    // Barcode simulation
    y += 22;
    const barStartX = 40;
    const barTotalW = w - 80;
    const barH = 34;
    const numBars = 55;
    const barStep = barTotalW / numBars;

    ctx.fillStyle = "#000000";
    for (let i = 0; i < numBars; i++) {
      if ((i * 13 + receipt.sessionId.length) % 3 !== 0) {
        const barW = i % 5 === 0 ? 2.5 : 1.2;
        ctx.fillRect(barStartX + i * barStep, y, barW, barH);
      }
    }

    y += barH + 12;
    ctx.fillStyle = "#666666";
    ctx.font = "9px 'Space Mono', 'Courier New', monospace";
    ctx.fillText(`*${receipt.checksum}*`, w / 2, y);

    y += 16;
    drawDashedLine(y);

    // Closing
    y += 18;
    ctx.fillStyle = "#000000";
    ctx.font = "bold 10px 'Space Mono', 'Courier New', monospace";
    ctx.fillText("THANK YOU FOR YOUR EXPRESSION.", w / 2, y);

    // Trigger download
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `choose-your-poison-${receipt.sessionId.replace("#", "")}.png`;
      a.click();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}
