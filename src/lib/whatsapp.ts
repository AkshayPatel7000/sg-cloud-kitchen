import type { Cart } from "./types";

/**
 * Generates a WhatsApp message with cart details
 */
export function generateWhatsAppMessage(cart: Cart, userName?: string): string {
  const greeting = userName ? `Hi, I'm ${userName}!` : "Hi!";

  let message = `${greeting}\n\n`;
  message += `🛒 *My Order*\n`;
  message += `${"=".repeat(30)}\n\n`;

  // Add each item
  cart.items.forEach((item, index) => {
    message += `${index + 1}. *${item.dish.name}*\n`;
    message += `   ${item.dish.isVeg ? "🟢" : "🔴"} ${item.dish.isVeg ? "Veg" : "Non-Veg"}\n`;
    message += `   Qty: ${item.quantity} × Rs.${item.dish.price.toFixed(2)}\n`;
    message += `   Subtotal: Rs.${(item.dish.price * item.quantity).toFixed(2)}\n\n`;
  });

  message += `${"=".repeat(30)}\n`;
  message += `*Bill Summary*\n`;
  message += `${"=".repeat(30)}\n`;
  message += `Subtotal: Rs.${cart.subtotal.toFixed(2)}\n`;
  message += `Tax (GST 5%): Rs.${cart.tax.toFixed(2)}\n`;
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
): void {
  const message = generateWhatsAppMessage(cart, userName);
  sendWhatsAppMessage(restaurantPhone, message);
}
