import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SectionItem from "@/models/SectionItem";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  await dbConnect();
  try {
    const { id } = params;
    const data = await req.json();
    const item = await SectionItem.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return NextResponse.json(
        { error: "Section item not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update section item" },
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
    const item = await SectionItem.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json(
        { error: "Section item not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ message: "Section item deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete section item" },
      { status: 500 },
    );
  }
}
