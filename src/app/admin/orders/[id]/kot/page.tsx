"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Printer, Copy, Check } from "lucide-react";
import Link from "next/link";
import type { Order, Restaurant } from "@/lib/types";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  centerText,
  separator,
  splitLine,
  PRINTER_WIDTH,
  generatePrintHTML,
  printContent,
  wrapText,
} from "@/lib/thermal-printer";

export default function KOTPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (orderId) {
      fetchData();
    }
  }, [orderId]);

  const fetchData = async () => {
    try {
      // Fetch order
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const data = orderSnap.data();
        const orderData = {
          id: orderSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Order;
        setOrder(orderData);

        // Mark as viewed if not already viewed
        if (!data.isViewed) {
          updateDoc(orderRef, {
            isViewed: true,
            updatedAt: new Date(),
          }).catch((err) =>
            console.error("Error marking order as viewed:", err),
          );
        }
      }

      // Fetch restaurant
      const restaurantRef = doc(db, "restaurant", "details");
      const restaurantSnap = await getDoc(restaurantRef);
      if (restaurantSnap.exists()) {
        setRestaurant(restaurantSnap.data() as Restaurant);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateKOT = (): string => {
    if (!order) return "";

    let kot = "";

    // Header
    kot += centerText("KITCHEN ORDER TICKET") + "\n";
    kot += centerText("(KOT)") + "\n";
    kot += separator("=") + "\n";

    // Restaurant name
    if (restaurant?.name) {
      kot += centerText(restaurant.name) + "\n";
      kot += separator("-") + "\n";
    }

    // Order details
    kot += splitLine("Order:", order.orderNumber) + "\n";
    kot += splitLine("Date:", format(order.createdAt, "dd/MM/yyyy")) + "\n";
    kot += splitLine("Time:", format(order.createdAt, "hh:mm a")) + "\n";

    // Order type and table
    kot += splitLine("Type:", order.orderType.toUpperCase()) + "\n";
    if (order.tableNumber) {
      kot += splitLine("Table:", order.tableNumber) + "\n";
    }

    kot += separator("=") + "\n";

    // Items
    kot += "ITEMS:\n";
    kot += separator("-") + "\n";

    order.items.forEach((item, index) => {
      // Item number and name
      const displayName = item.variantName
        ? `${item.dishName} (${item.variantName})`
        : item.dishName;
      kot += `${index + 1}. ${displayName}\n`;

      // Customizations
      if (
        item.selectedCustomizations &&
        item.selectedCustomizations.length > 0
      ) {
        item.selectedCustomizations.forEach((c) => {
          kot += `   + ${c.optionName}\n`;
        });
      }

      // Veg/Non-Veg indicator
      const vegIndicator = item.isVeg ? "[VEG]" : "[NON-VEG]";
      kot += `   ${vegIndicator}\n`;

      // Quantity
      kot += `   Qty: ${item.quantity}\n`;

      // Notes if any
      if (item.notes) {
        kot += `   NOTE: ${item.notes.toUpperCase()}\n`;
      }

      kot += "\n";
    });

    kot += separator("-") + "\n";
    kot += splitLine("Total Items:", order.items.length.toString()) + "\n";
    kot += separator("=") + "\n";

    // Special instructions
    if (order.notes) {
      kot += "SPECIAL INSTRUCTIONS:\n";
      kot += order.notes + "\n";
      kot += separator("=") + "\n";
    }

    // Customer info (if available)
    if (order.customerName) {
      kot += splitLine("Customer:", order.customerName) + "\n";
    }
    if (order.customerAddress) {
      kot += "Address:\n";
      const addressLines = wrapText(order.customerAddress, PRINTER_WIDTH);
      addressLines.forEach((line) => {
        kot += `  ${line}\n`;
      });
    }

    // Footer
    kot += "\n";
    kot += centerText("--- KOT ---") + "\n";
    kot += centerText(format(new Date(), "dd/MM/yyyy hh:mm a")) + "\n";

    return kot;
  };

  const handlePrint = () => {
    const kotContent = generateKOT();
    const html = generatePrintHTML(kotContent);
    printContent(html);
  };

  const handleCopy = async () => {
    const kotContent = generateKOT();
    try {
      await navigator.clipboard.writeText(kotContent);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "KOT content copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        title: "Error",
        description: "Failed to copy content.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading KOT...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Link href="/admin/orders">
          <Button className="mt-4">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const kotContent = generateKOT();

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href={`/admin/orders/${orderId}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Kitchen Order Ticket
            </h1>
            <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="default"
            onClick={handleCopy}
            className="flex-1 sm:flex-none"
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            ) : (
              <Copy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span className="hidden sm:inline">
              {copied ? "Copied" : "Copy KOT"}
            </span>
            <span className="sm:hidden">{copied ? "Copied" : "Copy"}</span>
          </Button>
          <Button
            size="default"
            onClick={handlePrint}
            className="flex-1 sm:flex-none"
          >
            <Printer className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Print KOT</span>
            <span className="sm:hidden">Print</span>
          </Button>
        </div>
      </div>

      {/* Preview */}
      <Card>
        <CardContent className="p-4">
          <div className="bg-white text-black p-4 rounded-lg border shadow-inner max-w-[200px] mx-auto overflow-hidden">
            <pre className="font-mono text-[10px] leading-tight whitespace-pre">
              {kotContent}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Printing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>
              Ensure your SHREYANS 58mm printer is connected (USB or Bluetooth)
            </li>
            <li>Click the "Print KOT" button above</li>
            <li>Select your thermal printer from the print dialog</li>
            <li className="font-bold text-primary">
              IMPORTANT: In the print dialog, set "Margins" to "None" and
              uncheck "Headers and Footers"
            </li>
            <li>Set "Scale" to "100" (Default)</li>
            <li>Click Print to send to kitchen</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
