import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Battery, Cpu, HardDrive, KeyRound, MapPin, Wifi } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { DeviceStatusBadge } from "@/components/shared/DeviceStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { devicesApi } from "@/api/devices";
import { locationsApi } from "@/api/locations";
import { inventoryApi } from "@/api/inventory";
import { policiesApi } from "@/api/policies";
import { EditDeviceDialog } from "./EditDeviceDialog";

function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "—";
  const gb = bytes / 1024 ** 3;
  return `${gb.toFixed(1)} GB`;
}

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: device, isLoading } = useQuery({
    queryKey: ["device", id],
    queryFn: () => devicesApi.get(id!),
    enabled: !!id,
  });

  const { data: latestLocation } = useQuery({
    queryKey: ["device-latest-location", id],
    queryFn: () => locationsApi.latest(id!),
    enabled: !!id,
  });

  const { data: apps } = useQuery({
    queryKey: ["device-apps", id],
    queryFn: () => inventoryApi.apps(id!),
    enabled: !!id,
  });

  const { data: metrics } = useQuery({
    queryKey: ["device-metrics", id],
    queryFn: () => inventoryApi.latestMetrics(id!),
    enabled: !!id,
  });

  const { data: effectivePolicy } = useQuery({
    queryKey: ["device-policy", id],
    queryFn: () => policiesApi.effectiveForDevice(id!),
    enabled: !!id,
  });

  const regenerateKeyMutation = useMutation({
    mutationFn: () => devicesApi.regenerateApiKey(id!),
    onSuccess: (data) => {
      toast.success(`Nova chave gerada: ${data.apiKey}`, { duration: 15000 });
      queryClient.invalidateQueries({ queryKey: ["device", id] });
    },
  });

  if (isLoading || !device) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando…</div>;
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => navigate("/devices")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <PageHeader
        title={device.name}
        description={[device.manufacturer, device.model].filter(Boolean).join(" · ") || "Sem detalhes de modelo"}
        actions={
          <>
            <DeviceStatusBadge status={device.status} />
            <EditDeviceDialog device={device} />
            <Button variant="outline" onClick={() => regenerateKeyMutation.mutate()}>
              <KeyRound className="mr-2 h-4 w-4" /> Regenerar chave
            </Button>
          </>
        }
      />

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="location">Localização</TabsTrigger>
          <TabsTrigger value="inventory">Inventário</TabsTrigger>
          <TabsTrigger value="policy">Política</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Identificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="IMEI" value={device.imei ?? "—"} />
                <Row label="Número de série" value={device.serialNumber ?? "—"} />
                <Row label="Versão Android" value={device.androidVersion ?? "—"} />
                <Row label="Departamento" value={device.department?.name ?? "—"} />
                <Row label="Responsável" value={device.responsibleUser?.name ?? "—"} />
                <Row
                  label="Última sincronização"
                  value={device.lastSyncAt ? new Date(device.lastSyncAt).toLocaleString("pt-BR") : "Nunca"}
                />
                <Row label="Device Owner ativo" value={device.deviceOwnerActive ? "Sim" : "Não"} />
                <div className="flex flex-wrap gap-1 pt-1">
                  {device.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estado atual</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <MetricTile icon={Battery} label="Bateria" value={metrics?.batteryLevel != null ? `${metrics.batteryLevel}%` : "—"} />
                <MetricTile icon={Cpu} label="CPU" value={metrics?.cpuUsagePercent != null ? `${metrics.cpuUsagePercent.toFixed(0)}%` : "—"} />
                <MetricTile icon={HardDrive} label="Armazenamento" value={`${formatBytes(metrics?.storageUsedBytes)} / ${formatBytes(metrics?.storageTotalBytes)}`} />
                <MetricTile icon={Wifi} label="Wi-Fi" value={metrics?.wifiConnected ? (metrics.wifiSsid ?? "Conectado") : "Desconectado"} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Última localização conhecida</CardTitle>
            </CardHeader>
            <CardContent>
              {!latestLocation ? (
                <EmptyState icon={MapPin} title="Sem localização registrada" />
              ) : (
                <div className="space-y-2 text-sm">
                  <Row label="Latitude" value={latestLocation.latitude.toFixed(6)} />
                  <Row label="Longitude" value={latestLocation.longitude.toFixed(6)} />
                  <Row label="Precisão" value={latestLocation.accuracy ? `${latestLocation.accuracy.toFixed(0)} m` : "—"} />
                  <Row label="Capturado em" value={new Date(latestLocation.capturedAt).toLocaleString("pt-BR")} />
                  <Button variant="link" className="px-0" asChild>
                    <Link to={`/map?deviceId=${device.id}`}>Ver no mapa e histórico completo →</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aplicativos instalados</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!apps || apps.length === 0 ? (
                <EmptyState icon={HardDrive} title="Nenhum aplicativo sincronizado ainda" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aplicativo</TableHead>
                      <TableHead>Pacote</TableHead>
                      <TableHead>Versão</TableHead>
                      <TableHead>Tamanho</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apps.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.appName ?? app.packageName}</TableCell>
                        <TableCell className="text-muted-foreground">{app.packageName}</TableCell>
                        <TableCell>{app.versionName ?? "—"}</TableCell>
                        <TableCell>{formatBytes(app.sizeBytes)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Política efetiva</CardTitle>
            </CardHeader>
            <CardContent>
              {!effectivePolicy ? (
                <EmptyState icon={KeyRound} title="Nenhuma política atribuída a este dispositivo" />
              ) : (
                <div className="space-y-2 text-sm">
                  <Row label="Nome" value={effectivePolicy.name} />
                  <Row label="Senha obrigatória" value={effectivePolicy.passwordRequired ? "Sim" : "Não"} />
                  <Row label="Tamanho mínimo da senha" value={String(effectivePolicy.minPasswordLength)} />
                  <Row label="Câmera desabilitada" value={effectivePolicy.cameraDisabled ? "Sim" : "Não"} />
                  <Row label="Instalação de apps bloqueada" value={effectivePolicy.installAppsDisabled ? "Sim" : "Não"} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Battery;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="font-medium">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
