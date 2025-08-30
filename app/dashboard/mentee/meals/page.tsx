"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Utensils, Droplets, Apple, Beef, Clock } from "lucide-react";
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

export default function MealPlanPage() {
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "mentee") {
      router.push("/dashboard");
      return;
    }

    const fetchMealPlan = async () => {
      try {
        const response = await api.get(`/meal-plans/mentee/${user?.id}`);
        setMealPlan(response.data.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setMealPlan(null);
        } else {
          console.error("Failed to fetch meal plan:", error);
          toast.error("Error al cargar el plan de alimentación");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchMealPlan();
    }
  }, [user, router]);

  if (isLoading) {
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

  if (!mealPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tu Plan de Alimentación</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Utensils className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="mt-2 text-lg font-semibold">No hay Plan de Alimentación Disponible</h3>
              <p className="text-muted-foreground">
                Contacta a tu entrenador para obtener un plan de alimentación personalizado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tu Plan de Alimentación</h1>

      {/* Daily Requirements Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Requerimientos Diarios
          </CardTitle>
          <CardDescription>Tus objetivos de nutrición personalizados</CardDescription>
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
          <CardDescription>Tu plan de alimentación para cada día de la semana</CardDescription>
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
                            <span>Proteína:</span>
                            <span className="font-medium">{meal.mealMacros.protein}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3 text-muted-foreground" />
                            <span>Grasa:</span>
                            <span className="font-medium">{meal.mealMacros.fat}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Apple className="h-3 w-3 text-muted-foreground" />
                            <span>Carbohidratos:</span>
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
    </div>
  );
}