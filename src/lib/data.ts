import type {
  Category,
  Dish,
  Restaurant,
  SectionItem,
  SectionType,
} from "./types";

// TODO: Add error handling for all data fetching functions.

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

export async function getSectionItems(
  sectionType: SectionType,
): Promise<SectionItem[]> {
  const response = await fetch(`/api/section-items?type=${sectionType}`);
  if (!response.ok) throw new Error("Failed to fetch section items");
  const items: SectionItem[] = await response.json();
  return items.filter(
    (item) => item.isActive && item.sectionType === sectionType,
  );
}

export async function getAllSectionItems(): Promise<SectionItem[]> {
  const response = await fetch("/api/section-items");
  if (!response.ok) throw new Error("Failed to fetch section items");
  return await response.json();
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories");
  if (!response.ok) throw new Error("Failed to fetch categories");
  const categories: Category[] = await response.json();
  return categories.filter((category) => category.isActive);
}

export async function getAllCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories");
  if (!response.ok) throw new Error("Failed to fetch categories");
  return await response.json();
}

export async function getDishes(): Promise<Dish[]> {
  const response = await fetch("/api/dishes");
  if (!response.ok) throw new Error("Failed to fetch dishes");
  return await response.json();
}

export async function getDishesForCategory(
  categoryId: string,
): Promise<Dish[]> {
  const response = await fetch("/api/dishes");
  if (!response.ok) throw new Error("Failed to fetch dishes");
  const dishes: Dish[] = await response.json();
  return dishes.filter(
    (dish) => dish.isAvailable && dish.categoryId === categoryId,
  );
}
