import { useEffect, useState } from "react";
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
import { policiesApi } from "@/api/policies";
import type { PolicyRequest, PolicyResponse, UpdatePolicyType } from "@/types";

const DEFAULT_VALUES: PolicyRequest = {
  name: "",
  description: "",
  passwordRequired: true,
  minPasswordLength: 6,
  maxInactivityLockMs: 60000,
  updatePolicy: "WINDOWED",
  cameraDisabled: false,
  screenCaptureDisabled: false,
  factoryResetDisabled: true,
  installAppsDisabled: false,
  usbFileTransferDisabled: false,
  active: true,
};

function toRequest(policy: PolicyResponse): PolicyRequest {
  return {
    ...policy,
    description: policy.description ?? undefined,
    restrictionsJson: policy.restrictionsJson ?? undefined,
  };
}

export function PolicyFormDialog({ policy }: { policy?: PolicyResponse }) {
  const isEdit = !!policy;
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<PolicyRequest>(policy ? toRequest(policy) : DEFAULT_VALUES);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (policy) setValues(toRequest(policy));
  }, [policy]);

  const saveMutation = useMutation({
    mutationFn: () => (isEdit ? policiesApi.update(policy!.id, values) : policiesApi.create(values)),
    onSuccess: () => {
      toast.success(isEdit ? "Política atualizada" : "Política criada");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
    onError: () => toast.error("Não foi possível salvar a política"),
  });

  function toggle(key: keyof PolicyRequest) {
    setValues((prev) => ({ ...prev, [key]: !prev[key as keyof PolicyRequest] }));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nova política
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar política" : "Nova política"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="pol-name">Nome</Label>
            <Input
              id="pol-name"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pol-desc">Descrição</Label>
            <Input
              id="pol-desc"
              value={values.description ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pol-min-pwd">Tamanho mínimo da senha</Label>
              <Input
                id="pol-min-pwd"
                type="number"
                min={4}
                value={values.minPasswordLength}
                onChange={(e) => setValues((v) => ({ ...v, minPasswordLength: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pol-lock">Bloqueio por inatividade (ms)</Label>
              <Input
                id="pol-lock"
                type="number"
                min={0}
                value={values.maxInactivityLockMs}
                onChange={(e) => setValues((v) => ({ ...v, maxInactivityLockMs: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Política de atualização</Label>
            <Select
              value={values.updatePolicy}
              onValueChange={(v) => setValues((prev) => ({ ...prev, updatePolicy: v as UpdatePolicyType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AUTOMATIC">Automática</SelectItem>
                <SelectItem value="WINDOWED">Janela de manutenção</SelectItem>
                <SelectItem value="POSTPONE">Adiar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 rounded-md border border-border p-3">
            <ToggleRow label="Senha obrigatória" checked={values.passwordRequired} onChange={() => toggle("passwordRequired")} />
            <ToggleRow label="Câmera desabilitada" checked={values.cameraDisabled} onChange={() => toggle("cameraDisabled")} />
            <ToggleRow label="Captura de tela desabilitada" checked={values.screenCaptureDisabled} onChange={() => toggle("screenCaptureDisabled")} />
            <ToggleRow label="Reset de fábrica bloqueado" checked={values.factoryResetDisabled} onChange={() => toggle("factoryResetDisabled")} />
            <ToggleRow label="Instalação de apps bloqueada" checked={values.installAppsDisabled} onChange={() => toggle("installAppsDisabled")} />
            <ToggleRow label="Transferência USB bloqueada" checked={values.usbFileTransferDisabled} onChange={() => toggle("usbFileTransferDisabled")} />
            <ToggleRow label="Ativa" checked={values.active} onChange={() => toggle("active")} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => saveMutation.mutate()} disabled={!values.name || saveMutation.isPending}>
            {saveMutation.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
