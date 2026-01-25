"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import type { Order, Restaurant } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { format } from "date-fns";
import {
  centerText,
  separator,
  splitLine,
  rightAlign,
  formatCurrency,
  PRINTER_WIDTH,
  generatePrintHTML,
  printContent,
  wrapText,
} from "@/lib/thermal-printer";

export default function BillPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        const orderData = {
          id: orderSnap.id,
          ...orderSnap.data(),
          createdAt: orderSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: orderSnap.data().updatedAt?.toDate() || new Date(),
        } as Order;
        setOrder(orderData);
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

  const generateBill = (): string => {
    if (!order) return "";

    let bill = "";

    // Header
    bill += "\n";
    if (restaurant?.name) {
      bill += centerText(restaurant.name.toUpperCase()) + "\n";
    }
    bill += centerText("TAX INVOICE") + "\n";
    bill += separator("=") + "\n";

    // Restaurant details
    if (restaurant) {
      if (restaurant.address) {
        const addressLines = wrapText(restaurant.address, PRINTER_WIDTH);
        addressLines.forEach((line) => {
          bill += centerText(line) + "\n";
        });
      }
      if (restaurant.phone) {
        bill += centerText(`Tel: ${restaurant.phone}`) + "\n";
      }
      if (restaurant.email) {
        bill += centerText(restaurant.email) + "\n";
      }
    }
    bill += separator("=") + "\n";

    // Bill details
    bill += splitLine("Bill No:", order.orderNumber) + "\n";
    bill += splitLine("Date:", format(order.createdAt, "dd/MM/yyyy")) + "\n";
    bill += splitLine("Time:", format(order.createdAt, "hh:mm a")) + "\n";

    // Order type
    bill += splitLine("Type:", order.orderType.toUpperCase()) + "\n";
    if (order.tableNumber) {
      bill += splitLine("Table:", order.tableNumber) + "\n";
    }

    // Customer details
    if (order.customerName || order.customerPhone) {
      bill += separator("-") + "\n";
      if (order.customerName) {
        bill += splitLine("Customer:", order.customerName) + "\n";
      }
      if (order.customerPhone) {
        bill += splitLine("Phone:", order.customerPhone) + "\n";
      }
    }

    bill += separator("=") + "\n";

    // Items header
    bill += "Item              Qty   Amount\n";
    bill += separator("-") + "\n";

    // Items
    order.items.forEach((item) => {
      // Item name (truncate if too long)
      const itemName =
        item.dishName.length > 18
          ? item.dishName.substring(0, 15) + "..."
          : item.dishName;

      bill += itemName + "\n";

      // Veg/Non-Veg indicator
      const vegTag = item.isVeg ? "[V]" : "[N]";

      // Price line: veg tag, quantity, and amount
      const qtyStr = `${item.quantity}`;
      const amountStr = formatCurrency(item.price * item.quantity);
      const priceLine = `${vegTag} @${formatCurrency(item.price)}`;

      // Calculate spacing
      const spacing1 = 18 - priceLine.length;
      const spacing2 = 5 - qtyStr.length;

      bill +=
        priceLine +
        " ".repeat(Math.max(1, spacing1)) +
        qtyStr +
        " ".repeat(Math.max(1, spacing2)) +
        amountStr +
        "\n";
    });

    bill += separator("-") + "\n";

    // Totals
    bill += splitLine("Subtotal:", formatCurrency(order.subtotal)) + "\n";
    bill += splitLine("GST (5%):", formatCurrency(order.tax)) + "\n";
    bill += separator("=") + "\n";
    bill += splitLine("TOTAL:", formatCurrency(order.total)) + "\n";
    bill += separator("=") + "\n";

    // Payment details
    if (order.isPaid) {
      bill += splitLine("Payment:", "PAID") + "\n";
      if (order.paymentMethod) {
        bill += splitLine("Method:", order.paymentMethod.toUpperCase()) + "\n";
      }
      bill += separator("-") + "\n";
    } else {
      bill += centerText("** UNPAID **") + "\n";
      bill += separator("-") + "\n";
    }

    // Footer
    bill += "\n";
    bill += centerText("Thank you for your order!") + "\n";
    bill += centerText("Please visit again") + "\n";
    bill += "\n";
    bill += separator("=") + "\n";
    bill += centerText("Powered by Kitchen App") + "\n";
    bill += "\n";

    return bill;
  };

  const handlePrint = () => {
    const billContent = generateBill();
    const html = generatePrintHTML(billContent);
    printContent(html);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading bill...</p>
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

  const billContent = generateBill();

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/orders/${orderId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Customer Bill</h1>
            <p className="text-muted-foreground">{order.orderNumber}</p>
          </div>
        </div>

        <Button size="lg" onClick={handlePrint}>
          <Printer className="mr-2 h-5 w-5" />
          Print Bill
        </Button>
      </div>

      {/* Preview */}
      <Card>
        <CardContent className="p-6">
          <div className="bg-white text-black p-6 rounded-lg max-w-md mx-auto">
            <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap">
              {billContent}
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
            <li>Click the "Print Bill" button above</li>
            <li>Select your thermal printer from the print dialog</li>
            <li>Verify the preview looks correct</li>
            <li>Click Print to generate customer bill</li>
          </ol>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Printer Settings:</p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1">
              <li>• Paper Size: 58mm (2.28 inches)</li>
              <li>• Orientation: Portrait</li>
              <li>• Margins: Minimal or None</li>
              <li>• Scale: 100%</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
