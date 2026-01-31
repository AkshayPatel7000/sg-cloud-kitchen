import { NextResponse } from "next/server";
import { adminDb, adminMessaging } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { orderDetails, fcmToken } = await request.json();
    let tokens: string[] = [];

    if (fcmToken) {
      tokens = [fcmToken];
    } else {
      // Fallback: Fetch from Firestore only if token not provided by client
      const adminSnapshot = await adminDb.collection("admins").get();
      adminSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.fcmToken) {
          tokens.push(data.fcmToken);
        }
      });
    }

    if (tokens.length === 0) {
      return NextResponse.json(
        { message: "No admin tokens found" },
        { status: 200 },
      );
    }

    const message = {
      notification: {
        title: "New Order Received!",
        body: `Order ${orderDetails.orderNumber} for Rs.${orderDetails.total.toFixed(2)}`,
      },
      data: {
        orderId: orderDetails.id || "",
        orderNumber: orderDetails.orderNumber,
        click_action: "/admin/orders",
      },
      tokens: tokens,
    };

    const response = await adminMessaging.sendEachForMulticast(message);

    console.log("Successfully sent messages:", response);

    return NextResponse.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
