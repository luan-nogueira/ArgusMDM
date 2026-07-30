import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { devicesApi } from "@/api/devices";
import { departmentsApi } from "@/api/org";
import type { DeviceResponse, DeviceStatus } from "@/types";

const STATUS_OPTIONS: DeviceStatus[] = ["ONLINE", "OFFLINE", "PROVISIONING", "BLOCKED", "RETIRED"];

export function EditDeviceDialog({ device }: { device: DeviceResponse }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(device.name);
  const [model, setModel] = useState(device.model ?? "");
  const [manufacturer, setManufacturer] = useState(device.manufacturer ?? "");
  const [status, setStatus] = useState<DeviceStatus>(device.status);
  const [departmentId, setDepartmentId] = useState(device.department?.id ?? "NONE");

  const queryClient = useQueryClient();
  const { data: departments } = useQuery({ queryKey: ["departments"], queryFn: departmentsApi.list });

  useEffect(() => {
    setName(device.name);
    setModel(device.model ?? "");
    setManufacturer(device.manufacturer ?? "");
    setStatus(device.status);
    setDepartmentId(device.department?.id ?? "NONE");
  }, [device]);

  const updateMutation = useMutation({
    mutationFn: () =>
      devicesApi.update(device.id, {
        name,
        model: model || undefined,
        manufacturer: manufacturer || undefined,
        status,
        departmentId: departmentId === "NONE" ? undefined : departmentId,
        tagIds: device.tags.map((t) => t.id),
      }),
    onSuccess: () => {
      toast.success("Dispositivo atualizado");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["device", device.id] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: () => toast.error("Não foi possível atualizar o dispositivo"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="mr-2 h-4 w-4" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar dispositivo</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Nome</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-model">Modelo</Label>
              <Input id="edit-model" value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-manufacturer">Fabricante</Label>
              <Input
                id="edit-manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as DeviceStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Departamento</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Nenhum</SelectItem>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Salvando…" : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
