"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { menuItems } from "@/config/menu.config";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apiService } from "@/helpers/api.service";

const MenuComponent = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Filter out settings from main menu
  const mainMenuItems = menuItems.filter((item) => item.label !== "Settings");

  // Helper to check if a path is active (including nested routes)
  const isPathActive = (href: string) => {
    // Exact match
    if (pathname === href) return true;

    // For dynamic routes, check if pathname starts with the base path
    // Example: /product/123 should highlight /product menu
    if (href !== "/" && pathname.startsWith(href + "/")) return true;

    // Special case for root
    if (href === "/" && pathname === "/") return true;

    return false;
  };

  // Class generators
  const getLinkClasses = (active: boolean) =>
    `group relative flex items-center w-full rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-[#3C6301] text-white"
        : "text-gray-300 hover:bg-gray-900 hover:text-white"
    }`;

  const getIconClasses = (active: boolean) =>
    `mr-3 h-4 w-4 ${
      active ? "text-white" : "text-gray-400 group-hover:text-white"
    }`;

  const getBadgeClasses = (active: boolean) =>
    `rounded-full px-2 py-0.5 text-xs ${
      active ? "bg-white/20" : "bg-gray-800"
    }`;

  // Logout handler
  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem("access_token");
      const userInfo = sessionStorage.getItem("user_info");

      if (token && userInfo) {
        const userData = JSON.parse(userInfo);
        await apiService.post(
          "/auth/revoke",
          { access_token: token, user_id: userData.id },
          undefined,
          { Authorization: `Bearer ${token}` }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      sessionStorage.clear();
      router.push("/signin");
    }
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-black p-6">
      {/* Logo */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Feedo</h1>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {mainMenuItems.map((item) => {
          const isActive = isPathActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={getLinkClasses(isActive)}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-white" />
              )}

              {/* Icon */}
              {item.icon && <item.icon className={getIconClasses(isActive)} />}

              {/* Label */}
              <span className="flex-1">{item.label}</span>

              {/* Badge */}
              {item.count !== undefined && (
                <span className={getBadgeClasses(isActive)}>{item.count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="mt-auto space-y-2 pt-6">
        <Separator className="bg-gray-800" />

        {/* Settings */}
        <Link
          href="/settings"
          className={getLinkClasses(pathname === "/settings")}
        >
          {pathname === "/settings" && (
            <div className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-white" />
          )}
          <Settings className={getIconClasses(pathname === "/settings")} />
          <span className="flex-1">Settings</span>
        </Link>

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2 text-gray-300 hover:bg-gray-900 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4 text-[#FB2C36]" />
          <span className="text-[#FB2C36]">Logout</span>
        </Button>
      </div>
    </aside>
  );
};

export default MenuComponent;
