# Sponsor Carousel Feature

## Overview
The sponsor carousel is an interactive component that showcases our sponsors in an engaging way. It features smooth animations, parallax effects, and responsive design to provide an optimal viewing experience across all devices.

## Key Features
- Interactive carousel with smooth scrolling and drag support
- Parallax effects on sponsor logos
- Progress bar showing current scroll position
- Automatic playback with pause on hover/interaction
- Responsive design with optimized layouts for mobile and desktop
- Floating animations and hover effects for enhanced interactivity

## Technical Implementation
- Uses Embla Carousel for core carousel functionality
- Implements custom parallax effects using scroll position calculations
- Tailwind CSS animations for smooth transitions and hover effects
- Responsive breakpoints for optimal display on all screen sizes

## Usage
The sponsor carousel is implemented in `components/SponsorCarousel.tsx`. To use it:

```tsx
import SponsorCarousel from '@/components/SponsorCarousel';

export default function Page() {
  return (
    <SponsorCarousel />
  );
}
```

## Configuration
The carousel can be configured through the following options:

- `duration`: Controls the scroll animation duration (default: 20)
- `dragFree`: Enables momentum scrolling (default: true)
- `loop`: Enables infinite looping (default: true)
- `align`: Centers the active slide (default: 'center')
- `autoplay`: Automatically advances slides (default: 3500ms delay)

## Styling
The component uses Tailwind CSS for styling with custom animations defined in `tailwind.config.ts`:
- `float`: Creates a gentle floating effect for logos
- `fade-in`: Smooth fade-in transition
- `slide-up`: Upward sliding animation
