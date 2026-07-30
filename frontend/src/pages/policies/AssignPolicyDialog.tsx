import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { policiesApi } from "@/api/policies";
import { devicesApi } from "@/api/devices";
import { departmentsApi, tagsApi } from "@/api/org";
import type { PolicyResponse, PolicyTargetType } from "@/types";

export function AssignPolicyDialog({ policy }: { policy: PolicyResponse }) {
  const [open, setOpen] = useState(false);
  const [targetType, setTargetType] = useState<PolicyTargetType>("DEVICE");
  const [targetId, setTargetId] = useState<string>("");

  const { data: devicesPage } = useQuery({
    queryKey: ["devices-for-assign"],
    queryFn: () => devicesApi.list({ size: 100 }),
    enabled: open && targetType === "DEVICE",
  });
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentsApi.list,
    enabled: open && targetType === "DEPARTMENT",
  });
  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: tagsApi.list,
    enabled: open && targetType === "TAG",
  });

  const assignMutation = useMutation({
    mutationFn: () => policiesApi.assign({ policyId: policy.id, targetType, targetId }),
    onSuccess: () => {
      toast.success("Política atribuída");
      setOpen(false);
      setTargetId("");
    },
    onError: () => toast.error("Não foi possível atribuir a política"),
  });

  const options =
    targetType === "DEVICE"
      ? devicesPage?.content.map((d) => ({ id: d.id, label: d.name }))
      : targetType === "DEPARTMENT"
        ? departments?.map((d) => ({ id: d.id, label: d.name }))
        : tags?.map((t) => ({ id: t.id, label: t.name }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="mr-2 h-4 w-4" /> Atribuir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir política "{policy.name}"</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Aplicar a</Label>
            <Select
              value={targetType}
              onValueChange={(v) => {
                setTargetType(v as PolicyTargetType);
                setTargetId("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEVICE">Dispositivo</SelectItem>
                <SelectItem value="DEPARTMENT">Departamento</SelectItem>
                <SelectItem value="TAG">Tag</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Alvo</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {options?.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => assignMutation.mutate()} disabled={!targetId || assignMutation.isPending}>
            {assignMutation.isPending ? "Atribuindo…" : "Atribuir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
