import { ReceiptData } from "../types";

/**
 * ESC/POS Command Byte Constants
 */
const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

export class EscPosBuilder {
  private buffer: number[] = [];
  private charsPerLine: number;

  constructor(paperWidth: "58mm" | "80mm" = "58mm") {
    // 58mm thermal printers usually fit 32 characters per line (Font A)
    // 80mm thermal printers usually fit 48 characters per line
    this.charsPerLine = paperWidth === "80mm" ? 48 : 32;
  }

  /**
   * Initialize printer (resets settings to default)
   */
  init(): this {
    this.buffer.push(ESC, 0x40);
    return this;
  }

  /**
   * Set text alignment: 'left' | 'center' | 'right'
   */
  align(alignment: "left" | "center" | "right"): this {
    const code = alignment === "center" ? 0x01 : alignment === "right" ? 0x02 : 0x00;
    this.buffer.push(ESC, 0x61, code);
    return this;
  }

  /**
   * Set bold mode on/off
   */
  bold(enable: boolean): this {
    this.buffer.push(ESC, 0x45, enable ? 0x01 : 0x00);
    return this;
  }

  /**
   * Set double height & double width
   */
  textDoubleSize(enable: boolean): this {
    this.buffer.push(GS, 0x21, enable ? 0x11 : 0x00);
    return this;
  }

  /**
   * Set double height only
   */
  textDoubleHeight(enable: boolean): this {
    this.buffer.push(GS, 0x21, enable ? 0x01 : 0x00);
    return this;
  }

  /**
   * Append raw ASCII text (sanitizes unicode characters to standard ASCII)
   */
  text(str: string): this {
    const cleanStr = this.sanitizeText(str);
    for (let i = 0; i < cleanStr.length; i++) {
      this.buffer.push(cleanStr.charCodeAt(i) & 0xff);
    }
    return this;
  }

  /**
   * Append text followed by a newline
   */
  line(str: string = ""): this {
    if (str.length > 0) {
      this.text(str);
    }
    this.buffer.push(LF);
    return this;
  }

  /**
   * Print a horizontal divider rule
   */
  divider(char: string = "-"): this {
    const line = char.repeat(this.charsPerLine);
    this.line(line);
    return this;
  }

  /**
   * Print a double-line divider
   */
  doubleDivider(): this {
    return this.divider("=");
  }

  /**
   * Print two columns (Left aligned label, Right aligned value)
   */
  twoColumns(left: string, right: string): this {
    const availableSpace = this.charsPerLine - left.length - right.length;
    if (availableSpace > 0) {
      const line = left + " ".repeat(availableSpace) + right;
      this.line(line);
    } else {
      this.line(left);
      this.line(" ".repeat(Math.max(0, this.charsPerLine - right.length)) + right);
    }
    return this;
  }

  /**
   * Print word-wrapped text
   */
  wrappedText(text: string, indent: number = 0): this {
    const clean = this.sanitizeText(text);
    const maxLen = this.charsPerLine - indent;
    const words = clean.split(/\s+/);
    let currentLine = "";

    const pad = " ".repeat(indent);

    for (const word of words) {
      if ((currentLine + (currentLine ? " " : "") + word).length <= maxLen) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        if (currentLine) {
          this.line(pad + currentLine);
        }
        currentLine = word;
      }
    }
    if (currentLine) {
      this.line(pad + currentLine);
    }
    return this;
  }

  /**
   * Print 1D Barcode (Code39)
   */
  barcode(code: string): this {
    const clean = code.replace(/[^A-Z0-9\-\.\ \$\/\+\%]/gi, "").toUpperCase();
    if (!clean) return this;

    // Barcode dimensions: width = 2, height = 55 dots
    this.buffer.push(GS, 0x77, 0x02); // GS w 2
    this.buffer.push(GS, 0x68, 55); // GS h 55
    this.buffer.push(GS, 0x48, 0x00); // GS H 0 (Do not print HRI below barcode directly, we will print custom text)

    // GS k 4 (Code 39) <data> NUL
    this.buffer.push(GS, 0x6b, 0x04);
    for (let i = 0; i < clean.length; i++) {
      this.buffer.push(clean.charCodeAt(i) & 0xff);
    }
    this.buffer.push(0x00); // Terminator
    this.buffer.push(LF);
    return this;
  }

  /**
   * Feed N blank lines
   */
  feed(lines: number = 3): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(LF);
    }
    return this;
  }

  /**
   * Cut paper (Partial cut with feed)
   */
  cut(feedLines: number = 3): this {
    this.feed(feedLines);
    // GS V 66 <feed> : Feed paper and partial cut
    this.buffer.push(GS, 0x56, 0x42, 0x00);
    return this;
  }

  /**
   * Sanitize text to avoid corrupted characters on thermal printers
   */
  private sanitizeText(str: string): string {
    return str
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[—–]/g, "-")
      .replace(/[•]/g, "*")
      .replace(/[^\x20-\x7E\n\r]/g, ""); // Keep only printable ASCII
  }

  /**
   * Convert a base64 image data URL into ESC/POS GS v 0 monochrome raster bitmap
   */
  async rasterImage(dataUrl: string): Promise<this> {
    const maxDots = this.charsPerLine === 48 ? 576 : 384;
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = dataUrl;
    });

    const targetWidth = Math.floor(maxDots / 8) * 8;
    const targetHeight = Math.max(1, Math.round((img.height / img.width) * targetWidth));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return this;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;

    // Grayscale buffer for Floyd-Steinberg dithering
    const gray = new Float32Array(targetWidth * targetHeight);
    for (let i = 0; i < targetWidth * targetHeight; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    }

    const bytesPerRow = targetWidth / 8;
    const bitmapBytes: number[] = [];

    for (let y = 0; y < targetHeight; y++) {
      for (let bx = 0; bx < bytesPerRow; bx++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const x = bx * 8 + bit;
          const idx = y * targetWidth + x;
          const oldPixel = gray[idx];
          const newPixel = oldPixel < 128 ? 0 : 255;
          if (newPixel === 0) {
            byte |= 1 << (7 - bit);
          }
          const err = oldPixel - newPixel;
          if (x + 1 < targetWidth) gray[idx + 1] += (err * 7) / 16;
          if (y + 1 < targetHeight) {
            if (x > 0) gray[idx + targetWidth - 1] += (err * 3) / 16;
            gray[idx + targetWidth] += (err * 5) / 16;
            if (x + 1 < targetWidth) gray[idx + targetWidth + 1] += (err * 1) / 16;
          }
        }
        bitmapBytes.push(byte);
      }
    }

    // Single raster command: splitting into bands makes the print head
    // pause between commands, leaving visible white lines.
    const xL = bytesPerRow & 0xff;
    const xH = (bytesPerRow >> 8) & 0xff;
    const yL = targetHeight & 0xff;
    const yH = (targetHeight >> 8) & 0xff;
    this.buffer.push(GS, 0x76, 0x30, 0x00, xL, xH, yL, yH);
    for (let i = 0; i < bitmapBytes.length; i++) this.buffer.push(bitmapBytes[i]);
    this.buffer.push(LF);
    return this;
  }

  /**
   * Get raw byte array
   */
  build(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

/**
 * Generate complete ESC/POS buffer from ReceiptData
 */
export async function generateEscPosReceipt(receipt: ReceiptData): Promise<Uint8Array> {
  const builder = new EscPosBuilder(receipt.paperWidth);

  builder
    .init()
    // Header
    .align("center")
    .bold(true)
    .textDoubleSize(true)
    .line("CHOOSE YOUR POISON")
    .textDoubleSize(false)
    .line("FREEDOM OF EXPRESSION TERMINAL")
    .bold(false)
    .feed(1)

    // Divider
    .doubleDivider()

    // Session info
    .align("left")
    .twoColumns("SESSION:", receipt.sessionId)
    .twoColumns("TIMESTAMP:", receipt.timestamp);

  if (receipt.selectedSocials && receipt.selectedSocials.length > 0) {
    builder.wrappedText(`PLATFORMS: ${receipt.selectedSocials.join(", ")}`, 0);
  }

  builder
    // Divider
    .divider()

    // Recorded Expressions
    .bold(true)
    .line("RECORDED EXPRESSIONS & RISKS:")
    .bold(false);

  if (receipt.selectedExpressions.length === 0) {
    builder.align("center").line("[ No expressions selected ]").align("left");
  } else {
    for (const item of receipt.selectedExpressions) {
      builder
        .feed(1)
        .bold(true)
        .line(`[${item.code}] ${item.title.toUpperCase()}`)
        .bold(false)
        .wrappedText(`> Risk: ${item.primaryRisk}`, 2);

      if (item.id === "share-face" && receipt.expressionInputs?.facePhoto) {
        try {
          builder.align("center");
          await builder.rasterImage(receipt.expressionInputs.facePhoto);
          builder.align("left");
        } catch {
          builder.wrappedText("> [Face Photo Captured]", 2);
        }
      }
      if (item.id === "speak-mind" && receipt.expressionInputs?.mindText) {
        builder.wrappedText(`> "${receipt.expressionInputs.mindText}"`, 2);
      }
      if (item.id === "share-location" && receipt.expressionInputs?.locationText) {
        builder.wrappedText(`> Loc: ${receipt.expressionInputs.locationText}`, 2);
      }
      if (item.id === "share-life" && receipt.expressionInputs?.lifeText) {
        builder.wrappedText(`> "${receipt.expressionInputs.lifeText}"`, 2);
      }
      if (item.id === "share-identity" && receipt.expressionInputs?.identity) {
        const id = receipt.expressionInputs.identity;
        if (id.name) builder.wrappedText(`> Name: ${id.name}`, 2);
        if (id.birthPlaceDate) builder.wrappedText(`> DOB: ${id.birthPlaceDate}`, 2);
        if (id.address) builder.wrappedText(`> Addr: ${id.address}`, 2);
        if (id.school) builder.wrappedText(`> School: ${id.school}`, 2);
        if (id.graduation) builder.wrappedText(`> Grad: ${id.graduation}`, 2);
      }

      builder.wrappedText(`"${item.consequenceQuote}"`, 2);
    }
  }

  // Divider
  builder
    .feed(1)
    .divider()

    // The Hidden Cost
    .bold(true)
    .line("THE HIDDEN COST:")
    .bold(false)
    .line("* Your biometric geometry")
    .line("* Your permanent digital footprint")
    .line("* Your private contextual boundaries")
    .line("* Your perpetual surveillance record")

    // Divider
    .doubleDivider()

    // Philosophy closing
    .align("center")
    .bold(true)
    .line("YOU CHOSE YOUR POISON.")
    .bold(false)
    .line("You knew the risks.")
    .line("You made the choice.")
    .feed(1)

    // Barcode
    .barcode(receipt.checksum)
    .line(`* ${receipt.checksum} *`)
    .feed(1)

    // Footer divider & message
    .divider()
    .bold(true)
    .line("THANK YOU FOR YOUR EXPRESSION.")
    .bold(false)
    .line("KEEP THIS PHYSICAL RECORD AS PROOF")

    // Cut paper
    .cut(4);

  return builder.build();
}
