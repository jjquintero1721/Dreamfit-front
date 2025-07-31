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
import { Utensils, Droplets, Apple, Beef } from "lucide-react";

// Mock data - Replace with API call
const MOCK_MEAL_PLAN = {
  plan: {
    calories: "2946",
    dailyMacros: {
      protein: "167g",
      fat: "82g",
      carbs: "358g"
    },
    days: [
      {
        day: 1,
        meals: [
          {
            mealnumber: 1,
            name: "Avena con Proteína en Polvo",
            recipee: "Mezcla 1 scoop de proteína en polvo con 1/2 taza de avena y 1 taza de agua o leche. Cocina en la estufa o en el microondas hasta que espese. Añade frutas frescas o nueces si lo deseas.",
            mealMacros: {
              protein: "30g",
              fat: "8g",
              carbs: "50g"
            }
          },
          {
            mealnumber: 2,
            name: "Ensalada de Pollo a la Parrilla",
            recipee: "Asa 150g de pechuga de pollo hasta que esté completamente cocida. Mézclala con hojas verdes, tomates cherry, pepinos y un aderezo ligero de vinagreta.",
            mealMacros: {
              protein: "35g",
              fat: "12g",
              carbs: "15g"
            }
          },
          {
            mealnumber: 3,
            name: "Wrap de Pavo con Verduras",
            recipee: "Unta hummus en una tortilla de trigo integral, luego añade pavo en rodajas, lechuga, tomate y zanahorias ralladas. Enrolla la tortilla y córtala por la mitad.",
            mealMacros: {
              protein: "40g",
              fat: "10g",
              carbs: "45g"
            }
          },
          {
            mealnumber: 4,
            name: "Salmón con Quinoa",
            recipee: "Hornea 150g de salmón con limón y hierbas. Cocina 1/2 taza de quinoa según las instrucciones del paquete. Sirve el salmón sobre la quinoa con una guarnición de verduras al vapor.",
            mealMacros: {
              protein: "62g",
              fat: "15g",
              carbs: "70g"
            }
          }
        ]
      },
      // ... other days
    ]
  }
};

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
  day: number;
  meals: Meal[];
}

interface MealPlan {
  calories: string;
  dailyMacros: MealMacros;
  days: DayPlan[];
}

export default function MealPlanPage() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "mentee") {
      router.push("/dashboard");
      return;
    }

    // Simulate API call
    const fetchMealPlan = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMealPlan(MOCK_MEAL_PLAN.plan);
      } catch (error) {
        console.error("Failed to fetch meal plan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealPlan();
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
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Utensils className="mx-auto h-12 w-12 text-muted-foreground" />
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
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{mealPlan.calories}</span>
                <span className="text-sm text-muted-foreground">kcal</span>
              </div>
              <div className="h-8 w-px bg-border hidden md:block" />
            </div>
            <div className="flex gap-4 flex-wrap justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <Beef className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{mealPlan.dailyMacros.protein}</span>
                <span className="text-sm text-muted-foreground">proteína</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{mealPlan.dailyMacros.fat}</span>
                <span className="text-sm text-muted-foreground">grasa</span>
              </div>
              <div className="flex items-center gap-2">
                <Apple className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{mealPlan.dailyMacros.carbs}</span>
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
            <TabsList className="w-full justify-start">
              {mealPlan.days.map((day) => (
                <TabsTrigger key={day.day} value={day.day.toString()}>
                  Día {day.day}
                </TabsTrigger>
              ))}
            </TabsList>

            {mealPlan.days.map((day) => (
              <TabsContent key={day.day} value={day.day.toString()}>
                <div className="space-y-6">
                  {day.meals.map((meal) => (
                    <Card key={meal.mealnumber}>
                      <CardHeader>
                        <div className="flex flex-col gap-2">
                          <div className="space-y-1">
                            <CardTitle className="text-xl">
                              {meal.name}
                            </CardTitle>
                            <CardDescription>
                              Comida {meal.mealnumber}
                            </CardDescription>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">
                              {meal.mealMacros.protein} proteína
                            </Badge>
                            <Badge variant="secondary">
                              {meal.mealMacros.fat} grasa
                            </Badge>
                            <Badge variant="secondary">
                              {meal.mealMacros.carbs} carbohidratos
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          {meal.recipee}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}