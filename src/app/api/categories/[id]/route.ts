import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  await dbConnect();
  try {
    const { id } = params;
    const data = await req.json();
    const category = await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update category" },
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
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
