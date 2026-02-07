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

    // GST Number if enabled
    if (restaurant?.isGstEnabled && restaurant?.gstNumber) {
      bill += splitLine("GSTIN:", restaurant.gstNumber) + "\n";
    }

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
      if (order.customerAddress) {
        bill += "Address:\n";
        const addressLines = wrapText(order.customerAddress, PRINTER_WIDTH);
        addressLines.forEach((line) => {
          bill += `  ${line}\n`;
        });
      }
    }

    bill += separator("=") + "\n";

    // Items header
    bill += "Item         Qty    Amount\n"; // 13 + 5 + 10 = 28
    bill += separator("-") + "\n";

    // Items
    order.items.forEach((item) => {
      // Wrap item name to fit in 13 characters
      const displayName = item.variantName
        ? `${item.dishName} (${item.variantName})`
        : item.dishName;
      const nameLines = wrapText(displayName, 13);
      const qtyStr = `${item.quantity}`.padStart(5);
      const amountStr = formatCurrency(item.price * item.quantity).padStart(10);

      nameLines.forEach((line, idx) => {
        if (idx === 0) {
          // First line: Name + Qty + Amount
          bill += line.padEnd(13) + qtyStr + amountStr + "\n";
        } else {
          // Subsequent lines: Just the wrapped name
          bill += line.padEnd(13) + "\n";
        }
      });

      // Customizations
      if (
        item.selectedCustomizations &&
        item.selectedCustomizations.length > 0
      ) {
        item.selectedCustomizations.forEach((c) => {
          const custLines = wrapText(`+ ${c.optionName}`, 28);
          custLines.forEach((cl) => {
            bill += `  ${cl}\n`;
          });
        });
      }

      // Price details line (Veg/Non-Veg + unit price)
      const vegTag = item.isVeg ? "[V]" : "[N]";
      bill += `  ${vegTag} @${formatCurrency(item.price)}\n`;

      // Notes if any
      // if (item.notes) {
      //   const noteLines = wrapText(`Note: ${item.notes}`, 26);
      //   noteLines.forEach((nl) => {
      //     bill += `  ${nl}\n`;
      //   });
      // }
    });

    bill += separator("-") + "\n";

    // Totals
    bill += splitLine("Subtotal:", formatCurrency(order.subtotal)) + "\n";

    // Discount (if applicable)
    if (order.discount && order.discount > 0) {
      let discountLabel = "Discount:";
      if (order.discountType && order.discountValue) {
        if (order.discountType === "percentage") {
          discountLabel = `Discount (${order.discountValue}%):`;
        } else {
          discountLabel = "Discount:";
        }
      }
      bill +=
        splitLine(discountLabel, `- ${formatCurrency(order.discount)}`) + "\n";
      bill +=
        splitLine(
          "After Discount:",
          formatCurrency(order.subtotal - order.discount),
        ) + "\n";
    }

    if (restaurant?.isGstEnabled && restaurant?.gstNumber && order.tax > 0) {
      bill += splitLine("GST (5%):", formatCurrency(order.tax)) + "\n";
    }

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

  const handleCopy = async () => {
    const billContent = generateBill();
    try {
      await navigator.clipboard.writeText(billContent);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Bill content copied to clipboard.",
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

        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={handleCopy}>
            {copied ? (
              <Check className="mr-2 h-5 w-5 text-green-600" />
            ) : (
              <Copy className="mr-2 h-5 w-5" />
            )}
            {copied ? "Copied" : "Copy Bill"}
          </Button>
          <Button size="lg" onClick={handlePrint}>
            <Printer className="mr-2 h-5 w-5" />
            Print Bill
          </Button>
        </div>
      </div>

      {/* Preview */}
      <Card>
        <CardContent className="p-4">
          <div className="bg-white text-black p-4 rounded-lg border shadow-inner max-w-[200px] mx-auto overflow-hidden">
            <pre className="font-mono text-[10px] leading-tight whitespace-pre">
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
            <li className="font-bold text-primary">
              IMPORTANT: In the print dialog, set "Margins" to "None" and
              uncheck "Headers and Footers"
            </li>
            <li>Click Print to generate customer bill</li>
          </ol>

          <div className="mt-4 p-3 bg-muted rounded-lg border-l-4 border-primary">
            <p className="text-sm font-bold">
              Recommended Settings (Chrome/Edge):
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1">
              <li>• Paper Size: 58mm x 210mm (or Roll)</li>
              <li>
                • Margins: <span className="text-primary font-bold">NONE</span>
              </li>
              <li>
                • Headers & Footers:{" "}
                <span className="text-primary font-bold">UNCHECKED</span>
              </li>
              <li>• Scale: 100% (Default)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
