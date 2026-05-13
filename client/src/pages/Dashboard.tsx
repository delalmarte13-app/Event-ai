import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  CalendarDays,
  Camera,
  Plus,
  Sparkles,
  Users,
  ArrowRight,
  Loader2,
  BookOpen,
  Crown,
  Star,
} from "lucide-react";
import { Link } from "wouter";

const eventTypeLabels: Record<string, string> = {
  wedding: "Boda",
  birthday: "Cumpleaños",
  reunion: "Reunión",
  concert: "Concierto",
  trip: "Viaje",
  corporate: "Corporativo",
  life: "Life Event",
  other: "Otro",
};

const eventTypeColors: Record<string, string> = {
  wedding: "bg-rose-400/10 text-rose-400",
  birthday: "bg-amber-400/10 text-amber-400",
  reunion: "bg-sky-400/10 text-sky-400",
  concert: "bg-violet-400/10 text-violet-400",
  trip: "bg-emerald-400/10 text-emerald-400",
  corporate: "bg-slate-400/10 text-slate-400",
  life: "bg-pink-400/10 text-pink-400",
  other: "bg-muted text-muted-foreground",
};

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: eventsData, isLoading: eventsLoading } = trpc.events.list.useQuery(undefined, {
    enabled: isAuthenticated,
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
          <Sparkles className="w-12 h-12 text-primary" />
          <h2 className="text-2xl font-serif font-bold">Bienvenido a EventAI</h2>
          <p className="text-muted-foreground">Inicia sesión para acceder a tu dashboard</p>
          <Button
            className="bg-primary text-primary-foreground"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Iniciar sesión
          </Button>
        </div>
      </AppLayout>
    );
  }

  const organized = (eventsData ?? []) as any[];
  const participated: any[] = [];
  const totalEvents = organized.length;

  return (
    <AppLayout>
      <div className="container py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-1">
              Hola, {user?.name?.split(" ")[0] ?? "Usuario"} 👋
            </h1>
            <p className="text-muted-foreground">Tu espacio personal en EventAI</p>
          </div>
          <Link href="/events/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-lg">
              <Plus className="w-4 h-4" />
              Crear evento
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            {
              icon: CalendarDays,
              label: "Eventos organizados",
              value: organized.length,
              color: "text-amber-400",
              bg: "bg-amber-400/10",
            },
            {
              icon: Users,
              label: "Eventos participados",
              value: participated.length,
              color: "text-sky-400",
              bg: "bg-sky-400/10",
            },
            {
              icon: Camera,
              label: "Total eventos",
              value: totalEvents,
              color: "text-violet-400",
              bg: "bg-violet-400/10",
            },
            {
              icon: BookOpen,
              label: "Álbumes generados",
              value: 0,
              color: "text-emerald-400",
              bg: "bg-emerald-400/10",
            },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="glass-card rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="text-2xl font-serif font-bold mb-0.5">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* Organized */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-semibold">Mis eventos</h2>
                <Link href="/events">
                  <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                    Ver todos <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              {eventsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : organized.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Aún no has creado ningún evento</p>
                  <Link href="/events/new">
                    <Button size="sm" className="bg-primary text-primary-foreground gap-2">
                      <Plus className="w-4 h-4" /> Crear mi primer evento
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {organized.slice(0, 5).map((event: any) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="glass-card rounded-xl p-4 hover:border-primary/25 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                {event.title}
                              </h3>
                              <Badge
                                className={`text-xs shrink-0 ${eventTypeColors[event.eventType] ?? ""}`}
                              >
                                {eventTypeLabels[event.eventType] ?? event.eventType}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {event.location && <span>📍 {event.location}</span>}
                              {event.startDate && (
                                <span>
                                  📅{" "}
                                  {new Date(event.startDate).toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`shrink-0 text-xs ${
                              event.status === "active"
                                ? "border-emerald-400/30 text-emerald-400"
                                : event.status === "ended"
                                ? "border-muted text-muted-foreground"
                                : "border-amber-400/30 text-amber-400"
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
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Participated */}
            {participated.length > 0 && (
              <div>
                <h2 className="text-xl font-serif font-semibold mb-4">Eventos en los que participo</h2>
                <div className="space-y-3">
                  {participated.slice(0, 3).map((event: any) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="glass-card rounded-xl p-4 hover:border-primary/25 transition-all cursor-pointer group">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                              {event.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {eventTypeLabels[event.eventType] ?? event.eventType}
                            </p>
                          </div>
                          <Badge variant="outline" className="border-sky-400/30 text-sky-400 text-xs">
                            Invitado
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick actions */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-serif font-semibold mb-4">Acciones rápidas</h3>
              <div className="space-y-2">
                <Link href="/events/new">
                  <Button variant="ghost" className="w-full justify-start gap-3 text-sm">
                    <Plus className="w-4 h-4 text-primary" /> Crear evento
                  </Button>
                </Link>
                <Link href="/events/join">
                  <Button variant="ghost" className="w-full justify-start gap-3 text-sm">
                    <Users className="w-4 h-4 text-sky-400" /> Unirse con código
                  </Button>
                </Link>
                <Link href="/communities">
                  <Button variant="ghost" className="w-full justify-start gap-3 text-sm">
                    <Sparkles className="w-4 h-4 text-violet-400" /> Explorar comunidades
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" className="w-full justify-start gap-3 text-sm">
                    <Camera className="w-4 h-4 text-emerald-400" /> Editar perfil
                  </Button>
                </Link>
              </div>
            </div>

            {/* Premium upsell */}
            <div className="glass-card rounded-2xl p-5 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-primary" />
                <h3 className="font-serif font-semibold">EventAI Premium</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Desbloquea álbumes ilimitados, videos personalizados con IA y más opciones de
                personalización.
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground mb-4">
                {[
                  "Álbumes ilimitados con IA",
                  "Videos de recuerdos personalizados",
                  "Comunidades exclusivas",
                  "Soporte prioritario",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <Crown className="w-3.5 h-3.5" /> Actualizar a Premium
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
