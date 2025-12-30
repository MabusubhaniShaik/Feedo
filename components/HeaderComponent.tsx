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
import { useRouter } from "next/navigation";

interface UserInfo {
  name: string;
  role: string;
  email?: string;
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

  const handleLogout = () => {
    sessionStorage.clear();
    router.push("/signin");
  };

  if (!user)
    return <HeaderSkeleton searchQuery={searchQuery} onSearch={handleSearch} />;

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-800 bg-black px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-white" />
        </Button>
        <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllAsRead={markAllAsRead}
          onMarkAsRead={markAsRead}
        />
        <UserProfile user={user} onLogout={handleLogout} />
      </div>
    </header>
  );
};

const HeaderSkeleton = ({
  searchQuery,
  onSearch,
}: {
  searchQuery: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-800 bg-black px-6">
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5 text-white" />
      </Button>
      <SearchBar searchQuery={searchQuery} onSearch={onSearch} />
    </div>
    <div className="flex items-center gap-4">
      <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse" />
      <div className="hidden md:block">
        <div className="h-4 w-24 bg-gray-700 rounded animate-pulse mb-1" />
        <div className="h-3 w-16 bg-gray-700 rounded animate-pulse" />
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
  <div className="relative w-64 md:w-80">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    <Input
      type="search"
      placeholder="Search..."
      value={searchQuery}
      onChange={onSearch}
      className="w-full bg-gray-900 pl-10 text-white placeholder:text-gray-400 border-gray-700 focus:border-green-600"
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
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80 border-gray-700 bg-gray-900 text-white">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-green-400 hover:text-green-300"
            onClick={onMarkAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      <div className="mt-2 space-y-2 max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start rounded-md p-2 cursor-pointer transition-colors ${
                notification.read
                  ? "hover:bg-gray-800"
                  : "bg-green-900/20 hover:bg-green-900/30"
              }`}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-gray-400">{notification.time}</p>
              </div>
              {!notification.read && (
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
              )}
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-sm text-gray-400">
            No notifications
          </p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <Button
          variant="ghost"
          className="w-full text-sm text-gray-400 hover:text-white"
          onClick={() => console.log("View all notifications")}
        >
          View all notifications
        </Button>
      </div>
    </PopoverContent>
  </Popover>
);

const UserProfile = ({
  user,
  onLogout,
}: {
  user: UserInfo;
  onLogout: () => void;
}) => {
  const router = useRouter();

  const menuItems = [
    { label: "Profile", action: () => router.push("/profile") },
    { label: "Settings", action: () => router.push("/settings") },
    { label: "Billing", action: () => router.push("/billing") },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <Avatar className="h-8 w-8 border border-gray-700">
            <AvatarImage src={getAvatarUrl(user.name)} alt={user.name} />
            <AvatarFallback className="bg-green-600 text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-gray-400 capitalize">
              {user.role.toLowerCase()}
            </p>
          </div>
          <ChevronDown className="hidden md:block h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 border-gray-700 bg-gray-900 text-white"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-gray-400 capitalize">
              {user.role.toLowerCase()}
            </p>
            {user.email && (
              <p className="text-xs leading-none text-gray-400">{user.email}</p>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-700" />

        {menuItems.map((item) => (
          <DropdownMenuItem
            key={item.label}
            className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800"
            onClick={item.action}
          >
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-gray-700" />

        <DropdownMenuItem
          className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-900/20 focus:bg-red-900/20"
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
