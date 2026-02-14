import { NextResponse } from "next/server";
import { checkPaymentStatus } from "@/lib/phonepe";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const orderId = new URL(req.url).searchParams.get("orderId");

    const merchantId = formData.get("merchantId") as string;
    const transactionId = formData.get("transactionId") as string;
    const code = formData.get("code") as string;

    if (!orderId || !transactionId) {
      return NextResponse.redirect(new URL("/cart", req.url));
    }

    // Verify payment status with PhonePe
    const response = await checkPaymentStatus(transactionId);

    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = req.headers.get("host");
    const baseUrl = `${protocol}://${host}`;

    if (response.success && response.code === "PAYMENT_SUCCESS") {
      // Update order in Firestore
      const orderRef = adminDb.collection("orders").doc(orderId);
      await orderRef.update({
        status: "pending",
        isPaid: true,
        paymentMethod: "online",
        paymentDetails: {
          transactionId,
          merchantId,
          provider: "phonepe",
          updatedAt: new Date(),
        },
      });

      return NextResponse.redirect(
        new URL(`/order-success/${orderId}`, baseUrl),
        303,
      );
    } else {
      // Payment failed or was cancelled
      const orderRef = adminDb.collection("orders").doc(orderId);
      await orderRef.update({
        status: "payment_failed",
        paymentDetails: {
          transactionId,
          provider: "phonepe",
          code: response.code,
          message: response.message,
          updatedAt: new Date(),
        },
      });

      return NextResponse.redirect(
        new URL(`/cart?error=payment_failed&orderId=${orderId}`, baseUrl),
        303,
      );
    }
  } catch (error) {
    console.error("Payment Status Error:", error);
    return NextResponse.redirect(
      new URL("/cart?error=internal_error", req.url),
      303,
    );
  }
}
