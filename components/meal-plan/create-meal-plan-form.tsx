// components/meal-plan/create-meal-plan-form.tsx
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
import { Plus, Loader2, Utensils, Info } from "lucide-react";
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
      const response = await api.post("/meal-plans", {
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Crear Plan de Alimentación
          </DialogTitle>
          <DialogDescription>
            Genera un plan nutricional personalizado para {menteeName} usando IA.
          </DialogDescription>
        </DialogHeader>

        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Nota:</strong> El plan se generará basándose en los macronutrientes
            calculados previamente. Asegúrate de haber calculado los macros del alumno
            antes de crear el plan.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días del plan</FormLabel>
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
                    <FormDescription>
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
                    <FormLabel>Comidas por día</FormLabel>
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
                    <FormDescription>
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
                  <FormLabel>Observaciones y restricciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Vegetariano, sin gluten, alérgico a frutos secos, prefiere pollo sobre carne roja, no le gusta el pescado..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Incluye restricciones alimentarias, preferencias, alergias o cualquier
                    información relevante para personalizar el plan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
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
      </DialogContent>
    </Dialog>
  );
}