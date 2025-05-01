"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, Car, Cog, Home, LogOut, Package, PenToolIcon as Tool, User, Wrench, FileText } from "lucide-react"

import { Logo } from "@/components/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { signOut } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"

export function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true
    }
    if (path !== "/dashboard" && pathname.startsWith(path)) {
      return true
    }
    return false
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center py-4">
        <Logo size="md" />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard" passHref legacyBehavior>
              <SidebarMenuButton isActive={isActive("/dashboard")} tooltip="Dashboard">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/dashboard/projects" passHref legacyBehavior>
              <SidebarMenuButton isActive={isActive("/dashboard/projects")} tooltip="Projects">
                <Car className="h-5 w-5" />
                <span>Projects</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/dashboard/tasks" passHref legacyBehavior>
              <SidebarMenuButton isActive={isActive("/dashboard/tasks")} tooltip="Tasks">
                <Tool className="h-5 w-5" />
                <span>Tasks</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/dashboard/reports" passHref legacyBehavior>
              <SidebarMenuButton isActive={isActive("/dashboard/reports")} tooltip="Reports">
                <BarChart2 className="h-5 w-5" />
                <span>Reports</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/dashboard/parts" passHref legacyBehavior>
              <SidebarMenuButton isActive={isActive("/dashboard/parts")} tooltip="Parts">
                <Package className="h-5 w-5" />
                <span>Parts</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/dashboard/maintenance" passHref legacyBehavior>
              <SidebarMenuButton isActive={isActive("/dashboard/maintenance")} tooltip="Maintenance">
                <Wrench className="h-5 w-5" />
                <span>Maintenance</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/dashboard/expenses" passHref legacyBehavior>
              <SidebarMenuButton isActive={isActive("/dashboard/expenses")} tooltip="Expenses">
                <FileText className="h-5 w-5" />
                <span>Expenses</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard/profile" passHref legacyBehavior>
              <SidebarMenuButton isActive={isActive("/dashboard/profile")} tooltip="Profile">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/dashboard/settings" passHref legacyBehavior>
              <SidebarMenuButton isActive={isActive("/dashboard/settings")} tooltip="Settings">
                <Cog className="h-5 w-5" />
                <span>Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarSeparator />
          <SidebarMenuItem>
            <form action={signOut} className="w-full">
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start px-2 hover:bg-muted hover:text-foreground"
              >
                <LogOut className="mr-2 h-5 w-5" />
                <span>Sign Out</span>
              </Button>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
