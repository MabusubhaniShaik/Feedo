import {
  Home,
  Users,
  Settings,
  Package,
  Star,
  User,
} from "lucide-react";

export interface MenuItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
  roles?: string[];
}

export const menuItems: MenuItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
    roles: ["Admin", "User"],
  },
  {
    href: "/product",
    label: "Product",
    icon: Package,
    roles: ["Admin", "User"],
  },
  {
    href: "/review",
    label: "Review",
    icon: Star,
    roles: ["Admin", "User"],
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    roles: ["Admin", "User"],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    roles: ["Admin"],
  },
  {
    href: "/manage",
    label: "Manage",
    icon: Users,
    roles: ["Admin"],
  },
];
