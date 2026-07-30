import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Check } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { alertsApi } from "@/api/alerts";
import { useStompTopic } from "@/hooks/use-stomp-topic";
import type { AlertResponse } from "@/types";

const ALERT_LABEL: Record<string, string> = {
  DEVICE_OFFLINE: "Dispositivo offline",
  LOW_BATTERY: "Bateria baixa",
  SYNC_FAILURE: "Falha de sincronização",
  GEOFENCE_BREACH: "Geofence",
  POLICY_VIOLATION: "Violação de política",
};

export default function Alerts() {
  const [page, setPage] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["alerts", page, unreadOnly],
    queryFn: () => alertsApi.list(unreadOnly, page),
  });

  useStompTopic<AlertResponse>("/topic/alerts", () => {
    queryClient.invalidateQueries({ queryKey: ["alerts"] });
  });

  const markReadMutation = useMutation({
    mutationFn: alertsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  return (
    <div>
      <PageHeader title="Alertas" description="Eventos que exigem atenção" />

      <div className="mb-4 flex items-center gap-2">
        <Switch id="unread-only" checked={unreadOnly} onCheckedChange={(v) => { setUnreadOnly(v); setPage(0); }} />
        <Label htmlFor="unread-only" className="font-normal">Mostrar apenas não lidos</Label>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Carregando…</div>
          ) : !data || data.content.length === 0 ? (
            <EmptyState icon={Bell} title="Nenhum alerta encontrado" />
          ) : (
            <>
              <ul className="divide-y divide-border">
                {data.content.map((alert) => (
                  <li key={alert.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-start gap-3">
                      <Badge variant={alert.read ? "outline" : "destructive"}>
                        {ALERT_LABEL[alert.type] ?? alert.type}
                      </Badge>
                      <div>
                        <p className="text-sm">{alert.message}</p>
                        {alert.deviceName && (
                          <p className="text-xs text-muted-foreground">{alert.deviceName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: ptBR })}
                      </span>
                      {!alert.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Marcar como lido"
                          onClick={() => markReadMutation.mutate(alert.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
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
    </div>
  );
}
