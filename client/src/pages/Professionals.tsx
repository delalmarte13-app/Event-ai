import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Star, Loader2, Plus, Search, MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const categoryLabels: Record<string, string> = {
  photographer: "📸 Fotógrafo",
  videographer: "🎥 Videógrafo",
  catering: "🍽️ Catering",
  florist: "🌸 Florista",
  decoration: "🎨 Decoración",
  venue: "🏢 Venue",
  music: "🎵 Música",
  other: "🎉 Otro",
};

export default function Professionals() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");

  const { data: professionals, isLoading } = trpc.professionals.list.useQuery();

  const filtered = (professionals ?? []).filter((p: any) =>
    p.businessName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="container py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold">Profesionales</h1>
            <p className="text-muted-foreground mt-1">Encuentra los mejores proveedores para tu evento</p>
          </div>
          {isAuthenticated && (
            <Link href="/professionals/register">
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Registrarse
              </Button>
            </Link>
          )}
        </div>

        <div className="mb-6">
          <Input
            placeholder="Buscar profesionales..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron profesionales</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((prof: any) => (
              <div key={prof.id} className="glass-card rounded-2xl p-6 hover:border-primary/25 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{prof.businessName}</h3>
                    <Badge className="mt-2">{categoryLabels[prof.category] || prof.category}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold">4.8</span>
                  </div>
                </div>

                {prof.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{prof.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  {prof.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {prof.location}
                    </div>
                  )}
                  {prof.contactPhone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {prof.contactPhone}
                    </div>
                  )}
                </div>

                <Button variant="outline" className="w-full">
                  Ver perfil
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
