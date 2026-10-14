"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { menuItems, type MenuItem } from "@/config/menu.config";
import { Button } from "@/components/ui/button";
import { apiService } from "@/helpers/api.service";
import { useEffect, useState } from "react";

const isPathActive = (pathname: string, href: string) => {
  if (pathname === href) return true;
  if (href !== "/" && pathname.startsWith(href + "/")) return true;
  return false;
};

const NavLink = ({
  item,
  active,
  onClick,
}: {
  item: MenuItem;
  active: boolean;
  onClick?: () => void;
}) => (
  <Link
    href={item.href}
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    className={`group relative flex items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
      active
        ? "bg-[var(--accent)] font-medium text-gold"
        : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
    }`}
  >
    {active && (
      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gold" />
    )}
    {item.icon && (
      <item.icon
        className={`mr-3 h-[18px] w-[18px] transition-colors ${
          active ? "text-gold" : "text-muted-foreground group-hover:text-foreground"
        }`}
      />
    )}
    <span className="flex-1">{item.label}</span>
  </Link>
);

/** Shared sidebar navigation — used by the desktop rail and the mobile sheet. */
export const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const handleLogout = async () => {
    try {
      const access_token = sessionStorage.getItem("access_token");
      const userInfo = sessionStorage.getItem("user_info");
      if (access_token && userInfo) {
        const userData = JSON.parse(userInfo);
        await apiService.post("/auth/revoke", {
          access_token,
          user_id: userData.id,
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      sessionStorage.clear();
      router.push("/signin");
    }
  };

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
  const showSettings = filteredMenuItems.some((item) => item.label === "Settings");

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-7">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="inline-flex items-baseline gap-2"
        >
          <span className="font-display text-4xl font-semibold leading-none gold-text">
            Feedo
          </span>
        </Link>
        <div className="mt-4 h-px gold-rule" />
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Feedback Suite
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {!isClient
          ? [...Array(5)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-white/[0.04]" />
            ))
          : mainMenuItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isPathActive(pathname, item.href)}
                onClick={onNavigate}
              />
            ))}
      </nav>

      <div className="mt-auto space-y-1 border-t border-border px-3 pb-5 pt-4">
        {showSettings && (
          <NavLink
            item={{ href: "/settings", label: "Settings", icon: Settings }}
            active={isPathActive(pathname, "/settings")}
            onClick={onNavigate}
          />
        )}

        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-[#f87171]"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-[18px] w-[18px]" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};

const MenuComponent = () => (
  <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
    <SidebarContent />
  </aside>
);

export default MenuComponent;
