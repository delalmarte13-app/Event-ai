import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BookOpen,
  Wand2,
  Loader2,
  Images,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface Props {
  eventId: number;
  isOrganizer: boolean;
  eventTitle: string;
}

export default function EventAlbums({ eventId, isOrganizer, eventTitle }: Props) {
  const utils = trpc.useUtils();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [albumTitle, setAlbumTitle] = useState(`Recuerdos de ${eventTitle}`);
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);

  const { data: albumsList, isLoading } = trpc.albums.listByEvent.useQuery({ eventId });
  const { data: albumDetail } = trpc.albums.getWithItems.useQuery(
    { albumId: selectedAlbumId! },
    { enabled: !!selectedAlbumId }
  );

  const generateAlbum = trpc.albums.generate.useMutation({
    onSuccess: (data) => {
      toast.success(`Álbum generado con ${data.photoCount} fotos`);
      utils.albums.listByEvent.invalidate({ eventId });
      setGenerateOpen(false);
      setAlbumTitle(`Recuerdos de ${eventTitle}`);
    },
    onError: (err) => toast.error(err.message ?? "Error al generar el álbum"),
  });

  const statusIcon = (status: string) => {
    if (status === "ready") return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (status === "generating") return <Clock className="w-4 h-4 text-amber-400 animate-spin" />;
    return <XCircle className="w-4 h-4 text-destructive" />;
  };

  const statusLabel = (status: string) => {
    if (status === "ready") return "Listo";
    if (status === "generating") return "Generando...";
    return "Error";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-serif font-semibold">Álbumes de recuerdos</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generados automáticamente con inteligencia artificial
          </p>
        </div>
        {isOrganizer && (
          <Button
            onClick={() => setGenerateOpen(true)}
            className="bg-primary text-primary-foreground gap-2"
          >
            <Wand2 className="w-4 h-4" /> Generar álbum
          </Button>
        )}
      </div>

      {/* Albums list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !albumsList || albumsList.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-serif font-semibold mb-2">Sin álbumes aún</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {isOrganizer
              ? "Genera un álbum de recuerdos con IA usando las fotos del evento"
              : "El organizador del evento generará un álbum de recuerdos próximamente"}
          </p>
          {isOrganizer && (
            <Button
              onClick={() => setGenerateOpen(true)}
              className="bg-primary text-primary-foreground gap-2"
            >
              <Wand2 className="w-4 h-4" /> Crear primer álbum
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albumsList.map((album) => (
            <button
              key={album.id}
              className="glass-card rounded-2xl overflow-hidden hover:border-primary/25 transition-all text-left group"
              onClick={() => setSelectedAlbumId(album.id)}
            >
              {/* Cover */}
              <div className="h-36 bg-gradient-to-br from-primary/10 to-violet-500/10 relative overflow-hidden">
                {album.coverUrl ? (
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Images className="w-10 h-10 text-primary/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-background/80 backdrop-blur text-xs gap-1 border-border/50">
                    {statusIcon(album.status)}
                    {statusLabel(album.status)}
                  </Badge>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {album.title}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                </div>
                {album.aiSummary && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                    {album.aiSummary}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(album.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Album detail dialog */}
      <Dialog open={!!selectedAlbumId} onOpenChange={(o) => !o && setSelectedAlbumId(null)}>
        <DialogContent className="bg-card border-border/60 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {albumDetail?.title ?? "Álbum"}
            </DialogTitle>
          </DialogHeader>

          {albumDetail ? (
            <div className="space-y-4">
              {albumDetail.aiSummary && (
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">Resumen generado por IA</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {albumDetail.aiSummary}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {albumDetail.items.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                      {item.url && (
                        <img
                          src={item.url}
                          alt={item.aiCaption ?? "Foto"}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    {item.aiCaption && (
                      <p className="text-xs text-muted-foreground px-1 line-clamp-2">
                        {item.aiCaption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="bg-card border-border/60 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Generar álbum con IA</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Wand2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-1">¿Cómo funciona?</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    La IA analizará todas las fotos públicas del evento, seleccionará las mejores
                    y creará un álbum personalizado con una descripción narrativa emotiva.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="albumTitle">Título del álbum</Label>
              <Input
                id="albumTitle"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                className="bg-input border-border/60"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-border/60"
                onClick={() => setGenerateOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground gap-2"
                onClick={() => generateAlbum.mutate({ eventId, title: albumTitle })}
                disabled={generateAlbum.isPending || !albumTitle.trim()}
              >
                {generateAlbum.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                Generar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
