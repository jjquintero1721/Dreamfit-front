"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import {
  Form,
  FormControl,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

const supplements = [
  { id: "Protein Powder", label: "Protein Powder" },
  { id: "Creatine", label: "Creatine" },
  { id: "BCAAs", label: "BCAAs" },
  { id: "Pre-workout", label: "Pre-workout" },
  { id: "Multivitamins", label: "Multivitamins" },
  { id: "Omega-3", label: "Omega-3" },
] as const;

const physicalDataSchema = z.object({
  age: z.number().gt(0, "La edad debe ser mayor que cero"),
  gender: z.enum(["Male", "Female", ""], { required_error: "Selecciona un género" }),
  weight: z.number().gt(0, "El peso debe ser mayor que cero"),
  weightUnit: z.enum(["kg", "lb"]),
  height: z.number().gt(0, "La altura debe ser mayor que cero"),
  heightUnit: z.enum(["cm", "in"]),
  measurements: z.object({
    chest: z.number().gt(0, "El pecho debe ser mayor que cero"),
    waist: z.number().gt(0, "La cintura debe ser mayor que cero"),
    hips: z.number().gt(0, "La cadera debe ser mayor que cero"),
    leftArm: z.number().gt(0, "El brazo izquierdo debe ser mayor que cero"),
    rightArm: z.number().gt(0, "El brazo derecho debe ser mayor que cero"),
    leftLeg: z.number().gt(0, "La pierna izquierda debe ser mayor que cero"),
    rightLeg: z.number().gt(0, "La pierna derecha debe ser mayor que cero"),
    leftCalf: z.number().gt(0, "La pantorrilla izquierda debe ser mayor que cero"),
    rightCalf: z.number().gt(0, "La pantorrilla derecha debe ser mayor que cero"),
    neck: z.number().gt(0, "El cuello debe ser mayor que cero"),
  }),
  measurementUnit: z.enum(["cm", "in"]),
  supplements: z.array(z.string()),
  exerciseFrequency: z.number().gt(0, "La frecuencia de ejercicio debe ser mayor que cero"),
  activityLevel: z.enum(["Sedentary", "Active"], { required_error: "Selecciona un nivel de actividad" }),
});

type PhysicalDataFormValues = z.infer<typeof physicalDataSchema>;

interface MenteeInfo {
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

interface PhysicalMeasurement {
  value: number;
  units: string;
}

interface DualMeasurement {
  left: PhysicalMeasurement;
  right: PhysicalMeasurement;
}

interface CurrentPhysicalData {
  arm?: DualMeasurement;
  calf?: DualMeasurement;
  leg?: DualMeasurement;
  chest?: PhysicalMeasurement;
  waist?: PhysicalMeasurement;
  hips?: PhysicalMeasurement;
  neck?: PhysicalMeasurement;
}

const formSteps = [
  {
    title: "Información Básica",
    fields: ["age", "gender"],
  },
  {
    title: "Medidas Corporales",
    fields: ["weight", "weightUnit", "height", "heightUnit"],
  },
  {
    title: "Medidas Detalladas",
    fields: ["measurements", "measurementUnit"],
  },
  {
    title: "Estilo de Vida",
    fields: ["supplements", "exerciseFrequency", "activityLevel"],
  },
] as const;

const handleNumericChange = (value: string, onChange: (value: number) => void) => {
  const numValue = parseFloat(value);
  if (!isNaN(numValue) && numValue >= 0) {
    onChange(numValue);
  } else if (value === '') {
    onChange(0);
  }
};

interface PhysicalDataFormProps {
  onSubmitSuccess: () => void;
  onClose: () => void;
  menteeInfo?: MenteeInfo;
}

export function PhysicalDataForm({ onSubmitSuccess, onClose, menteeInfo }: PhysicalDataFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPhysicalData, setCurrentPhysicalData] = useState<CurrentPhysicalData | null>(null);
  const [isLoadingCurrentData, setIsLoadingCurrentData] = useState(true);
  const { user } = useAuth();

  const getExerciseFrequency = (frequency: string): number => {
    const match = frequency.match(/(\d+)/);
    return match ? parseInt(match[1]) : 3;
  };

  const fetchCurrentPhysicalData = async () => {
    if (!user?.id) return;

    setIsLoadingCurrentData(true);
    try {
      const response = await api.get(`/physical-data/${user.id}`);
      setCurrentPhysicalData(response.data.data.measurements);
    } catch (error) {
      console.error("Error fetching current physical data:", error);
      setCurrentPhysicalData(null);
    } finally {
      setIsLoadingCurrentData(false);
    }
  };

  useEffect(() => {
    fetchCurrentPhysicalData();
  }, [user?.id]);

  const getDefaultMeasurements = () => {
    if (!currentPhysicalData) {
      return {
        chest: 90,
        waist: 80,
        hips: 95,
        leftArm: 35,
        rightArm: 35,
        leftLeg: 55,
        rightLeg: 55,
        leftCalf: 35,
        rightCalf: 35,
        neck: 35,
      };
    }

    return {
      chest: currentPhysicalData.chest?.value || 90,
      waist: currentPhysicalData.waist?.value || 80,
      hips: currentPhysicalData.hips?.value || 95,
      leftArm: currentPhysicalData.arm?.left?.value || 35,
      rightArm: currentPhysicalData.arm?.right?.value || 35,
      leftLeg: currentPhysicalData.leg?.left?.value || 55,
      rightLeg: currentPhysicalData.leg?.right?.value || 55,
      leftCalf: currentPhysicalData.calf?.left?.value || 35,
      rightCalf: currentPhysicalData.calf?.right?.value || 35,
      neck: currentPhysicalData.neck?.value || 35,
    };
  };

  const form = useForm<PhysicalDataFormValues>({
    resolver: zodResolver(physicalDataSchema),
    defaultValues: {
      age: menteeInfo?.age || 25,
      gender: (menteeInfo?.gender as "Male" | "Female" | "") || "Male",
      weight: 70,
      weightUnit: "kg",
      height: menteeInfo?.height?.value || 170,
      heightUnit: menteeInfo?.height?.units === "cm" ? "cm" : "in",
      measurements: getDefaultMeasurements(),
      measurementUnit: "cm",
      supplements: menteeInfo?.supplements || [],
      exerciseFrequency: menteeInfo?.weeklyExerciseFrequency ?
        getExerciseFrequency(menteeInfo.weeklyExerciseFrequency) : 3,
      activityLevel: (menteeInfo?.activityLevel as "Sedentary" | "Active") || "Active",
    },
  });

  useEffect(() => {
    if (!isLoadingCurrentData) {
      const defaultMeasurements = getDefaultMeasurements();
      form.setValue("measurements", defaultMeasurements);
    }
  }, [isLoadingCurrentData, currentPhysicalData]);

  const getExerciseFrequencyString = (frequency: number): string => {
    const frequencyMap: { [key: number]: string } = {
      1: "1 day per week",
      2: "2 days per week",
      3: "3 days per week",
      4: "4 days per week",
      5: "5 days per week",
      6: "6 days per week",
      7: "7 days per week"
    };
    return frequencyMap[frequency] || "3 days per week";
  };

  const transformMenteeData = (data: PhysicalDataFormValues) => {
    return {
      age: data.age,
      gender: data.gender,
      height: {
        value: data.height,
        units: data.heightUnit
      },
      supplements: data.supplements,
      weeklyExerciseFrequency: getExerciseFrequencyString(data.exerciseFrequency),
      activityLevel: data.activityLevel
    };
  };

  const transformPhysicalData = (data: PhysicalDataFormValues) => {
    return {
      weight: {
        value: data.weight,
        units: data.weightUnit
      },
      chest: {
        value: data.measurements.chest,
        units: data.measurementUnit
      },
      waist: {
        value: data.measurements.waist,
        units: data.measurementUnit
      },
      hips: {
        value: data.measurements.hips,
        units: data.measurementUnit
      },
      neck: {
        value: data.measurements.neck,
        units: data.measurementUnit
      },
      leg: {
        left: {
          value: data.measurements.leftLeg,
          units: data.measurementUnit
        },
        right: {
          value: data.measurements.rightLeg,
          units: data.measurementUnit
        }
      },
      arms: {
        left: {
          value: data.measurements.leftArm,
          units: data.measurementUnit
        },
        right: {
          value: data.measurements.rightArm,
          units: data.measurementUnit
        }
      },
      calves: {
        left: {
          value: data.measurements.leftCalf,
          units: data.measurementUnit
        },
        right: {
          value: data.measurements.rightCalf,
          units: data.measurementUnit
        }
      }
    };
  };

  const onSubmit = async (data: PhysicalDataFormValues) => {
    if (!user?.id) {
      toast.error("Usuario no encontrado");
      return;
    }

    const formErrors = form.formState.errors;

    if (Object.keys(formErrors).length > 0) {
      const mensajes: string[] = [];

      if (formErrors.age?.message) mensajes.push(formErrors.age.message);
      if (formErrors.gender?.message) mensajes.push(formErrors.gender.message);
      if (formErrors.weight?.message) mensajes.push(formErrors.weight.message);
      if (formErrors.height?.message) mensajes.push(formErrors.height.message);
      if (formErrors.exerciseFrequency?.message) mensajes.push(formErrors.exerciseFrequency.message);
      if (formErrors.activityLevel?.message) mensajes.push(formErrors.activityLevel.message);

      if (formErrors.measurements && typeof formErrors.measurements === "object") {
        Object.entries(formErrors.measurements).forEach(([key, error]) => {
          if (
            error &&
            typeof error === "object" &&
            "message" in error &&
            typeof error.message === "string"
          ) {
            mensajes.push(error.message);
          }
        });
      }

      toast.error("Corrige los siguientes campos:\n• " + mensajes.join("\n• "));
      return;
    }


    const negativeFields = [];
    if (data.age < 0) negativeFields.push("edad");
    if (data.weight < 0) negativeFields.push("peso");
    if (data.height < 0) negativeFields.push("altura");
    if (data.exerciseFrequency < 0) negativeFields.push("frecuencia de ejercicio");

    Object.entries(data.measurements).forEach(([key, value]) => {
      if (value < 0) {
        const fieldNames: { [key: string]: string } = {
          chest: "pecho",
          waist: "cintura",
          hips: "cadera",
          leftArm: "brazo izquierdo",
          rightArm: "brazo derecho",
          leftLeg: "pierna izquierda",
          rightLeg: "pierna derecha",
          leftCalf: "pantorrilla izquierda",
          rightCalf: "pantorrilla derecha",
          neck: "cuello"
        };
        negativeFields.push(fieldNames[key] || key);
      }
    });

    if (negativeFields.length > 0) {
      toast.error(`Los siguientes campos no pueden tener valores negativos: ${negativeFields.join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const menteeData = transformMenteeData(data);
      await api.patch(`/mentees/${user.id}`, menteeData);

      const physicalData = transformPhysicalData(data);
      await api.post(`/mentees/physical-data/${user.id}`, physicalData);

      toast.success("¡Datos físicos actualizados exitosamente!");
      onSubmitSuccess();
    } catch (error: any) {
      console.error("Error al actualizar datos físicos:", error);

      let errorMessage = "Error al actualizar datos físicos. Por favor, intenta de nuevo.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Los datos ingresados no son válidos. Por favor revisa todos los campos.";
      } else if (error.response?.status === 422) {
        errorMessage = "Algunos datos no cumplen con los requisitos del sistema. Por favor verifica todos los campos.";
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (formErrors: typeof form.formState.errors) => {
    const mensajes: string[] = [];

    if (formErrors.age?.message) mensajes.push(String(formErrors.age.message));
    if (formErrors.gender?.message) mensajes.push(String(formErrors.gender.message));
    if (formErrors.weight?.message) mensajes.push(String(formErrors.weight.message));
    if (formErrors.height?.message) mensajes.push(String(formErrors.height.message));
    if (formErrors.exerciseFrequency?.message) mensajes.push(String(formErrors.exerciseFrequency.message));
    if (formErrors.activityLevel?.message) mensajes.push(String(formErrors.activityLevel.message));

    if (formErrors.measurements && typeof formErrors.measurements === "object") {
      Object.entries(formErrors.measurements).forEach(([key, error]) => {
        if (
          error &&
          typeof error === "object" &&
          "message" in error &&
          typeof error.message === "string"
        ) {
          mensajes.push(error.message);
        }
      });
    }

    toast.error("Corrige los siguientes campos:\n• " + mensajes.join("\n• "));
  };


  if (isLoadingCurrentData) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-2">
        {formSteps[currentStep].title}
      </h2>
      {currentPhysicalData && currentStep === 2 && (
        <p className="text-sm text-muted-foreground mb-6">
          Los campos están prellenados con tus medidas más recientes
        </p>
      )}

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {currentStep === 0 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={field.value || ''}
                        onChange={(e) => handleNumericChange(e.target.value, field.onChange)}
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                            e.preventDefault();
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Masculino</SelectItem>
                        <SelectItem value="Female">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={field.value || ''}
                          onChange={(e) => handleNumericChange(e.target.value, field.onChange)}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                              e.preventDefault();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weightUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                          <SelectItem value="lb">Libras (lb)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altura</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={field.value || ''}
                          onChange={(e) => handleNumericChange(e.target.value, field.onChange)}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                              e.preventDefault();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="heightUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cm">Centímetros (cm)</SelectItem>
                          <SelectItem value="in">Pulgadas (in)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Core Measurements */}
              <div className="space-y-4">
                <h3 className="font-medium">Medidas Principales</h3>
                {["chest", "waist", "hips", "neck"].map((part) => (
                  <FormField
                    key={part}
                    control={form.control}
                    name={`measurements.${part as keyof PhysicalDataFormValues["measurements"]}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">
                          {part === "chest" ? "Pecho" :
                           part === "waist" ? "Cintura" :
                           part === "hips" ? "Cadera" :
                           "Cuello"}
                          {currentPhysicalData?.[part as keyof CurrentPhysicalData] &&
                           typeof currentPhysicalData[part as keyof CurrentPhysicalData] === 'object' &&
                           'value' in (currentPhysicalData[part as keyof CurrentPhysicalData] as PhysicalMeasurement) && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (Anterior: {(currentPhysicalData[part as keyof CurrentPhysicalData] as PhysicalMeasurement).value} {(currentPhysicalData[part as keyof CurrentPhysicalData] as PhysicalMeasurement).units})
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={field.value || ''}
                            onChange={(e) => handleNumericChange(e.target.value, field.onChange)}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault();
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {/* Arms Measurements */}
              <div className="space-y-4">
                <h3 className="font-medium">Brazos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="measurements.leftArm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Brazo Izquierdo
                          {currentPhysicalData?.arm?.left && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (Anterior: {currentPhysicalData.arm.left.value} {currentPhysicalData.arm.left.units})
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={field.value || ''}
                            onChange={(e) => handleNumericChange(e.target.value, field.onChange)}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault();
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="measurements.rightArm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Brazo Derecho
                          {currentPhysicalData?.arm?.right && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (Anterior: {currentPhysicalData.arm.right.value} {currentPhysicalData.arm.right.units})
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={field.value || ''}
                            onChange={(e) => handleNumericChange(e.target.value, field.onChange)}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault();
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Legs Measurements */}
              <div className="space-y-4">
                <h3 className="font-medium">Piernas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="measurements.leftLeg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Muslo Izquierdo
                          {currentPhysicalData?.leg?.left && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (Anterior: {currentPhysicalData.leg.left.value} {currentPhysicalData.leg.left.units})
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={field.value || ''}
                            onChange={(e) => handleNumericChange(e.target.value, field.onChange)}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault();
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="measurements.rightLeg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Muslo Derecho
                          {currentPhysicalData?.leg?.right && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (Anterior: {currentPhysicalData.leg.right.value} {currentPhysicalData.leg.right.units})
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={field.value || ''}
                            onChange={(e) => handleNumericChange(e.target.value, field.onChange)}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault();
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Calves Measurements */}
              <div className="space-y-4">
                <h3 className="font-medium">Pantorrillas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="measurements.leftCalf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Pantorrilla Izquierda
                          {currentPhysicalData?.calf?.left && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (Anterior: {currentPhysicalData.calf.left.value} {currentPhysicalData.calf.left.units})
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={field.value || ''}
                            onChange={(e) => handleNumericChange(e.target.value, field.onChange)}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault();
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="measurements.rightCalf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Pantorrilla Derecha
                          {currentPhysicalData?.calf?.right && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (Anterior: {currentPhysicalData.calf.right.value} {currentPhysicalData.calf.right.units})
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={field.value || ''}
                            onChange={(e) => handleNumericChange(e.target.value, field.onChange)}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault();
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="measurementUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de Medida</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar unidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cm">Centímetros (cm)</SelectItem>
                        <SelectItem value="in">Pulgadas (in)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <FormLabel className="text-base font-medium">Suplementos</FormLabel>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {supplements.map((supplement) => (
                    <FormField
                      key={supplement.id}
                      control={form.control}
                      name="supplements"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={supplement.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(supplement.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, supplement.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== supplement.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {supplement.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="exerciseFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frecuencia de Ejercicio Semanal</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar frecuencia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 día por semana</SelectItem>
                        <SelectItem value="2">2 días por semana</SelectItem>
                        <SelectItem value="3">3 días por semana</SelectItem>
                        <SelectItem value="4">4 días por semana</SelectItem>
                        <SelectItem value="5">5 días por semana</SelectItem>
                        <SelectItem value="6">6 días por semana</SelectItem>
                        <SelectItem value="7">7 días por semana</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de Actividad</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar nivel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Sedentary">Sedentario</SelectItem>
                        <SelectItem value="Active">Activo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="flex justify-between pt-6">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Anterior
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
            </div>

            <div className="flex gap-2">
              {currentStep < formSteps.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => {
                    setCurrentStep(currentStep + 1);
                  }}
                >
                  Siguiente
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isSubmitting}
                    onClick={() => {
                      form.handleSubmit(async (data) => {
                        await onSubmit(data);
                        onClose();
                      },
                      onError
                      )();
                    }}
                  >
                    {isSubmitting ? "Guardando..." : "Guardar y Cerrar"}
                  </Button>

                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      form.handleSubmit(onSubmit, onError)();
                    }}
                  >
                    {isSubmitting ? "Guardando..." : "Guardar y Continuar"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}