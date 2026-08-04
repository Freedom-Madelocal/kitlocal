import { useEffect, useState, type ReactNode } from "react";
import { Plus, Bell, Moon, Sun, LogIn, LogOut } from "lucide-react";
import { type Seller } from "@/lib/mock-data";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import {
  useMadeLocalSession,
  signOutMadeLocal,
  displayNameFor,
} from "@/lib/madelocal-session";

type Props = {
  seller: Seller;
  mobileButton?: ReactNode;
};

export function Header({ seller, mobileButton }: Props) {
  const session = useMadeLocalSession();

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const dark = stored ? stored === "dark" : document.documentElement.classList.contains("dark");
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return (
    <header className="px-4 md:px-8 pt-5 md:pt-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {mobileButton}
          <div className="neu-card-sm min-w-0 flex items-center gap-3 px-3 py-2 md:px-4 md:py-2.5">
            <div className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold text-sm">
              {seller.initials}
            </div>
            <div className="min-w-0 text-left">
              <div className="text-sm font-semibold truncate">
                {displayNameFor(session.user) ?? seller.name}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {session.user ? "MadeLocal account" : seller.category}
              </div>
            </div>
          </div>
        </div>


        <div className="flex items-center gap-2 shrink-0">
          <button
            className="neu-pressable h-10 w-10 grid place-items-center"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            className="neu-pressable h-10 w-10 grid place-items-center"
            onClick={() => toast("No new alerts", { description: "You're all caught up." })}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            className="neu-pressable hidden sm:flex items-center gap-2 px-4 h-10 text-sm font-medium text-primary"
            onClick={() => toast.success("Quick action", { description: "New post drafted." })}
          >
            <Plus className="h-4 w-4" /> New post
          </button>
          {session.configured &&
            (session.user ? (
              <button
                className="neu-pressable flex items-center gap-2 px-3 h-10 text-sm font-medium"
                onClick={async () => {
                  await signOutMadeLocal();
                  toast.message("Signed out of MadeLocal");
                }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign out</span>
              </button>
            ) : (
              <Link
                to="/auth"
                className="neu-pressable flex items-center gap-2 px-3 h-10 text-sm font-semibold text-primary"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            ))}
        </div>

      </div>
    </header>
  );
}
