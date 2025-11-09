"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Utensils, Calculator, Droplets, Apple, Beef, Clock } from "lucide-react";
import { CreateMealPlanForm } from "@/components/meal-plan/create-meal-plan-form";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface MealMacros {
  protein: string;
  fat: string;
  carbs: string;
}

interface Meal {
  mealnumber: number;
  name: string;
  recipee: string;
  mealMacros: MealMacros;
}

interface DayPlan {
  dayNumber: number;
  meals: Meal[];
}

interface MealPlanData {
  calories: string;
  dailyMacros: MealMacros;
  days: DayPlan[];
}

interface MealPlanResponse {
  _id: string;
  coach_id: string;
  mentee_id: string;
  created_at: string;
  mealPlan: MealPlanData;
}

interface MenteeInfo {
  _id: string;
  user_id: string;
  name: string;
  last_name: string;
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

export default function MealPlanPage() {
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [menteeInfo, setMenteeInfo] = useState<MenteeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const id = params.id as string;
  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    if (!isMounted.current) return;

    setIsLoading(true);
    try {
      const menteeResponse = await api.get(`/mentees/info/${id}`);
      if (isMounted.current) {
        setMenteeInfo(menteeResponse.data.data);
      }

      try {
        const response = await api.get(`/meal-plans/mentee/${id}`);
        if (isMounted.current) {
          setMealPlan(response.data.data);
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          if (isMounted.current) setMealPlan(null);
        } else {
          console.error("Failed to fetch meal plan:", error);
          if (isMounted.current) {
            toast.error("Error al cargar el plan de alimentación");
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar información:", error);
      if (isMounted.current) {
        toast.error("Error al cargar la información del alumno");
        router.push("/dashboard");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || user?.role !== "coach") {
      router.push("/dashboard");
      return;
    }

    if (!id) {
      router.push("/dashboard");
      return;
    }

    if (!hasInitialized) {
      fetchData();
      setHasInitialized(true);
    }
  }, [authLoading, isAuthenticated, user?.role, id, hasInitialized, fetchData, router]);

  const handlePlanCreated = () => {
    fetchData();
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const hasMealPlan = menteeInfo?.userPlans?.mealPlan?.active || false;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push(`/dashboard/mentee-details/${id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al perfil
          </Button>
          <h1 className="text-3xl font-bold">Plan de Alimentación</h1>
          <p className="text-muted-foreground mt-2">
            {menteeInfo?.name} {menteeInfo?.last_name}
          </p>
        </div>

        {/* Botones escritorio */}
        <div className="hidden sm:flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/mentee-details/${id}/macros-calculator`)}
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calcular Macros
          </Button>
          {menteeInfo && (
            <CreateMealPlanForm
              menteeId={id}
              menteeName={`${menteeInfo.name} ${menteeInfo.last_name}`}
              onPlanCreated={handlePlanCreated}
            />
          )}
        </div>
      </div>

      {/* Botones móvil */}
      <div className="flex flex-col gap-2 mt-4 sm:hidden">
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/mentee-details/${id}/macros-calculator`)}
        >
          <Calculator className="mr-2 h-4 w-4" />
          Calcular Macros
        </Button>
        {menteeInfo && (
          <CreateMealPlanForm
            menteeId={id}
            menteeName={`${menteeInfo.name} ${menteeInfo.last_name}`}
            onPlanCreated={handlePlanCreated}
          />
        )}
      </div>

      {/* Resto del contenido */}
      {!mealPlan ? (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Utensils className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No hay Plan de Alimentación Disponible
              </h3>
              <p className="text-muted-foreground mb-6">
                Primero debes calcular los macronutrientes del alumno,<br />
                luego podrás crear un plan de alimentación personalizado.
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/mentee-details/${id}/macros-calculator`)}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular Macros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Daily Requirements Card */}
          <Card className="mt-6 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Requerimientos Diarios
              </CardTitle>
              <CardDescription>
                Objetivos nutricionales calculados para el alumno
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{mealPlan.mealPlan.calories}</span>
                    <span className="text-sm text-muted-foreground">kcal</span>
                  </div>
                  <div className="h-8 w-px bg-border hidden md:block" />
                </div>

                <div className="flex gap-4 flex-wrap justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    <Beef className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{mealPlan.mealPlan.dailyMacros.protein}</span>
                    <span className="text-sm text-muted-foreground">proteína</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{mealPlan.mealPlan.dailyMacros.fat}</span>
                    <span className="text-sm text-muted-foreground">grasa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Apple className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{mealPlan.mealPlan.dailyMacros.carbs}</span>
                    <span className="text-sm text-muted-foreground">carbohidratos</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Meals */}
          <Card>
            <CardHeader>
              <CardTitle>Comidas Diarias</CardTitle>
              <CardDescription>
                Plan de alimentación para {mealPlan.mealPlan.days.length} días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="1" className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                  {mealPlan.mealPlan.days.map((day) => (
                    <TabsTrigger key={day.dayNumber} value={day.dayNumber.toString()}>
                      Día {day.dayNumber}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {mealPlan.mealPlan.days.map((day) => (
                  <TabsContent key={day.dayNumber} value={day.dayNumber.toString()}>
                    <div className="space-y-6">
                      {day.meals.map((meal) => (
                        <Card key={meal.mealnumber}>
                          <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-center gap-2">
                                <Badge variant="outline" className="w-fit">
                                  Comida {meal.mealnumber}
                                </Badge>
                                <span className="mt-1 sm:mt-0">{meal.name}</span>
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">{meal.recipee}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Beef className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium">{meal.mealMacros.protein}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Droplets className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium">{meal.mealMacros.fat}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Apple className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium">{meal.mealMacros.carbs}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Metadata */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Clock className="inline-block h-3 w-3 mr-1" />
            Plan creado el {new Date(mealPlan.created_at).toLocaleDateString('es-ES')}
          </div>
        </>
      )}
    </div>
  );
}
