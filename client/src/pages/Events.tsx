import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  CalendarDays,
  MapPin,
  Plus,
  Search,
  Loader2,
  Users,
  Lock,
  Globe,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

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

const eventTypeColors: Record<string, string> = {
  wedding: "bg-rose-400/10 text-rose-400 border-rose-400/20",
  birthday: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  reunion: "bg-sky-400/10 text-sky-400 border-sky-400/20",
  concert: "bg-violet-400/10 text-violet-400 border-violet-400/20",
  trip: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  corporate: "bg-slate-400/10 text-slate-400 border-slate-400/20",
  life: "bg-pink-400/10 text-pink-400 border-pink-400/20",
  other: "bg-muted text-muted-foreground border-border",
};

export default function Events() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");

  const { data: myEvents, isLoading: myLoading } = trpc.events.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: publicEvents, isLoading: publicLoading } = trpc.events.listPublic.useQuery();

  const allEvents = isAuthenticated
    ? (() => {
        const seen = new Set<number>();
        const combined = [];
        // Agregar eventos propios primero
        for (const event of myEvents ?? []) {
          if (!seen.has(event.id)) {
            combined.push(event);
            seen.add(event.id);
          }
        }
        // Agregar eventos públicos que no estén duplicados
        for (const event of publicEvents ?? []) {
          if (!seen.has(event.id)) {
            combined.push(event);
            seen.add(event.id);
          }
        }
        return combined;
      })()
    : publicEvents ?? [];

  const filtered = allEvents.filter((e: any) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.location ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const isLoading = myLoading || publicLoading;

  return (
    <AppLayout>
      <div className="container py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-1">Eventos</h1>
            <p className="text-muted-foreground">
              {isAuthenticated
                ? "Tus eventos y eventos públicos disponibles"
                : "Explora eventos públicos"}
            </p>
          </div>
          {isAuthenticated ? (
            <div className="flex gap-3">
              <Link href="/events/join">
                <Button variant="outline" className="border-border/60 gap-2">
                  <Users className="w-4 h-4" /> Unirse con código
                </Button>
              </Link>
              <Link href="/events/new">
                <Button className="bg-primary text-primary-foreground gap-2">
                  <Plus className="w-4 h-4" /> Crear evento
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              className="bg-primary text-primary-foreground gap-2"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              <Plus className="w-4 h-4" /> Crear evento
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-input border-border/60"
          />
        </div>

        {/* Events grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold mb-2">
              {search ? "Sin resultados" : "No hay eventos"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {search
                ? "Prueba con otro término de búsqueda"
                : isAuthenticated
                ? "Crea tu primer evento y empieza a compartir momentos"
                : "Inicia sesión para crear y ver tus eventos"}
            </p>
            {isAuthenticated && !search && (
              <Link href="/events/new">
                <Button className="bg-primary text-primary-foreground gap-2">
                  <Plus className="w-4 h-4" /> Crear evento
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="glass-card rounded-2xl overflow-hidden hover:border-primary/25 transition-all group cursor-pointer h-full flex flex-col">
                  {/* Cover */}
                  <div className="h-40 bg-gradient-to-br from-primary/10 to-violet-500/10 relative overflow-hidden">
                    {event.coverImageUrl ? (
                      <img
                        src={event.coverImageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CalendarDays className="w-12 h-12 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      {event.isPublic ? (
                        <Badge className="bg-background/80 backdrop-blur text-xs gap-1 border-border/50">
                          <Globe className="w-3 h-3" /> Público
                        </Badge>
                      ) : (
                        <Badge className="bg-background/80 backdrop-blur text-xs gap-1 border-border/50">
                          <Lock className="w-3 h-3" /> Privado
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-serif font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                    </div>

                    <Badge
                      className={`self-start text-xs mb-3 ${eventTypeColors[event.eventType] ?? ""}`}
                    >
                      {eventTypeLabels[event.eventType] ?? event.eventType}
                    </Badge>

                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                        {event.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </span>
                      )}
                      {event.startDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(event.startDate).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
