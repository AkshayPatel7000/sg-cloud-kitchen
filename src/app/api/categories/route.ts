import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  await dbConnect();
  try {
    const categories = await Category.find().sort({ order: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const data = await req.json();
    const category = await Category.create(data);
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
