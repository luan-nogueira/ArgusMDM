import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usersApi } from "@/api/users";
import type { UserResponse, UserRole } from "@/types";

export function UserFormDialog({ user }: { user?: UserResponse }) {
  const isEdit = !!user;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user?.role ?? "OPERATOR");
  const [active, setActive] = useState(user?.active ?? true);

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: () =>
      isEdit
        ? usersApi.update(user!.id, { name, role, active })
        : usersApi.create({ name, email, password, role }),
    onSuccess: () => {
      toast.success(isEdit ? "Usuário atualizado" : "Usuário criado");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Não foi possível salvar o usuário"),
  });

  const canSubmit = isEdit ? !!name : !!name && !!email && password.length >= 8;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo usuário
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar usuário" : "Novo usuário"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="user-name">Nome</Label>
            <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          {!isEdit && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="user-email">E-mail</Label>
                <Input id="user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="user-password">Senha</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label>Perfil</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                <SelectItem value="OPERATOR">Operador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isEdit && (
            <div className="flex items-center gap-2">
              <Switch id="user-active" checked={active} onCheckedChange={setActive} />
              <Label htmlFor="user-active" className="font-normal">Ativo</Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => saveMutation.mutate()} disabled={!canSubmit || saveMutation.isPending}>
            {saveMutation.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
