/**
 * Thermal Printer Utilities for 58mm Printer
 * Optimized for SHREYANS 58mm USB+Bluetooth Direct Thermal Printer
 * Paper width: 58mm (approximately 28 characters per line at 10pt)
 */

export const PRINTER_WIDTH = 28; // Characters per line for 58mm paper

/**
 * Center text within printer width
 */
export function centerText(
  text: string,
  width: number = PRINTER_WIDTH,
): string {
  if (text.length >= width) return text;
  const padding = Math.floor((width - text.length) / 2);
  return " ".repeat(padding) + text;
}

/**
 * Align text to right
 */
export function rightAlign(
  text: string,
  width: number = PRINTER_WIDTH,
): string {
  if (text.length >= width) return text;
  const padding = width - text.length;
  return " ".repeat(padding) + text;
}

/**
 * Create a line with left and right aligned text
 */
export function splitLine(
  left: string,
  right: string,
  width: number = PRINTER_WIDTH,
): string {
  const totalLength = left.length + right.length;
  if (totalLength >= width) {
    return left.substring(0, width - right.length - 1) + " " + right;
  }
  const spaces = width - totalLength;
  return left + " ".repeat(spaces) + right;
}

/**
 * Create a separator line
 */
export function separator(
  char: string = "-",
  width: number = PRINTER_WIDTH,
): string {
  return char.repeat(width);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/**
 * Truncate text to fit width
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Wrap text to multiple lines
 */
export function wrapText(
  text: string,
  width: number = PRINTER_WIDTH,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + word).length > width) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  }

  if (currentLine) lines.push(currentLine.trim());
  return lines;
}

/**
 * Print styles for thermal printer
 */
export const PrintStyles = {
  normal: "font-family: monospace; font-size: 12px; line-height: 1.4;",
  bold: "font-family: monospace; font-size: 12px; font-weight: bold; line-height: 1.4;",
  large:
    "font-family: monospace; font-size: 16px; font-weight: bold; line-height: 1.4;",
  center: "text-align: center;",
  right: "text-align: right;",
};

/**
 * Generate print-friendly HTML
 */
export function generatePrintHTML(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Print</title>
      <style>
        @page {
          size: 58mm auto;
          margin: 0;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          width: 58mm;
          margin: 0;
          padding: 0;
          background: white;
        }
        body {
          padding: 1mm 2mm;
          font-family: 'DejaVu Sans Mono', 'Consolas', 'Monaco', 'Liberation Mono', 'Courier New', monospace;
          font-size: 8pt;
          line-height: 1.2;
          color: black;
          background: white;
        }
        pre {
          margin: 0;
          padding: 0;
          font-family: 'DejaVu Sans Mono', 'Consolas', 'Monaco', 'Liberation Mono', 'Courier New', monospace;
          font-size: 8pt;
          line-height: 1.2;
          white-space: pre;
          overflow-x: hidden;
          word-wrap: break-word;
        }
        @media print {
          html, body {
            width: 58mm;
            margin: 0;
            padding: 0;
          }
          body {
            padding: 1mm 2mm;
          }
        }
      </style>
    </head>
    <body>
      <pre>${content}</pre>
    </body>
    </html>
  `;
}

/**
 * Trigger browser print dialog
 * Uses iframe to avoid popup blockers
 */
export function printContent(htmlContent: string) {
  // Create a hidden iframe
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    let hasPrinted = false;
    const triggerPrint = () => {
      if (hasPrinted) return;
      hasPrinted = true;

      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Remove iframe after printing (with delay to ensure print dialog opens)
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    };

    // Wait for content to load
    iframe.onload = triggerPrint;

    // Trigger manually if it doesn't fire within a reasonable time
    setTimeout(triggerPrint, 500);
  }
}
