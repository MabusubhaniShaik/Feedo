import { 
  Home, 
  Users, 
  Settings, 
  BarChart3,
  Bell,
  FileText 
} from "lucide-react";

export interface MenuItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export const menuItems: MenuItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
  },
 
    {
    href: "/product",
    label: "Product",
    icon: FileText,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: FileText,
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
   {
    href: "/manage",
    label: "Manage",
    icon: Users,
  },
];