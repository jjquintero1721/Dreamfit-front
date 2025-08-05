"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, Loader2, Save, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const formSchema = z.object({
  weight: z.string().min(1, "El peso es requerido"),
  activityFactor: z.number().min(1.0).max(1.9),
  objective: z.enum(["bulking", "cutting", "maintenance"]),
  proteinFactor: z.number().min(1.0).max(3.0),
  fatFactor: z.number().min(0.6).max(6.0),
});

type FormData = z.infer<typeof formSchema>;

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

interface CalculationResult {
  bmr: number;
  tdee: number;
  final_calories: number;
  protein_grams: number;
  protein_calories: number;
  fat_grams: number;
  fat_calories: number;
  carbs_grams: number;
  carbs_calories: number;
  macronutrients: MacronutrientsData;
}

interface MacrosCalculatorFormProps {
  menteeId: string;
  menteeName: string;
  currentMacros: MacronutrientsData | null;
  onCalculationComplete?: (macros: MacronutrientsData) => void;
}

export function MacrosCalculatorForm({
  menteeId,
  menteeName,
  currentMacros,
  onCalculationComplete,
}: MacrosCalculatorFormProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showForm, setShowForm] = useState(!currentMacros);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: "",
      activityFactor: 1.6,
      objective: "maintenance",
      proteinFactor: 2.0,
      fatFactor: 1.0,
    },
  });

  // Si hay macros actuales, construir el resultado para mostrar
  useEffect(() => {
    if (currentMacros && !result) {
      // Parse the values to create a display result
      const calories = parseInt(currentMacros.calories);
      const proteinGrams = parseInt(currentMacros.macros.protein);
      const fatGrams = parseInt(currentMacros.macros.fat);
      const carbsGrams = parseInt(currentMacros.macros.carbs);

      setResult({
        bmr: 0, // These values are not stored, so we can't show them
        tdee: 0,
        final_calories: calories,
        protein_grams: proteinGrams,
        protein_calories: proteinGrams * 4,
        fat_grams: fatGrams,
        fat_calories: fatGrams * 9,
        carbs_grams: carbsGrams,
        carbs_calories: carbsGrams * 4,
        macronutrients: currentMacros,
      });
    }
  }, [currentMacros, result]);

  const onSubmit = async (data: FormData) => {
    setIsCalculating(true);
    try {
      const response = await api.post("/macronutrients/calculate", {
        mentee_id: menteeId,
        weight: parseFloat(data.weight),
        activity_factor: data.activityFactor,
        objective: data.objective,
        protein_factor: data.proteinFactor,
        fat_factor: data.fatFactor,
      });

      const calculationResult = response.data.data.calculation;
      setResult(calculationResult);
      setShowForm(false);
      toast.success("Macronutrientes calculados y guardados exitosamente");
      onCalculationComplete?.(calculationResult.macronutrients);
    } catch (error) {
      console.error("Error al calcular macronutrientes:", error);
      toast.error("Error al calcular los macronutrientes");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculadora de Macronutrientes
            </CardTitle>
            <CardDescription>
              {result ?
                `Macronutrientes actuales de ${menteeName}` :
                `Ingresa los datos para calcular los macronutrientes de ${menteeName}`
              }
            </CardDescription>
          </div>
          {result && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(true);
                form.reset();
              }}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recalcular
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Weight Input */}
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="80"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Peso actual del alumno en kilogramos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Activity Factor */}
              <FormField
                control={form.control}
                name="activityFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factor de Actividad: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={1.0}
                        max={1.9}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Nivel de actividad física del alumno (1.0 = Sedentario, 1.9 = Muy activo)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Objective */}
              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un objetivo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bulking">Volumen (+20% cal)</SelectItem>
                        <SelectItem value="cutting">Definición (-20% cal)</SelectItem>
                        <SelectItem value="maintenance">Mantenimiento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Objetivo actual del plan nutricional
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Protein Factor */}
              <FormField
                control={form.control}
                name="proteinFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factor de Proteína: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={1.0}
                        max={3.0}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Gramos de proteína por kg de peso corporal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fat Factor */}
              <FormField
                control={form.control}
                name="fatFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factor de Grasa: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={0.6}
                        max={6.0}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Gramos de grasa por kg de peso corporal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isCalculating}>
                {isCalculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Calcular Macronutrientes
                  </>
                )}
              </Button>
            </form>
          </Form>
        ) : null}

        {/* Results Display */}
        {result && (
          <div className={showForm ? "mt-8 space-y-6" : "space-y-6"}>
            {showForm && <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Resultados del Cálculo</h3>
            </div>}

            {/* Summary Card - Responsive Grid */}
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
                  {/* Calories - Full width on mobile */}
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-3xl sm:text-2xl font-bold">{result.final_calories}</p>
                    <p className="text-sm text-muted-foreground mt-1">Calorías Diarias</p>
                  </div>
                  {/* Protein */}
                  <div className="col-span-1 md:col-span-1">
                    <p className="text-2xl sm:text-2xl font-bold">{result.protein_grams}g</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Proteína</p>
                  </div>
                  {/* Fat */}
                  <div className="col-span-1 md:col-span-1">
                    <p className="text-2xl sm:text-2xl font-bold">{result.fat_grams}g</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Grasa</p>
                  </div>
                  {/* Carbs - Full width on mobile */}
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-2xl sm:text-2xl font-bold">{result.carbs_grams}g</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Carbohidratos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Breakdown - Only show when we have full calculation data */}
            {result.bmr > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Metabolismo Basal (BMR)</p>
                      <p className="text-xl font-semibold">{result.bmr} kcal</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Gasto Energético Total (TDEE)</p>
                      <p className="text-xl font-semibold">{result.tdee} kcal</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Distribution Card - Better mobile spacing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Distribución de Macronutrientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm font-medium">Proteína</span>
                  <span className="text-sm font-medium text-right">
                    <span className="block sm:inline">{result.protein_grams}g</span>
                    <span className="text-xs text-muted-foreground sm:text-sm sm:ml-1">({result.protein_calories} kcal)</span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm font-medium">Grasa</span>
                  <span className="text-sm font-medium text-right">
                    <span className="block sm:inline">{result.fat_grams}g</span>
                    <span className="text-xs text-muted-foreground sm:text-sm sm:ml-1">({result.fat_calories} kcal)</span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm font-medium">Carbohidratos</span>
                  <span className="text-sm font-medium text-right">
                    <span className="block sm:inline">{result.carbs_grams}g</span>
                    <span className="text-xs text-muted-foreground sm:text-sm sm:ml-1">({result.carbs_calories} kcal)</span>
                  </span>
                </div>
              </CardContent>
            </Card>

            {showForm && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                <Save className="h-4 w-4 flex-shrink-0" />
                <span>Los resultados han sido guardados exitosamente</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}