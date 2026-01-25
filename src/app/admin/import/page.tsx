"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/firestore";
import { collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import menuData from "../../../../menu_data.json";

export default function ImportPage() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const importCategories = async () => {
    setStatus("loading");
    setMessage("Starting import...");

    try {
      const batch = writeBatch(db);

      const categoryMapping: Record<string, string> = {
        "Pizza and Pasta": "cat_pizza_pasta",
        "Rice and Biryani": "cat_rice_biryani",
        Thali: "cat_thali",
        "Main Course": "cat_main_course",
        Starters: "cat_starters",
        "Fried Rice and Noodles": "cat_fried_rice_noodles",
        Breads: "cat_breads",
        Snacks: "cat_snacks",
        Desserts: "cat_desserts",
        "Drinks (Beverages)": "cat_drinks",
        Bowls: "cat_bowls",
      };

      const categories = menuData.categories;

      for (const cat of categories) {
        const id = cat.id || categoryMapping[cat.name];
        if (!id) {
          console.warn(`No ID found for category: ${cat.name}`);
          continue;
        }

        const categoryRef = doc(db, "categories", id);
        batch.set(categoryRef, {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          order: cat.order,
          isActive: cat.isActive,
          updatedAt: new Date(),
        });
      }

      await batch.commit();
      setStatus("success");
      setMessage(`Successfully imported ${categories.length} categories.`);
    } catch (error: any) {
      console.error("Import error:", error);
      setStatus("error");
      setMessage(error.message || "An unknown error occurred");
    }
  };

  const importDishes = async () => {
    setStatus("loading");
    setMessage("Starting dishes import...");

    try {
      const dishes = menuData.dishes;
      let count = 0;

      // Firestore batches are limited to 500 operations
      // We'll process in chunks of 100
      const chunks = [];
      for (let i = 0; i < dishes.length; i += 100) {
        chunks.push(dishes.slice(i, i + 100));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        const dishesCollection = collection(db, "dishes");

        for (const dish of chunk) {
          // Use auto-generated ID
          const dishRef = doc(dishesCollection);

          batch.set(dishRef, {
            ...dish,
            id: dishRef.id,
            updatedAt: new Date(),
            isAvailable: true, // Ensure they are available by default
          });
          count++;
        }
        await batch.commit();
        setMessage(`Imported ${count}/${dishes.length} dishes...`);
      }

      setStatus("success");
      setMessage(`Successfully imported ${dishes.length} dishes.`);
    } catch (error: any) {
      console.error("Import error:", error);
      setStatus("error");
      setMessage(error.message || "An unknown error occurred");
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import Data</CardTitle>
          <CardDescription>
            Import categories and dishes from menu_data.json into Firestore.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Categories</h3>
                <p className="text-sm text-muted-foreground">
                  {menuData.categories.length} categories found in JSON
                </p>
              </div>
              <Button
                onClick={importCategories}
                disabled={status === "loading"}
              >
                {status === "loading" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Import Categories
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Dishes</h3>
                <p className="text-sm text-muted-foreground">
                  {menuData.dishes.length} dishes found in JSON
                </p>
              </div>
              <Button
                onClick={importDishes}
                disabled={status === "loading"}
                variant="outline"
              >
                {status === "loading" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Import Dishes
              </Button>
            </div>
          </div>

          {status !== "idle" && (
            <Alert variant={status === "error" ? "destructive" : "default"}>
              {status === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : status === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <AlertTitle>
                {status === "loading"
                  ? "Processing..."
                  : status === "success"
                    ? "Success"
                    : "Error"}
              </AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
