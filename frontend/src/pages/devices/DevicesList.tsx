import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Lock, Search, Smartphone, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { DeviceStatusBadge } from "@/components/shared/DeviceStatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { devicesApi } from "@/api/devices";
import { departmentsApi } from "@/api/org";
import type { DeviceStatus } from "@/types";
import { CreateDeviceDialog } from "./CreateDeviceDialog";

export default function DevicesList() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DeviceStatus | "ALL">("ALL");
  const [departmentId, setDepartmentId] = useState<string>("ALL");
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: departments } = useQuery({ queryKey: ["departments"], queryFn: departmentsApi.list });

  const { data, isLoading } = useQuery({
    queryKey: ["devices", { page, search, status, departmentId }],
    queryFn: () =>
      devicesApi.list({
        page,
        search: search || undefined,
        status: status === "ALL" ? undefined : status,
        departmentId: departmentId === "ALL" ? undefined : departmentId,
      }),
  });

  const lockMutation = useMutation({
    mutationFn: devicesApi.lock,
    onSuccess: () => {
      toast.success("Dispositivo bloqueado");
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: devicesApi.remove,
    onSuccess: () => {
      toast.success("Dispositivo removido");
      setDeviceToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });

  return (
    <div>
      <PageHeader
        title="Dispositivos"
        description="Inventário de dispositivos Android gerenciados"
        actions={<CreateDeviceDialog />}
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, modelo, IMEI, série…"
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v as DeviceStatus | "ALL"); setPage(0); }}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="ONLINE">Online</SelectItem>
              <SelectItem value="OFFLINE">Offline</SelectItem>
              <SelectItem value="PROVISIONING">Provisionando</SelectItem>
              <SelectItem value="BLOCKED">Bloqueado</SelectItem>
              <SelectItem value="RETIRED">Desativado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentId} onValueChange={(v) => { setDepartmentId(v); setPage(0); }}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os departamentos</SelectItem>
              {departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Carregando…</div>
          ) : !data || data.content.length === 0 ? (
            <EmptyState icon={Smartphone} title="Nenhum dispositivo encontrado" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última sinc.</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.content.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">
                        <Link to={`/devices/${device.id}`} className="hover:underline">
                          {device.name}
                        </Link>
                      </TableCell>
                      <TableCell>{device.model ?? "—"}</TableCell>
                      <TableCell>{device.department?.name ?? "—"}</TableCell>
                      <TableCell>
                        <DeviceStatusBadge status={device.status} />
                      </TableCell>
                      <TableCell>
                        {device.lastSyncAt ? new Date(device.lastSyncAt).toLocaleString("pt-BR") : "Nunca"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Bloquear"
                          onClick={() => lockMutation.mutate(device.id)}
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Remover"
                          onClick={() => setDeviceToDelete(device.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-4">
                <PaginationBar
                  page={data.page}
                  totalPages={data.totalPages}
                  totalElements={data.totalElements}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deviceToDelete}
        onOpenChange={(open) => !open && setDeviceToDelete(null)}
        title="Remover dispositivo"
        description="Esta ação não pode ser desfeita. Todo o histórico do dispositivo será removido."
        confirmLabel="Remover"
        loading={deleteMutation.isPending}
        onConfirm={() => deviceToDelete && deleteMutation.mutate(deviceToDelete)}
      />
    </div>
  );
}
