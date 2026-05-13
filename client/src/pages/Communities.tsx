import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  Loader2,
  Lock,
  Globe,
  Crown,
  Camera,
  Music,
  Utensils,
  Plane,
  Dumbbell,
  Cpu,
  Palette,
  Briefcase,
  MoreHorizontal,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { useState } from "react";

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  photography: { label: "Fotografía", icon: Camera, color: "text-amber-400", bg: "bg-amber-400/10" },
  music: { label: "Música", icon: Music, color: "text-violet-400", bg: "bg-violet-400/10" },
  food: { label: "Gastronomía", icon: Utensils, color: "text-orange-400", bg: "bg-orange-400/10" },
  travel: { label: "Viajes", icon: Plane, color: "text-sky-400", bg: "bg-sky-400/10" },
  sports: { label: "Deportes", icon: Dumbbell, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  technology: { label: "Tecnología", icon: Cpu, color: "text-blue-400", bg: "bg-blue-400/10" },
  arts: { label: "Arte", icon: Palette, color: "text-pink-400", bg: "bg-pink-400/10" },
  business: { label: "Negocios", icon: Briefcase, color: "text-slate-400", bg: "bg-slate-400/10" },
  other: { label: "Otro", icon: MoreHorizontal, color: "text-muted-foreground", bg: "bg-muted" },
};

const categories = Object.entries(categoryConfig).map(([value, config]) => ({
  value,
  ...config,
}));

function CommunityCard({ community }: { community: any }) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const cat = categoryConfig[community.category] ?? categoryConfig.other;
  const Icon = cat.icon;

  const membership = null;

  const join = trpc.communities.join.useMutation({
    onSuccess: () => {
      toast.success(`Te has unido a ${community.name}`);
      utils.communities.list.invalidate();
    },
    onError: () => toast.error("Error al unirse a la comunidad"),
  });

  const isMember = false;

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover:border-primary/25 transition-all group">
      {/* Header */}
      <div className="h-28 bg-gradient-to-br from-primary/10 to-violet-500/10 relative">
        {community.coverImageUrl ? (
          <img
            src={community.coverImageUrl}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center`}>
              <Icon className={`w-7 h-7 ${cat.color}`} />
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1.5">
          {community.isPrivate ? (
            <Badge className="bg-background/80 backdrop-blur text-xs gap-1 border-border/50">
              <Lock className="w-2.5 h-2.5" /> Privada
            </Badge>
          ) : (
            <Badge className="bg-background/80 backdrop-blur text-xs gap-1 border-border/50">
              <Globe className="w-2.5 h-2.5" /> Pública
            </Badge>
          )}
          {community.isPaid && (
            <Badge className="bg-primary/80 backdrop-blur text-xs gap-1 border-primary/50 text-primary-foreground">
              <Crown className="w-2.5 h-2.5" /> Premium
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
            {community.name}
          </h3>
          <Badge className={`text-xs shrink-0 ${cat.bg} ${cat.color} border-0`}>
            {cat.label}
          </Badge>
        </div>

        {community.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {community.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            {community.memberCount} miembros
          </span>

          {isAuthenticated && (
            <Button
              size="sm"
              variant={isMember ? "outline" : "default"}
              className={
                isMember
                  ? "border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/40 text-xs h-7 gap-1"
                  : "bg-primary text-primary-foreground text-xs h-7 gap-1"
              }
              onClick={() => join.mutate({ communityId: community.id })}
              disabled={join.isPending}
            >
              {join.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isMember ? (
                <>
                  <UserCheck className="w-3 h-3" /> Miembro
                </>
              ) : (
                <>
                  <UserPlus className="w-3 h-3" /> Unirse
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Communities() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const { data: communities, isLoading } = trpc.communities.list.useQuery();

  const createCommunity = { mutate: () => toast.error("No disponible"), isPending: false };

  const filtered = (communities ?? []).filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="container py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-1">Comunidades</h1>
            <p className="text-muted-foreground">
              Conecta con personas que comparten tus intereses
            </p>
          </div>
          {isAuthenticated ? (
            <Button
              className="bg-primary text-primary-foreground gap-2"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="w-4 h-4" /> Crear comunidad
            </Button>
          ) : (
            <Button
              className="bg-primary text-primary-foreground gap-2"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              <Plus className="w-4 h-4" /> Crear comunidad
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar comunidades..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-input border-border/60"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedCategory === "all" ? "default" : "outline"}
              className={selectedCategory === "all" ? "bg-primary text-primary-foreground" : "border-border/60"}
              onClick={() => setSelectedCategory("all")}
            >
              Todas
            </Button>
            {categories.slice(0, 5).map(({ value, label, icon: Icon, color }) => (
              <Button
                key={value}
                size="sm"
                variant={selectedCategory === value ? "default" : "outline"}
                className={
                  selectedCategory === value
                    ? "bg-primary text-primary-foreground"
                    : "border-border/60 gap-1.5"
                }
                onClick={() => setSelectedCategory(value)}
              >
                <Icon className={`w-3.5 h-3.5 ${selectedCategory !== value ? color : ""}`} />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Communities grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold mb-2">Sin comunidades</h3>
            <p className="text-muted-foreground mb-6">
              {search ? "Prueba con otro término" : "Sé el primero en crear una comunidad"}
            </p>
            {isAuthenticated && (
              <Button
                className="bg-primary text-primary-foreground gap-2"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="w-4 h-4" /> Crear comunidad
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card border-border/60 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Crear comunidad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre de la comunidad *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Fotógrafos de Madrid"
                className="bg-input border-border/60"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="¿De qué trata esta comunidad?"
                rows={3}
                className="bg-input border-border/60 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-input border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Comunidad privada</p>
                  <p className="text-xs text-muted-foreground">Solo por invitación</p>
                </div>
                <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Comunidad de pago</p>
                  <p className="text-xs text-muted-foreground">Requiere suscripción</p>
                </div>
                <Switch checked={isPaid} onCheckedChange={setIsPaid} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-border/60"
                onClick={() => setCreateOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={() => createCommunity.mutate()}
                disabled={createCommunity.isPending || !name.trim()}
              >
                {createCommunity.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Crear"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
