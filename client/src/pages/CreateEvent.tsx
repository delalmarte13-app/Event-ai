import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, CalendarDays, MapPin, Globe, Lock, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useLocation, Link } from "wouter";

const eventTypes = [
  { value: "wedding", label: "💍 Boda" },
  { value: "birthday", label: "🎂 Cumpleaños" },
  { value: "reunion", label: "🤝 Reunión" },
  { value: "concert", label: "🎵 Concierto" },
  { value: "trip", label: "✈️ Viaje" },
  { value: "corporate", label: "🏢 Corporativo" },
  { value: "life", label: "👶 Life Event" },
  { value: "other", label: "🎉 Otro" },
];

export default function CreateEvent() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("other");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [maxAttendees, setMaxAttendees] = useState("");

  const createEvent = trpc.events.create.useMutation({
    onSuccess: (data) => {
      toast.success("¡Evento creado exitosamente!");
      navigate(`/events/${data.id}`);
    },
    onError: (err) => toast.error(err.message ?? "Error al crear el evento"),
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
          <p className="text-muted-foreground">Inicia sesión para crear eventos</p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>Iniciar sesión</Button>
        </div>
      </AppLayout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    createEvent.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      eventType: eventType as any,
      location: location.trim() || undefined,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      isPublic,
    });
  };

  return (
    <AppLayout>
      <div className="container py-10 max-w-2xl mx-auto">
        {/* Back */}
        <Link href="/events">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Volver a eventos
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-1">Crear nuevo evento</h1>
          <p className="text-muted-foreground">
            Configura tu evento y compártelo con quienes quieras
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-serif font-semibold text-lg">Información básica</h2>

            <div className="space-y-2">
              <Label htmlFor="title">Título del evento *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Boda de Ana y Carlos"
                className="bg-input border-border/60"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de evento</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="bg-input border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cuéntanos sobre tu evento..."
                rows={3}
                className="bg-input border-border/60 resize-none"
              />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-serif font-semibold text-lg">Fecha y lugar</h2>

            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="w-4 h-4 inline mr-1" />
                Ubicación
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Madrid, España"
                className="bg-input border-border/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  <CalendarDays className="w-4 h-4 inline mr-1" />
                  Fecha inicio
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-input border-border/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha fin</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-input border-border/60"
                />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-serif font-semibold text-lg">Configuración</h2>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {isPublic ? (
                    <Globe className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                  {isPublic ? "Evento público" : "Evento privado"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPublic
                    ? "Cualquier persona puede ver este evento"
                    : "Solo los invitados con código pueden acceder"}
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAttendees">Máximo de asistentes (opcional)</Label>
              <Input
                id="maxAttendees"
                type="number"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(e.target.value)}
                placeholder="Sin límite"
                min="1"
                className="bg-input border-border/60 max-w-xs"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Link href="/events">
              <Button variant="outline" type="button" className="border-border/60">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createEvent.isPending || !title.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              {createEvent.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CalendarDays className="w-4 h-4" />
              )}
              Crear evento
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
