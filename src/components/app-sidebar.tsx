"use client";
import { Home, Search, User, Vote } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Profile",
    url: "Profile",
    icon: User,
  },
  {
    title: "Pollz",
    url: "pollz",
    icon: Vote,
  },
  {
    title: "Search",
    url: "search",
    icon: Search,
  },
];

export function AppSidebar() {
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear any stored auth data
      localStorage.removeItem("auth_redirect");

      // Redirect to auth page
      window.location.replace("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <div>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <div className="mt-auto">
                  <Button
                    onClick={handleLogout}
                    variant="default"
                    className="w-[40%]"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
