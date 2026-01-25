# Shopping Cart System Documentation

## Overview

A complete shopping cart system has been implemented for your kitchen restaurant app with the following features:

## Features Implemented

### 1. **Cart Context** (`src/contexts/cart-context.tsx`)

- Global state management for the shopping cart
- Functions: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`
- Automatic calculation of subtotal, tax (5% GST), and total
- Item count tracking

### 2. **Floating Cart Button** (`src/components/cart-button.tsx`)

- Fixed position button in bottom-right corner
- Badge showing item count
- Slide-out sheet with cart preview
- Quick quantity adjustments
- Remove items functionality
- Bill summary preview
- "View Full Cart & Checkout" button

### 3. **Add to Cart Buttons** (`src/components/dish-list-item.tsx`)

- Each menu item has an "Add" button
- Visual feedback when item is added (changes to "Added" with checkmark)
- Integrates with cart context

### 4. **Full Cart Page** (`src/app/cart/page.tsx`)

- Accessible at `/cart`
- Detailed view of all cart items
- Large item cards with images
- Quantity controls (increase/decrease)
- Remove individual items
- Clear entire cart option
- Sticky bill summary sidebar with:
  - Subtotal
  - Tax (GST 5%)
  - Total amount
  - Itemized breakdown
- "Proceed to Checkout" button
- Empty cart state with "Browse Menu" CTA

### 5. **Updated Types** (`src/lib/types.ts`)

```typescript
export type CartItem = {
  dish: Dish;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
};
```

## User Flow

1. **Browse Menu** → User sees menu items with "Add" buttons
2. **Add to Cart** → Click "Add" button, item is added to cart
3. **View Cart** → Click floating cart button to see cart preview
4. **Adjust Quantities** → Use +/- buttons in cart preview or full cart page
5. **View Full Cart** → Click "View Full Cart & Checkout" or navigate to `/cart`
6. **Review Bill** → See detailed breakdown with subtotal, tax, and total
7. **Checkout** → Click "Proceed to Checkout" (ready for payment integration)

## Bill Breakdown

The cart automatically calculates:

- **Subtotal**: Sum of (price × quantity) for all items
- **Tax**: 5% GST on subtotal
- **Total**: Subtotal + Tax

Example:

```
Item 1: Rs.200 × 2 = Rs.400
Item 2: Rs.150 × 1 = Rs.150
─────────────────────────
Subtotal:        Rs.550.00
Tax (5%):         Rs.27.50
─────────────────────────
Total:           Rs.577.50
```

## Components Structure

```
app/
├── layout.tsx (wrapped with CartProvider)
├── page.tsx (includes CartButton)
└── cart/
    └── page.tsx (full cart page)

components/
├── cart-button.tsx (floating button + sheet)
├── dish-list-item.tsx (menu item with Add button)
└── menu-section.tsx (updated to use dish-list-item)

contexts/
└── cart-context.tsx (global cart state)

lib/
└── types.ts (CartItem and Cart types)
```

## Next Steps for Enhancement

### Payment Integration

- Add payment gateway (Razorpay, Stripe, etc.)
- Order confirmation page
- Order history

### User Authentication

- Save cart to user account
- Persistent cart across sessions
- User profile with saved addresses

### Additional Features

- Delivery address input
- Delivery time selection
- Special instructions field
- Promo code/coupon system
- Minimum order value validation
- Delivery charges calculation

### UI Enhancements

- Toast notifications when adding to cart
- Cart animations
- Loading states
- Error handling for API calls

## Usage

### Adding an item to cart:

```tsx
const { addToCart } = useCart();
addToCart(dish, quantity); // quantity defaults to 1
```

### Accessing cart data:

```tsx
const { cart, itemCount } = useCart();
console.log(cart.total); // Total amount
console.log(itemCount); // Total number of items
```

### Updating quantity:

```tsx
const { updateQuantity } = useCart();
updateQuantity(dishId, newQuantity); // Set to 0 to remove
```

### Removing an item:

```tsx
const { removeFromCart } = useCart();
removeFromCart(dishId);
```

### Clearing the cart:

```tsx
const { clearCart } = useCart();
clearCart();
```

## Tax Configuration

To change the tax rate, edit `src/contexts/cart-context.tsx`:

```tsx
const TAX_RATE = 0.05; // 5% tax (change as needed)
```

## Styling

The cart system uses your existing UI components:

- `Button` from `@/components/ui/button`
- `Card` from `@/components/ui/card`
- `Sheet` from `@/components/ui/sheet`
- `Badge` from `@/components/ui/badge`
- `Separator` from `@/components/ui/separator`

All components follow your app's design system and dark mode theme.

## Testing the Cart

1. Navigate to the home page
2. Click "Add" on any menu item
3. See the cart button badge update
4. Click the floating cart button (bottom-right)
5. Adjust quantities or remove items
6. Click "View Full Cart & Checkout"
7. Review the full cart page with bill breakdown
8. Try clearing the cart or removing individual items

Enjoy your new shopping cart system! 🛒✨
