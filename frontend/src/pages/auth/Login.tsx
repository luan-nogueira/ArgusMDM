import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

const credentialsSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe a senha"),
});

type CredentialsForm = z.infer<typeof credentialsSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [pendingCredentials, setPendingCredentials] = useState<CredentialsForm | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsForm>({ resolver: zodResolver(credentialsSchema) });

  const redirectTo = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/";

  async function attemptLogin(payload: CredentialsForm, code?: string) {
    setSubmitting(true);
    try {
      await login({ ...payload, totpCode: code });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message: string | undefined = error.response?.data?.message;
        if (message?.includes("2FA") && !message.includes("inválido")) {
          setPendingCredentials(payload);
          setRequires2FA(true);
          return;
        }
        if (message?.includes("2FA inválido")) {
          toast.error("Código 2FA inválido. Tente novamente.");
          return;
        }
        toast.error(message ?? "Falha ao autenticar");
        return;
      }
      toast.error("Falha ao autenticar");
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmitCredentials(payload: CredentialsForm) {
    void attemptLogin(payload);
  }

  function onSubmitTotp() {
    if (!pendingCredentials) return;
    void attemptLogin(pendingCredentials, totpCode);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle>Argus MDM</CardTitle>
          <CardDescription>
            {requires2FA ? "Informe o código do autenticador" : "Entre com sua conta para continuar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!requires2FA ? (
            <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmitCredentials)}>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" autoComplete="username" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Entrando…" : "Entrar"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="totp">Código de 6 dígitos</Label>
                <Input
                  id="totp"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <Button
                className="w-full"
                disabled={submitting || totpCode.length < 6}
                onClick={onSubmitTotp}
              >
                {submitting ? "Verificando…" : "Confirmar"}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                type="button"
                onClick={() => {
                  setRequires2FA(false);
                  setTotpCode("");
                }}
              >
                Voltar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
