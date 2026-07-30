import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, FileSpreadsheet, ScrollText } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auditApi, downloadBlob, type AuditLogFilters } from "@/api/audit";
import type { AuditAction } from "@/types";

const ACTION_OPTIONS: AuditAction[] = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGIN_FAILED",
  "LOGOUT",
  "POLICY_APPLIED",
  "DEVICE_LOCKED",
  "DEVICE_WIPED",
];

export default function Logs() {
  const [page, setPage] = useState(0);
  const [action, setAction] = useState<AuditAction | "ALL">("ALL");
  const [entityType, setEntityType] = useState("");

  const filters: AuditLogFilters = {
    action: action === "ALL" ? undefined : action,
    entityType: entityType || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, filters],
    queryFn: () => auditApi.list(filters, page),
  });

  const exportPdfMutation = useMutation({
    mutationFn: () => auditApi.exportPdf(filters),
    onSuccess: (blob) => downloadBlob(blob, "logs-auditoria.pdf"),
    onError: () => toast.error("Falha ao exportar PDF"),
  });

  const exportExcelMutation = useMutation({
    mutationFn: () => auditApi.exportExcel(filters),
    onSuccess: (blob) => downloadBlob(blob, "logs-auditoria.xlsx"),
    onError: () => toast.error("Falha ao exportar Excel"),
  });

  return (
    <div>
      <PageHeader
        title="Logs de Auditoria"
        description="Histórico de ações realizadas na plataforma"
        actions={
          <>
            <Button variant="outline" onClick={() => exportPdfMutation.mutate()} disabled={exportPdfMutation.isPending}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" onClick={() => exportExcelMutation.mutate()} disabled={exportExcelMutation.isPending}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
            </Button>
          </>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
          <Select value={action} onValueChange={(v) => { setAction(v as AuditAction | "ALL"); setPage(0); }}>
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as ações</SelectItem>
              {ACTION_OPTIONS.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Tipo de entidade (ex: Device, User)"
            value={entityType}
            onChange={(e) => { setEntityType(e.target.value); setPage(0); }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Carregando…</div>
          ) : !data || data.content.length === 0 ? (
            <EmptyState icon={ScrollText} title="Nenhum log encontrado" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.content.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.createdAt).toLocaleString("pt-BR")}</TableCell>
                      <TableCell>{log.userName ?? "Sistema"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        {log.entityType}
                        {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{log.ipAddress ?? "—"}</TableCell>
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
    </div>
  );
}
