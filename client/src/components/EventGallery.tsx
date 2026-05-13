import { trpc } from "@/lib/trpc";
import PhotoEditor from "./PhotoEditor";
import VideoGenerator from "./VideoGenerator";
import CameraCapture from "./CameraCapture";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Camera,
  Upload,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  ImageIcon,
  X,
  Lock,
  Sparkles,
  Film,
  Video,
} from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

interface Props {
  eventId: number;
  isParticipant: boolean;
}

export default function EventGallery({ eventId, isParticipant }: Props) {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [editPhotoOpen, setEditPhotoOpen] = useState(false);
  const [editPhotoUrl, setEditPhotoUrl] = useState<string>("");
  const [editPhotoName, setEditPhotoName] = useState<string>("");
  const [videoGenOpen, setVideoGenOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: mediaList, isLoading } = trpc.media.listByEvent.useQuery(
    { eventId },
    { enabled: isParticipant, refetchInterval: 10000 }
  );

  const togglePrivacy = trpc.media.togglePrivacy.useMutation({
    onSuccess: () => {
      utils.media.listByEvent.invalidate({ eventId });
      toast.success("Privacidad actualizada");
    },
  });

  const deleteMedia = trpc.media.delete.useMutation({
    onSuccess: () => {
      utils.media.listByEvent.invalidate({ eventId });
      toast.success("Archivo eliminado");
    },
  });

  const uploadMedia = trpc.media.upload.useMutation({
    onSuccess: () => {
      utils.media.listByEvent.invalidate({ eventId });
      toast.success("Archivo subido");
      setUploadProgress((prev) => prev + Math.ceil(100 / selectedFiles.length));
    },
    onError: (err) => {
      toast.error(err.message ?? "Error al subir");
      setUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`${file.name} supera 100MB`);
        return false;
      }
      return true;
    });
    setSelectedFiles(validFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        uploadMedia.mutate({
          eventId,
          fileName: file.name,
          mimeType: file.type,
          base64Data: base64,
          caption: undefined,
          isPrivate: false,
        });
      };
      reader.readAsDataURL(file);
    }

    // Después de que todos se suban
    setTimeout(() => {
      setUploadOpen(false);
      setSelectedFiles([]);
      setUploading(false);
      setUploadProgress(0);
    }, 2000);
  };

  if (!isParticipant) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Galería</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mediaList?.length ?? 0} fotos y videos compartidos
          </p>
        </div>
        <div className="flex gap-2">
          {mediaList && mediaList.length > 0 && (
            <>
              <Button
                onClick={() => setVideoGenOpen(true)}
                variant="outline"
                className="border-border/60 gap-2"
              >
                <Film className="w-4 h-4" /> Video IA
              </Button>
            </>
          )}
          <Button
            onClick={() => setCameraOpen(true)}
            variant="outline"
            className="border-border/60 gap-2"
          >
            <Video className="w-4 h-4" /> Cámara
          </Button>
          <Button
            onClick={() => setUploadOpen(true)}
            className="bg-primary text-primary-foreground gap-2"
          >
            <Upload className="w-4 h-4" /> Subir
          </Button>
        </div>
      </div>

      {/* Gallery grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : mediaList && mediaList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mediaList.map((item) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors">
              {/* Media */}
              <div
                className="aspect-square cursor-pointer bg-black"
                onClick={() => setLightboxUrl(item.url)}
              >
                {item.mediaType === "photo" ? (
                  <img
                    src={item.url}
                    alt={item.caption || "Foto"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-3 opacity-0 group-hover:opacity-100">
                <div className="w-full space-y-2">
                  {item.caption && (
                    <p className="text-xs text-white line-clamp-2">{item.caption}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={item.uploaderAvatar ?? ""} />
                      <AvatarFallback className="text-xs">{item.uploaderName?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-white">{item.uploaderName}</span>
                  </div>

                  {/* Actions */}
                  {user?.id === item.uploaderId && (
                    <div className="flex gap-1 pt-2">
                      {item.mediaType === "photo" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditPhotoOpen(true);
                            setEditPhotoUrl(item.url);
                            setEditPhotoName(item.caption || "foto");
                          }}
                          className="flex-1 text-xs bg-primary/80 hover:bg-primary text-white py-1 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Editar
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePrivacy.mutate({ mediaId: item.id, isPrivate: !item.isPrivate });
                        }}
                        className="flex-1 text-xs bg-muted/80 hover:bg-muted text-foreground py-1 rounded transition-colors flex items-center justify-center gap-1"
                      >
                        {item.isPrivate ? (
                          <>
                            <Eye className="w-3 h-3" /> Pública
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Privada
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMedia.mutate({ mediaId: item.id });
                        }}
                        className="text-xs bg-destructive/80 hover:bg-destructive text-white px-2 py-1 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Private badge */}
              {item.isPrivate && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-background/80 backdrop-blur text-xs gap-1 border-border/50 py-0.5">
                    <Lock className="w-2.5 h-2.5" /> Privada
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-border/50 bg-muted/20 py-12 text-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay fotos ni videos aún</p>
          <p className="text-sm text-muted-foreground mt-1">Sé el primero en compartir un momento</p>
        </div>
      )}

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="bg-card border-border/60 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Subir fotos o videos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {selectedFiles.length > 0 ? (
                <div className="space-y-2">
                  <ImageIcon className="w-8 h-8 text-primary mx-auto" />
                  <p className="text-sm font-medium">{selectedFiles.length} archivo(s) seleccionado(s)</p>
                  <p className="text-xs text-muted-foreground">
                    Tamaño total: {(selectedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Haz clic para seleccionar fotos o videos
                  </p>
                  <p className="text-xs text-muted-foreground">Puedes seleccionar múltiples archivos | Máximo 100MB cada uno</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progreso</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-border/60"
                onClick={() => {
                  setUploadOpen(false);
                  setSelectedFiles([]);
                  setUploadProgress(0);
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Subiendo...
                  </>
                ) : (
                  `Subir ${selectedFiles.length} archivo(s)`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Editor */}
      <PhotoEditor
        open={editPhotoOpen}
        onOpenChange={setEditPhotoOpen}
        imageUrl={editPhotoUrl}
        imageName={editPhotoName}
      />

      {/* Video Generator */}
      <VideoGenerator
        open={videoGenOpen}
        onOpenChange={setVideoGenOpen}
        eventId={eventId}
        eventTitle="Evento"
        mediaUrls={mediaList?.map((m) => m.url) ?? []}
      />

      {/* Camera Capture */}
      <CameraCapture
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onCapture={(data) => {
          const fileName = `capture-${Date.now()}.${data.type === "photo" ? "jpg" : "webm"}`;
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            uploadMedia.mutate({
              eventId,
              fileName,
              mimeType: data.mimeType,
              base64Data: base64,
              caption: `${data.type === "photo" ? "Foto" : "Video"} capturado en vivo`,
              isPrivate: false,
            });
          };
          reader.readAsDataURL(data.blob);
        }}
      />

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={() => setLightboxUrl(null)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={lightboxUrl}
            alt="Vista ampliada"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
