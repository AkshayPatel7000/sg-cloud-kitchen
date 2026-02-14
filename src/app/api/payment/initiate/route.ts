import { NextResponse } from "next/server";
import { initiatePayment } from "@/lib/phonepe";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, phone, orderId, userId } = body;

    if (!amount || !orderId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Determine the base URL for redirects
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = req.headers.get("host");
    const baseUrl = `${protocol}://${host}`;

    const transactionId = `T${Date.now()}`;

    const response = await initiatePayment({
      transactionId,
      amount,
      userId,
      phone,
      redirectUrl: `${baseUrl}/api/payment/status?orderId=${orderId}`,
      callbackUrl: `${baseUrl}/api/payment/callback`,
    });

    if (response.success && response.data.instrumentResponse.redirectInfo.url) {
      return NextResponse.json({
        url: response.data.instrumentResponse.redirectInfo.url,
        transactionId,
      });
    }

    console.error("PhonePe Initiation Error:", response);
    return NextResponse.json(
      { error: response.message || "Failed to initiate payment" },
      { status: 500 },
    );
  } catch (error) {
    console.error("Payment API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
