import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ErrorLog from "@/models/ErrorLog";

export async function GET() {
  await dbConnect();
  try {
    const logs = await ErrorLog.find().sort({ createdAt: -1 }).limit(100);
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch error logs" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const data = await req.json();
    const log = await ErrorLog.create(data);
    return NextResponse.json(log);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create error log" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  // Clear all logs
  await dbConnect();
  try {
    await ErrorLog.deleteMany({});
    return NextResponse.json({ message: "All logs cleared" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to clear logs" },
      { status: 500 },
    );
  }
}
