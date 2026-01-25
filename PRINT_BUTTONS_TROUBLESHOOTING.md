# 🔧 Print Buttons Troubleshooting

## Issue: Print KOT and Print Bill buttons don't do anything

### ✅ Quick Fixes

#### 1. **Check Browser Console**

Press `F12` to open DevTools and check for errors in the Console tab.

Common errors:

- `404 Not Found` - Route doesn't exist
- `Module not found` - Missing import
- `Firebase error` - Permission issue

#### 2. **Verify Routes Exist**

Make sure these files exist:

```
src/app/admin/orders/[id]/kot/page.tsx
src/app/admin/orders/[id]/bill/page.tsx
```

#### 3. **Test Navigation Manually**

Try navigating directly in the browser:

```
http://localhost:9002/admin/orders/YOUR_ORDER_ID/kot
http://localhost:9002/admin/orders/YOUR_ORDER_ID/bill
```

Replace `YOUR_ORDER_ID` with an actual order ID (e.g., `8bUJ0KuU5kZHgTJKuwg2`)

#### 4. **Check for JavaScript Errors**

Open browser console (F12) and look for:

- Red error messages
- Failed network requests
- Module loading errors

#### 5. **Restart Dev Server**

Sometimes Next.js needs a restart after adding new routes:

```bash
# Stop the server (Ctrl+C)
# Then restart
yarn dev
```

#### 6. **Clear Browser Cache**

Hard refresh the page:

- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### 🔍 Debugging Steps

#### Step 1: Check if Links Work

Click the "View" (eye icon) button. Does it navigate to the order details page?

- ✅ Yes → Links work, issue is with KOT/Bill pages
- ❌ No → General navigation issue

#### Step 2: Check Console for Errors

Open DevTools (F12) → Console tab

- Look for red error messages
- Check Network tab for failed requests

#### Step 3: Verify File Structure

Your folder structure should look like:

```
src/app/admin/orders/
├── page.tsx                    # Orders list
├── new/
│   └── page.tsx               # Create order
└── [id]/
    ├── page.tsx               # Order details
    ├── kot/
    │   └── page.tsx           # KOT print
    └── bill/
        └── page.tsx           # Bill print
```

#### Step 4: Test Direct Navigation

In browser address bar, go to:

```
http://localhost:9002/admin/orders/8bUJ0KuU5kZHgTJKuwg2/kot
```

What happens?

- ✅ Page loads → Links might have issue
- ❌ 404 error → File doesn't exist or route issue
- ❌ Blank page → Check console for errors

### 🐛 Common Issues & Solutions

#### Issue 1: 404 Not Found

**Cause:** File doesn't exist or wrong location
**Solution:**

1. Check file exists at correct path
2. Restart dev server
3. Clear `.next` folder: `rm -rf .next`

#### Issue 2: Blank Page

**Cause:** JavaScript error in component
**Solution:**

1. Check browser console
2. Look for import errors
3. Verify all dependencies installed

#### Issue 3: Module Not Found

**Cause:** Missing import or dependency
**Solution:**

```bash
# Install missing dependencies
yarn install

# Or if specific package missing
yarn add date-fns
```

#### Issue 4: Firebase Permission Error

**Cause:** Firestore rules blocking read
**Solution:**
Update Firestore rules to allow reading orders (see FIRESTORE_SECURITY_RULES.md)

### 🧪 Test Each Component

#### Test 1: Orders List Page

```
URL: /admin/orders
Expected: List of orders with buttons
```

#### Test 2: Order Details Page

```
URL: /admin/orders/[id]
Expected: Full order details
```

#### Test 3: KOT Page

```
URL: /admin/orders/[id]/kot
Expected: KOT preview with print button
```

#### Test 4: Bill Page

```
URL: /admin/orders/[id]/bill
Expected: Bill preview with print button
```

### 📋 Checklist

Before asking for help, verify:

- [ ] Dev server is running (`yarn dev`)
- [ ] No errors in terminal
- [ ] No errors in browser console (F12)
- [ ] Files exist at correct paths
- [ ] Browser cache cleared
- [ ] Tried hard refresh (Ctrl+Shift+R)
- [ ] Tested direct URL navigation
- [ ] Firestore rules allow reading orders

### 🔄 Quick Reset

If nothing works, try a full reset:

```bash
# Stop dev server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
yarn install

# Restart dev server
yarn dev
```

### 💡 Expected Behavior

When clicking "Print KOT" or "Print Bill":

1. Browser navigates to new page
2. Page shows print preview
3. "Print KOT" or "Print Bill" button appears
4. Clicking print button opens browser print dialog

### 🆘 Still Not Working?

If buttons still don't work:

1. **Share the error message** from browser console
2. **Check terminal** for build errors
3. **Verify file paths** match exactly
4. **Test with a different browser**
5. **Check if other navigation works** (like "New Order" button)

### 📸 What to Check

Take screenshots of:

1. Browser console (F12 → Console tab)
2. Network tab (F12 → Network tab)
3. Terminal output
4. File structure in VS Code

This will help diagnose the issue!

---

## Quick Test

**Right now, try this:**

1. Open browser console (F12)
2. Click "Print KOT" button
3. What do you see in console?
   - Error message? → Share it
   - Nothing? → Check Network tab
   - Navigation? → Check if page loads

**Most likely causes:**

1. ✅ Files exist but dev server needs restart
2. ✅ Route exists but has JavaScript error
3. ✅ Navigation works but page is blank

**Try:** Restart dev server and hard refresh browser!
