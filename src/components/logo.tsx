import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { sanitizeImageUrl } from "@/lib/image-utils";

export function Logo({
  href = "/",
  logoUrl,
  restaurantName = "SG Cloud Kitchen",
  showText = true,
}: {
  href?: string;
  logoUrl?: string;
  restaurantName?: string;
  showText?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
    >
      {logoUrl ? (
        <div className="relative h-8 w-8 flex-shrink-0">
          <Image
            src={sanitizeImageUrl(logoUrl, "hero")}
            alt={`${restaurantName} Logo`}
            fill
            sizes="32px"
            className="object-contain"
          />
        </div>
      ) : (
        <UtensilsCrossed className="h-8 w-8 text-primary flex-shrink-0" />
      )}
      {showText && (
        <span className="font-headline text-xl font-bold tracking-tight">
          {restaurantName}
        </span>
      )}
    </Link>
  );
}
