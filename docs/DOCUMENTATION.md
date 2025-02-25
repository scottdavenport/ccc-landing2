# CCC Landing Page Documentation

Hi! 👋 This is a simple guide to our website. Let's break it down into easy-to-understand parts!

## 📁 What's in Each Folder?

### 🏠 Main Pages (`app` folder)

- `page.tsx`: This is our home page! It shows sponsors, fundraising info, and past winners
- `admin/page.tsx`: This is where we manage sponsors and website stuff (only for admins!)
- `admin/login/page.tsx`: Where admins log in to access the special admin area

### 🧩 Building Blocks (`components` folder)

- `Hero.tsx`: The big welcome banner at the top of the page
- `FundsRaised.tsx`: Shows how much money we've collected
- `Navigation.tsx`: The menu at the top of the page
- `PastWinners.tsx`: Shows who won in previous years
- `Sponsors.tsx`: Shows all our helpful sponsors
- `SponsorCarousel.tsx`: A pretty sliding display of sponsor logos
- `SponsorLightbox.tsx`: Makes sponsor images bigger when you click them

#### Admin Components

- `admin/AddSponsorForm.tsx`: A form for adding new sponsors
- `admin/SponsorsTable.tsx`: A list of all sponsors that we can edit
- `admin/ConnectionStatus.tsx`: Shows if we're connected to our database

### 🔧 Behind the Scenes (`lib` folder)

- `supabase/client.ts`: Helps us talk to our database
- `supabase/server.ts`: Special database stuff that happens on our server
- `auth.tsx`: Makes sure only admins can access admin pages
- `utils.ts`: Helpful tools we use in different places

### 🗄️ Database Stuff (`supabase` folder)

- `migrations`: Contains all our database setup instructions
- `config.toml`: Settings for our database

### 🎨 Design and Style

- `app/globals.css`: Makes everything look pretty
- `components/ui`: Common buttons and alerts we use everywhere

## 🧹 Cleanup Needed

1. We can remove these test files:
   - `app/admin/supabase-test/page.tsx`
   - `app/admin/test-connection/page.tsx`
   - `components/admin/SupabaseTest.tsx`
   - `components/admin/SupabaseTestUI.tsx`
   - `lib/supabase.ts` (we now use `lib/supabase/client.ts`)
   - `lib/supabase-auth.ts` (we now use `lib/supabase/server.ts`)

## 🚀 How to Run the Website

1. Copy `.env.example` to `.env.local` and fill in the database details
2. Run `npm install` to get all the tools we need
3. Run `npm run dev` to start the website
4. Open your web browser and go to `http://localhost:3000`

## 👥 Who Can Do What?

- **Regular Visitors**: Can see sponsors, fundraising info, and past winners
- **Admin Users**: Can add/edit sponsors and manage website content

## 🔒 Safety First!

- We keep database passwords safe in special `.env` files
- Only admins can log in to the admin area
- We check database connections regularly

## 🎯 Coming Soon

Check out `ROADMAP.md` for what we're planning to add next!
