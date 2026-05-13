import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CalendarDays,
  MapPin,
  Users,
  Camera,
  MessageSquare,
  BookOpen,
  Copy,
  Loader2,
  ArrowLeft,
  Globe,
  Lock,
  Wand2,
  Upload,
  MessageCircle,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { useState, useRef } from "react";
import EventGallery from "@/components/EventGallery";
import EventChat from "@/components/EventChat";
import EventAlbums from "@/components/EventAlbums";

const eventTypeLabels: Record<string, string> = {
  wedding: "💍 Boda",
  birthday: "🎂 Cumpleaños",
  reunion: "🤝 Reunión",
  concert: "🎵 Concierto",
  trip: "✈️ Viaje",
  corporate: "🏢 Corporativo",
  life: "👶 Life Event",
  other: "🎉 Otro",
};

export default function EventDetail() {
  const params = useParams<{ id: string }>();
  const eventId = parseInt(params.id ?? "0");
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("gallery");

  const { data: event, isLoading } = trpc.events.getById.useQuery(
    { id: eventId },
    { enabled: !!eventId }
  );

  const copyInviteCode = () => {
    if (event?.inviteCode) {
      navigator.clipboard.writeText(event.inviteCode);
      toast.success("Código copiado al portapapeles");
    }
  };

  const shareViaWhatsApp = () => {
    if (event?.inviteCode) {
      const appUrl = `${window.location.origin}/events/join?code=${event.inviteCode}`;
      const message = `¡Hola! Te invito al evento "${event.title}" en EventAI. 🎉\n\nUnete aquí: ${appUrl}\n\nO usa el código: ${event.inviteCode}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <CalendarDays className="w-12 h-12 text-muted-foreground" />
          <h2 className="text-xl font-serif font-semibold">Evento no encontrado</h2>
          <p className="text-muted-foreground">
            Este evento no existe o no tienes acceso a él
          </p>
          <Link href="/events">
            <Button variant="outline">Ver todos los eventos</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isOrganizer = user?.id === event.organizerId;
  const isParticipant = isAuthenticated && isOrganizer;

  return (
    <AppLayout>
      <div className="container py-8">
        {/* Back */}
        <Link href="/events">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Volver a eventos
          </Button>
        </Link>

        {/* Event header */}
        <div className="glass-card rounded-2xl overflow-hidden mb-8">
          {/* Cover */}
          <div className="h-48 sm:h-64 bg-gradient-to-br from-primary/15 to-violet-500/15 relative">
            {event.coverImageUrl && (
              <img
                src={event.coverImageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
              <div>
                <Badge className={`mb-2 text-xs`}>
                  {eventTypeLabels[event.eventType] ?? event.eventType}
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white drop-shadow-lg">
                  {event.title}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {event.isPublic ? (
                  <Badge className="bg-background/80 backdrop-blur gap-1 border-border/50">
                    <Globe className="w-3 h-3" /> Público
                  </Badge>
                ) : (
                  <Badge className="bg-background/80 backdrop-blur gap-1 border-border/50">
                    <Lock className="w-3 h-3" /> Privado
                  </Badge>
                )}
                <Badge
                  className={`bg-background/80 backdrop-blur border-border/50 ${
                    event.status === "active"
                      ? "text-emerald-400"
                      : event.status === "ended"
                      ? "text-muted-foreground"
                      : "text-amber-400"
                  }`}
                >
                  {event.status === "active"
                    ? "Activo"
                    : event.status === "ended"
                    ? "Finalizado"
                    : "Borrador"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Info bar */}
          <div className="p-6">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              {event.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  {event.location}
                </span>
              )}
              {event.startDate && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  {new Date(event.startDate).toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}

            </div>

            {event.description && (
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {event.description}
              </p>
            )}



            {/* Invite code */}
            {isOrganizer && event.inviteCode && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Código de invitación</p>
                  <p className="font-mono font-bold text-primary tracking-widest text-lg">
                    {event.inviteCode}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyInviteCode}
                    className="gap-2 border-border/60"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copiar
                  </Button>
                  <Button
                    size="sm"
                    onClick={shareViaWhatsApp}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        {isParticipant || isOrganizer ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-card border border-border/50 mb-6">
              <TabsTrigger value="gallery" className="gap-2">
                <Camera className="w-4 h-4" /> Galería
              </TabsTrigger>
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="w-4 h-4" /> Chat
              </TabsTrigger>
              <TabsTrigger value="albums" className="gap-2">
                <BookOpen className="w-4 h-4" /> Álbumes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gallery">
              <EventGallery eventId={eventId} isParticipant={true} />
            </TabsContent>
            <TabsContent value="chat">
              <EventChat eventId={eventId} />
            </TabsContent>
            <TabsContent value="albums">
              <EventAlbums eventId={eventId} isOrganizer={isOrganizer} eventTitle={event.title} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="glass-card rounded-2xl p-10 text-center">
            <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold mb-2">Contenido privado</h3>
            <p className="text-muted-foreground mb-6">
              Necesitas ser participante del evento para ver la galería y el chat
            </p>
            {!isAuthenticated && (
              <Button
                className="bg-primary text-primary-foreground"
                onClick={() => (window.location.href = "/events/join")}
              >
                Unirse con código
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
