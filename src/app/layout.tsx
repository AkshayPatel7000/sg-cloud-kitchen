import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/contexts/cart-context";
import { getRestaurant } from "@/lib/data";
import { GoogleAnalytics } from "@next/third-parties/google";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await getRestaurant();

  return {
    metadataBase: new URL("https://sgcloudkitchen.com"),
    title: {
      default: `${restaurant.name} | Best Cloud Kitchen in Indore`,
      template: `%s | ${restaurant.name}`,
    },
    description: `${restaurant.tagline} Order fresh, hygienic, and delicious food online from SG Cloud Kitchen. Express delivery across Indore.`,
    keywords: [
      "SG Cloud Kitchen",
      "Cloud Kitchen Indore",
      "Food Delivery Indore",
      "Order Food Online Indore",
      "Best Restaurant Indore",
      "Hygienic Food Indore",
      "Takeaway Indore",
      "SG Cloud Kitchen Menu",
    ],
    authors: [{ name: restaurant.name }],
    creator: restaurant.name,
    publisher: restaurant.name,
    formatDetection: {
      email: false,
      address: true,
      telephone: true,
    },
    icons: {
      icon: restaurant.logoUrl,
      shortcut: restaurant.logoUrl,
      apple: restaurant.logoUrl,
    },
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: restaurant.name,
      description: restaurant.tagline,
      url: "https://sgcloudkitchen.com",
      siteName: restaurant.name,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: restaurant.logoUrl,
          width: 800,
          height: 600,
          alt: restaurant.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: restaurant.name,
      description: restaurant.tagline,
      images: [restaurant.logoUrl],
      creator: "@sgcloudkitchen",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    category: "Food & Beverage",
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
        <GoogleAnalytics gaId="G-BE1LN1ECXB" />
      </head>

      <body className="font-body antialiased min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FoodEstablishment",
              name: "SG Cloud Kitchen",
              url: "https://sgcloudkitchen.com",
              logo: "https://sgcloudkitchen.com/logo.png",
              image: "https://sgcloudkitchen.com/hero-image.jpg",
              description:
                "SG Cloud Kitchen offers the best culinary experience with fresh ingredients and fast delivery in Indore. Order now for authentic taste and hygiene.",
              address: {
                "@type": "PostalAddress",
                streetAddress:
                  "Plot 213, Shraddha Shri Colony, New Malviya Nagar, Near Vijay Nagar",
                addressLocality: "Indore",
                addressRegion: "MP",
                postalCode: "452010",
                addressCountry: "IN",
              },
              telephone: "+91-7440440128",
              servesCuisine: ["Indian", "Chinese", "Fast Food"],
              priceRange: "₹₹",
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ],
                  opens: "11:00",
                  closes: "23:59",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Sunday"],
                  opens: "12:00",
                  closes: "22:00",
                },
              ],
              geo: {
                "@type": "GeoCoordinates",
                latitude: "22.7533",
                longitude: "75.8937",
              },
            }),
          }}
        />
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
