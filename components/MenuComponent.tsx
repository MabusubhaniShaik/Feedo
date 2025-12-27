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

  // Separate main menu items from settings
  const mainMenuItems = menuItems.filter((item) => item.label !== "Settings");

  // Helper function to determine active state
  const isItemActive = (href: string) => pathname === href;

  // Helper function to generate link classes
  const getLinkClasses = (isActive: boolean) =>
    `group relative flex items-center w-full rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-[#3C6301] text-white"
        : "text-gray-300 hover:bg-gray-900 hover:text-white"
    }`;

  // Helper function to generate icon classes
  const getIconClasses = (isActive: boolean) =>
    `mr-3 h-4 w-4 ${
      isActive ? "text-white" : "text-gray-400 group-hover:text-white"
    }`;

  // Helper function to generate badge classes
  const getBadgeClasses = (isActive: boolean) =>
    `rounded-full px-2 py-0.5 text-xs ${
      isActive ? "bg-white/20" : "bg-gray-800"
    }`;

  // Logout handler
  const handleLogout = async () => {
    try {
      const access_token = sessionStorage.getItem("access_token");
      const user_info = sessionStorage.getItem("user_info");

      if (!access_token || !user_info) {
        console.error("No access token or user info found");
        clearSessionAndRedirect();
        return;
      }

      const userData = JSON.parse(user_info);

      await apiService.post(
        "/auth/revoke",
        {
          access_token,
          user_id: userData.id,
        },
        undefined,
        {
          Authorization: `Bearer ${access_token}`,
        }
      );

      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearSessionAndRedirect();
    }
  };

  // Clear session and redirect to login
  const clearSessionAndRedirect = () => {
    sessionStorage.clear();
    router.push("/signin");
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-black p-6 text-white">
      {/* Logo */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-xl font-bold">Feedo</h1>
      </div>

      {/* Main Menu Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {mainMenuItems.map((item) => {
          const isActive = isItemActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={getLinkClasses(isActive)}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active Indicator */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-white"
                  aria-hidden="true"
                />
              )}

              {/* Icon */}
              {item.icon && <item.icon className={getIconClasses(isActive)} />}

              {/* Label */}
              <span className="flex-1">{item.label}</span>

              {/* Notification Badge */}
              {item.count !== undefined && (
                <span className={getBadgeClasses(isActive)}>{item.count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto flex-shrink-0 space-y-2 pt-6">
        <Separator className="bg-gray-800" />

        {/* Settings */}
        <Link
          href="/settings"
          className={getLinkClasses(pathname === "/settings")}
          aria-current={pathname === "/settings" ? "page" : undefined}
        >
          {/* Active Indicator */}
          {pathname === "/settings" && (
            <div
              className="absolute left-0 top-1/2 h-3 w-1 -translate-y-1/2 rounded-r-full bg-white"
              aria-hidden="true"
            />
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
