"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { menuItems } from "@/config/menu.config";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apiService } from "@/helpers/api.service";
import { useEffect, useState } from "react";

const MenuComponent = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const userInfo = sessionStorage.getItem("user_info");
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          setUserRole(parsed.role || null);
        } catch {
          setUserRole(null);
        }
      }
    }
  }, [isClient]);

  const filteredMenuItems = menuItems.filter((item) => {
    if (!isClient) return true;
    if (!item.roles || !userRole) return true;
    return item.roles.includes(userRole);
  });

  const mainMenuItems = filteredMenuItems.filter(
    (item) => item.label !== "Settings"
  );

  const isPathActive = (href: string) => {
    if (pathname === href) return true;
    if (href !== "/" && pathname.startsWith(href + "/")) return true;
    return false;
  };

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

  const handleLogout = async () => {
    try {
      const access_token = sessionStorage.getItem("access_token");
      const userInfo = sessionStorage.getItem("user_info");

      if (access_token && userInfo) {
        const userData = JSON.parse(userInfo);
        const payload = {
          access_token,
          user_id: userData.id,
        };

        await apiService.post("/auth/revoke", payload);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      sessionStorage.clear();
      router.push("/signin");
    }
  };

  if (!isClient) {
    return (
      <aside className="flex h-screen w-64 flex-col bg-black p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Feedo</h1>
        </div>
        <div className="flex-1 space-y-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-900 rounded-md animate-pulse"
            />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-screen w-64 flex-col bg-black p-6">
      <div className="mb-6 flex items-center justify-center">
        <h1 className="text-xl font-bold text-white">Feedo</h1>
      </div>

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
              {isActive && (
                <div className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-white" />
              )}
              {item.icon && <item.icon className={getIconClasses(isActive)} />}
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 pt-6">
        <Separator className="bg-gray-800" />

        {filteredMenuItems.some((item) => item.label === "Settings") && (
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
        )}

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
