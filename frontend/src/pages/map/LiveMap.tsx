import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { toast } from "sonner";
import { LogIn, LogOut, MapPin, Trash2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { devicesApi } from "@/api/devices";
import { geofencesApi } from "@/api/geofences";
import { locationsApi } from "@/api/locations";
import { useStompTopic } from "@/hooks/use-stomp-topic";
import { markerIcon } from "@/lib/leaflet-icon";
import { computeStops, formatDuration } from "@/lib/stops";
import type { LocationHistoryResponse } from "@/types";
import { GeofenceFormDialog } from "./GeofenceFormDialog";

function toDateTimeLocalValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

const DEFAULT_CENTER: [number, number] = [-15.793889, -47.882778];

function MapFlyTo({ center, zoom = 15 }: { center: [number, number] | null; zoom?: number }) {
  const map = useMap();

  useEffect(() => {
    if (center && typeof center[0] === "number" && typeof center[1] === "number") {
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [center, zoom, map]);

  return null;
}

export default function LiveMap() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDeviceId = searchParams.get("deviceId") ?? "";
  const queryClient = useQueryClient();

  const [liveLocations, setLiveLocations] = useState<Record<string, LocationHistoryResponse>>({});

  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: devicesApi.dashboardSummary,
  });

  const { data: geofences } = useQuery({ queryKey: ["geofences"], queryFn: geofencesApi.list });

  const { data: devicesPage } = useQuery({
    queryKey: ["devices-for-map"],
    queryFn: () => devicesApi.list({ size: 100 }),
  });

  const [fromInput, setFromInput] = useState(() =>
    toDateTimeLocalValue(new Date(Date.now() - 24 * 60 * 60 * 1000)),
  );
  const [toInput, setToInput] = useState(() => toDateTimeLocalValue(new Date()));

  const from = useMemo(() => new Date(fromInput).toISOString(), [fromInput]);
  const to = useMemo(() => new Date(toInput).toISOString(), [toInput]);

  const { data: history } = useQuery({
    queryKey: ["device-history", selectedDeviceId, from, to],
    queryFn: () => locationsApi.history(selectedDeviceId, from, to, 0, 1000),
    enabled: !!selectedDeviceId,
  });

  const stops = useMemo(() => {
    if (!history?.content.length) return [];
    const chronological = [...history.content].reverse();
    return computeStops(chronological);
  }, [history]);

  const { data: events } = useQuery({
    queryKey: ["geofence-events", selectedDeviceId],
    queryFn: () => geofencesApi.events(selectedDeviceId, 0, 20),
    enabled: !!selectedDeviceId,
  });

  useEffect(() => {
    if (summary) {
      setLiveLocations(summary.recentLocationsByDevice);
    }
  }, [summary]);

  useStompTopic<LocationHistoryResponse>("/topic/locations", (location) => {
    setLiveLocations((prev) => ({ ...prev, [location.deviceId]: location }));
  });

  const deleteGeofenceMutation = useMutation({
    mutationFn: geofencesApi.remove,
    onSuccess: () => {
      toast.success("Geofence removida");
      queryClient.invalidateQueries({ queryKey: ["geofences"] });
    },
  });

  const locations = Object.values(liveLocations);
  const trajectory = history?.content.map((loc) => [loc.latitude, loc.longitude] as [number, number]) ?? [];

  const targetCenter = useMemo<[number, number] | null>(() => {
    if (!selectedDeviceId) return null;

    const live = liveLocations[selectedDeviceId];
    if (live && typeof live.latitude === "number" && typeof live.longitude === "number") {
      return [live.latitude, live.longitude];
    }

    if (trajectory.length > 0) {
      return trajectory[0];
    }

    return DEFAULT_CENTER;
  }, [selectedDeviceId, liveLocations, trajectory]);

  return (
    <div>
      <PageHeader title="Mapa & Geofencing" description="Localização em tempo real e áreas monitoradas" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="h-[560px] p-0">
            <MapContainer center={DEFAULT_CENTER} zoom={11} className="h-full w-full rounded-lg">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapFlyTo center={targetCenter} zoom={15} />
              {locations.map((loc) => (
                <Marker key={loc.deviceId} position={[loc.latitude, loc.longitude]} icon={markerIcon}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{loc.deviceName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(loc.capturedAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {geofences?.map((geofence) => (
                <Circle
                  key={geofence.id}
                  center={[geofence.centerLatitude, geofence.centerLongitude]}
                  radius={geofence.radiusMeters}
                  pathOptions={{
                    color: geofence.active ? "#2563eb" : "#9ca3af",
                    fillOpacity: 0.1,
                  }}
                />
              ))}
              {trajectory.length > 1 && <Polyline positions={trajectory} pathOptions={{ color: "#2563eb" }} />}
              {stops.map((stop, index) => (
                <CircleMarker
                  key={`${stop.startedAt}-${index}`}
                  center={[stop.latitude, stop.longitude]}
                  radius={8}
                  pathOptions={{ color: "#dc2626", fillColor: "#f87171", fillOpacity: 0.7 }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">Parado por {formatDuration(stop.durationMs)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(stop.startedAt).toLocaleString("pt-BR")} até{" "}
                        {new Date(stop.endedAt).toLocaleString("pt-BR")}
                      </p>
                      <a
                        className="text-xs text-primary underline"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://www.google.com/maps?q=${stop.latitude},${stop.longitude}`}
                      >
                        Abrir no Google Maps
                      </a>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico do dispositivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={selectedDeviceId || "NONE"}
                onValueChange={(v) => setSearchParams(v === "NONE" ? {} : { deviceId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um dispositivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Nenhum</SelectItem>
                  {devicesPage?.content.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedDeviceId && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">De</Label>
                    <Input
                      type="datetime-local"
                      value={fromInput}
                      onChange={(e) => setFromInput(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Até</Label>
                    <Input
                      type="datetime-local"
                      value={toInput}
                      onChange={(e) => setToInput(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}

              {selectedDeviceId && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {history?.content.length ?? 0} pontos no período selecionado
                  </p>
                  <p className="text-xs font-medium">Eventos de geofence</p>
                  {!events || events.content.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhum evento registrado</p>
                  ) : (
                    <ul className="max-h-40 space-y-1.5 overflow-y-auto text-xs">
                      {events.content.map((event) => (
                        <li key={event.id} className="flex items-center gap-2">
                          {event.type === "ENTER" ? (
                            <LogIn className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <LogOut className="h-3.5 w-3.5 text-warning" />
                          )}
                          <span>
                            {event.geofenceName} · {new Date(event.occurredAt).toLocaleString("pt-BR")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedDeviceId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Paradas (10+ min no mesmo lugar)</CardTitle>
              </CardHeader>
              <CardContent>
                {stops.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Nenhuma parada longa detectada no período selecionado
                  </p>
                ) : (
                  <ul className="max-h-64 space-y-2 overflow-y-auto text-xs">
                    {stops.map((stop, index) => (
                      <li key={`${stop.startedAt}-${index}`} className="rounded-md border border-border p-2">
                        <p className="font-medium">{formatDuration(stop.durationMs)}</p>
                        <p className="text-muted-foreground">
                          {new Date(stop.startedAt).toLocaleString("pt-BR")} até{" "}
                          {new Date(stop.endedAt).toLocaleString("pt-BR")}
                        </p>
                        <a
                          className="text-primary underline"
                          target="_blank"
                          rel="noreferrer"
                          href={`https://www.google.com/maps?q=${stop.latitude},${stop.longitude}`}
                        >
                          Abrir no Google Maps
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Geofences</CardTitle>
              <GeofenceFormDialog />
            </CardHeader>
            <CardContent>
              {!geofences || geofences.length === 0 ? (
                <EmptyState icon={MapPin} title="Nenhuma geofence cadastrada" />
              ) : (
                <ul className="space-y-2">
                  {geofences.map((geofence) => (
                    <li
                      key={geofence.id}
                      className="flex items-center justify-between rounded-md border border-border p-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{geofence.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {geofence.radiusMeters}m · {geofence.deviceIds.length} dispositivo(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <GeofenceFormDialog geofence={geofence} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGeofenceMutation.mutate(geofence.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
