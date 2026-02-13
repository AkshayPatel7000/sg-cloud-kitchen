import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  await dbConnect();
  try {
    const { id } = params;
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  await dbConnect();
  try {
    const { id } = params;
    const data = await req.json();

    // Specifically handle updatedAt
    const order = await Order.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  await dbConnect();
  try {
    const { id } = params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 },
    );
  }
}
