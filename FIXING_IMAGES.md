# Fixing Image URLs in Your Kitchen App

## The Problem

Your Firestore database currently contains **Google search redirect URLs** instead of direct image URLs. These URLs look like:

```
https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.indianhealthyrecipes.com%2Fwhite-sauce-pasta%2F&psig=...
```

These are **NOT** actual image files - they're Google redirect pages that won't work with Next.js Image component.

## What I've Done

I've added automatic fallback handling so your app won't break:

1. ✅ Created `src/lib/image-utils.ts` with validation functions
2. ✅ Updated `menu-section.tsx` to use fallback images for invalid URLs
3. ✅ Updated `offers-carousel.tsx` to use fallback images for invalid URLs
4. ✅ Added the `sizes` prop to all images for better performance

**Your app will now show placeholder images instead of broken images.**

## How to Fix Your Database (Recommended)

### Option 1: Use Unsplash (Free, High Quality)

1. Go to [Unsplash](https://unsplash.com/)
2. Search for your dish (e.g., "pasta", "pizza", "burger")
3. Click on an image
4. Click "Download" → Right-click the image → "Copy image address"
5. Use that URL in your Firestore database

Example good URL:

```
https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80
```

### Option 2: Use Your Existing Placeholder Images

You already have placeholder images in `src/lib/placeholder-images.json`. You can use these URLs directly:

- **Pasta**: `https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8c3BhZ2hldHRpJTIwY2FyYm9uYXJhfGVufDB8fHx8MTc2NTA5NzI5N3ww&ixlib=rb-4.1.0&q=80&w=1080`
- **Pizza**: `https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8cGl6emF8ZW58MHx8fHwxNzY1MDY0NjgyfDA&ixlib=rb-4.1.0&q=80&w=1080`
- **Salad**: `https://images.unsplash.com/photo-1642346881079-56938000f95d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxnYXJkZW4lMjBzYWxhZHxlbnwwfHx8fDE3NjUwMTg5NTF8MA&ixlib=rb-4.1.0&q=80&w=1080`

### Option 3: Upload to Firebase Storage

1. Go to Firebase Console → Storage
2. Upload your images
3. Get the download URL
4. Use that URL in Firestore

### Option 4: Use Pexels (Free Alternative)

1. Go to [Pexels](https://www.pexels.com/)
2. Search for food images
3. Download and get the image URL

## How to Get the CORRECT Image URL from Google Images

If you must use Google Images:

1. **Right-click on the image** in Google Images
2. Select **"Open image in new tab"**
3. Copy the URL from the address bar (should end in .jpg, .png, etc.)
4. **DO NOT** use "Copy link address" - that gives you the redirect URL

❌ **WRONG** (redirect URL):

```
https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.indianhealthyrecipes.com...
```

✅ **CORRECT** (direct image URL):

```
https://www.indianhealthyrecipes.com/wp-content/uploads/2023/01/white-sauce-pasta.jpg
```

## Updating Your Firestore Database

1. Go to Firebase Console → Firestore Database
2. Find the `dishes` or `sectionItems` collection
3. Click on each document
4. Update the `imageUrl` field with a valid image URL
5. Save

## Current Status

- ✅ App won't break with invalid URLs (shows fallback images)
- ⚠️ You should still update your database with proper URLs for better images
- ✅ All Next.js Image warnings are fixed
- ✅ Images are optimized with proper `sizes` prop

## Console Warnings

You may see warnings like:

```
Invalid image URL detected: https://www.google.com/url?... Using fallback.
```

This is **expected** and helps you identify which images need to be fixed in your database.
