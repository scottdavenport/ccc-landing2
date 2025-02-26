# Sponsor Carousel Feature

## Overview
The Sponsor Carousel is a dynamic, interactive component that showcases sponsors of the Craven Cancer Classic. It features smooth animations, parallax effects, and responsive design to provide an engaging user experience.

## Features
- **Dynamic Data Loading**: Fetches sponsor data from Supabase database
- **Optimized Image Loading**: Uses Cloudinary for optimized image delivery
- **Interactive UI**: Includes lightbox for detailed sponsor information
- **Smooth Animations**: Implements parallax effects and transitions
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Includes keyboard navigation and ARIA attributes
- **Currency Formatting**: Properly displays sponsorship amounts in USD format
- **Autoplay**: Automatically cycles through sponsors with pause on hover/interaction
- **Progress Indicators**: Shows carousel progress and current slide position

## Technical Implementation

### Components
1. **SponsorCarousel.tsx**: Main component that renders the carousel
2. **SponsorLightbox.tsx**: Modal component for displaying detailed sponsor information
3. **EmblaCarouselDotButton.tsx**: Component for carousel navigation dots

### Libraries Used
- **Embla Carousel**: Core carousel functionality with autoplay plugin
- **Next Cloudinary**: Image optimization and delivery
- **Framer Motion**: Animations for the lightbox
- **Radix UI**: Dialog component for the lightbox
- **Lucide React**: Icon components

### Styling
- Custom CSS in `styles/embla-carousel.css`
- Tailwind CSS for responsive design and utility classes
- CSS variables for easy customization

### Data Flow
1. Fetch sponsor data from Supabase
2. Transform data to match component requirements
3. Render sponsors in carousel with optimized images
4. Track carousel state (selected index, scroll progress, etc.)
5. Update UI based on carousel state

## Usage Example
```tsx
// In a page component
import SponsorCarousel from '@/components/SponsorCarousel';

export default function HomePage() {
  return (
    <div>
      {/* Other components */}
      <SponsorCarousel />
      {/* Other components */}
    </div>
  );
}
```

## Customization
The carousel can be customized through:
- CSS variables in `styles/embla-carousel.css`
- Embla Carousel options in the `OPTIONS` constant
- Tailwind classes for styling

## Future Enhancements
- Add sponsor website links
- Implement filtering by sponsor level
- Add year selection for historical sponsors
- Enhance animations and transitions
- Implement sponsor search functionality
