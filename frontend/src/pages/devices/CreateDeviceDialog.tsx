import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { DeviceProvisionResponse } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Informe um nome"),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  androidVersion: z.string().optional(),
  imei: z.string().optional(),
  serialNumber: z.string().optional(),
  departmentId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CreateDeviceDialog() {
  const [open, setOpen] = useState(false);
  const [provisioned, setProvisioned] = useState<DeviceProvisionResponse | null>(null);
  const queryClient = useQueryClient();

  const { data: departments } = useQuery({ queryKey: ["departments"], queryFn: departmentsApi.list });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: (payload: FormValues) =>
      devicesApi.create({
        ...payload,
        departmentId: payload.departmentId || undefined,
      }),
    onSuccess: (data) => {
      setProvisioned(data);
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: () => toast.error("Não foi possível criar o dispositivo"),
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      reset();
      setProvisioned(null);
    }
  }

  function copyApiKey() {
    if (!provisioned) return;
    navigator.clipboard.writeText(provisioned.apiKey);
    toast.success("Chave copiada para a área de transferência");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Novo dispositivo
        </Button>
      </DialogTrigger>
      <DialogContent>
        {provisioned ? (
          <>
            <DialogHeader>
              <DialogTitle>Dispositivo provisionado</DialogTitle>
              <DialogDescription>
                Guarde esta chave agora — ela não poderá ser visualizada novamente. Use-a junto com o ID do
                dispositivo para provisionar o app Android (QR code).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 rounded-md bg-muted p-3 text-xs">
              <p><span className="font-medium">Device ID:</span> {provisioned.deviceId}</p>
              <p className="break-all"><span className="font-medium">API Key:</span> {provisioned.apiKey}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={copyApiKey}>
                <Copy className="mr-2 h-4 w-4" /> Copiar chave
              </Button>
              <Button onClick={() => handleOpenChange(false)}>Concluir</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Novo dispositivo</DialogTitle>
              <DialogDescription>Cadastre um dispositivo para gerenciamento</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-3"
              onSubmit={handleSubmit((values) => createMutation.mutate(values))}
            >
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="model">Modelo</Label>
                  <Input id="model" {...register("model")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="manufacturer">Fabricante</Label>
                  <Input id="manufacturer" {...register("manufacturer")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="imei">IMEI</Label>
                  <Input id="imei" {...register("imei")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="serialNumber">Número de série</Label>
                  <Input id="serialNumber" {...register("serialNumber")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Departamento</Label>
                <Select onValueChange={(value) => setValue("departmentId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando…" : "Criar dispositivo"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
