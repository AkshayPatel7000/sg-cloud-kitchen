import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/contexts/cart-context";
import { getRestaurant } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await getRestaurant();

  return {
    title: restaurant.name,
    description: restaurant.tagline,
    openGraph: {
      title: restaurant.name,
      description: restaurant.tagline,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: restaurant.name,
      description: restaurant.tagline,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen">
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
