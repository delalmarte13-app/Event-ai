import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import AppLayout from "@/components/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Camera, Loader2, Save, Star, Crown } from "lucide-react";
import { useState, useEffect } from "react";

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");

  const { data: profile, isLoading: profileLoading } = trpc.users.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateProfile = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil actualizado correctamente");
      utils.users.getProfile.invalidate();
    },
    onError: () => toast.error("Error al actualizar el perfil"),
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
      setBio(profile.bio ?? "");
      setInterests(
        profile.interests ? JSON.parse(profile.interests).join(", ") : ""
      );
    }
  }, [profile]);

  if (loading || profileLoading) {
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
          <p className="text-muted-foreground">Inicia sesión para ver tu perfil</p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            Iniciar sesión
          </Button>
        </div>
      </AppLayout>
    );
  }

  const initials = (profile?.name ?? user?.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSave = () => {
    updateProfile.mutate({ name, bio, email });
  };

  return (
    <AppLayout>
      <div className="container py-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-1">Mi Perfil</h1>
          <p className="text-muted-foreground">Personaliza tu presencia en EventAI</p>
        </div>

        {/* Profile card */}
        <div className="glass-card rounded-2xl p-8 mb-6">
          {/* Avatar section */}
          <div className="flex items-start gap-6 mb-8">
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-primary/20">
                <AvatarImage src={profile?.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-serif font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-serif font-semibold">
                  {profile?.name ?? user?.name ?? "Usuario"}
                </h2>
                {profile?.subscriptionTier === "premium" ? (
                  <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                    <Crown className="w-3 h-3" /> Premium
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground gap-1">
                    <Star className="w-3 h-3" /> Free
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Miembro desde{" "}
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("es-ES", {
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="bg-input border-border/60"
                />
              </div>
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input
                  value={user?.email ?? ""}
                  disabled
                  className="bg-muted/50 text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Cuéntanos algo sobre ti..."
                rows={3}
                className="bg-input border-border/60 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Intereses</Label>
              <Input
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="fotografía, viajes, música (separados por comas)"
                className="bg-input border-border/60"
              />
              <p className="text-xs text-muted-foreground">
                Separa tus intereses con comas para que la IA personalice mejor tus recuerdos
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                {updateProfile.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>

        {/* Subscription card */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-semibold mb-1">Plan actual</h3>
              <p className="text-sm text-muted-foreground">
                {profile?.subscriptionTier === "premium"
                  ? "Tienes acceso a todas las funciones premium de EventAI"
                  : "Actualiza a Premium para desbloquear todas las funciones de IA"}
              </p>
            </div>
            {profile?.subscriptionTier !== "premium" && (
              <Button
                variant="outline"
                className="border-primary/40 text-primary hover:bg-primary/10 gap-2 shrink-0"
              >
                <Crown className="w-4 h-4" />
                Actualizar
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
