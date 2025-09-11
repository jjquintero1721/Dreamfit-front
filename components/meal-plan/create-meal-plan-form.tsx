"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, Utensils, Info, Clock, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const formSchema = z.object({
  days: z.string(),
  meals_per_day: z.string(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateMealPlanFormProps {
  menteeId: string;
  menteeName: string;
  onPlanCreated?: () => void;
}

export function CreateMealPlanForm({
  menteeId,
  menteeName,
  onPlanCreated
}: CreateMealPlanFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      days: "7",
      meals_per_day: "4",
      notes: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsCreating(true);
    try {
      await api.post("/meal-plans", {
        mentee_id: menteeId,
        days: parseInt(data.days),
        meals_per_day: parseInt(data.meals_per_day),
        notes: data.notes || "",
      });

      toast.success("Plan de alimentación creado exitosamente");
      setIsOpen(false);
      form.reset();
      onPlanCreated?.();
    } catch (error: any) {
      console.error("Error al crear plan de alimentación:", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al crear el plan de alimentación");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Crear Plan de Alimentación
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[900px] p-0 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Utensils className="h-5 w-5" />
              Crear Plan de Alimentación
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Genera un plan nutricional personalizado para {menteeName}.
            </DialogDescription>
          </DialogHeader>

          {/* Card informativa - Móvil */}
          <Card className="mt-4 mb-4 sm:hidden border-blue-100 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-blue-900 dark:text-blue-100">Tiempo de Generación</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  El plan se generará usando inteligencia artificial en aproximadamente
                  <span className="font-semibold"> 1-2 minutos</span>.
                </p>
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Se creará un plan personalizado basado en los macronutrientes calculados
                    y las preferencias alimentarias especificadas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6 mt-6">
            {/* Columna del formulario */}
            <div className="space-y-4">
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs sm:text-sm">
                  <strong>Nota:</strong> El plan se generará basándose en los macronutrientes
                  calculados previamente. Asegúrate de haber calculado los macros del alumno
                  antes de crear el plan.
                </AlertDescription>
              </Alert>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Días del plan</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona los días" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                <SelectItem key={day} value={day.toString()}>
                                  {day} {day === 1 ? "día" : "días"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs sm:text-sm">
                            Número de días diferentes en el plan
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meals_per_day"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Comidas por día</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona las comidas" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((meal) => (
                                <SelectItem key={meal} value={meal.toString()}>
                                  {meal} {meal === 1 ? "comida" : "comidas"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs sm:text-sm">
                            Número de comidas diarias
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">
                          Observaciones y restricciones
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ej: Vegetariano, sin gluten, alérgico a frutos secos..."
                            className="min-h-[80px] sm:min-h-[100px] text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Incluye restricciones alimentarias, preferencias, alergias o cualquier
                          información relevante para personalizar el plan.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      disabled={isCreating}
                      className="w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="w-full sm:w-auto"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generando plan...
                        </>
                      ) : (
                        <>
                          <Utensils className="mr-2 h-4 w-4" />
                          Crear Plan
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            {/* Card informativa - Desktop */}
            <div className="hidden lg:block">
              <Card className="sticky top-0 border-blue-100 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-900/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-900 dark:text-blue-100">Tiempo de Generación</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      El plan se generará en aproximadamente
                      <span className="font-semibold"> 1-2 minutos</span>.
                    </p>
                    <div className="border-t border-blue-200 dark:border-blue-700 pt-3">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Se creará un plan personalizado basado en los macronutrientes calculados
                          y las preferencias alimentarias especificadas.
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/70 dark:bg-gray-800/50 rounded-lg p-3 mt-3">
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-2">
                        El plan incluirá:
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                        <li className="flex items-center gap-1">
                          <span className="text-blue-600">•</span> Recetas detalladas
                        </li>
                        <li className="flex items-center gap-1">
                          <span className="text-blue-600">•</span> Macros por comida
                        </li>
                        <li className="flex items-center gap-1">
                          <span className="text-blue-600">•</span> Instrucciones de preparación
                        </li>
                        <li className="flex items-center gap-1">
                          <span className="text-blue-600">•</span> Porciones exactas
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
