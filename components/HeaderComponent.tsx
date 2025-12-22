"use client";

import { useState } from "react";
import { Search, Bell, Menu, ChevronDown } from "lucide-react";
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

const HeaderComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New feedback received", time: "2 min ago", read: false },
    { id: 2, title: "System update available", time: "1 hour ago", read: false },
    { id: 3, title: "Weekly report ready", time: "3 hours ago", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Implement search logic here
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleNotificationClick = (id: number) => {
    markAsRead(id);
    // Navigate to notification or perform action
  };

  const user = {
    name: "John Doe",
    email: "john@feedo.com",
    role: "Administrator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John", // Placeholder avatar
    initials: "JD"
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-800 bg-black px-6">
      {/* Left Side: Mobile Menu Button & Search */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button (Hidden on desktop) */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-white" />
        </Button>

        {/* Search Bar */}
        <div className="relative w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-gray-900 pl-10 text-white placeholder:text-gray-400 border-gray-700 focus:border-green-600"
          />
        </div>
      </div>

      {/* Right Side: Notifications & User Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications Bell with Popover */}
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
                  onClick={markAllAsRead}
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
                    onClick={() => handleNotificationClick(notification.id)}
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

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8 border border-gray-700">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-green-600 text-white">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              
              {/* User info - hidden on mobile, shown on medium screens and up */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.role}</p>
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
                <p className="text-xs leading-none text-gray-400">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="bg-gray-700" />
            
            <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
              <span>Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
              <span>Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
              <span>Billing</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-gray-700" />
            
            <DropdownMenuItem 
              className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-900/20 focus:bg-red-900/20"
              onClick={() => console.log("Logout")}
            >
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default HeaderComponent;