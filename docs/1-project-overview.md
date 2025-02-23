# Project Overview: CCC Landing Page 🚀

Hey there! 👋 Welcome to the CCC Landing Page project. Let's break down what this project is all about in simple terms.

## What Are We Building? 🏗️

We're building a website for CCC that has two main parts:
1. A public landing page that everyone can see
2. An admin dashboard where we can manage the website content

## How Is It Built? 🛠️

We're using some cool modern tools:

### Next.js 14
- This is our main framework
- Think of it like Lego blocks for building websites
- It helps us make both the front-end (what users see) and back-end (behind the scenes stuff)

### TypeScript
- It's like regular JavaScript but with extra safety features
- Helps catch mistakes before they happen
- Makes it easier to understand what kind of data we're working with

### Tailwind CSS
- A tool that makes styling our website super easy
- Instead of writing separate CSS files, we add style classes directly in our code
- Makes it quick to make things look good!

### Supabase
- Our database and authentication service
- Think of it like a super-powered spreadsheet that lives on the internet
- Stores all our data (like sponsor information) securely

## Project Structure 📁

Here's how our files are organized:

```
app/                  # Main pages of our website
  ├── page.tsx         # The landing page (what everyone sees)
  └── admin/           # Admin section (password protected)
      └── page.tsx     # Admin dashboard

components/           # Reusable pieces of our website
  ├── Hero.tsx         # The big welcome banner
  ├── Sponsors.tsx     # Shows all sponsors
  └── admin/           # Admin-only components
      └── ...          # Various admin tools

lib/                 # Helper functions and setup
  └── supabase/       # Database connection stuff

public/              # Images and other files
```

## Key Features 🌟

1. **Public Landing Page**
   - Shows sponsors in a cool carousel
   - Displays fundraising progress
   - Lists past winners

2. **Admin Dashboard**
   - Add and manage sponsors
   - See database connection status
   - More features coming soon!

## Getting Started 🎬

Want to run this project on your computer? Here's how:

1. Make sure you have Node.js installed (that's what runs our JavaScript)
2. Copy `.env.example` to `.env.local` and add your Supabase details
3. Open your terminal and run:
   ```bash
   npm install        # Gets all the tools we need
   npm run dev       # Starts the website
   ```
4. Open `http://localhost:3000` in your browser

## Need Help? 🤔

- Check out the other docs in this folder
- Look for comments in the code (they explain what things do)
- Ask questions! We're here to help
