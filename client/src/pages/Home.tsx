import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import {
  CalendarDays,
  Camera,
  Users,
  MessageSquare,
  Wand2,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { Link } from "wouter";

const features = [
  { icon: CalendarDays, title: "Crea eventos" },
  { icon: Camera, title: "Galería compartida" },
  { icon: Wand2, title: "Álbum con IA" },
  { icon: MessageSquare, title: "Chat privado" },
  { icon: Users, title: "Comunidades" },
  { icon: Briefcase, title: "Profesionales" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <AppLayout>
      <section className="container pt-16 pb-14 sm:pt-24 sm:pb-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 max-w-2xl mx-auto">
          Cada evento, un recuerdo único
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Comparte fotos en vivo y deja que la IA arme el álbum del recuerdo.
        </p>

        {isAuthenticated ? (
          <Link href="/dashboard">
            <Button size="lg" className="h-12 px-8 text-base">
              Ir al dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        ) : (
          <Button
            size="lg"
            className="h-12 px-8 text-base"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Comenzar gratis
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        )}
      </section>

      <section className="container pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {features.map(({ icon: Icon, title }) => (
            <div
              key={title}
              className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 text-center"
            >
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{title}</span>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
