import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { policiesApi } from "@/api/policies";
import { useAuth } from "@/hooks/use-auth";
import { PolicyFormDialog } from "./PolicyFormDialog";
import { AssignPolicyDialog } from "./AssignPolicyDialog";

export default function Policies() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const canManage = hasRole("ADMIN", "SUPERVISOR");
  const canDelete = hasRole("ADMIN");

  const { data: policies, isLoading } = useQuery({ queryKey: ["policies"], queryFn: policiesApi.list });

  const deleteMutation = useMutation({
    mutationFn: policiesApi.remove,
    onSuccess: () => {
      toast.success("Política removida");
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });

  return (
    <div>
      <PageHeader
        title="Políticas"
        description="Regras de segurança aplicáveis a dispositivos, departamentos ou tags"
        actions={canManage ? <PolicyFormDialog /> : undefined}
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : !policies || policies.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Nenhuma política cadastrada" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {policies.map((policy) => (
            <Card key={policy.id}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{policy.name}</CardTitle>
                  {policy.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{policy.description}</p>
                  )}
                </div>
                {canManage && <PolicyFormDialog policy={policy} />}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {policy.active && <Badge variant="success">Ativa</Badge>}
                  {policy.passwordRequired && <Badge variant="outline">Senha obrigatória</Badge>}
                  {policy.cameraDisabled && <Badge variant="outline">Câmera bloqueada</Badge>}
                  {policy.installAppsDisabled && <Badge variant="outline">Instalação bloqueada</Badge>}
                  {policy.factoryResetDisabled && <Badge variant="outline">Reset bloqueado</Badge>}
                </div>
                <div className="flex items-center justify-between pt-2">
                  {canManage ? <AssignPolicyDialog policy={policy} /> : <span />}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(policy.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
