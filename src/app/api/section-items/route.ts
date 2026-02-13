import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SectionItem from "@/models/SectionItem";

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let query = {};
    if (type) {
      query = { sectionType: type };
    }

    const items = await SectionItem.find(query).sort({ priority: 1 });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch section items" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const data = await req.json();
    const item = await SectionItem.create(data);
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create section item" },
      { status: 500 },
    );
  }
}
