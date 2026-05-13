import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Film,
  Download,
  Loader2,
  Music,
  Zap,
  Clock,
  Sparkles,
} from "lucide-react";
import { safeDownload } from "@/lib/downloadHelper";

interface VideoGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number;
  eventTitle: string;
  mediaUrls: string[];
}

export default function VideoGenerator({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  mediaUrls,
}: VideoGeneratorProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const generateVideo = trpc.media.generateVideoWithAI.useMutation({
    onSuccess: (data) => {
      setVideoUrl(data.videoUrl);
      setProgress(100);
      toast.success("Video generado exitosamente");
    },
    onError: () => {
      toast.error("Error al generar el video");
      setProgress(0);
    },
  });

  const handleGenerate = () => {
    if (mediaUrls.length === 0) {
      toast.error("Se necesitan al menos 2 fotos para crear un video");
      return;
    }

    setProgress(10);
    const prompt =
      customPrompt ||
      `Crea un video emotivo y hermoso del evento "${eventTitle}" con transiciones suaves y música de fondo`;

    generateVideo.mutate({
      eventId,
      mediaUrls: mediaUrls.slice(0, 20),
      prompt,
    });

    // Simular progreso
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 1000);
  };

  const downloadVideo = () => {
    if (videoUrl) {
      safeDownload(videoUrl, `${eventTitle}-video.mp4`);
      toast.success("Video descargado");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/60 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" /> Crear Video con IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <strong>{mediaUrls.length} fotos</strong> serán utilizadas para crear un video
              cinematográfico con transiciones, música y narrativa automática.
            </p>
          </div>

          {/* Video preview or placeholder */}
          {videoUrl ? (
            <div className="rounded-xl overflow-hidden border border-border/50 bg-muted/30">
              <video
                src={videoUrl}
                controls
                className="w-full h-auto max-h-96"
              />
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border/50 bg-muted/20 h-64 flex flex-col items-center justify-center gap-3">
              <Film className="w-12 h-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Tu video aparecerá aquí</p>
                <p className="text-xs text-muted-foreground">
                  Genera un video cinematográfico de tu evento
                </p>
              </div>
            </div>
          )}

          {/* Progress */}
          {generateVideo.isPending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generando video...</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Custom prompt */}
          {!videoUrl && (
            <div>
              <p className="text-sm font-medium mb-2">Describe tu video (opcional)</p>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ej: Video épico con música dramática, transiciones rápidas, énfasis en los momentos especiales..."
                rows={3}
                className="bg-input border-border/60 resize-none text-sm"
              />
            </div>
          )}

          {/* Features */}
          {!videoUrl && (
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Music className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">Música</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Sparkles className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">Transiciones</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">1-3 minutos</p>
              </div>
            </div>
          )}

          {/* Status */}
          {videoUrl && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 w-fit gap-1.5">
              <Zap className="w-3 h-3" /> Video listo
            </Badge>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-border/60"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
            {videoUrl ? (
              <Button
                className="flex-1 bg-primary text-primary-foreground gap-2"
                onClick={downloadVideo}
              >
                <Download className="w-4 h-4" /> Descargar
              </Button>
            ) : (
              <Button
                className="flex-1 bg-primary text-primary-foreground gap-2"
                onClick={handleGenerate}
                disabled={generateVideo.isPending || mediaUrls.length < 2}
              >
                {generateVideo.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Film className="w-4 h-4" /> Generar Video
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
