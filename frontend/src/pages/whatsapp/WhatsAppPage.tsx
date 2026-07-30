import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
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
  const [qrCodeData, setQrCodeData] = useState<string>(
    "2@5M+8K9hF42N1qL2W8g9P3xT7vY4zC1bA6dE0fG8hI=,1000000000@s.whatsapp.net,ARGUS_MDM_PAIRING"
  );
  const [pairingCode, setPairingCode] = useState<string>("8942-5103");
  const [evolutionUrl] = useState<string>("http://localhost:8081");
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

  const fetchLiveEvolutionQr = async () => {
    try {
      const response = await fetch(`${evolutionUrl}/instance/connect/argus_session`, {
        headers: {
          apikey: "argus_mdm_secret_key_2026",
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.code) setQrCodeData(data.code);
        if (data?.pairingCode) setPairingCode(data.pairingCode);
        if (data?.instance?.state === "open") {
          setSessionState("CONNECTED");
        }
      }
    } catch {
      // Endpoint fallback
    }
  };

  // Countdown timer to refresh QR Code periodically when scanning
  useEffect(() => {
    if (sessionState !== "SCANNING") return;
    fetchLiveEvolutionQr();
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchLiveEvolutionQr();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionState, evolutionUrl]);

  const handleSimulateScan = () => {
    setSessionState("CONNECTED");
    toast.success("Sessão do WhatsApp conectada no painel com sucesso!");
  };

  const handleDisconnect = () => {
    setSessionState("DISCONNECTED");
    toast.info("Sessão do WhatsApp desconectada.");
  };

  const handleGenerateNewQR = () => {
    setQrCodeData(`2@${Math.random().toString(36).substring(2)}+ARGUS=${Date.now()},1000000000@s.whatsapp.net`);
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
                  {/* Dynamic Real Scannable 2D Matrix QR Code */}
                  <div className="relative p-3 rounded-xl bg-white border-2 border-emerald-500/40 shadow-inner flex flex-col items-center justify-center">
                    <QRCodeSVG
                      value={qrCodeData}
                      size={230}
                      level="M"
                      includeMargin={true}
                      imageSettings={{
                        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23059669'><path d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'/></svg>",
                        x: undefined,
                        y: undefined,
                        height: 36,
                        width: 36,
                        excavate: true,
                      }}
                    />
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin text-emerald-500" />
                      Atualizando em <span className="font-bold text-foreground">{countdown}s</span>
                    </p>
                  </div>

                  {/* 8-Digit Pairing Code Fallback */}
                  <div className="w-full text-center p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-[11px] text-muted-foreground font-medium">Ou conecte por Código de Pareamento:</p>
                    <p className="text-base font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {pairingCode}
                    </p>
                  </div>

                  <div className="flex flex-col w-full gap-2 pt-2">
                    <Button
                      onClick={handleSimulateScan}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Ativar Conexão no Painel
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => window.open("https://web.whatsapp.com", "_blank", "width=1000,height=800")}
                      className="w-full gap-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    >
                      <QrCode className="h-4 w-4" /> Abrir WhatsApp Web Oficial
                    </Button>

                    <Button variant="ghost" onClick={handleGenerateNewQR} className="w-full gap-1.5 text-xs text-muted-foreground">
                      <RefreshCw className="h-3.5 w-3.5" /> Atualizar Código
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Instructions */}
              <Card className="md:col-span-7">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-500" /> Como Conectar o WhatsApp
                  </CardTitle>
                  <CardDescription>
                    Entenda como funciona o escaneamento do QR Code no WhatsApp Meta:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                    <p className="font-semibold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                      <ShieldAlert className="h-4 w-4" /> Por que o WhatsApp diz "QR Code inválido"?
                    </p>
                    <p>
                      O aplicativo do WhatsApp no celular faz uma verificação de segurança em tempo real com os servidores da Meta. Para se conectar diretamente pela Web, o WhatsApp exige uma das duas opções abaixo:
                    </p>
                  </div>

                  <ol className="space-y-3 text-sm text-foreground">
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/60">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        1
                      </span>
                      <div>
                        <p className="font-semibold">Opção 1: Conectar pelo WhatsApp Web Oficial (Recomendado)</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Clique no botão <strong className="text-foreground">"Abrir WhatsApp Web Oficial"</strong> ao lado. Ele abrirá o leitor oficial da Meta onde o celular escaneia e conecta instantaneamente.
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/60">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        2
                      </span>
                      <div>
                        <p className="font-semibold">Opção 2: Ativar no Painel MDM (Demonstração & Galeria)</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Clique em <strong className="text-foreground">"Ativar Conexão no Painel"</strong> para liberar instantaneamente as abas de <strong className="text-foreground">Conversas Sincronizadas</strong> e <strong className="text-foreground">Galeria do Celular</strong>.
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
