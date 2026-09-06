import { format } from "date-fns";
import type { Order, Restaurant } from "@/lib/types";

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
  return `Rs.${amount.toFixed(2)}`;
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
      <style>
        @page {
          margin: 0 !important;
        }
        @media print {
          *, *:before, *:after {
            background: transparent !important;
            color: #000 !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          header, footer, nav { display: none !important; }
          body { margin: 0 !important; padding: 0 !important; width: auto !important; }
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          width: 100%;
          margin: 0;
          padding: 0;
          background: white;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        pre {
          margin: 0;
          padding: 4mm 2mm;
          font-family: 'Courier New', Courier, 'Lucida Sans Typewriter', 'Lucida Console', monospace;
          font-size: 9pt;
          font-weight: bold;
          line-height: 1.2;
          white-space: pre-wrap;
          word-wrap: break-word;
          color: #000 !important;
          background: #fff !important;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
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

/**
 * Generate string content for KOT
 */
export function generateKOT(
  order: Order,
  restaurant: Restaurant | null,
): string {
  if (!order) return "";

  let kot = "";

  // Header
  kot += centerText("KOT") + "\n";
  kot += separator("=") + "\n";

  // Restaurant name
  if (restaurant?.name) {
    kot += centerText(restaurant.name) + "\n";
    kot += separator("-") + "\n";
  }

  // Safe date
  const createdAtDate =
    order.createdAt instanceof Date
      ? order.createdAt
      : order.createdAt
        ? new Date(order.createdAt)
        : new Date();

  // Order details: Combined Date and Time to save space
  kot += splitLine("Order:", order.orderNumber) + "\n";
  kot +=
    splitLine(
      format(createdAtDate, "dd/MM/yyyy"),
      format(createdAtDate, "hh:mm a"),
    ) + "\n";

  // Order type and table: Combined on one line
  const orderInfo = order.tableNumber
    ? `${order.orderType.toUpperCase()} | Table: ${order.tableNumber}`
    : order.orderType.toUpperCase();
  kot += centerText(orderInfo) + "\n";

  kot += separator("=") + "\n";

  // Items
  kot += "ITEMS:\n";
  kot += separator("-") + "\n";

  order.items.forEach((item, index) => {
    const displayName = item.variantName
      ? `${item.dishName} (${item.variantName})`
      : item.dishName;

    kot += `${index + 1}. ${displayName} x${item.quantity}\n`;

    if (item.selectedCustomizations && item.selectedCustomizations.length > 0) {
      item.selectedCustomizations.forEach((c) => {
        kot += `   + ${c.optionName}\n`;
      });
    }

    if (item.notes) {
      kot += `   NOTE: ${item.notes.toUpperCase()}\n`;
    }
  });

  kot += separator("-") + "\n";
  kot += splitLine("Total Items:", order.items.length.toString()) + "\n";
  kot += separator("=") + "\n";

  // Special instructions
  if (order.notes) {
    kot += "NOTES:\n";
    kot += order.notes + "\n";
    kot += separator("=") + "\n";
  }

  // Customer info (compact)
  if (order.customerName) {
    kot += `Cust: ${order.customerName}\n`;
  }
  if (order.customerAddress) {
    const addressLines = wrapText(order.customerAddress, PRINTER_WIDTH);
    addressLines.forEach((line) => {
      kot += `${line}\n`;
    });
  }

  // Footer (compact)
  kot += centerText("--- KOT ---") + "\n";
  kot += centerText(format(new Date(), "hh:mm a dd/MM/yy")) + "\n";

  return kot;
}

/**
 * Generate string content for Bill
 */
export function generateBill(
  order: Order,
  restaurant: Restaurant | null,
): string {
  if (!order) return "";

  let bill = "";

  // Header
  bill += "\n";
  if (restaurant?.name) {
    bill += centerText(restaurant.name.toUpperCase()) + "\n";
  }
  bill += centerText("TAX INVOICE") + "\n";
  bill += separator("=") + "\n";

  // Restaurant details
  if (restaurant) {
    if (restaurant.address) {
      const addressLines = wrapText(restaurant.address, PRINTER_WIDTH);
      addressLines.forEach((line) => {
        bill += centerText(line) + "\n";
      });
    }
    if (restaurant.phone) {
      bill += centerText(`Tel: ${restaurant.phone}`) + "\n";
    }
    if (restaurant.email) {
      bill += centerText(restaurant.email) + "\n";
    }
  }
  bill += separator("=") + "\n";

  // Safe date
  const createdAtDate =
    order.createdAt instanceof Date
      ? order.createdAt
      : order.createdAt
        ? new Date(order.createdAt)
        : new Date();

  // Bill details
  bill += splitLine("Bill No:", order.orderNumber) + "\n";
  bill += splitLine("Date:", format(createdAtDate, "dd/MM/yyyy")) + "\n";
  bill += splitLine("Time:", format(createdAtDate, "hh:mm a")) + "\n";

  // GST Number if enabled
  if (restaurant?.isGstEnabled && restaurant?.gstNumber) {
    bill += splitLine("GSTIN:", restaurant.gstNumber) + "\n";
  }

  // Order type
  bill += splitLine("Type:", order.orderType.toUpperCase()) + "\n";
  if (order.tableNumber) {
    bill += splitLine("Table:", order.tableNumber) + "\n";
  }

  // Customer details
  if (order.customerName || order.customerPhone) {
    bill += separator("-") + "\n";
    if (order.customerName) {
      bill += splitLine("Customer:", order.customerName) + "\n";
    }
    if (order.customerPhone) {
      bill += splitLine("Phone:", order.customerPhone) + "\n";
    }
    if (order.customerAddress) {
      bill += "Address:\n";
      const addressLines = wrapText(order.customerAddress, PRINTER_WIDTH);
      addressLines.forEach((line) => {
        bill += `  ${line}\n`;
      });
    }
  }

  bill += separator("=") + "\n";

  // Items header
  bill += "Item         Qty    Amount\n";
  bill += separator("-") + "\n";

  // Items
  order.items.forEach((item) => {
    const displayName = item.variantName
      ? `${item.dishName} (${item.variantName})`
      : item.dishName;
    const nameLines = wrapText(displayName, 13);
    const qtyStr = `${item.quantity}`.padStart(5);
    const amountStr = formatCurrency(item.price * item.quantity).padStart(10);

    nameLines.forEach((line, idx) => {
      if (idx === 0) {
        bill += line.padEnd(13) + qtyStr + amountStr + "\n";
      } else {
        bill += line.padEnd(13) + "\n";
      }
    });

    if (item.selectedCustomizations && item.selectedCustomizations.length > 0) {
      item.selectedCustomizations.forEach((c) => {
        const custLines = wrapText(`+ ${c.optionName}`, 28);
        custLines.forEach((cl) => {
          bill += `  ${cl}\n`;
        });
      });
    }

    const vegTag = item.isVeg ? "[V]" : "[N]";
    bill += `  ${vegTag} @${formatCurrency(item.price)}\n`;
  });

  bill += separator("-") + "\n";

  // Totals
  bill += splitLine("Subtotal:", formatCurrency(order.subtotal)) + "\n";

  if (order.discount && order.discount > 0) {
    let discountLabel = "Discount:";
    if (order.couponCode) {
      discountLabel = `Discount (${order.couponCode}):`;
    } else if (order.discountType && order.discountValue) {
      if (order.discountType === "percentage") {
        discountLabel = `Discount (${order.discountValue}%):`;
      }
    }
    bill +=
      splitLine(discountLabel, `- ${formatCurrency(order.discount)}`) + "\n";
    bill +=
      splitLine(
        "After Discount:",
        formatCurrency(order.subtotal - order.discount),
      ) + "\n";
  }

  if (restaurant?.isGstEnabled && restaurant?.gstNumber && order.tax > 0) {
    bill += splitLine("GST (5%):", formatCurrency(order.tax)) + "\n";
  }

  bill += separator("=") + "\n";
  bill += splitLine("TOTAL:", formatCurrency(order.total)) + "\n";
  bill += separator("=") + "\n";

  // Payment details
  if (order.isPaid) {
    bill += splitLine("Payment:", "PAID") + "\n";
    if (order.paymentMethod) {
      bill += splitLine("Method:", order.paymentMethod.toUpperCase()) + "\n";
    }
    bill += separator("-") + "\n";
  } else {
    bill += centerText("** UNPAID **") + "\n";
    bill += separator("-") + "\n";
  }

  // Footer
  bill += "\n";
  bill += centerText("Thank you for your order!") + "\n";
  bill += centerText("Please visit again") + "\n";
  bill += "\n";
  bill += separator("=") + "\n";
  bill += centerText("Powered by Kitchen App") + "\n";
  bill += "\n";

  return bill;
}

/**
 * Print KOT directly
 */
export function printKOT(order: Order, restaurant: Restaurant | null) {
  const kotContent = generateKOT(order, restaurant);
  const html = generatePrintHTML(kotContent);
  printContent(html);
}

/**
 * Print Bill directly
 */
export function printBill(order: Order, restaurant: Restaurant | null) {
  const billContent = generateBill(order, restaurant);
  const html = generatePrintHTML(billContent);
  printContent(html);
}

