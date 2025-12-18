"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  HelpCircle,
  AlertTriangle,
  Newspaper,
  BookOpen,
  Upload,
  FileText,
  Trophy,
  GraduationCap,
  Video,
  ChevronDown,
  ChevronRight,
  Users,
  Home,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { 
    name: "Home", 
    href: "#", 
    icon: Home,
    children: [
      { name: "News & Events", href: "/dashboard/news-events", icon: Newspaper },
      { name: "Announcements", href: "/dashboard/public-notices", icon: FileText },
    ]
  },
  { 
    name: "Content Management", 
    href: "#", 
    icon: Upload,
    children: [
      { name: "Banner Management", href: "/dashboard/banners", icon: Upload },
      { name: "Blogs", href: "/dashboard/blogs", icon: BookOpen },
    ]
  },
  { 
    name: "Courses", 
    href: "#", 
    icon: BookOpen,
    children: [
      { name: "Medical Courses", href: "/dashboard/courses?category=Medical Courses", icon: BookOpen },
      { name: "Engineering Courses", href: "/dashboard/courses?category=Engineering Courses", icon: BookOpen },
    ]
  },
  { 
    name: "Student Zone", 
    href: "#", 
    icon: Users,
    children: [
      { name: "Complaints & Feedback", href: "/dashboard/complaint-feedback", icon: AlertTriangle },
      { name: "AITS Video Solutions", href: "/dashboard/aits-video-solutions", icon: Video },
      { name: "GVET Answer Keys", href: "/dashboard/gvet-answer-keys", icon: FileText },
    ]
  },
  { 
    name: "Results", 
    href: "#", 
    icon: Trophy,
    children: [
      { name: "GAET Results", href: "/dashboard/gaet-results", icon: GraduationCap },
      { name: "Upcoming GAET Dates", href: "/dashboard/gaet-dates", icon: Calendar },
    ]
  },
  { name: "Enquiry Forms", href: "/dashboard/enquiry", icon: HelpCircle },
  { name: "Admission Forms", href: "/dashboard/admission-forms", icon: GraduationCap },
  { name: "Chatbot Insights", href: "/dashboard/chatbot-insights", icon: MessageSquare },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Only allow limited menu items for event publisher role
  const filteredNavigation: NavigationItem[] = navigation.filter((item) => {
    if (!user) return false;

    if (user.role === 'event_publisher') {
      // Event publisher: dashboard + home (news & events, announcements)
      return item.name === 'Dashboard' || item.name === 'Home';
    }

    // Admin or other roles: full navigation
    return true;
  });

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuName)) {
        newSet.delete(menuName);
      } else {
        newSet.add(menuName);
      }
      return newSet;
    });
  };

  const isMenuActive = (item: NavigationItem) => {
    if (item.href && pathname === item.href && item.href !== "#") return true;
    if (item.children) {
      return item.children.some((child: any) => {
        if (pathname === child.href) return true;
        if (child.children) {
          return child.children.some((grandchild: any) => {
            if (pathname === grandchild.href) return true;
            // Handle query parameters
            if (grandchild.href.includes("?") && pathname.startsWith(grandchild.href.split("?")[0])) {
              return true;
            }
            return false;
          });
        }
        return false;
      });
    }
    return false;
  };

  // Auto-expand menu if current pathname matches a child route
  useEffect(() => {
    navigation.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child: any) => {
          if (pathname === child.href) return true;
          if (child.children) {
            return child.children.some((grandchild: any) => pathname === grandchild.href);
          }
          return false;
        });
        if (hasActiveChild) {
          setExpandedMenus((prev) => {
            const newSet = new Set(prev);
            newSet.add(item.name);
            // Also expand the parent if it has nested children
            if (item.children) {
              item.children.forEach((child) => {
                if (child.children) {
                  const hasActiveGrandchild = child.children.some((grandchild: any) => pathname === grandchild.href);
                  if (hasActiveGrandchild) {
                    newSet.add(child.name);
                  }
                }
              });
            }
            return newSet;
          });
        }
      }
    });
  }, [pathname]);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 sidebar-container",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Goal Institute</h1>
          </div>

              {/* Navigation */}
          <nav className="flex-1 px-4 py-3 space-y-2 overflow-y-auto overflow-x-hidden sidebar-nav">
            {filteredNavigation.map((item) => {
              const isActive = isMenuActive(item);
              const isExpanded = expandedMenus.has(item.name);
              const hasChildren = item.children && item.children.length > 0;

              return (
                <div key={item.name}>
                  {hasChildren ? (
                    <>
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          className={cn(
                            "flex-1 flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                            isActive
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleMenu(item.name);
                          }}
                          className={cn(
                            "flex items-center justify-center w-6 h-8 text-sm font-medium rounded-md transition-colors",
                            isActive
                              ? "text-blue-700 hover:bg-blue-200"
                              : "text-gray-600 hover:bg-gray-100"
                          )}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                          )}
                        </button>
                      </div>
                      {isExpanded && item.children && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.children.map((child: any) => {
                            const isChildActive = isMenuActive(child);
                            const hasGrandchildren = child.children && child.children.length > 0;
                            const isChildExpanded = expandedMenus.has(child.name);

                            if (hasGrandchildren) {
                              return (
                                <div key={child.name}>
                                  <div className="flex items-center">
                                    <Link
                                      href={child.href}
                                      className={cn(
                                        "flex-1 flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                                        isChildActive
                                          ? "bg-blue-100 text-blue-700"
                                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                      )}
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      <child.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                      <span className="truncate">{child.name}</span>
                                    </Link>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        toggleMenu(child.name);
                                      }}
                                      className={cn(
                                        "flex items-center justify-center w-6 h-8 text-sm font-medium rounded-md transition-colors",
                                        isChildActive
                                          ? "text-blue-700 hover:bg-blue-200"
                                          : "text-gray-600 hover:bg-gray-100"
                                      )}
                                    >
                                      {isChildExpanded ? (
                                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                      )}
                                    </button>
                                  </div>
                                  {isChildExpanded && (
                                    <div className="ml-4 mt-1 space-y-1">
                                      {child.children.map((grandchild: any) => {
                                        const isGrandchildActive = pathname === grandchild.href || 
                                          (grandchild.href.includes("?") && pathname.startsWith(grandchild.href.split("?")[0]));
                                        return (
                                          <Link
                                            key={grandchild.name}
                                            href={grandchild.href}
                                            className={cn(
                                              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                                              isGrandchildActive
                                                ? "bg-blue-100 text-blue-700"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                            )}
                                            onClick={() => setMobileMenuOpen(false)}
                                          >
                                            <grandchild.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                            <span className="truncate">{grandchild.name}</span>
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            } else {
                              return (
                                <Link
                                  key={child.name}
                                  href={child.href}
                                  className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                                    isChildActive
                                      ? "bg-blue-100 text-blue-700"
                                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                  )}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  <child.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                  <span className="truncate">{child.name}</span>
                                </Link>
                              );
                            }
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3 min-w-0">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
