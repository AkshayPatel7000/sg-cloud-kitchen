import type { Cart } from "./types";

/**
 * Generates a WhatsApp message with cart details
 */
export function generateWhatsAppMessage(
  cart: Cart,
  userName?: string,
  userPhone?: string,
  userAddress?: string,
  orderNumber?: string,
): string {
  const greeting = userName ? `Hi, I'm ${userName}!` : "Hi!";
  const phoneInfo = userPhone ? ` (Phone: ${userPhone})` : "";
  const addressInfo = userAddress ? `\n📍 *Address: ${userAddress}*` : "";

  let message = `${greeting}${phoneInfo}${addressInfo}\n\n`;

  if (orderNumber) {
    message += `🆔 *Order ID: ${orderNumber}*\n`;
  }
  message += `🛒 *My Order Details*\n`;
  message += `${"=".repeat(30)}\n\n`;

  // Add each item
  cart.items.forEach((item, index) => {
    message += `${index + 1}. *${item.dish.name}*${item.variantName ? ` (${item.variantName})` : ""}\n`;
    message += `   ${item.dish.isVeg ? "🟢" : "🔴"} ${item.dish.isVeg ? "Veg" : "Non-Veg"}\n`;

    if (item.selectedCustomizations && item.selectedCustomizations.length > 0) {
      message += `   Customizations: ${item.selectedCustomizations.map((c) => c.optionName).join(", ")}\n`;
    }

    if (item.notes) {
      message += `   Note: _${item.notes}_\n`;
    }

    message += `   Qty: ${item.quantity} × Rs.${item.price.toFixed(2)}\n`;
    message += `   Subtotal: Rs.${(item.price * item.quantity).toFixed(2)}\n\n`;
  });

  message += `${"=".repeat(30)}\n`;
  message += `*Bill Summary*\n`;
  message += `${"=".repeat(30)}\n`;
  message += `Subtotal: Rs.${cart.subtotal.toFixed(2)}\n`;
  if (cart.tax > 0) {
    message += `Tax (GST 5%): Rs.${cart.tax.toFixed(2)}\n`;
  }
  message += `${"─".repeat(30)}\n`;
  message += `*Total Amount: Rs.${cart.total.toFixed(2)}*\n\n`;

  message += `Please confirm my order. Thank you! 🙏`;

  return message;
}

/**
 * Opens WhatsApp with pre-filled message
 * @param phoneNumber - Restaurant's WhatsApp number (with country code, no + or spaces)
 * @param message - Pre-filled message
 */
export function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
): void {
  const encodedMessage = encodeURIComponent(message);

  // Use WhatsApp Web API for desktop, WhatsApp app for mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const whatsappUrl = isMobile
    ? `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`
    : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

  // Use location.href instead of window.open to avoid popup blockers
  window.location.href = whatsappUrl;
}

/**
 * Complete flow: Generate message and send via WhatsApp
 */
export function sendCartViaWhatsApp(
  cart: Cart,
  restaurantPhone: string,
  userName?: string,
  userPhone?: string,
  userAddress?: string,
  orderNumber?: string,
): void {
  const message = generateWhatsAppMessage(
    cart,
    userName,
    userPhone,
    userAddress,
    orderNumber,
  );
  sendWhatsAppMessage(restaurantPhone, message);
}
