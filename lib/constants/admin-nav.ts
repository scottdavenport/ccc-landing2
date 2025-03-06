import {
  LayoutDashboard,
  Users,
  DollarSign,
  HandHeart,
  Settings,
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