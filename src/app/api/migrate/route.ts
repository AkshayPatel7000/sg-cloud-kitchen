import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { db } from "@/lib/firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import Category from "@/models/Category";
import Dish from "@/models/Dish";
import Restaurant from "@/models/Restaurant";
import SectionItem from "@/models/SectionItem";
import Order from "@/models/Order";

export async function POST() {
  await dbConnect();

  const results: any = {
    categories: 0,
    dishes: 0,
    restaurant: 0,
    sectionItems: 0,
    orders: 0,
    errors: [],
  };

  try {
    // 1. Migrate Categories
    const catSnap = await getDocs(collection(db, "categories"));
    for (const d of catSnap.docs) {
      const data = d.data();
      await Category.findOneAndUpdate(
        { slug: data.slug || d.id },
        { ...data, id: d.id },
        { upsert: true, new: true },
      );
      results.categories++;
    }

    // 2. Migrate Dishes
    const dishSnap = await getDocs(collection(db, "dishes"));
    for (const d of dishSnap.docs) {
      const data = d.data();
      await Dish.findOneAndUpdate(
        { name: data.name },
        { ...data, id: d.id },
        { upsert: true, new: true },
      );
      results.dishes++;
    }

    // 3. Migrate Restaurant Details
    const resSnap = await getDocs(collection(db, "restaurant"));
    if (!resSnap.empty) {
      const data = resSnap.docs[0].data();
      await Restaurant.findOneAndUpdate(
        {},
        { ...data },
        { upsert: true, new: true },
      );
      results.restaurant++;
    }

    // 4. Migrate Section Items
    const secSnap = await getDocs(collection(db, "sectionItems"));
    for (const d of secSnap.docs) {
      const data = d.data();
      await SectionItem.findOneAndUpdate(
        { title: data.title, sectionType: data.sectionType },
        { ...data, id: d.id },
        { upsert: true, new: true },
      );
      results.sectionItems++;
    }

    // 5. Migrate Orders
    const ordSnap = await getDocs(collection(db, "orders"));
    for (const d of ordSnap.docs) {
      const data = d.data();
      // Handle timestamps
      const createdAt = data.createdAt?.toDate
        ? data.createdAt.toDate()
        : new Date();
      const updatedAt = data.updatedAt?.toDate
        ? data.updatedAt.toDate()
        : new Date();

      await Order.findOneAndUpdate(
        { orderNumber: data.orderNumber },
        { ...data, createdAt, updatedAt, id: d.id },
        { upsert: true, new: true },
      );
      results.orders++;
    }

    return NextResponse.json({ message: "Migration successful", results });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: error.message, results },
      { status: 500 },
    );
  }
}
