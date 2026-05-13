import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";
import {
  Sparkles,
  CalendarDays,
  Camera,
  Users,
  MessageSquare,
  Wand2,
  Star,
  ArrowRight,
  Play,
  Shield,
  Zap,
  Heart,
  Globe,
  Briefcase,
} from "lucide-react";
import { Link } from "wouter";

const features = [
  {
    icon: CalendarDays,
    title: "Crea Eventos Únicos",
    description:
      "Organiza bodas, cumpleaños, reuniones o viajes con todas las herramientas que necesitas. Invita a tus seres queridos con un código único.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: Camera,
    title: "Galería Compartida",
    description:
      "Todos los participantes pueden subir fotos y videos en tiempo real. Una galería viva que crece durante el evento.",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
  {
    icon: Wand2,
    title: "Recuerdos con IA",
    description:
      "Nuestra IA selecciona las mejores imágenes y crea álbumes y videos personalizados automáticamente al finalizar el evento.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: MessageSquare,
    title: "Chat Privado",
    description:
      "Comunícate con todos los participantes del evento en un chat privado exclusivo. Rompe el hielo y conecta.",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    icon: Users,
    title: "Comunidades",
    description:
      "Únete a comunidades temáticas de fotografía, música, viajes y más. Comparte experiencias con personas afines.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Briefcase,
    title: "Área Profesional",
    description:
      "Fotógrafos, caterings, floristas y más pueden publicitar sus servicios y conectar con clientes en cada evento.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
];

const stats = [
  { value: "10K+", label: "Eventos creados" },
  { value: "50K+", label: "Recuerdos generados" },
  { value: "200K+", label: "Fotos compartidas" },
  { value: "99%", label: "Satisfacción" },
];

const eventTypes = [
  { emoji: "💍", label: "Bodas" },
  { emoji: "🎂", label: "Cumpleaños" },
  { emoji: "✈️", label: "Viajes" },
  { emoji: "🎵", label: "Conciertos" },
  { emoji: "🏢", label: "Corporativos" },
  { emoji: "👶", label: "Life Events" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <AppLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge
              variant="outline"
              className="mb-6 border-primary/30 text-primary bg-primary/5 px-4 py-1.5 text-sm font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Inteligencia Artificial para tus momentos
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6">
              Cada evento,{" "}
              <span className="text-gold-gradient">un recuerdo</span>
              <br />
              <span className="italic">único e irrepetible</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              EventAI utiliza inteligencia artificial para crear álbumes y videos personalizados de
              tus eventos. Organiza, comparte y recuerda cada momento especial de una manera
              completamente nueva.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 h-12 text-base shadow-lg gold-glow"
                  >
                    Ir al Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 h-12 text-base shadow-lg gold-glow"
                  onClick={() => (window.location.href = getLoginUrl())}
                >
                  Comenzar gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
              <Link href="/events">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border/60 hover:border-primary/50 h-12 px-8 text-base gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Ver eventos
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Privacidad garantizada
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> IA en tiempo real
              </span>
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" /> Gratis para empezar
              </span>
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Eventos a distancia
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-border/50 bg-card/30 py-12">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl sm:text-4xl font-serif font-bold text-gold-gradient mb-1">
                  {value}
                </div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Event Types ── */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-3">
              Para cada momento especial
            </h2>
            <p className="text-muted-foreground">
              EventAI se adapta a cualquier tipo de evento que quieras recordar
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {eventTypes.map(({ emoji, label }) => (
              <div
                key={label}
                className="glass-card rounded-2xl px-6 py-4 flex items-center gap-3 hover:border-primary/30 transition-all cursor-default"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="font-medium text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-card/20">
        <div className="container">
          <div className="text-center mb-14">
            <Badge
              variant="outline"
              className="mb-4 border-primary/30 text-primary bg-primary/5 px-3 py-1 text-xs"
            >
              Funcionalidades
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Una plataforma completa que combina organización, comunicación y recuerdos con el
              poder de la inteligencia artificial.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <div
                key={title}
                className="glass-card rounded-2xl p-6 hover:border-primary/25 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-lg font-serif font-semibold mb-2 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Highlight ── */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="glass-card rounded-3xl p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="relative grid sm:grid-cols-2 gap-10 items-center">
                <div>
                  <Badge
                    variant="outline"
                    className="mb-4 border-violet-400/30 text-violet-400 bg-violet-400/5 px-3 py-1 text-xs"
                  >
                    <Wand2 className="w-3 h-3 mr-1.5" />
                    IA Generativa
                  </Badge>
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
                    La IA que convierte fotos en{" "}
                    <span className="text-gold-gradient">obras de arte</span>
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Al finalizar el evento, nuestra inteligencia artificial analiza todas las fotos y
                    videos, selecciona los mejores momentos y crea automáticamente un álbum
                    personalizado con descripción narrativa para cada participante.
                  </p>
                  <ul className="space-y-3 text-sm">
                    {[
                      "Selección automática de las mejores fotos",
                      "Descripción narrativa generada por IA",
                      "Álbum personalizado para cada invitado",
                      "Privacidad total: tú controlas qué se incluye",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-muted-foreground">
                        <Star className="w-4 h-4 text-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Calidad de selección", value: 95 },
                    { label: "Satisfacción usuarios", value: 99 },
                    { label: "Tiempo de generación", value: 88 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="text-primary font-semibold">{value}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-amber-300 rounded-full"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-card/20">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
            Empieza a crear recuerdos hoy
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Únete a miles de personas que ya usan EventAI para hacer sus momentos especiales
            verdaderamente únicos.
          </p>
          {!isAuthenticated && (
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-10 h-12 text-base gold-glow"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              Crear mi primer evento
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
