# Styling Guide 🎨

Let's learn how to make things look pretty using Tailwind CSS!

## What is Tailwind? 🌈

Tailwind is a way to style our website by adding special classes to our HTML. Instead of writing separate CSS files, we put all our styles right in the className.

## Common Tailwind Classes 📝

### Colors

```tsx
// Text colors
className = 'text-blue-500'; // Blue text
className = 'text-red-500'; // Red text
className = 'text-gray-900'; // Dark gray text

// Background colors
className = 'bg-white'; // White background
className = 'bg-blue-500'; // Blue background
className = 'bg-gray-50'; // Light gray background
```

### Spacing

```tsx
// Margin (space outside)
className = 'mt-4'; // Margin top
className = 'mb-6'; // Margin bottom
className = 'mx-4'; // Margin left and right

// Padding (space inside)
className = 'p-4'; // Padding all around
className = 'px-6'; // Padding left and right
className = 'py-4'; // Padding top and bottom
```

### Layout

```tsx
// Flex
className = 'flex'; // Make a flex container
className = 'items-center'; // Center items vertically
className = 'justify-between'; // Space items evenly

// Grid
className = 'grid'; // Make a grid container
className = 'grid-cols-3'; // 3 columns
className = 'gap-4'; // Space between grid items
```

### Typography

```tsx
// Size
className = 'text-sm'; // Small text
className = 'text-xl'; // Extra large text
className = 'text-3xl'; // Really big text

// Weight
className = 'font-bold'; // Bold text
className = 'font-medium'; // Medium weight
```

## Real Examples from Our Code 🚀

### Admin Header

```tsx
// app/admin/layout.tsx
<header className="bg-white shadow">
  <div className="mx-auto max-w-7xl px-4 py-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-900">CCC Admin</h1>
      <ConnectionStatus />
    </div>
  </div>
</header>
```

This creates:

- White background with shadow
- Centered content with max width
- Spacing around content
- Big bold title on left
- Connection status on right

### Connection Status Pill

```tsx
// components/admin/ConnectionStatus.tsx
<div
  className={`
  inline-flex items-center 
  px-3 py-1 
  rounded-full border 
  ${getStatusColor()}
  text-sm font-medium
`}
>
  <span className="w-2 h-2 rounded-full mr-2 bg-green-500" />
  Connected to Supabase
</div>
```

This creates:

- Rounded pill shape
- Small padding inside
- Colored border
- Small dot indicator
- Medium weight text

## Responsive Design 📱

Make things look good on all screen sizes:

```tsx
className="
  text-sm        // Small text on mobile
  md:text-base   // Normal text on medium screens
  lg:text-lg     // Larger text on big screens
"

className="
  grid-cols-1    // 1 column on mobile
  sm:grid-cols-2 // 2 columns on small screens
  lg:grid-cols-3 // 3 columns on large screens
"
```

## Hover and Focus States 🖱️

Add special effects when users interact:

```tsx
className="
  bg-blue-500          // Normal blue background
  hover:bg-blue-700    // Darker blue on hover
  focus:ring-2        // Ring around when focused
"
```

## Dark Mode 🌙

Support light and dark themes:

```tsx
className="
  bg-white          // White background in light mode
  dark:bg-gray-800  // Dark background in dark mode
  text-gray-900     // Dark text in light mode
  dark:text-white   // White text in dark mode
"
```

## Tips for Styling 💡

1. **Start Simple**

   - Begin with basic styles
   - Add more as needed
   - Don't overdo it!

2. **Use the Inspector**

   - Right-click → Inspect
   - See what styles are applied
   - Try changes in the browser

3. **Copy from Examples**

   - Look at existing components
   - Copy styles that look good
   - Modify to fit your needs

4. **Stay Consistent**

   - Use similar colors
   - Keep spacing consistent
   - Follow the design patterns

5. **Ask for Help**
   - Styling can be tricky
   - It's okay to ask questions
   - Share what you learn!
