import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Plus, Tags as TagsIcon, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { departmentsApi, tagsApi } from "@/api/org";
import { useAuth } from "@/hooks/use-auth";

export default function Organization() {
  return (
    <div>
      <PageHeader title="Departamentos & Tags" description="Organização usada para agrupar dispositivos" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DepartmentsSection />
        <TagsSection />
      </div>
    </div>
  );
}

function DepartmentsSection() {
  const { hasRole } = useAuth();
  const canManage = hasRole("ADMIN", "SUPERVISOR");
  const canDelete = hasRole("ADMIN");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: departments, isLoading } = useQuery({ queryKey: ["departments"], queryFn: departmentsApi.list });

  const createMutation = useMutation({
    mutationFn: () => departmentsApi.create({ name, description: description || undefined }),
    onSuccess: () => {
      toast.success("Departamento criado");
      setOpen(false);
      setName("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: departmentsApi.remove,
    onSuccess: () => {
      toast.success("Departamento removido");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Departamentos</CardTitle>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Novo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo departamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dept-name">Nome</Label>
                  <Input id="dept-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dept-desc">Descrição</Label>
                  <Input id="dept-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending}>
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : !departments || departments.length === 0 ? (
          <EmptyState icon={Building2} title="Nenhum departamento cadastrado" />
        ) : (
          <ul className="divide-y divide-border">
            {departments.map((dept) => (
              <li key={dept.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium">{dept.name}</p>
                  {dept.description && <p className="text-xs text-muted-foreground">{dept.description}</p>}
                </div>
                {canDelete && (
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(dept.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function TagsSection() {
  const { hasRole } = useAuth();
  const canManage = hasRole("ADMIN", "SUPERVISOR");
  const canDelete = hasRole("ADMIN");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#2563eb");

  const { data: tags, isLoading } = useQuery({ queryKey: ["tags"], queryFn: tagsApi.list });

  const createMutation = useMutation({
    mutationFn: () => tagsApi.create({ name, color }),
    onSuccess: () => {
      toast.success("Tag criada");
      setOpen(false);
      setName("");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tagsApi.remove,
    onSuccess: () => {
      toast.success("Tag removida");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Tags</CardTitle>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Nova
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova tag</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="tag-name">Nome</Label>
                  <Input id="tag-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tag-color">Cor</Label>
                  <Input id="tag-color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-16 p-1" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending}>
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : !tags || tags.length === 0 ? (
          <EmptyState icon={TagsIcon} title="Nenhuma tag cadastrada" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="flex items-center gap-1.5 py-1"
                style={tag.color ? { borderColor: tag.color } : undefined}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: tag.color ?? "hsl(var(--muted-foreground))" }}
                />
                {tag.name}
                {canDelete && (
                  <button
                    type="button"
                    className="ml-1 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate(tag.id)}
                  >
                    ×
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
