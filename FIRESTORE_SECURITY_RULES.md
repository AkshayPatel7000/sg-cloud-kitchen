# 🔐 Firestore Security Rules Setup

## ❌ Current Error

```
FirebaseError: Missing or insufficient permissions.
```

This error occurs because Firestore security rules are blocking write access to the `orders` collection.

## ✅ Solution: Update Firestore Security Rules

### Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top

### Step 2: Update Security Rules

Replace your current rules with these comprehensive rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null &&
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Restaurant info - Public read, Admin write
    match /restaurant/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Categories - Public read, Admin write
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Dishes - Public read, Admin write
    match /dishes/{dishId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Section Items (Offers, Specials, What's New) - Public read, Admin write
    match /sectionItems/{itemId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Orders - Admin only
    match /orders/{orderId} {
      allow read: if isAdmin();
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Admins - Admin only
    match /admins/{adminId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

### Step 3: Publish Rules

1. Click **Publish** button
2. Confirm the changes

## 🔍 Understanding the Rules

### Public Read, Admin Write Pattern:

```javascript
match /dishes/{dishId} {
  allow read: if true;           // Anyone can read
  allow write: if isAdmin();     // Only admins can write
}
```

### Admin Only Pattern:

```javascript
match /orders/{orderId} {
  allow read: if isAdmin();      // Only admins can read
  allow create: if isAdmin();    // Only admins can create
  allow update: if isAdmin();    // Only admins can update
  allow delete: if isAdmin();    // Only admins can delete
}
```

## 📋 Collections Overview

| Collection     | Read Access | Write Access |
| -------------- | ----------- | ------------ |
| `restaurant`   | Public      | Admin only   |
| `categories`   | Public      | Admin only   |
| `dishes`       | Public      | Admin only   |
| `sectionItems` | Public      | Admin only   |
| `orders`       | Admin only  | Admin only   |
| `admins`       | Admin only  | Admin only   |

## 🧪 Testing After Update

### Test 1: Create Order

1. Go to `/admin/orders/new`
2. Add dishes
3. Fill customer details
4. Click "Create Order"
5. ✅ Should work without errors

### Test 2: View Orders

1. Go to `/admin/orders`
2. ✅ Should see orders list

### Test 3: Public Access

1. Open home page (not logged in)
2. ✅ Should see dishes and menu
3. ❌ Should NOT be able to create orders

## ⚠️ Important Notes

### Admin User Setup

Make sure you have an admin user in Firestore:

1. **Go to Firestore Database**
2. **Create collection:** `admins`
3. **Add document with your user ID:**

```javascript
// Document ID: YOUR_USER_UID (from Firebase Auth)
{
  email: "admin@restaurant.com",
  name: "Admin User",
  role: "admin",
  uid: "YOUR_USER_UID"
}
```

### How to Get Your User UID:

**Method 1: From Firebase Console**

1. Go to **Authentication** → **Users**
2. Find your user
3. Copy the **User UID**

**Method 2: From Browser Console**

1. Log in to admin panel
2. Open browser console (F12)
3. Type: `firebase.auth().currentUser.uid`
4. Copy the UID

## 🔒 Security Best Practices

### ✅ DO:

- Use helper functions (`isAdmin()`)
- Validate data before writing
- Use specific rules for each collection
- Test rules thoroughly

### ❌ DON'T:

- Use `allow read, write: if true;` in production
- Store sensitive data without encryption
- Allow public write access
- Skip authentication checks

## 🚀 Alternative: Development Mode (NOT for Production)

If you're just testing and want to allow all access temporarily:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ⚠️ DEVELOPMENT ONLY!
    }
  }
}
```

**⚠️ WARNING:** This allows anyone to read/write all data. Use ONLY for development!

## 📊 Complete Production Rules (Enhanced)

For a production-ready setup with more security:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAdmin() {
      return request.auth != null &&
             exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }

    function isAuthenticated() {
      return request.auth != null;
    }

    // Restaurant info
    match /restaurant/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Categories
    match /categories/{categoryId} {
      allow read: if true;
      allow create: if isAdmin();
      allow update: if isAdmin() &&
                      request.resource.data.keys().hasAll(['name', 'slug', 'description', 'order', 'isActive']);
      allow delete: if isAdmin();
    }

    // Dishes
    match /dishes/{dishId} {
      allow read: if true;
      allow create: if isAdmin();
      allow update: if isAdmin() &&
                      request.resource.data.keys().hasAll(['name', 'categoryId', 'description', 'price', 'imageUrl', 'isVeg', 'isAvailable', 'tags']);
      allow delete: if isAdmin();
    }

    // Section Items
    match /sectionItems/{itemId} {
      allow read: if true;
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Orders
    match /orders/{orderId} {
      allow read: if isAdmin();
      allow create: if isAdmin() &&
                      request.resource.data.keys().hasAll(['orderNumber', 'items', 'subtotal', 'tax', 'total', 'status', 'orderType', 'createdBy', 'isPaid']) &&
                      request.resource.data.createdBy == request.auth.uid;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Admins
    match /admins/{adminId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

## 🔧 Troubleshooting

### Still Getting Permission Error?

1. **Check Admin User:**
   - Verify `admins` collection exists
   - Verify your UID is in the collection
   - Verify `role` field is set to "admin"

2. **Check Authentication:**
   - Make sure you're logged in
   - Check browser console for auth errors
   - Try logging out and back in

3. **Check Rules:**
   - Verify rules are published
   - Check for syntax errors
   - Use Firebase Rules Playground to test

4. **Clear Cache:**
   - Clear browser cache
   - Restart dev server
   - Hard refresh (Ctrl+Shift+R)

## 📝 Quick Fix Checklist

- [ ] Updated Firestore security rules
- [ ] Published the rules
- [ ] Created `admins` collection
- [ ] Added your user to `admins` collection
- [ ] Verified your UID matches
- [ ] Logged in as admin
- [ ] Tested creating an order

## 🎉 After Setup

Once rules are updated, you should be able to:

- ✅ Create orders from admin panel
- ✅ View orders list
- ✅ Update order status
- ✅ Manage all admin features

**Your orders system will work perfectly!** 🔐✨
