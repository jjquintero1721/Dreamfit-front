"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Dumbbell,
  Utensils,
  AlertCircle,
  Scale,
  User,
  Calendar,
  Activity,
  TrendingUp
} from "lucide-react";
import { PhysicalDataDisplay } from "@/components/physical-data/physical-data-display";
import { api } from "@/lib/api";

interface WorkoutPlan {
  active: boolean;
  planId: string;
}

interface MealPlan {
  active: boolean;
  planId: string;
}

interface MenteeInfo {
  _id: string;
  user_id: string;
  name: string;
  last_name: string;
  coach_id: string;
  userPlans: {
    workoutsPlan: WorkoutPlan;
    mealPlan: MealPlan;
  };
  age: number;
  gender: string;
  height: {
    value: number;
    units: string;
  };
  supplements: string[];
  weeklyExerciseFrequency: string;
  activityLevel: string;
}

interface WeightRecord {
  value: number;
  date: string;
  units: string;
}

interface WeightHistoryResponse {
  message: string;
  data: {
    weightRecords: WeightRecord[];
  };
}

export default function CoachMenteeDetails() {
  const [menteeInfo, setMenteeInfo] = useState<MenteeInfo | null>(null);
  const [weightHistory, setWeightHistory] = useState<Array<{ date: string; weight: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWeight, setIsLoadingWeight] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const menteeId = params.id as string;

  useEffect(() => {
    if (user && user.role !== "coach") {
      router.push("/dashboard");
      return;
    }

    if (!menteeId) {
      router.push("/dashboard");
      return;
    }

    const fetchMenteeInfo = async () => {
      try {
        const response = await api.get(`/mentees/info/${menteeId}`);
        setMenteeInfo(response.data.data);
      } catch (error) {
        console.error("Error al cargar información del mentee:", error);
        setError("No se pudo cargar la información del alumno. Por favor, intenta de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchWeightHistory = async () => {
      try {
        const response = await api.get<WeightHistoryResponse>(`/physical-data/weight/${menteeId}`);
        const weightRecords = response.data.data.weightRecords;

        const transformedData = weightRecords.map(record => ({
          date: record.date.split("T")[0],
          weight: record.value,
        }));

        setWeightHistory(transformedData.reverse());
      } catch (error) {
        console.error("Error al cargar historial de peso:", error);
        if (error instanceof Error && !error.message.includes("404")) {
          toast.error("No se pudo cargar el historial de peso.");
        }
      } finally {
        setIsLoadingWeight(false);
      }
    };

    fetchMenteeInfo();
    fetchWeightHistory();
  }, [user, router, menteeId]);

  const handlePlanNavigation = (planType: "workout" | "meal") => {
    if (!menteeInfo) return;

    switch (planType) {
      case "workout":
        router.push(`/dashboard/mentee-details/${menteeId}/workout-plan`);
        break;
      case "meal":
        router.push(`/dashboard/mentee-details/${menteeId}/meal-plan`);
        break;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-lg font-medium">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Intentar de nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {isLoading ? (
            <Skeleton className="h-9 w-64" />
          ) : (
            `${menteeInfo?.name} ${menteeInfo?.last_name}`
          )}
        </h1>
        <p className="text-muted-foreground mt-2">
          Información y progreso del alumno
        </p>
      </div>

      {/* Basic Info Card */}
      <div className="mb-6">
        <Card className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-blue-200 dark:border-blue-500/20">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            ) : menteeInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Edad</p>
                    <p className="font-medium">{menteeInfo.age || "No especificada"} años</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Altura</p>
                    <p className="font-medium">
                      {menteeInfo.height?.value || "No especificada"} {menteeInfo.height?.units || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Actividad</p>
                    <p className="font-medium">{menteeInfo.activityLevel || "No especificado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Frecuencia</p>
                    <p className="font-medium">{menteeInfo.weeklyExerciseFrequency || "No especificada"}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Physical Data Display */}
      {menteeInfo && (
        <div className="mb-6">
          <PhysicalDataDisplay userId={menteeId} variant="coach" />
        </div>
      )}

      {/* Plan Cards with background */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Gestión de Planes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plan de Entrenamiento */}
          <Card
            className="relative overflow-hidden min-h-[280px] cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
            onClick={() => handlePlanNavigation("workout")}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')",
              }}
            >
              <div className="absolute inset-0 bg-black/50" />
            </div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-white">
                <Dumbbell className="h-5 w-5" />
                Plan de Entrenamiento
              </CardTitle>
              <CardDescription className="text-white/90">
                {menteeInfo?.userPlans.workoutsPlan.active
                  ? "Gestionar plan de entrenamiento activo"
                  : "Crear plan de entrenamiento personalizado"}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative mt-auto">
              <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white">
                {menteeInfo?.userPlans.workoutsPlan.active ? "Ver Plan" : "Crear Plan"}
              </Button>
            </CardContent>
          </Card>

          {/* Plan de Alimentación */}
          <Card
            className="relative overflow-hidden min-h-[280px] cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
            onClick={() => handlePlanNavigation("meal")}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070')",
              }}
            >
              <div className="absolute inset-0 bg-black/50" />
            </div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-white">
                <Utensils className="h-5 w-5" />
                Plan de Alimentación
              </CardTitle>
              <CardDescription className="text-white/90">
                {menteeInfo?.userPlans.mealPlan.active
                  ? "Gestionar plan de alimentación activo"
                  : "Crear plan de alimentación personalizado"}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative mt-auto">
              <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white">
                {menteeInfo?.userPlans.mealPlan.active ? "Ver Plan" : "Crear Plan"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weight Progress Chart */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Progreso de Peso
            </CardTitle>
            <CardDescription>Evolución del peso del alumno a lo largo del tiempo</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingWeight ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-full w-full" />
              </div>
            ) : weightHistory.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No hay datos de peso disponibles</p>
                  <p className="text-sm text-muted-foreground">El alumno debe actualizar sus datos físicos</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                    }
                    stroke="hsl(var(--foreground))"
                  />
                  <YAxis
                    domain={["dataMin - 1", "dataMax + 1"]}
                    stroke="hsl(var(--foreground))"
                  />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [`${value} kg`, "Peso"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={2}
                    dot={{ strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
