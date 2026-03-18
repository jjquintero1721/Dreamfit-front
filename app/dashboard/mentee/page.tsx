"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  MessageCircle,
} from "lucide-react";
import { PhysicalDataForm } from "@/components/mentee/physical-data-form";
import { PhysicalDataDisplay } from "@/components/physical-data/physical-data-display";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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

export default function MenteeDashboard() {
  const [menteeInfo, setMenteeInfo] = useState<MenteeInfo | null>(null);
  const [weightHistory, setWeightHistory] = useState<Array<{ date: string; weight: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWeight, setIsLoadingWeight] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [physicalDataKey, setPhysicalDataKey] = useState(0);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "mentee") {
      router.push("/dashboard");
      return;
    }

    const fetchMenteeInfo = async () => {
      try {
        const response = await api.get(`/mentees/info/${user?.id}`);
        setMenteeInfo(response.data.data);
      } catch (error) {
        console.error("Error al cargar información del mentee:", error);
        setError("No se pudo cargar tu información. Por favor, intenta de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchWeightHistory = async () => {
      try {
        const response = await api.get<WeightHistoryResponse>(`/physical-data/weight/${user?.id}`);
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

    if (user?.id) {
      fetchMenteeInfo();
      fetchWeightHistory();
    }
  }, [user, router]);

  const handlePlanAccess = (planType: "workout" | "meal") => {
    if (!menteeInfo) return;

    if (planType === "workout") {
      if (menteeInfo.userPlans.workoutsPlan.active) {
        router.push(`/dashboard/mentee/workouts`);
      } else {
        toast.error("Por favor contacta a tu entrenador para crear un plan de entrenamiento.");
      }
    } else {
      if (menteeInfo.userPlans.mealPlan.active) {
        router.push(`/dashboard/mentee/meals`);
      } else {
        toast.error("Por favor contacta a tu entrenador para crear un plan de alimentación.");
      }
    }
  };

  const handlePhysicalDataUpdate = () => {
    const fetchWeightHistory = async () => {
      try {
        const response = await api.get<WeightHistoryResponse>(`/physical-data/weight/${user?.id}`);
        const weightRecords = response.data.data.weightRecords;

        const transformedData = weightRecords.map(record => ({
          date: record.date.split("T")[0],
          weight: record.value,
        }));

        setWeightHistory(transformedData.reverse());
      } catch (error) {
        console.error("Error al cargar historial de peso:", error);
      }
    };

    fetchWeightHistory();
    setPhysicalDataKey(prev => prev + 1);
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
            `¡Bienvenido, ${menteeInfo?.name || user?.firstName}!`
          )}
        </h1>
        <p className="text-muted-foreground mt-2">
          Sigue tu progreso y mantente al día con tus objetivos
        </p>
      </div>

      {/* Physical Data Form Card */}
      <div className="mb-6">
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Datos Físicos</CardTitle>
            <CardDescription>
              Mantén tus medidas actualizadas para un mejor seguimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Actualizar Datos Físicos</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-auto w-[calc(100%-2rem)]">
                <PhysicalDataForm
                  menteeInfo={menteeInfo || undefined}
                  onSubmitSuccess={() => {
                    toast.success("¡Datos físicos actualizados exitosamente!");
                    handlePhysicalDataUpdate();
                  }}
                  onClose={() => setIsFormOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Physical Data Display */}
      {user?.id && (
        <div className="mb-8">
          <PhysicalDataDisplay
            key={physicalDataKey}
            userId={user.id}
            variant="mentee"
          />
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card
          className="relative overflow-hidden min-h-[280px] cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
          onClick={() => handlePlanAccess("workout")}
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
                ? "Ver y seguir tus entrenamientos"
                : "No hay plan de entrenamiento disponible"}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative mt-auto">
            {menteeInfo?.userPlans.workoutsPlan.active ? (
              <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-6 text-lg text-white">
                Ver Entrenamientos
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-white/80">
                  Contacta a tu entrenador para comenzar con tu plan de entrenamiento personalizado.
                </p>
                <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-6 text-lg text-white">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Solicitar Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden min-h-[280px] cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
          onClick={() => handlePlanAccess("meal")}
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
                ? "Revisa tus recomendaciones de comida"
                : "No hay plan de alimentación disponible"}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative mt-auto">
            {menteeInfo?.userPlans.mealPlan.active ? (
              <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-6 text-lg text-white">
                Ver Plan de Alimentación
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-white/80">
                  Contacta a tu entrenador para comenzar con tu plan de alimentación personalizado.
                </p>
                <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-6 text-lg text-white">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Solicitar Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weight Progress Chart */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Progreso de Peso
            </CardTitle>
            <CardDescription>
              Sigue los cambios en tu peso a lo largo del tiempo
            </CardDescription>
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
                  <p className="text-lg font-medium text-muted-foreground">
                    No hay datos de peso disponibles
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Actualiza tus datos físicos para comenzar a ver tu progreso
                  </p>
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
