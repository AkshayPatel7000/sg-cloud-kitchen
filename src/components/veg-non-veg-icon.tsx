import { cn } from "@/lib/utils";

export const VegNonVegIcon = ({
  isVeg,
  className,
}: {
  isVeg: boolean;
  className?: string;
}) => {
  const colorClass = isVeg ? "bg-green-600" : "bg-red-600";
  const borderClass = isVeg ? "border-green-600" : "border-red-600";
  // Note: Using Tailwind direct colors here for simplicity as they represent universal concepts of veg/non-veg.
  // In a real app, these could be mapped to theme variables if needed.

  return (
    <div
      className={cn(
        "w-4 h-4 border p-0.5 flex items-center justify-center flex-shrink-0",
        borderClass,
        className,
      )}
      title={isVeg ? "Vegetarian" : "Non-Vegetarian"}
    >
      <div className={cn("w-full h-full rounded-full", colorClass)}></div>
    </div>
  );
};
