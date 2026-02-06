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
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function OffersCarousel({
  items,
  title,
}: {
  items: SectionItem[];
  title: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <section id="offers" className="w-full py-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Sparkles size={24} />
        </div>
        <h2 className="font-headline text-4xl font-bold tracking-tight">
          {title}
        </h2>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full relative"
      >
        <CarouselContent className="-ml-4">
          {items.map((item, index) => (
            <CarouselItem
              key={item.id}
              className="pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="h-full"
                >
                  <Card className="overflow-hidden h-full flex flex-col border-none bg-card shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-3xl group">
                    <div className="relative aspect-[16/10] w-full overflow-hidden">
                      <Image
                        src={sanitizeImageUrl(item.imageUrl, "offer")}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-lg">
                          Limited Offer
                        </span>
                      </div>
                    </div>
                    <CardHeader className="pt-6">
                      <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardDescription className="text-base leading-relaxed text-muted-foreground line-clamp-2">
                        {item.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute -top-16 right-12 flex gap-2">
          <CarouselPrevious className="static translate-y-0 h-10 w-10 border-primary/20 hover:bg-primary hover:text-white transition-all" />
          <CarouselNext className="static translate-y-0 h-10 w-10 border-primary/20 hover:bg-primary hover:text-white transition-all" />
        </div>
      </Carousel>
    </section>
  );
}
