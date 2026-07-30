import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Users as UsersIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usersApi } from "@/api/users";
import { useAuth } from "@/hooks/use-auth";
import { UserFormDialog } from "./UserFormDialog";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  OPERATOR: "Operador",
};

export default function Users() {
  const [page, setPage] = useState(0);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const { hasRole } = useAuth();
  const isAdmin = hasRole("ADMIN");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users", page],
    queryFn: () => usersApi.list(page),
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => {
      toast.success("Usuário removido");
      setUserToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Contas com acesso ao painel administrativo"
        actions={isAdmin ? <UserFormDialog /> : undefined}
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Carregando…</div>
          ) : !data || data.content.length === 0 ? (
            <EmptyState icon={UsersIcon} title="Nenhum usuário encontrado" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>2FA</TableHead>
                    {isAdmin && <TableHead className="text-right">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.content.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{ROLE_LABEL[user.role]}</TableCell>
                      <TableCell>
                        <Badge variant={user.active ? "success" : "secondary"}>
                          {user.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.twoFaEnabled ? "Ativado" : "—"}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <UserFormDialog user={user} />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setUserToDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      )}
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
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title="Remover usuário"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        loading={deleteMutation.isPending}
        onConfirm={() => userToDelete && deleteMutation.mutate(userToDelete)}
      />
    </div>
  );
}
