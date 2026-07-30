import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { geofencesApi } from "@/api/geofences";
import { devicesApi } from "@/api/devices";
import type { GeofenceResponse } from "@/types";

export function GeofenceFormDialog({ geofence }: { geofence?: GeofenceResponse }) {
  const isEdit = !!geofence;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(geofence?.name ?? "");
  const [lat, setLat] = useState(String(geofence?.centerLatitude ?? "-15.793889"));
  const [lng, setLng] = useState(String(geofence?.centerLongitude ?? "-47.882778"));
  const [radius, setRadius] = useState(String(geofence?.radiusMeters ?? "500"));
  const [active, setActive] = useState(geofence?.active ?? true);
  const [selectedDevices, setSelectedDevices] = useState<string[]>(geofence?.deviceIds ?? []);

  const queryClient = useQueryClient();
  const { data: devicesPage } = useQuery({
    queryKey: ["devices-for-geofence"],
    queryFn: () => devicesApi.list({ size: 100 }),
    enabled: open,
  });

  useEffect(() => {
    if (!geofence) return;
    setName(geofence.name);
    setLat(String(geofence.centerLatitude));
    setLng(String(geofence.centerLongitude));
    setRadius(String(geofence.radiusMeters));
    setActive(geofence.active);
    setSelectedDevices(geofence.deviceIds);
  }, [geofence]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name,
        centerLatitude: Number(lat),
        centerLongitude: Number(lng),
        radiusMeters: Number(radius),
        active,
        deviceIds: selectedDevices,
      };
      return isEdit ? geofencesApi.update(geofence!.id, payload) : geofencesApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Geofence atualizada" : "Geofence criada");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["geofences"] });
    },
    onError: () => toast.error("Não foi possível salvar a geofence"),
  });

  function toggleDevice(id: string) {
    setSelectedDevices((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Nova geofence
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar geofence" : "Nova geofence"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="gf-name">Nome</Label>
            <Input id="gf-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="gf-lat">Latitude</Label>
              <Input id="gf-lat" value={lat} onChange={(e) => setLat(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gf-lng">Longitude</Label>
              <Input id="gf-lng" value={lng} onChange={(e) => setLng(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gf-radius">Raio (m)</Label>
              <Input id="gf-radius" value={radius} onChange={(e) => setRadius(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="gf-active" checked={active} onCheckedChange={(v) => setActive(!!v)} />
            <Label htmlFor="gf-active">Ativa</Label>
          </div>
          <div className="space-y-1.5">
            <Label>Dispositivos monitorados</Label>
            <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border border-border p-2">
              {devicesPage?.content.map((device) => (
                <div key={device.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`gf-device-${device.id}`}
                    checked={selectedDevices.includes(device.id)}
                    onCheckedChange={() => toggleDevice(device.id)}
                  />
                  <Label htmlFor={`gf-device-${device.id}`} className="font-normal">
                    {device.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => saveMutation.mutate()} disabled={!name || saveMutation.isPending}>
            {saveMutation.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
