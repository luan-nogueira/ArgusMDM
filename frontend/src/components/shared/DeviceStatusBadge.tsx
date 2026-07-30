import { Badge } from "@/components/ui/badge";
import type { DeviceStatus } from "@/types";

const CONFIG: Record<DeviceStatus, { label: string; variant: "success" | "secondary" | "warning" | "destructive" | "outline" }> = {
  ONLINE: { label: "Online", variant: "success" },
  OFFLINE: { label: "Offline", variant: "secondary" },
  PROVISIONING: { label: "Provisionando", variant: "warning" },
  BLOCKED: { label: "Bloqueado", variant: "destructive" },
  RETIRED: { label: "Desativado", variant: "outline" },
};

export function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const config = CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
