import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase/firestore";
import type {
  Category,
  Dish,
  Restaurant,
  SectionItem,
  SectionType,
} from "./types";

// TODO: Add error handling for all data fetching and mutation functions.

export async function getRestaurant(): Promise<Restaurant> {
  try {
    const response = await fetch("/api/restaurant");
    if (!response.ok) throw new Error("Failed to fetch restaurant");
    return await response.json();
  } catch (error) {
    console.warn("API fetch failed, falling back to default", error);
    return {
      name: "SG Cloud Kitchen",
      logoUrl: "/logo.png",
      tagline: "A delightful culinary experience.",
      address:
        "Plot 213, Shraddha Shri Colony, New Malviya Nagar, Near Vijay Nagar, Indore",
      phone: "744-044-0128",
      email: "sgclaidk2025@gmail.com",
      openingHours: "Mon-Sat: 11am - 3am",
      socialLinks: { facebook: "#", instagram: "#", twitter: "#" },
    };
  }
}

export async function updateRestaurant(data: Restaurant): Promise<void> {
  const response = await fetch("/api/restaurant", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update restaurant");
}

export async function getAllSectionItems(): Promise<SectionItem[]> {
  const response = await fetch("/api/section-items");
  if (!response.ok) throw new Error("Failed to fetch section items");
  return await response.json();
}

export async function addSectionItem(
  item: Omit<SectionItem, "id">,
): Promise<SectionItem> {
  const response = await fetch("/api/section-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error("Failed to add section item");
  return await response.json();
}

export async function updateSectionItem(
  id: string,
  data: Partial<SectionItem>,
): Promise<void> {
  const response = await fetch(`/api/section-items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update section item");
}

export async function deleteSectionItem(id: string): Promise<void> {
  const response = await fetch(`/api/section-items/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete section item");
}

export async function getAllCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories");
  if (!response.ok) throw new Error("Failed to fetch categories");
  return await response.json();
}

export async function addCategory(
  category: Omit<Category, "id">,
): Promise<Category> {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  if (!response.ok) throw new Error("Failed to add category");
  return await response.json();
}

export async function updateCategory(
  id: string,
  data: Partial<Category>,
): Promise<void> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update category");
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete category");
}

export async function getDishes(): Promise<Dish[]> {
  const response = await fetch("/api/dishes");
  if (!response.ok) throw new Error("Failed to fetch dishes");
  return await response.json();
}

export async function addDish(dish: Omit<Dish, "id">): Promise<Dish> {
  const response = await fetch("/api/dishes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dish),
  });
  if (!response.ok) throw new Error("Failed to add dish");
  return await response.json();
}

export async function updateDish(
  id: string,
  data: Partial<Dish>,
): Promise<void> {
  const response = await fetch(`/api/dishes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update dish");
}

export async function deleteDish(id: string): Promise<void> {
  const response = await fetch(`/api/dishes/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete dish");
}

export async function getAdmins(): Promise<any[]> {
  const querySnapshot = await getDocs(collection(db, "admins"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
