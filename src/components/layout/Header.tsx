import { useEffect, useState, type ReactNode } from "react";
import { ChevronsUpDown, Plus, Bell, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sellers, type Seller } from "@/lib/mock-data";
import { toast } from "sonner";

type Props = {
  seller: Seller;
  onSellerChange: (s: Seller) => void;
  mobileButton?: ReactNode;
};

export function Header({ seller, onSellerChange, mobileButton }: Props) {
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="neu-pressable min-w-0 flex items-center gap-3 px-3 py-2 md:px-4 md:py-2.5">
                <div className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold text-sm">
                  {seller.initials}
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-sm font-semibold truncate">{seller.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{seller.category}</div>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Switch seller profile</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sellers.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={() => onSellerChange(s)}
                  className="gap-3"
                >
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">
                    {s.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{s.handle}</div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
        </div>
      </div>
    </header>
  );
}
