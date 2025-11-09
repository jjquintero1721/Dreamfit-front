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
import { ArrowLeft, Calculator, Info } from "lucide-react";
import { MacrosCalculatorForm } from "@/components/macros/macros-calculator-form";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface MenteeInfo {
  _id: string;
  user_id: string;
  name: string;
  last_name: string;
  height: {
    value: number;
    units: string;
  };
  weight?: {
    value: number;
    units: string;
  };
  userPlans?: {
    mealPlan: {
      active: boolean;
      planId: string;
    };
    workoutsPlan: {
      active: boolean;
      planId: string;
    };
  };
}

interface MacronutrientsData {
  id: string;
  calories: string;
  macros: {
    protein: string;
    fat: string;
    carbs: string;
  };
  created_at: string;
}

interface WeightRecord {
  value: number;
  date: string;
  units: string;
}

export default function MacrosCalculatorPage() {
  const [menteeInfo, setMenteeInfo] = useState<MenteeInfo | null>(null);
  const [currentMacros, setCurrentMacros] = useState<MacronutrientsData | null>(null);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
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

    const fetchData = async () => {
      try {
        const menteeResponse = await api.get(`/mentees/info/${id}`);
        setMenteeInfo(menteeResponse.data.data);

        try {
          const weightResponse = await api.get(`/physical-data/weight/${id}`);
          const weightRecords: WeightRecord[] = weightResponse.data.data.weightRecords;

          if (weightRecords && weightRecords.length > 0) {
            const latestWeightRecord = weightRecords[0];

            if (latestWeightRecord.units === "lbs") {
              setLatestWeight(latestWeightRecord.value * 0.453592);
            } else {
              setLatestWeight(latestWeightRecord.value);
            }
          } else {
            setLatestWeight(null);
          }
        } catch (weightError) {
          console.log("No se encontraron registros de peso para el alumno");
          setLatestWeight(null);
        }

        try {
          const macrosResponse = await api.get(`/macronutrients/mentee/${id}/latest`);
          setCurrentMacros(macrosResponse.data.data.macronutrients);
        } catch (error) {
          console.log("No previous macros found");
        }
      } catch (error) {
        console.error("Error al cargar información:", error);
        toast.error("No se pudo cargar la información del alumno");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, id, router]);

  const handleCalculationComplete = (newMacros: MacronutrientsData) => {
    setCurrentMacros(newMacros);
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

  const hasMealPlan = menteeInfo?.userPlans?.mealPlan?.active || false;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push(`/dashboard/mentee-details/${id}/meal-plan`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a Planes Alimenticios
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calculadora de Macronutrientes</h1>
        <p className="text-muted-foreground mt-2">
          Calcula los macronutrientes ideales para {menteeInfo?.name} {menteeInfo?.last_name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Form - pasando el peso más reciente y estado del plan */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <MacrosCalculatorForm
            menteeId={id}
            menteeName={`${menteeInfo?.name} ${menteeInfo?.last_name}`}
            currentMacros={currentMacros}
            latestWeight={latestWeight}
            hasMealPlan={hasMealPlan}
            onCalculationComplete={handleCalculationComplete}
          />
        </div>

        {/* Info Card */}
        <div className="space-y-4 order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <Info className="h-4 w-4 lg:h-5 lg:w-5" />
                Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium mb-1 text-sm lg:text-base">¿Cómo funciona?</h4>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  La calculadora utiliza el peso, nivel de actividad y objetivos del alumno para
                  determinar las calorías y macronutrientes óptimos.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-sm lg:text-base">Factores de actividad</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Sedentario: 1.0 - 1.3</li>
                  <li>• Ligeramente activo: 1.3 - 1.5</li>
                  <li>• Moderadamente activo: 1.5 - 1.7</li>
                  <li>• Muy activo: 1.7 - 1.9</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-sm lg:text-base">Objetivos</h4>
                <ul className="text-xs lg:text-sm text-muted-foreground space-y-1">
                  <li>• Volumen: +20% calorías</li>
                  <li>• Definición: -20% calorías</li>
                  <li>• Mantenimiento: sin cambios</li>
                </ul>
              </div>
              {latestWeight && (
                <div className="pt-2 border-t">
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    <span className="font-medium">Peso actual del alumno:</span>{" "}
                    {latestWeight.toFixed(1)} kg
                  </p>
                </div>
              )}
              {hasMealPlan && (
                <div className="pt-2 border-t">
                  <p className="text-xs lg:text-sm text-orange-600 dark:text-orange-400">
                    <span className="font-medium">⚠️ Plan de alimentación activo</span>
                    <br />
                    <span className="text-muted-foreground">
                      Recalcular macros requerirá regenerar el plan
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}