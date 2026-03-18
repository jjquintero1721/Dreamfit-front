"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { UserProfileForm } from "@/components/user/user-profile-form";
import { PasswordChangeForm } from "@/components/user/password-change-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export default function MyUserPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    fetchUserProfile();
  }, [isAuthenticated, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/user/profile");
      setProfile(response.data.data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error al cargar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (data: { firstName: string; lastName: string }) => {
    try {
      const response = await api.patch("/user/profile", data);
      setProfile(response.data.data);
      toast.success("Perfil actualizado exitosamente");

      // Recargar la sesión para actualizar el nombre en la navbar
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar el perfil");
      throw error;
    }
  };

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      await api.post("/user/change-password", data);
      toast.success("Contraseña actualizada exitosamente");
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.response?.data?.message === "Contraseña actual incorrecta") {
        toast.error("La contraseña actual es incorrecta");
      } else {
        toast.error("Error al cambiar la contraseña");
      }
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Información Personal</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu información personal aquí.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile && (
                  <UserProfileForm
                    initialData={{
                      firstName: profile.first_name,
                      lastName: profile.last_name,
                      email: profile.email,
                    }}
                    onSubmit={handleProfileUpdate}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>
                  Asegúrate de usar una contraseña segura.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PasswordChangeForm onSubmit={handlePasswordChange} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}