"use client";

import { useEffect, useState } from "react";
import { getAllSectionItems } from "@/lib/data";
import { OffersClient } from "./offers-client";
import { SectionItem } from "@/lib/types";

export default function OffersPage() {
  const [offers, setOffers] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const offersData = await getAllSectionItems();
        setOffers(offersData);
      } catch (error) {
        console.error("Error loading offers data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <OffersClient offers={offers} />
    </div>
  );
}
