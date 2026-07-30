import {
  LayoutDashboard,
  Smartphone,
  Map,
  ShieldCheck,
  Bell,
  ScrollText,
  Users,
  Building2,
  Settings,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "@/types";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

export const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/devices", label: "Dispositivos", icon: Smartphone },
  { to: "/map", label: "Mapa & Geofencing", icon: Map },
  { to: "/policies", label: "Políticas", icon: ShieldCheck },
  { to: "/alerts", label: "Alertas", icon: Bell },
  { to: "/logs", label: "Logs", icon: ScrollText, roles: ["ADMIN", "SUPERVISOR"] },
  { to: "/users", label: "Usuários", icon: Users, roles: ["ADMIN", "SUPERVISOR"] },
  { to: "/organization", label: "Departamentos & Tags", icon: Building2 },
  { to: "/settings", label: "Configurações", icon: Settings },
];
