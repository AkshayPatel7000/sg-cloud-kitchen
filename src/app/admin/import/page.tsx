"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/firestore";
import { collection, doc, writeBatch } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Upload,
} from "lucide-react";
import { getDishes, getAllCategories } from "@/lib/data";
import { Textarea } from "@/components/ui/textarea";

export default function ImportPage() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [jsonInput, setJsonInput] = useState("");

  const exportData = async () => {
    setStatus("loading");
    setMessage("Fetching data for export...");
    try {
      const [categories, dishes] = await Promise.all([
        getAllCategories(),
        getDishes(),
      ]);

      const data = {
        categories,
        dishes,
        exportedAt: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `menu_export_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus("success");
      setMessage("Data exported successfully.");
    } catch (error: any) {
      console.error("Export error:", error);
      setStatus("error");
      setMessage(error.message || "An error occurred during export.");
    }
  };

  const parseJson = () => {
    try {
      return JSON.parse(jsonInput);
    } catch (e) {
      throw new Error("Invalid JSON format. Please check your data.");
    }
  };

  const importCategories = async () => {
    setStatus("loading");
    setMessage("Starting category import...");

    try {
      const data = parseJson();
      const categories = data.categories;

      if (!categories || !Array.isArray(categories)) {
        throw new Error("JSON must contain a 'categories' array.");
      }

      const batch = writeBatch(db);
      const categoriesCollection = collection(db, "categories");

      for (const cat of categories) {
        // Use provided ID or generate a new one from Firebase
        const categoryRef = cat.id
          ? doc(db, "categories", cat.id)
          : doc(categoriesCollection);

        const finalId = categoryRef.id;

        batch.set(categoryRef, {
          ...cat,
          id: finalId,
          updatedAt: new Date(),
          isActive: cat.isActive !== undefined ? cat.isActive : true,
          description: cat.description || "",
          order: cat.order || 0,
          slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
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
      const data = parseJson();
      const dishes = data.dishes;

      if (!dishes || !Array.isArray(dishes)) {
        throw new Error("JSON must contain a 'dishes' array.");
      }

      let count = 0;

      // Firestore batches are limited to 500 operations
      const chunks = [];
      for (let i = 0; i < dishes.length; i += 100) {
        chunks.push(dishes.slice(i, i + 100));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        const dishesCollection = collection(db, "dishes");

        for (const dish of chunk) {
          const dishRef = doc(dishesCollection);

          batch.set(dishRef, {
            ...dish,
            id: dishRef.id,
            updatedAt: new Date(),
            isAvailable:
              dish.isAvailable !== undefined ? dish.isAvailable : true,
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
          <CardTitle>Menu Data Management</CardTitle>
          <CardDescription>
            Export current menu or bulk import data by pasting JSON below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5 border-primary/20">
              <div>
                <h3 className="font-medium">Export Current Data</h3>
                <p className="text-sm text-muted-foreground">
                  Download all categories and dishes.
                </p>
              </div>
              <Button onClick={exportData} disabled={status === "loading"}>
                {status === "loading" && message.includes("Fetching") ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export JSON
              </Button>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Paste JSON for Bulk Import
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <Textarea
                placeholder='Paste your JSON here (e.g. { "categories": [...], "dishes": [...] })'
                className="min-h-[200px] font-mono text-xs"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={importCategories}
                  disabled={status === "loading" || !jsonInput}
                  variant="outline"
                  className="w-full"
                >
                  {status === "loading" && message.includes("category") ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Import Categories
                </Button>
                <Button
                  onClick={importDishes}
                  disabled={status === "loading" || !jsonInput}
                  variant="outline"
                  className="w-full"
                >
                  {status === "loading" && message.includes("dishes") ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Import Dishes
                </Button>
              </div>
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
              <AlertTitle className="capitalize">{status}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
