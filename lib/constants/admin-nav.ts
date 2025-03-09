import {
  LayoutDashboard,
  Users,
  DollarSign,
  HandHeart,
  Settings,
  Trophy,
  type LucideIcon
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const adminNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview of tournament statistics and activities',
  },
  {
    title: 'Tournament Results',
    href: '/admin/results',
    icon: Trophy,
    description: 'Manage tournament results, flights, and winners',
  },
  {
    title: 'Sponsors',
    href: '/admin/sponsors',
    icon: HandHeart,
    description: 'Manage tournament sponsors and partnerships',
  },
  {
    title: 'Donations',
    href: '/admin/donations',
    icon: DollarSign,
    description: 'Track and manage tournament donations',
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'Manage user accounts and permissions',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configure tournament and application settings',
  },
]; 