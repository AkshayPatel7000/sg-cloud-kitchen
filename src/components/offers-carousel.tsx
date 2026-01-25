"use client";
import type { SectionItem } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import Image from "next/image";
import { sanitizeImageUrl } from "@/lib/image-utils";

export function OffersCarousel({
  items,
  title,
}: {
  items: SectionItem[];
  title: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <section id="offers" className="w-full">
      <h2 className="font-headline text-3xl font-bold mb-6">{title}</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="overflow-hidden h-full flex flex-col">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={sanitizeImageUrl(item.imageUrl, "offer")}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                    {item.price && (
                      <p className="text-xl font-semibold text-primary">
                        Rs.{item.price.toFixed(2)}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </section>
  );
}
