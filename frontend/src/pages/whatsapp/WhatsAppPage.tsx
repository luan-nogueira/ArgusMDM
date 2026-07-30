import { useState, useEffect } from "react";
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  LogOut,
  MessageSquare,
  ImageIcon,
  ShieldAlert,
  Wifi,
  Sparkles,
  Search,
  Send,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { MediaGallery } from "@/components/whatsapp/MediaGallery";
import { toast } from "sonner";

export default function WhatsAppPage() {
  const [sessionState, setSessionState] = useState<"DISCONNECTED" | "SCANNING" | "CONNECTED">("SCANNING");
  const [qrCodeData, setQrCodeData] = useState<string>("ARGUS-MDM-WAPP-SESSION-PAIRING-TOKEN-99482710384");
  const [countdown, setCountdown] = useState(45);
  const [activeChat, setActiveChat] = useState<string>("c1");
  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Record<string, Array<{ id: string; sender: string; text: string; time: string; isMe: boolean }>>>({
    c1: [
      { id: "1", sender: "Irmão (Android Galaxy S23)", text: "Fala! Já concedi a permissão da galeria aqui no app do Argus MDM.", time: "14:20", isMe: false },
      { id: "2", sender: "Você", text: "Show! Já tá aparecendo aqui no painel web as fotos e o QR Code escaneado.", time: "14:22", isMe: true },
      { id: "3", sender: "Irmão (Android Galaxy S23)", text: "Perfeito, tudo funcionando certinho igual o WhatsApp Web!", time: "14:25", isMe: false },
    ],
    c2: [
      { id: "1", sender: "Supervisão Operacional", text: "Relatório de vistorias sincronizado.", time: "11:15", isMe: false },
    ],
  });

  // Countdown timer to refresh QR Code periodically when scanning
  useEffect(() => {
    if (sessionState !== "SCANNING") return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setQrCodeData(`ARGUS-MDM-WAPP-SESSION-${Date.now()}`);
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionState]);

  const handleSimulateScan = () => {
    setSessionState("CONNECTED");
    toast.success("Sessão do WhatsApp conectada com sucesso!");
  };

  const handleDisconnect = () => {
    setSessionState("DISCONNECTED");
    toast.info("Sessão do WhatsApp desconectada.");
  };

  const handleGenerateNewQR = () => {
    setQrCodeData(`ARGUS-MDM-WAPP-SESSION-${Date.now()}`);
    setCountdown(45);
    setSessionState("SCANNING");
    toast.info("Novo QR Code gerado!");
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const newMsg = {
      id: String(Date.now()),
      sender: "Você",
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };
    setChatMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMsg],
    }));
    setMessageInput("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            WhatsApp Web & Galeria de Mídias
          </h1>
          <p className="text-sm text-muted-foreground">
            Escaneie o QR Code no celular para conectar a sessão do WhatsApp e gerenciar mídias da galeria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sessionState === "CONNECTED" && (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5 py-1 px-3">
              <Wifi className="h-3.5 w-3.5" /> Sessão Conectada
            </Badge>
          )}
          {sessionState === "SCANNING" && (
            <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/40 gap-1.5 py-1 px-3">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Aguardando Leitura do QR Code
            </Badge>
          )}
          {sessionState === "DISCONNECTED" && (
            <Badge variant="destructive" className="gap-1.5 py-1 px-3">
              <ShieldAlert className="h-3.5 w-3.5" /> Desconectado
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="qrcode" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="qrcode" className="gap-2">
            <QrCode className="h-4 w-4 text-emerald-600" />
            Conexão QR Code
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            Conversas Sincronizadas
          </TabsTrigger>
          <TabsTrigger value="gallery" className="gap-2">
            <ImageIcon className="h-4 w-4 text-purple-500" />
            Galeria do Celular & Mídias
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: QR CODE CONNECTION */}
        <TabsContent value="qrcode" className="space-y-6">
          {sessionState === "CONNECTED" ? (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" /> WhatsApp Conectado com Sucesso!
                </CardTitle>
                <CardDescription>
                  Sua conta de WhatsApp está ativa e sincronizada no Argus MDM.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground font-medium">Dispositivo Pareado</p>
                    <p className="text-sm font-semibold text-foreground mt-1 flex items-center gap-1.5">
                      <Smartphone className="h-4 w-4 text-emerald-500" /> Android Galaxy S23 (Irmão)
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground font-medium">Status da Sessão</p>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      Ativa (Sincronizando WhatsApp Web)
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground font-medium">Ações Disponíveis</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button variant="destructive" size="sm" onClick={handleDisconnect} className="gap-1.5">
                        <LogOut className="h-3.5 w-3.5" /> Desconectar Sessão
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: QR Code Display Card */}
              <Card className="md:col-span-5 border-emerald-500/20 shadow-md">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">Escaneie o QR Code</CardTitle>
                  <CardDescription>
                    Abra o WhatsApp no celular e escaneie a imagem abaixo
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
                  {/* Simulated Dynamic QR Code Box */}
                  <div data-qr={qrCodeData} className="relative p-4 rounded-xl bg-white border-2 border-emerald-500/40 shadow-inner flex flex-col items-center justify-center">
                    <div className="w-64 h-64 bg-slate-900 rounded-lg p-3 flex flex-col items-center justify-center text-white relative">
                      {/* SVG Mock QR Code Pattern */}
                      <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-white">
                        <rect x="5" y="5" width="25" height="25" fill="white" />
                        <rect x="9" y="9" width="17" height="17" fill="black" />
                        <rect x="13" y="13" width="9" height="9" fill="white" />

                        <rect x="70" y="5" width="25" height="25" fill="white" />
                        <rect x="74" y="9" width="17" height="17" fill="black" />
                        <rect x="78" y="13" width="9" height="9" fill="white" />

                        <rect x="5" y="70" width="25" height="25" fill="white" />
                        <rect x="9" y="74" width="17" height="17" fill="black" />
                        <rect x="13" y="78" width="9" height="9" fill="white" />

                        <rect x="35" y="10" width="8" height="8" fill="white" />
                        <rect x="50" y="10" width="12" height="8" fill="white" />
                        <rect x="35" y="35" width="30" height="8" fill="white" />
                        <rect x="40" y="50" width="20" height="20" fill="white" />
                        <rect x="70" y="40" width="20" height="8" fill="white" />
                        <rect x="70" y="60" width="8" height="25" fill="white" />
                        <rect x="40" y="80" width="25" height="10" fill="white" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-emerald-600 p-2 rounded-full shadow-lg">
                          <MessageSquare className="h-7 w-7 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin text-emerald-500" />
                      Atualizando em <span className="font-bold text-foreground">{countdown}s</span>
                    </p>
                  </div>

                  <div className="flex flex-col w-full gap-2 pt-2">
                    <Button
                      onClick={handleSimulateScan}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Simular Leitura do QR Code
                    </Button>
                    <Button variant="outline" onClick={handleGenerateNewQR} className="w-full gap-1.5 text-xs">
                      <RefreshCw className="h-3.5 w-3.5" /> Atualizar QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Instructions */}
              <Card className="md:col-span-7">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-500" /> Instruções de Conexão no Celular
                  </CardTitle>
                  <CardDescription>
                    Siga o passo a passo no WhatsApp do celular (do seu irmão) para vincular a sessão:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="space-y-3 text-sm text-foreground">
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/60">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        1
                      </span>
                      <div>
                        <p className="font-semibold">Abra o WhatsApp no celular</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Abra o aplicativo oficial do WhatsApp no smartphone Android.
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/60">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        2
                      </span>
                      <div>
                        <p className="font-semibold">Acesse "Aparelhos Conectados"</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Toque no menu (três pontos no canto superior direito) e selecione <strong className="text-foreground">Aparelhos Conectados</strong>.
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/60">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        3
                      </span>
                      <div>
                        <p className="font-semibold">Toque em "Conectar um Aparelho"</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Aponte a câmera do celular para o QR Code exibido ao lado para realizar o pareamento instantâneo.
                        </p>
                      </div>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: SYNCHRONIZED CHATS */}
        <TabsContent value="messages" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[550px] border border-border rounded-xl overflow-hidden bg-card">
            {/* Sidebar Chat List */}
            <div className="md:col-span-4 border-r border-border flex flex-col bg-muted/30">
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar conversas..." className="pl-8 h-9 text-xs" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                <div
                  onClick={() => setActiveChat("c1")}
                  className={`p-3 cursor-pointer transition-colors hover:bg-muted ${
                    activeChat === "c1" ? "bg-emerald-500/10 border-l-4 border-emerald-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground truncate">Irmão (Android Galaxy S23)</span>
                    <span className="text-[10px] text-muted-foreground">14:25</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">Perfeito, tudo funcionando certinho igual o WhatsApp Web!</p>
                </div>

                <div
                  onClick={() => setActiveChat("c2")}
                  className={`p-3 cursor-pointer transition-colors hover:bg-muted ${
                    activeChat === "c2" ? "bg-emerald-500/10 border-l-4 border-emerald-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground truncate">Supervisão Operacional</span>
                    <span className="text-[10px] text-muted-foreground">11:15</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">Relatório de vistorias sincronizado.</p>
                </div>
              </div>
            </div>

            {/* Chat Box */}
            <div className="md:col-span-8 flex flex-col h-full bg-background">
              {/* Chat Header */}
              <div className="p-3 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                    {activeChat === "c1" ? "IR" : "SO"}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">
                      {activeChat === "c1" ? "Irmão (Dispositivo Android)" : "Supervisão Operacional"}
                    </h3>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Online via WhatsApp Web Sync</p>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950">
                {(chatMessages[activeChat] || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-3 text-xs shadow-sm ${
                        msg.isMe
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-card text-card-foreground border border-border rounded-bl-none"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className={`block text-[9px] mt-1 text-right ${msg.isMe ? "text-emerald-100" : "text-muted-foreground"}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-border flex items-center gap-2 bg-card">
                <Input
                  placeholder="Digite uma mensagem..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 h-9 text-xs"
                />
                <Button size="sm" onClick={handleSendMessage} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-3">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: MEDIA GALLERY */}
        <TabsContent value="gallery" className="space-y-6">
          <MediaGallery />
        </TabsContent>
      </Tabs>
    </div>
  );
}
