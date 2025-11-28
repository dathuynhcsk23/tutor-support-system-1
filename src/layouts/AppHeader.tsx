import { NavLink } from "react-router-dom";
import { LogOut, Menu, Moon, Palette, Sun, User } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useTheme, AVAILABLE_THEMES } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Logo from "@/components/Logo";

/**
 * Navigation items for each role
 */
const NAV_ITEMS: Record<Role, { label: string; to: string }[]> = {
  student: [
    { label: "Dashboard", to: "/student" },
    { label: "Find a Tutor", to: "/student/find" },
    { label: "Auto-match", to: "/student/auto-match" },
    { label: "My Schedule", to: "/student/schedule" },
    { label: "Library", to: "/student/library" },
    { label: "Profile", to: "/student/profile" },
  ],
  tutor: [
    { label: "Dashboard", to: "/tutor" },
    { label: "My Schedule", to: "/tutor/schedule" },
    { label: "Availability", to: "/tutor/availability" },
    { label: "Library", to: "/tutor/library" },
    { label: "Profile", to: "/tutor/profile" },
  ],
};

/**
 * Main application header with navigation
 */
export default function AppHeader() {
  const { user, activeRole, switchRole, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = activeRole ? NAV_ITEMS[activeRole] : [];
  const canSwitchRole = (user?.roles.length ?? 0) > 1;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Logo to={activeRole ? `/${activeRole}` : "/"} />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === `/${activeRole}`}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop User Menu */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
          <UserMenu
            canSwitchRole={canSwitchRole}
            onSwitchRole={switchRole}
            onSignOut={signOut}
          />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <MobileNav
            navItems={navItems}
            canSwitchRole={canSwitchRole}
            onSwitchRole={switchRole}
            onSignOut={signOut}
          />
        </div>
      </div>
    </header>
  );
}

// ============================================
// User Menu Component
// ============================================

interface UserMenuProps {
  canSwitchRole: boolean;
  onSwitchRole: () => void;
  onSignOut: () => void;
}

function UserMenu({ canSwitchRole, onSwitchRole, onSignOut }: UserMenuProps) {
  const { user, activeRole } = useAuth();
  const { customTheme, setCustomTheme } = useTheme();

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const currentThemeLabel =
    AVAILABLE_THEMES.find((t) => t.value === customTheme)?.label || "Default";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium lg:inline">
            {user.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user.name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {activeRole}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>Theme: {currentThemeLabel}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-[400px] overflow-y-auto">
            {AVAILABLE_THEMES.map((themeOption) => (
              <DropdownMenuItem
                key={themeOption.value}
                onClick={() => setCustomTheme(themeOption.value)}
                className={cn(customTheme === themeOption.value && "bg-accent")}
              >
                {themeOption.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        {canSwitchRole && (
          <DropdownMenuItem onClick={onSwitchRole}>
            <User className="mr-2 h-4 w-4" />
            Switch Role
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================
// Mobile Navigation Component
// ============================================

interface MobileNavProps {
  navItems: { label: string; to: string }[];
  canSwitchRole: boolean;
  onSwitchRole: () => void;
  onSignOut: () => void;
}

function MobileNav({
  navItems,
  canSwitchRole,
  onSwitchRole,
  onSignOut,
}: MobileNavProps) {
  const { user, activeRole } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === `/${activeRole}`}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="my-4 border-t" />
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            Toggle Theme
          </button>
          {canSwitchRole && (
            <button
              onClick={onSwitchRole}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <User className="h-4 w-4" />
              Switch Role
            </button>
          )}
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          {user && (
            <div className="mt-4 border-t pt-4 text-xs text-muted-foreground">
              Signed in as {user.name}
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
