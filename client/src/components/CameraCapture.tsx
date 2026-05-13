import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Camera,
  Video,
  RotateCw,
  Loader2,
} from "lucide-react";

interface CameraCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (data: { type: "photo" | "video"; blob: Blob; mimeType: string }) => void;
}

export default function CameraCapture({
  open,
  onOpenChange,
  onCapture,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<"photo" | "video">("photo");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    if (!open) {
      stopCamera();
      return;
    }

    const initCamera = async () => {
      try {
        setIsLoading(true);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: mode === "video",
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Camera error:", err);
        toast.error("No se pudo acceder a la cámara");
        onOpenChange(false);
        setIsLoading(false);
      }
    };

    initCamera();
  }, [open, facingMode, mode, onOpenChange]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          onCapture({
            type: "photo",
            blob,
            mimeType: "image/jpeg",
          });
          toast.success("Foto capturada");
          onOpenChange(false);
        }
      },
      "image/jpeg",
      0.95
    );
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const chunks: Blob[] = [];
    let mimeType = "video/webm";

    const possibleTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];

    for (const type of possibleTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }

    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      onCapture({
        type: "video",
        blob,
        mimeType,
      });
      toast.success("Video capturado");
      onOpenChange(false);
      setIsRecording(false);
      setRecordingTime(0);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);

    const interval = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 300) {
          stopRecording();
          clearInterval(interval);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleCamera = () => {
    setFacingMode(facingMode === "user" ? "environment" : "user");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Capturar {mode === "photo" ? "foto" : "video"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full rounded-lg bg-black aspect-video object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-2 justify-center flex-wrap">
                <Button
                  variant={mode === "photo" ? "default" : "outline"}
                  onClick={() => setMode("photo")}
                  className="gap-2"
                >
                  <Camera className="w-4 h-4" /> Foto
                </Button>

                <Button
                  variant={mode === "video" ? "default" : "outline"}
                  onClick={() => setMode("video")}
                  className="gap-2"
                >
                  <Video className="w-4 h-4" /> Video
                </Button>

                <Button
                  onClick={toggleCamera}
                  variant="outline"
                  className="gap-2"
                >
                  <RotateCw className="w-4 h-4" /> Cambiar
                </Button>
              </div>

              <div className="flex gap-2 justify-center">
                {mode === "photo" ? (
                  <Button
                    onClick={capturePhoto}
                    className="gap-2 bg-primary text-primary-foreground"
                  >
                    <Camera className="w-4 h-4" /> Capturar
                  </Button>
                ) : !isRecording ? (
                  <Button
                    onClick={startRecording}
                    variant="destructive"
                    className="gap-2"
                  >
                    <Video className="w-4 h-4" /> Grabar
                  </Button>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground py-2">
                      {recordingTime}s
                    </span>
                    <Button
                      onClick={stopRecording}
                      variant="secondary"
                      className="gap-2"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" /> Detener
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
