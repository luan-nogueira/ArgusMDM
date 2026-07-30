import { NavLink } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { navItems } from "./nav-items";

export function Sidebar() {
  const { hasRole } = useAuth();

  const visibleItems = navItems.filter((item) => !item.roles || hasRole(...item.roles));

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold tracking-wide">Argus MDM</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3 text-xs text-sidebar-foreground/60">
        Dispositivo gerenciado sob autorização do proprietário.
      </div>
    </aside>
  );
}
