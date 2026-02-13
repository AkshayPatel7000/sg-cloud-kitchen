import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Dish from "@/models/Dish";

export async function GET() {
  await dbConnect();
  try {
    const dishes = await Dish.find().populate("categoryId");
    return NextResponse.json(dishes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dishes" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const data = await req.json();
    const dish = await Dish.create(data);
    return NextResponse.json(dish);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create dish" },
      { status: 500 },
    );
  }
}
