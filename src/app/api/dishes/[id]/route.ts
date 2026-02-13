import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Dish from "@/models/Dish";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  await dbConnect();
  try {
    const { id } = params;
    const data = await req.json();
    const dish = await Dish.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }
    return NextResponse.json(dish);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update dish" },
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
    const dish = await Dish.findByIdAndDelete(id);
    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Dish deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete dish" },
      { status: 500 },
    );
  }
}
