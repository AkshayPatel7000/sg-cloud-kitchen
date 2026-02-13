import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ErrorLog from "@/models/ErrorLog";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  await dbConnect();
  try {
    const { id } = params;
    const log = await ErrorLog.findById(id);
    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }
    return NextResponse.json(log);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch log details" },
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
    const log = await ErrorLog.findByIdAndDelete(id);
    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Log deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete log" },
      { status: 500 },
    );
  }
}
