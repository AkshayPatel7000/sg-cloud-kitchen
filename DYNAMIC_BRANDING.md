# 🎨 Dynamic Branding System - COMPLETE

## ✅ What's Been Implemented

Your kitchen app now has a **fully dynamic branding system**! The logo, restaurant name, and metadata all update automatically based on your Firestore data.

## 🎯 Features

### 1. **Dynamic Logo Component**

- Accepts restaurant name and logo URL
- Displays custom logo image or fallback icon
- Responsive sizing
- Hover effects
- Optional text display

### 2. **Dynamic Metadata**

- Page title updates with restaurant name
- Meta description uses restaurant tagline
- OpenGraph tags for social sharing
- Twitter card metadata

### 3. **Automatic Updates**

- Changes in Firestore reflect immediately
- No code changes needed
- Consistent branding across all pages

## 📁 Files Modified

### 1. **`src/components/logo.tsx`**

Enhanced with:

- `restaurantName` prop - Dynamic restaurant name
- `showText` prop - Toggle text visibility
- Image sanitization for safety
- Better responsive sizing
- Hover effects

### 2. **`src/app/layout.tsx`**

Updated with:

- `generateMetadata()` function - Fetches restaurant data
- Dynamic page title
- Dynamic description
- OpenGraph metadata
- Twitter card metadata

### 3. **`src/components/header.tsx`**

Updated to:

- Pass restaurant name to Logo component
- Display dynamic branding in header
- Show in mobile menu

## 🎨 Logo Component API

### Props:

```typescript
<Logo
  href="/"                          // Link destination (default: '/')
  logoUrl="https://..."             // Logo image URL (optional)
  restaurantName="My Restaurant"    // Restaurant name (default: 'Gastronomic Gateway')
  showText={true}                   // Show/hide text (default: true)
/>
```

### Examples:

**Full Logo with Text:**

```tsx
<Logo logoUrl={restaurant.logoUrl} restaurantName={restaurant.name} />
```

**Icon Only:**

```tsx
<Logo
  logoUrl={restaurant.logoUrl}
  restaurantName={restaurant.name}
  showText={false}
/>
```

**Fallback (No Logo URL):**

```tsx
<Logo restaurantName="My Restaurant" />
// Shows UtensilsCrossed icon + name
```

## 🔧 Setup Your Branding

### Update in Firestore:

1. **Open Firebase Console**
2. **Go to Firestore Database**
3. **Navigate to:** `restaurant` → `details`
4. **Update fields:**

```javascript
{
  name: "Your Restaurant Name",
  logoUrl: "https://your-logo-url.com/logo.png",
  tagline: "Your amazing tagline",
  // ... other fields
}
```

### Logo Image Requirements:

**Recommended:**

- Format: PNG or SVG (transparent background)
- Size: 512x512px or larger
- Aspect ratio: Square (1:1)
- File size: < 100KB

**Supported:**

- PNG, JPG, WebP, SVG
- Any size (will be scaled to 32x32px)
- Hosted on any CDN

### Example Logo URLs:

**From Unsplash:**

```
https://images.unsplash.com/photo-...?w=512&h=512
```

**From Firebase Storage:**

```
https://firebasestorage.googleapis.com/v0/b/your-project/o/logo.png?alt=media
```

**From your CDN:**

```
https://cdn.yoursite.com/logo.png
```

## 📱 Where Branding Appears

### 1. **Browser Tab**

- Page title: "Your Restaurant Name"
- Favicon (if configured)

### 2. **Header**

- Logo image or icon
- Restaurant name
- Desktop and mobile views

### 3. **Social Sharing**

- OpenGraph title and description
- Twitter card metadata
- Proper preview when shared

### 4. **Search Engines**

- SEO-optimized title
- Meta description
- Better search results

## 🎨 Customization

### Change Logo Size:

In `src/components/logo.tsx`:

```tsx
// Current: h-8 w-8 (32px)
<div className="relative h-8 w-8 flex-shrink-0">

// Larger: h-12 w-12 (48px)
<div className="relative h-12 w-12 flex-shrink-0">

// Smaller: h-6 w-6 (24px)
<div className="relative h-6 w-6 flex-shrink-0">
```

### Change Text Size:

```tsx
// Current: text-xl
<span className="font-headline text-xl font-bold">

// Larger: text-2xl
<span className="font-headline text-2xl font-bold">

// Smaller: text-lg
<span className="font-headline text-lg font-bold">
```

### Add Favicon:

Create `public/favicon.ico` or add to layout:

```tsx
<head>
  <link rel="icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</head>
```

## 🌐 Metadata Features

### Current Implementation:

```typescript
{
  title: "Your Restaurant Name",
  description: "Your tagline",
  openGraph: {
    title: "Your Restaurant Name",
    description: "Your tagline",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Your Restaurant Name",
    description: "Your tagline",
  },
}
```

### Enhanced Metadata (Optional):

```typescript
{
  title: restaurant.name,
  description: restaurant.tagline,
  keywords: ['restaurant', 'food', 'delivery'],
  authors: [{ name: restaurant.name }],
  openGraph: {
    title: restaurant.name,
    description: restaurant.tagline,
    type: 'website',
    locale: 'en_US',
    siteName: restaurant.name,
    images: [
      {
        url: restaurant.logoUrl,
        width: 512,
        height: 512,
        alt: `${restaurant.name} Logo`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: restaurant.name,
    description: restaurant.tagline,
    images: [restaurant.logoUrl],
  },
}
```

## 🧪 Testing

### Test Dynamic Branding:

1. **Update Firestore:**
   - Change restaurant name
   - Change logo URL
   - Change tagline

2. **Refresh Your App:**
   - Check browser tab title
   - Check header logo
   - Check mobile menu

3. **Test Social Sharing:**
   - Share on Facebook
   - Share on Twitter
   - Check preview

### Test Fallbacks:

1. **Remove logo URL:**
   - Should show UtensilsCrossed icon
   - Name should still display

2. **Invalid logo URL:**
   - Should show fallback icon
   - No broken images

## 🎯 Benefits

### For Your Brand:

- ✅ Consistent branding everywhere
- ✅ Professional appearance
- ✅ Easy to update
- ✅ No code changes needed

### For SEO:

- ✅ Proper page titles
- ✅ Meta descriptions
- ✅ Social media optimization
- ✅ Better search rankings

### For Users:

- ✅ Clear brand identity
- ✅ Professional look
- ✅ Better recognition
- ✅ Trust building

## 🚀 Future Enhancements

### Possible Additions:

1. **Multiple Logo Variants:**
   - Light mode logo
   - Dark mode logo
   - Mobile logo
   - Favicon

2. **Brand Colors:**
   - Primary color from Firestore
   - Secondary color
   - Dynamic theming

3. **Custom Fonts:**
   - Brand font from Firestore
   - Google Fonts integration

4. **Advanced Metadata:**
   - Schema.org markup
   - Rich snippets
   - Local business data

### Example Enhanced Restaurant Type:

```typescript
export type Restaurant = {
  name: string;
  logoUrl: string;
  logoUrlDark?: string; // Dark mode logo
  logoUrlMobile?: string; // Mobile logo
  faviconUrl?: string; // Favicon
  tagline: string;
  brandColors?: {
    // Brand colors
    primary: string;
    secondary: string;
  };
  brandFont?: string; // Google Font name
  // ... existing fields
};
```

## 📊 Logo Display Sizes

### Across the App:

| Location    | Size      | Usage             |
| ----------- | --------- | ----------------- |
| Header      | 32x32px   | Main navigation   |
| Mobile Menu | 32x32px   | Mobile navigation |
| Favicon     | 16x16px   | Browser tab       |
| OpenGraph   | 512x512px | Social sharing    |
| Apple Touch | 180x180px | iOS home screen   |

## 🎉 Summary

✅ **Fully Dynamic Branding**

- Logo updates from Firestore
- Name updates from Firestore
- Metadata updates automatically

✅ **Professional Features**

- Image sanitization
- Fallback icons
- Responsive sizing
- SEO optimization

✅ **Easy Management**

- Update in Firestore
- No code changes
- Instant updates

**Your restaurant now has professional, dynamic branding!** 🎨✨
