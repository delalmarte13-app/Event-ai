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
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Sparkles,
  Download,
  Loader2,
  X,
  Zap,
  Palette,
  Focus,
  Contrast,
} from "lucide-react";
import { safeDownload } from "@/lib/downloadHelper";

interface PhotoEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  imageName: string;
}

const editingOptions = [
  { id: "enhance", label: "Mejorar", icon: Sparkles, color: "text-amber-400" },
  { id: "vibrant", label: "Vibrante", icon: Palette, color: "text-rose-400" },
  { id: "focus", label: "Enfocar", icon: Focus, color: "text-sky-400" },
  { id: "contrast", label: "Contraste", icon: Contrast, color: "text-violet-400" },
];

export default function PhotoEditor({
  open,
  onOpenChange,
  imageUrl,
  imageName,
}: PhotoEditorProps) {
  const [selectedOption, setSelectedOption] = useState<string>("enhance");
  const [customPrompt, setCustomPrompt] = useState("");
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);

  const editPhoto = trpc.media.editWithAI.useMutation({
    onSuccess: (data) => {
      setEditedImageUrl(data.editedImageUrl);
      toast.success("Foto editada exitosamente");
    },
    onError: () => toast.error("Error al editar la foto"),
  });

  const handleEdit = () => {
    const prompt = customPrompt || selectedOption;
    editPhoto.mutate({
      imageUrl,
      prompt,
    });
  };

  const downloadEditedImage = () => {
    if (editedImageUrl) {
      safeDownload(editedImageUrl, `edited-${imageName}`);
      toast.success("Imagen descargada");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/60 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Editor de Foto con IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image preview */}
          <div className="rounded-xl overflow-hidden border border-border/50 bg-muted/30">
            <img
              src={editedImageUrl || imageUrl}
              alt="Photo preview"
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>

          {/* Editing options */}
          <div>
            <p className="text-sm font-medium mb-3">Opciones de edición</p>
            <div className="grid grid-cols-2 gap-3">
              {editingOptions.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedOption(id);
                    setCustomPrompt("");
                  }}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    selectedOption === id
                      ? "border-primary bg-primary/10"
                      : "border-border/50 hover:border-primary/50 bg-muted/30"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom prompt */}
          <div>
            <p className="text-sm font-medium mb-2">O describe tu edición</p>
            <Textarea
              value={customPrompt}
              onChange={(e) => {
                setCustomPrompt(e.target.value);
                if (e.target.value) setSelectedOption("");
              }}
              placeholder="Ej: Aumentar saturación, hacer más cálida, mejorar iluminación..."
              rows={2}
              className="bg-input border-border/60 resize-none text-sm"
            />
          </div>

          {/* Status */}
          {editedImageUrl && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 w-fit gap-1.5">
              <Zap className="w-3 h-3" /> Foto editada
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
            {editedImageUrl ? (
              <Button
                className="flex-1 bg-primary text-primary-foreground gap-2"
                onClick={downloadEditedImage}
              >
                <Download className="w-4 h-4" /> Descargar
              </Button>
            ) : (
              <Button
                className="flex-1 bg-primary text-primary-foreground gap-2"
                onClick={handleEdit}
                disabled={editPhoto.isPending || (!selectedOption && !customPrompt)}
              >
                {editPhoto.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Editar con IA
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
