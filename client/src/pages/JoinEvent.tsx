import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Users, Loader2, Key, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useLocation, Link } from "wouter";

export default function JoinEvent() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [code, setCode] = useState("");

  const joinEvent = trpc.events.joinByCode.useMutation({
    onSuccess: (data) => {
      toast.success("¡Te has unido al evento!");
      navigate(`/events/${data.eventId}`);
    },
    onError: (err) => toast.error(err.message ?? "Código inválido"),
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Inicia sesión para unirte a eventos</p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>Iniciar sesión</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-10 max-w-md mx-auto">
        <Link href="/events">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Button>
        </Link>

        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold mb-2">Unirse a un evento</h1>
          <p className="text-muted-foreground mb-8">
            Introduce el código de invitación que te ha compartido el organizador
          </p>

          <div className="space-y-4">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej: ABC12345"
              className="bg-input border-border/60 text-center text-xl font-mono tracking-widest uppercase h-14"
              maxLength={8}
            />
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 gap-2 text-base"
              onClick={() => joinEvent.mutate({ inviteCode: code })}
              disabled={code.length < 6 || joinEvent.isPending}
            >
              {joinEvent.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Users className="w-5 h-5" /> Unirme al evento
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
