"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Utensils, Calculator } from "lucide-react";
import { toast } from "sonner";

export default function MealPlanPage() {
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const id = params.id as string;

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "coach") {
      router.push("/dashboard");
      return;
    }

    if (!id) {
      router.push("/dashboard");
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, id, router]);

  const handleCreateMealPlan = () => {
    toast.info("Actualmente estamos trabajando en esta funcionalidad", {
      description: "¡La creación de planes de alimentación estará disponible pronto!",
    });
  };

  const handleCalculateMacros = () => {
    router.push(`/dashboard/mentee-details/${id}/macros-calculator`);
  };

  if (!isAuthenticated || user?.role !== "coach") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Botón volver */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push(`/dashboard/mentee-details/${id}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a Detalles del Alumno
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Plan de Alimentación</h1>
        <p className="text-muted-foreground mt-2">
          Visualiza y gestiona el plan de alimentación de tu alumno
        </p>
      </div>

      {/* Botón Calcular Macros */}
      <Card className="mb-8 border-blue-200 dark:border-blue-500/20 transition-transform hover:scale-[1.02]">
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calcular Macronutrientes
            </CardTitle>
            <CardDescription>
              Calcula o recalcula los macronutrientes ideales para tu alumno
            </CardDescription>
          </div>
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleCalculateMacros}
          >
            Calcular Macros
          </Button>
        </CardContent>
      </Card>


      {/* Card Crear Plan */}
      <Card className="border-dashed transition-transform hover:scale-[1.02]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            No hay Plan de Alimentación Aún
          </CardTitle>
          <CardDescription>
            Crea un plan de alimentación personalizado para tu alumno
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <Button
            size="lg"
            className="gap-2"
            onClick={handleCreateMealPlan}
          >
            <Plus className="h-5 w-5" />
            Crear Plan de Alimentación
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
