"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Search, Bell, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { mockUser } from "@/lib/mock-data"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  // Use mock user data for display
  const displayUser = {
    name: mockUser.name,
    email: mockUser.email,
    role: mockUser.role,
    company: mockUser.company,
    avatar: mockUser.avatar
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "grid" },
    { name: "Meetings", href: "/meetings", icon: "video" },
    { name: "Action Items", href: "/action-items", icon: "check-square" },
    { name: "Analytics", href: "/analytics", icon: "bar-chart" },
    { name: "Settings", href: "/settings", icon: "settings" },
  ]

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-green-500 font-bold text-xl">Veritas AI</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-md group transition-colors"
                >
                  <span className="text-gray-400 group-hover:text-green-500">{getIcon(item.icon)}</span>
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold">
              {displayUser.avatar}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{displayUser.name}</p>
              <p className="text-xs text-gray-400 truncate">{displayUser.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-200 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 z-50 md:hidden transition-transform duration-200 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-green-500 font-bold text-xl">Veritas AI</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-md group transition-colors"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="text-gray-400 group-hover:text-green-500">{getIcon(item.icon)}</span>
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold">
              {displayUser.avatar}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{displayUser.name}</p>
              <p className="text-xs text-gray-400 truncate">{displayUser.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 md:hidden">
                <Menu size={24} />
              </button>
              <div className="relative ml-4 md:ml-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 w-full md:w-64 bg-gray-800 border-gray-700 focus:border-green-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white">
                <Bell size={20} />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold">
                      {displayUser.avatar}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold">
                      {displayUser.avatar}
                    </div>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm text-white">{displayUser.name}</p>
                      <p className="text-xs text-gray-400">{displayUser.role}</p>
                      <p className="text-xs text-gray-500">{displayUser.company}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help" className="cursor-pointer">
                      Help
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-black p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

function getIcon(name: string) {
  switch (name) {
    case "grid":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    case "video":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 8.5V15.5C22 16.3 21.3 17 20.5 17H3.5C2.7 17 2 16.3 2 15.5V8.5C2 7.7 2.7 7 3.5 7H20.5C21.3 7 22 7.7 22 8.5Z" />
          <path d="M12 7V17" />
          <path d="M2 12H22" />
        </svg>
      )
    case "check-square":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      )
    case "bar-chart":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="18" y1="20" x2="18" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
        </svg>
      )
    case "settings":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    default:
      return null
  }
}
