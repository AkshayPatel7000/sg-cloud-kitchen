import "server-only";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase/firestore";
import type {
  Category,
  Dish,
  Restaurant,
  SectionItem,
  SectionType,
} from "./types";

// TODO: Add error handling for all data fetching functions.

const toPlainObject = (data: any) => {
  if (!data) return data;
  const plain: any = { ...data };
  for (const key in plain) {
    if (
      plain[key] &&
      typeof plain[key] === "object" &&
      "seconds" in plain[key]
    ) {
      plain[key] = new Date(plain[key].seconds * 1000).toISOString();
    } else if (Array.isArray(plain[key])) {
      plain[key] = plain[key].map(toPlainObject);
    } else if (plain[key] && typeof plain[key] === "object") {
      plain[key] = toPlainObject(plain[key]);
    }
  }
  return plain;
};

export async function getRestaurant(): Promise<Restaurant> {
  try {
    const docRef = doc(db, "restaurant", "details");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return toPlainObject(docSnap.data()) as Restaurant;
    } else {
      return {
        name: "Gastronomic Gateway",
        logoUrl: "/default-logo.png",
        tagline: "A delightful culinary experience.",
        address: "123 Epicurean Ave, Flavor Town, 12345",
        phone: "555-123-4567",
        email: "contact@gastronomicgateway.com",
        openingHours: "Mon-Sat: 11am - 10pm, Sun: 12pm - 9pm",
        socialLinks: { facebook: "#", instagram: "#", twitter: "#" },
      };
    }
  } catch (error) {
    console.error("Error fetching restaurant data, returning fallback.", error);
    return {
      name: "Gastronomic Gateway",
      logoUrl: "/default-logo.png",
      tagline: "A delightful culinary experience.",
      address: "123 Epicurean Ave, Flavor Town, 12345",
      phone: "555-123-4567",
      email: "contact@gastronomicgateway.com",
      openingHours: "Mon-Sat: 11am - 10pm, Sun: 12pm - 9pm",
      socialLinks: { facebook: "#", instagram: "#", twitter: "#" },
    };
  }
}

export async function getSectionItems(
  sectionType: SectionType,
): Promise<SectionItem[]> {
  const q = query(
    collection(db, "sectionItems"),
    where("sectionType", "==", sectionType),
  );
  const querySnapshot = await getDocs(q);
  const items = querySnapshot.docs.map(
    (doc) => toPlainObject({ id: doc.id, ...doc.data() }) as SectionItem,
  );
  return items
    .filter((item) => item.isActive)
    .sort((a, b) => a.priority - b.priority);
}

export async function getAllSectionItems(): Promise<SectionItem[]> {
  const querySnapshot = await getDocs(collection(db, "sectionItems"));
  return querySnapshot.docs.map(
    (doc) => toPlainObject({ id: doc.id, ...doc.data() }) as SectionItem,
  );
}

export async function getCategories(): Promise<Category[]> {
  const q = query(collection(db, "categories"), orderBy("order"));
  const querySnapshot = await getDocs(q);
  const categories = querySnapshot.docs.map(
    (doc) => toPlainObject({ id: doc.id, ...doc.data() }) as Category,
  );
  return categories.filter((category) => category.isActive);
}

export async function getAllCategories(): Promise<Category[]> {
  const querySnapshot = await getDocs(collection(db, "categories"));
  return querySnapshot.docs.map(
    (doc) => toPlainObject({ id: doc.id, ...doc.data() }) as Category,
  );
}

export async function getDishes(): Promise<Dish[]> {
  const querySnapshot = await getDocs(collection(db, "dishes"));
  return querySnapshot.docs.map(
    (doc) => toPlainObject({ id: doc.id, ...doc.data() }) as Dish,
  );
}

export async function getDishesForCategory(
  categoryId: string,
): Promise<Dish[]> {
  const q = query(
    collection(db, "dishes"),
    where("categoryId", "==", categoryId),
  );
  const querySnapshot = await getDocs(q);
  const dishes = querySnapshot.docs.map(
    (doc) => toPlainObject({ id: doc.id, ...doc.data() }) as Dish,
  );
  return dishes.filter((dish) => dish.isAvailable);
}
