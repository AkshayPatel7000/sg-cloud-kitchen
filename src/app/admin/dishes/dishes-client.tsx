
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Dish, Category } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash, Edit } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { VegNonVegIcon } from '@/components/veg-non-veg-icon';
import { addDish, updateDish, deleteDish } from '@/lib/data-client';

const dishSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  price: z.coerce.number().positive("Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  isVeg: z.boolean(),
  isAvailable: z.boolean(),
  tags: z.array(z.enum(['spicy', 'bestseller'])).optional(),
});

type DishFormValues = z.infer<typeof dishSchema>;

function DishForm({ currentDish, categories, onSave, closeDialog }: { currentDish?: Dish | null, categories: Category[], onSave: (data: DishFormValues, id?: string) => void, closeDialog: () => void }) {
  const form = useForm<DishFormValues>({
    resolver: zodResolver(dishSchema),
    defaultValues: {
      name: currentDish?.name ?? '',
      description: currentDish?.description ?? '',
      imageUrl: currentDish?.imageUrl ?? '',
      price: currentDish?.price ?? 0,
      categoryId: currentDish?.categoryId ?? '',
      isVeg: currentDish?.isVeg ?? false,
      isAvailable: currentDish?.isAvailable ?? true,
      tags: currentDish?.tags ?? [],
    }
  });

  const onSubmit = (data: DishFormValues) => {
    onSave(data, currentDish?.id);
    closeDialog();
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="categoryId" render={({ field }) => (
            <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                    <SelectContent>
                        {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="isVeg" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Vegetarian</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="isAvailable" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Available</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
            )} />
        </div>
        <Button type="submit">Save</Button>
      </form>
    </Form>
  )
}

export function DishesClient({ dishes: initialDishes, categories }: { dishes: Dish[], categories: Category[] }) {
  const [dishes, setDishes] = useState(initialDishes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDish, setCurrentDish] = useState<Dish | null>(null);
  const { toast } = useToast();

  const handleSave = async (data: DishFormValues, id?: string) => {
    try {
      if (id) {
        await updateDish(id, data);
        setDishes(dishes.map(d => d.id === id ? { ...d, ...data } : d));
        toast({ title: 'Dish updated successfully!' });
      } else {
        const newDish = await addDish(data);
        setDishes([newDish, ...dishes]);
        toast({ title: 'Dish created successfully!' });
      }
    } catch (e) {
      toast({ title: 'An error occured', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDish(id);
      setDishes(dishes.filter(d => d.id !== id));
      toast({ title: 'Dish deleted', variant: 'destructive' });
    } catch (e) {
      toast({ title: 'An error occured', variant: 'destructive' });
    }
  };
  
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name ?? 'Unknown';

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dishes</h2>
          <p className="text-muted-foreground">Manage all the dishes on your menu.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentDish(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Dish
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{currentDish ? 'Edit' : 'Add'} Dish</DialogTitle>
              <DialogDescription>Fill in the details for the menu dish.</DialogDescription>
            </DialogHeader>
            <DishForm currentDish={currentDish} categories={categories} onSave={handleSave} closeDialog={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dishes.map(dish => (
                <TableRow key={dish.id}>
                  <TableCell className="font-medium">{dish.name}</TableCell>
                  <TableCell>{getCategoryName(dish.categoryId)}</TableCell>
                  <TableCell><VegNonVegIcon isVeg={dish.isVeg} /></TableCell>
                  <TableCell>
                    <Badge variant={dish.isAvailable ? 'default' : 'secondary'}>{dish.isAvailable ? 'Available' : 'Unavailable'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">₹{dish.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setCurrentDish(dish); setIsDialogOpen(true); }}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600"><Trash className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this dish.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(dish.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
