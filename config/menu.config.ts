import { Home, Users, Settings, FileText, User } from "lucide-react";

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
    icon: FileText,
    roles: ["Admin", "User"],
  },
  {
    href: "/review",
    label: "Review",
    icon: FileText,
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
