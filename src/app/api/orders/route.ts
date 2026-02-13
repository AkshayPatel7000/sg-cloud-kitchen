import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = {};
    if (status) {
      query = { status };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const data = await req.json();

    // Remove Firestore specific fields if they exist
    const { createdAt, updatedAt, ...cleanData } = data;

    const order = await Order.create({
      ...cleanData,
      status: data.status || "pending",
      isPaid: data.isPaid || false,
      isViewed: data.isViewed || false,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
