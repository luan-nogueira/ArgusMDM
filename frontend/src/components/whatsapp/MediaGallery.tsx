import React, { useState } from "react";
import {
  Image as ImageIcon,
  Video,
  FileText,
  Upload,
  Search,
  Filter,
  Eye,
  Download,
  Smartphone,
  Sparkles,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface MediaItem {
  id: string;
  title: string;
  type: "image" | "video" | "document";
  url: string;
  size: string;
  timestamp: string;
  source: "WhatsApp" | "APK Device Gallery" | "Upload Local";
  deviceName?: string;
}

const initialMediaItems: MediaItem[] = [
  {
    id: "m1",
    title: "Foto_Inspecao_Equipamento_01.jpg",
    type: "image",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60",
    size: "2.4 MB",
    timestamp: "Hoje às 14:32",
    source: "APK Device Gallery",
    deviceName: "Android Galaxy S23 (Dispositivo Irmão)",
  },
  {
    id: "m2",
    title: "Comprovante_Entrega_WhatsApp.png",
    type: "image",
    url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60",
    size: "1.1 MB",
    timestamp: "Hoje às 12:15",
    source: "WhatsApp",
    deviceName: "WhatsApp Web Connected Session",
  },
  {
    id: "m3",
    title: "Vistoria_Veiculo_Patio.jpg",
    type: "image",
    url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=60",
    size: "3.8 MB",
    timestamp: "Ontem às 18:40",
    source: "APK Device Gallery",
    deviceName: "Android Galaxy S23 (Dispositivo Irmão)",
  },
  {
    id: "m4",
    title: "Relatorio_Checklist_Operacao.pdf",
    type: "document",
    url: "#",
    size: "450 KB",
    timestamp: "Ontem às 11:05",
    source: "WhatsApp",
    deviceName: "WhatsApp Document Sync",
  },
  {
    id: "m5",
    title: "Gravacao_Vistoria_Patio.mp4",
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-working-late-in-a-modern-office-42867-large.mp4",
    size: "14.2 MB",
    timestamp: "28/07/2026 às 16:20",
    source: "APK Device Gallery",
    deviceName: "Android Galaxy S23 (Dispositivo Irmão)",
  },
];

export function MediaGallery() {
  const [items, setItems] = useState<MediaItem[]>(initialMediaItems);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const mediaType: "image" | "video" | "document" = isImage ? "image" : isVideo ? "video" : "document";

    const newItem: MediaItem = {
      id: `m-${Date.now()}`,
      title: file.name,
      type: mediaType,
      url: URL.createObjectURL(file),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      timestamp: "Agora mesmo",
      source: "Upload Local",
      deviceName: "Galeria Local do Navegador",
    };

    setItems([newItem, ...items]);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || (item.deviceName && item.deviceName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSource = filterSource === "all" || item.source === filterSource;
    return matchesSearch && matchesType && matchesSource;
  });

  return (
    <div className="space-y-6">
      {/* Upper Control Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar mídias por nome ou dispositivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*,video/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button variant="default" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer" asChild>
              <span>
                <Upload className="h-4 w-4" />
                Adicionar da Galeria Local
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            Todas as Mídias ({items.length})
          </Button>
          <Button
            variant={filterType === "image" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("image")}
            className="gap-1.5"
          >
            <ImageIcon className="h-4 w-4 text-blue-500" />
            Fotos ({items.filter((i) => i.type === "image").length})
          </Button>
          <Button
            variant={filterType === "video" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("video")}
            className="gap-1.5"
          >
            <Video className="h-4 w-4 text-purple-500" />
            Vídeos ({items.filter((i) => i.type === "video").length})
          </Button>
          <Button
            variant={filterType === "document" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("document")}
            className="gap-1.5"
          >
            <FileText className="h-4 w-4 text-amber-500" />
            Documentos ({items.filter((i) => i.type === "document").length})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">Todas as Fontes</option>
            <option value="APK Device Gallery">Galeria do Celular (APK)</option>
            <option value="WhatsApp">Sincronizadas WhatsApp</option>
            <option value="Upload Local">Upload Local</option>
          </select>
        </div>
      </div>

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-base font-medium">Nenhuma mídia encontrada com os filtros atuais.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden cursor-pointer hover:border-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              onClick={() => setSelectedMedia(item)}
            >
              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                {item.type === "image" ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : item.type === "video" ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                    <Video className="h-10 w-10 text-white/80" />
                    <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                      Vídeo
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center bg-slate-900">
                    <FileText className="h-10 w-10 text-amber-400 mb-1" />
                    <span className="text-xs text-white/80 font-medium truncate max-w-[150px]">
                      {item.title}
                    </span>
                  </div>
                )}

                <div className="absolute top-2 right-2">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] backdrop-blur-md bg-black/60 text-white ${
                      item.source === "APK Device Gallery"
                        ? "border-emerald-500/50 text-emerald-300"
                        : "border-blue-500/50 text-blue-300"
                    }`}
                  >
                    {item.source === "APK Device Gallery" ? (
                      <span className="flex items-center gap-1">
                        <Smartphone className="h-3 w-3" /> APK Galeria
                      </span>
                    ) : (
                      item.source
                    )}
                  </Badge>
                </div>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" variant="secondary" className="gap-1.5 backdrop-blur-md">
                    <Eye className="h-4 w-4" /> Visualizar
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-card space-y-1">
                <p className="text-xs font-semibold text-card-foreground truncate" title={item.title}>
                  {item.title}
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{item.timestamp}</span>
                  <span>{item.size}</span>
                </div>
                {item.deviceName && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                    📱 {item.deviceName}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox / Preview Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        {selectedMedia && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedMedia.type === "image" && <ImageIcon className="h-5 w-5 text-blue-500" />}
                {selectedMedia.type === "video" && <Video className="h-5 w-5 text-purple-500" />}
                {selectedMedia.type === "document" && <FileText className="h-5 w-5 text-amber-500" />}
                <span className="truncate">{selectedMedia.title}</span>
              </DialogTitle>
              <DialogDescription>
                Mídia vinda de {selectedMedia.source} • {selectedMedia.timestamp} • {selectedMedia.size}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-center rounded-lg overflow-hidden bg-black/90 p-2 min-h-[300px]">
              {selectedMedia.type === "image" ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title}
                  className="max-h-[60vh] object-contain rounded"
                />
              ) : selectedMedia.type === "video" ? (
                <video src={selectedMedia.url} controls className="max-h-[60vh] w-full rounded" />
              ) : (
                <div className="p-8 text-center text-white">
                  <FileText className="mx-auto h-16 w-16 text-amber-400 mb-2" />
                  <p className="font-semibold text-lg">{selectedMedia.title}</p>
                  <p className="text-xs text-white/70 mt-1">Documento pronto para download</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Badge variant="outline" className="gap-1">
                <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
                {selectedMedia.deviceName || "Dispositivo Sincronizado"}
              </Badge>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={selectedMedia.url} download target="_blank" rel="noreferrer" className="gap-1.5">
                    <Download className="h-4 w-4" /> Baixar Mídia
                  </a>
                </Button>
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Sparkles className="h-4 w-4" /> Compartilhar no WhatsApp
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
