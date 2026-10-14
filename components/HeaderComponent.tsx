"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Bell, Menu, ChevronDown, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarContent } from "@/components/MenuComponent";
import { useRouter } from "next/navigation";
import { apiService } from "@/helpers/api.service";

interface UserInfo {
  name: string;
  role: string;
  email?: string;
  id?: string;
}

interface Notification {
  id: number;
  title: string;
  time: string;
  read: boolean;
}

const defaultNotifications: Notification[] = [
  { id: 1, title: "New feedback received", time: "2 min ago", read: false },
  { id: 2, title: "System update available", time: "1 hour ago", read: false },
  { id: 3, title: "Weekly report ready", time: "3 hours ago", read: true },
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

const getAvatarUrl = (name: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

const HeaderComponent = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<Notification[]>(defaultNotifications);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const getUserInfo = useCallback(() => {
    try {
      const userInfoString = sessionStorage.getItem("user_info");
      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        setUser({
          name: userInfo.name || "User",
          role: userInfo.role || "User",
          email:
            userInfo.email ||
            `${(userInfo.name || "user").toLowerCase()}@example.com`,
          id: userInfo.id,
        });
      }
    } catch {
      setUser({ name: "User", role: "User", email: "user@example.com" });
    }
  }, []);

  useEffect(() => {
    getUserInfo();
    const handleStorageChange = () => getUserInfo();

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(getUserInfo, 5000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [getUserInfo]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markAsRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

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

  if (!user)
    return <HeaderSkeleton searchQuery={searchQuery} onSearch={handleSearch} />;

  return (
    <>
      <header className="glass sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllAsRead={markAllAsRead}
            onMarkAsRead={markAsRead}
          />
          <UserProfile user={user} onLogout={handleLogout} />
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
};

const HeaderSkeleton = ({
  searchQuery,
  onSearch,
}: {
  searchQuery: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <header className="glass sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border px-4 md:px-6">
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <SearchBar searchQuery={searchQuery} onSearch={onSearch} />
    </div>
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 animate-pulse rounded-full bg-white/[0.06]" />
      <div className="hidden md:block">
        <div className="mb-1 h-4 w-24 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-3 w-16 animate-pulse rounded bg-white/[0.06]" />
      </div>
    </div>
  </header>
);

const SearchBar = ({
  searchQuery,
  onSearch,
}: {
  searchQuery: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative w-40 sm:w-64 md:w-80">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      type="search"
      placeholder="Search..."
      value={searchQuery}
      onChange={onSearch}
      className="border-border bg-black/30 pl-10 text-foreground placeholder:text-muted-foreground focus-visible:border-gold/60"
    />
  </div>
);

const NotificationBell = ({
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onMarkAsRead,
}: {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: number) => void;
}) => {
  const router = useRouter();
  return (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-muted-foreground hover:text-foreground"
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[11px] font-semibold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80 border-border bg-popover text-popover-foreground shadow-luxury">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gold hover:text-gold-soft"
            onClick={onMarkAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      <div className="mt-2 max-h-80 space-y-2 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && markAsReadKey(notification.id, onMarkAsRead)}
              className={`flex cursor-pointer items-start rounded-lg p-2 transition-colors ${
                notification.read
                  ? "hover:bg-white/[0.04]"
                  : "bg-[var(--accent)] hover:bg-[var(--accent)]/70"
              }`}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-muted-foreground">{notification.time}</p>
              </div>
              {!notification.read && (
                <div className="mt-2 h-2 w-2 rounded-full bg-gold" />
              )}
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No notifications
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <Button
          variant="ghost"
          className="w-full text-sm text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/notifications")}
        >
          View all notifications
        </Button>
      </div>
    </PopoverContent>
  </Popover>
  );
};

const markAsReadKey = (
  id: number,
  onMarkAsRead: (id: number) => void
) => onMarkAsRead(id);

const UserProfile = ({
  user,
  onLogout,
}: {
  user: UserInfo;
  onLogout: () => void;
}) => {
  const router = useRouter();

  const items = [
    { label: "Profile", action: () => router.push("/profile") },
    { label: "Settings", action: () => router.push("/settings") },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 hover:bg-white/[0.05]"
        >
          <Avatar className="h-8 w-8 border border-gold/40">
            <AvatarImage src={getAvatarUrl(user.name)} alt={user.name} />
            <AvatarFallback className="bg-gold text-xs font-semibold text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium leading-tight">{user.name}</p>
            <p className="text-xs capitalize leading-tight text-muted-foreground">
              {user.role.toLowerCase()}
            </p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 border-border bg-popover text-popover-foreground shadow-luxury"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs capitalize leading-none text-muted-foreground">
              {user.role.toLowerCase()}
            </p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border" />

        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            className="cursor-pointer focus:bg-[var(--accent)] focus:text-gold"
            onClick={item.action}
          >
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          className="cursor-pointer text-[#f87171] focus:bg-destructive/10 focus:text-[#f87171]"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderComponent;
