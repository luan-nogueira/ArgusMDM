import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Smartphone, Wifi, WifiOff, BatteryLow, Bell } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { devicesApi } from "@/api/devices";
import { useStompTopic } from "@/hooks/use-stomp-topic";
import type { AlertResponse, LocationHistoryResponse } from "@/types";
import "leaflet/dist/leaflet.css";
import { markerIcon } from "@/lib/leaflet-icon";

const ALERT_LABEL: Record<string, string> = {
  DEVICE_OFFLINE: "Dispositivo offline",
  LOW_BATTERY: "Bateria baixa",
  SYNC_FAILURE: "Falha de sincronização",
  GEOFENCE_BREACH: "Geofence",
  POLICY_VIOLATION: "Violação de política",
};

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: devicesApi.dashboardSummary,
    refetchInterval: 30_000,
  });

  useStompTopic<AlertResponse>("/topic/alerts", () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  });

  useStompTopic<LocationHistoryResponse>("/topic/locations", () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  });

  const chartData = summary
    ? [
        { name: "Online", total: summary.onlineDevices, fill: "hsl(var(--success))" },
        { name: "Offline", total: summary.offlineDevices, fill: "hsl(var(--muted-foreground))" },
        {
          name: "Outros",
          total: Math.max(summary.totalDevices - summary.onlineDevices - summary.offlineDevices, 0),
          fill: "hsl(var(--warning))",
        },
      ]
    : [];

  const locations = summary ? Object.values(summary.recentLocationsByDevice) : [];
  const mapCenter: [number, number] = locations.length
    ? [locations[0].latitude, locations[0].longitude]
    : [-15.793889, -47.882778];

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral da frota de dispositivos" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Dispositivos" value={summary?.totalDevices ?? (isLoading ? "…" : 0)} icon={Smartphone} />
        <StatCard label="Online" value={summary?.onlineDevices ?? 0} icon={Wifi} tone="success" />
        <StatCard label="Offline" value={summary?.offlineDevices ?? 0} icon={WifiOff} tone="warning" />
        <StatCard
          label="Bateria baixa"
          value={summary?.lowBatteryDevices ?? 0}
          icon={BatteryLow}
          tone="destructive"
        />
        <StatCard label="Alertas não lidos" value={summary?.unreadAlerts ?? 0} icon={Bell} tone="destructive" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Status da frota</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Localizações recentes</CardTitle>
          </CardHeader>
          <CardContent className="h-64 p-0">
            {locations.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nenhuma localização recente
              </div>
            ) : (
              <MapContainer center={mapCenter} zoom={11} className="h-full w-full rounded-b-lg">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locations.map((loc) => (
                  <Marker key={loc.deviceId} position={[loc.latitude, loc.longitude]} icon={markerIcon}>
                    <Popup>{loc.deviceName}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Alertas recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {!summary || summary.recentAlerts.length === 0 ? (
            <EmptyState icon={Bell} title="Nenhum alerta recente" />
          ) : (
            <ul className="divide-y divide-border">
              {summary.recentAlerts.map((alert) => (
                <li key={alert.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{ALERT_LABEL[alert.type] ?? alert.type}</Badge>
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: ptBR })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
