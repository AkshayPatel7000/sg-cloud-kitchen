"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Dish, Category } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  PlusCircle,
  Trash,
  Edit,
  Search,
  Flame,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { VegNonVegIcon } from "@/components/veg-non-veg-icon";
import { addDish, updateDish, deleteDish } from "@/lib/data-client";
import { ImageUpload } from "@/components/image-upload";
import { Checkbox } from "@/components/ui/checkbox";

const dishSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  price: z.coerce.number().positive("Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  isVeg: z.boolean(),
  isAvailable: z.boolean(),
  tags: z.array(z.enum(["spicy", "bestseller"])).optional(),
});

type DishFormValues = z.infer<typeof dishSchema>;

function DishForm({
  currentDish,
  categories,
  onSave,
  closeDialog,
}: {
  currentDish?: Dish | null;
  categories: Category[];
  onSave: (data: DishFormValues, id?: string) => Promise<void>;
  closeDialog: () => void;
}) {
  const form = useForm<DishFormValues>({
    resolver: zodResolver(dishSchema),
    defaultValues: {
      name: currentDish?.name ?? "",
      description: currentDish?.description ?? "",
      imageUrl: currentDish?.imageUrl ?? "",
      price: currentDish?.price ?? 0,
      categoryId: currentDish?.categoryId ?? "",
      isVeg: currentDish?.isVeg ?? false,
      isAvailable: currentDish?.isAvailable ?? true,
      tags: currentDish?.tags ?? [],
    },
  });

  const onSubmit = async (data: DishFormValues) => {
    await onSave(data, currentDish?.id);
    closeDialog();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-h-[80vh] overflow-y-auto p-1"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-6 items-start">
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem className="flex-shrink-0">
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    onRemove={() => field.onChange("")}
                    folder="/dishes"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4 flex-grow pt-8">
            <FormLabel>Tags</FormLabel>
            <div className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes("spicy")}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          return checked
                            ? field.onChange([...current, "spicy"])
                            : field.onChange(
                                current.filter((value) => value !== "spicy"),
                              );
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Spicy
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes("bestseller")}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          return checked
                            ? field.onChange([...current, "bestseller"])
                            : field.onChange(
                                current.filter(
                                  (value) => value !== "bestseller",
                                ),
                              );
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Bestseller
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="isVeg"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Vegetarian</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isAvailable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Available</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}

export function DishesClient({
  dishes: initialDishes,
  categories,
}: {
  dishes: Dish[];
  categories: Category[];
}) {
  const [dishes, setDishes] = useState(initialDishes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentDish, setCurrentDish] = useState<Dish | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { toast } = useToast();

  const handleSave = async (data: DishFormValues, id?: string) => {
    try {
      const formattedData = {
        ...data,
        tags: data.tags || [],
      };
      if (id) {
        await updateDish(id, formattedData as any);
        setDishes(
          dishes.map((d) => (d.id === id ? { ...d, ...formattedData } : d)),
        );
        toast({ title: "Dish updated successfully!" });
      } else {
        const newDish = await addDish(formattedData as any);
        setDishes([newDish, ...dishes]);
        toast({ title: "Dish created successfully!" });
      }
    } catch (e) {
      toast({ title: "An error occured", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDish(id);
      setDishes(dishes.filter((d) => d.id !== id));
      toast({ title: "Dish deleted", variant: "destructive" });
    } catch (e) {
      toast({ title: "An error occured", variant: "destructive" });
    }
  };

  // Filtered Dishes
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesSearch = dish.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || dish.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [dishes, searchQuery, selectedCategory]);

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "Unknown";

  return (
    <>
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dishes</h2>
            <p className="text-muted-foreground">
              Manage all the dishes on your menu.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setCurrentDish(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Dish
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{currentDish ? "Edit" : "Add"} Dish</DialogTitle>
                <DialogDescription>
                  Fill in the details for the menu dish.
                </DialogDescription>
              </DialogHeader>
              <DishForm
                currentDish={currentDish}
                categories={categories}
                onSave={handleSave}
                closeDialog={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes by name..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDishes.map((dish) => (
                <TableRow key={dish.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 overflow-hidden rounded-md border">
                      <Image
                        src={dish.imageUrl}
                        alt={dish.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {dish.name}
                        <div className="flex gap-1">
                          {dish.tags?.includes("spicy") && (
                            <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                          )}
                          {dish.tags?.includes("bestseller") && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryName(dish.categoryId)}</TableCell>
                  <TableCell>
                    <VegNonVegIcon isVeg={dish.isVeg} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={dish.isAvailable ? "default" : "secondary"}>
                      {dish.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    Rs.{dish.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setCurrentDish(dish);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setCurrentDish(dish);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this dish.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (currentDish) handleDelete(currentDish.id);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
