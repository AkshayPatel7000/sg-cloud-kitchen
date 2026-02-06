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
    icons: {
      icon: restaurant.logoUrl,
    },
    openGraph: {
      title: restaurant.name,
      description: restaurant.tagline,
      type: "website",
      images: [restaurant.logoUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: restaurant.name,
      description: restaurant.tagline,
      images: [restaurant.logoUrl],
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
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="GG Admin" />
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
