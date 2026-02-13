import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";

export async function GET() {
  await dbConnect();
  try {
    // There should only be one restaurant entry.
    // If not found, we can return a default or 404.
    const restaurant = await Restaurant.findOne();
    if (!restaurant) {
      // Return a default restaurant object instead of 404 if DB is empty
      return NextResponse.json({
        name: "SG Cloud Kitchen",
        logoUrl: "/logo.png",
        tagline: "A delightful culinary experience.",
        address: "Plot 213, Shraddha Shri Colony, New Malviya Nagar, Indore",
        phone: "744-044-0128",
        email: "sgclaidk2025@gmail.com",
        openingHours: "Mon-Sat: 11am - 3am",
        socialLinks: { facebook: "#", instagram: "#", twitter: "#" },
      });
    }
    return NextResponse.json(restaurant);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch restaurant details" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  try {
    const data = await req.json();
    let restaurant = await Restaurant.findOne();

    if (restaurant) {
      restaurant = await Restaurant.findByIdAndUpdate(restaurant._id, data, {
        new: true,
        runValidators: true,
      });
    } else {
      restaurant = await Restaurant.create(data);
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update restaurant details" },
      { status: 500 },
    );
  }
}
