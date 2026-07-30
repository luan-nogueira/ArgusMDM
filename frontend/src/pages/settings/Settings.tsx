import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { KeyRound, ShieldCheck, ShieldOff } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/api/auth";
import { usersApi } from "@/api/users";
import { useAuth } from "@/hooks/use-auth";

export default function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const enableMutation = useMutation({
    mutationFn: authApi.enable2FA,
    onSuccess: (data) => setQrCode(data.qrCodeImageBase64),
    onError: () => toast.error("Não foi possível iniciar a configuração do 2FA"),
  });

  const confirmMutation = useMutation({
    mutationFn: () => authApi.confirm2FA(confirmCode),
    onSuccess: () => {
      toast.success("2FA ativado com sucesso");
      setQrCode(null);
      setConfirmCode("");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => toast.error("Código inválido"),
  });

  const disableMutation = useMutation({
    mutationFn: authApi.disable2FA,
    onSuccess: () => {
      toast.success("2FA desativado");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: () => usersApi.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Senha alterada com sucesso");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (error) => {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(message ?? "Não foi possível alterar a senha");
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Configurações" description="Preferências da sua conta" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Perfil</CardTitle>
            <CardDescription>{user?.name} — {user?.email}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Autenticação em duas etapas (2FA)</CardTitle>
            <CardDescription>
              Adicione uma camada extra de segurança usando um app autenticador (Google Authenticator, Authy, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.twoFaEnabled ? (
              <Button
                variant="outline"
                onClick={() => disableMutation.mutate()}
                disabled={disableMutation.isPending}
              >
                <ShieldOff className="mr-2 h-4 w-4" /> Desativar 2FA
              </Button>
            ) : qrCode ? (
              <div className="space-y-3">
                <img
                  src={`data:image/png;base64,${qrCode}`}
                  alt="QR code do 2FA"
                  className="h-44 w-44 rounded-md border border-border"
                />
                <div className="space-y-1.5">
                  <Label htmlFor="confirm2fa">Código de confirmação</Label>
                  <Input
                    id="confirm2fa"
                    inputMode="numeric"
                    maxLength={6}
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <Button
                  onClick={() => confirmMutation.mutate()}
                  disabled={confirmCode.length < 6 || confirmMutation.isPending}
                >
                  Confirmar ativação
                </Button>
              </div>
            ) : (
              <Button onClick={() => enableMutation.mutate()} disabled={enableMutation.isPending}>
                <ShieldCheck className="mr-2 h-4 w-4" /> Ativar 2FA
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alterar senha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={() => changePasswordMutation.mutate()}
              disabled={!currentPassword || newPassword.length < 8 || changePasswordMutation.isPending}
            >
              <KeyRound className="mr-2 h-4 w-4" /> Salvar nova senha
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
