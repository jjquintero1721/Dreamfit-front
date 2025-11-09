"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, VideoOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

const WEIGHT_UNITS = ["kg", "lb"];

interface Workout {
  id: number;
  documentId: string;
  name: string;
  videoUrl: string | null;
}

interface MuscularGroup {
  id: number;
  documentId: string;
  name: string;
  workouts: Workout[];
}

interface WorkoutsResponse {
  message: string;
  data: {
    muscularGroups: MuscularGroup[];
  };
}

interface WorkoutDetails {
  id: number;
  sets: string;
  reps: string;
  element: string;
  weight: {
    value: string;
    units: string;
  } | null;
  rest: string;
  technique: string;
  RIR: string;
  videoUrl: string | null;
  order: number;
}

interface WorkoutOrderInfo {
  order: number;
  muscularGroup: string;
  timestamp: number;
}

const workoutPlanSchema = z.object({
  totalDays: z.number().min(1).max(7),
  trainingObjective: z.string().min(1, "El objetivo de entrenamiento es requerido"),
  days: z.array(z.object({
    dayNumber: z.string(),
    muscularGroups: z.array(z.object({
      group: z.string(),
      workouts: z.array(z.object({
        name: z.string(),
        muscularGroup: z.string(),
        order: z.number(),
        sets: z.string().min(1).refine((val) => {
          const num = parseInt(val);
          return !isNaN(num) && num > 0;
        }, { message: "Las series deben ser un número positivo" }),
        reps: z.string().min(1).refine((val) => {
          const rangePattern = /^\d+(-\d+)?$/;
          return rangePattern.test(val);
        }, { message: "Las repeticiones deben ser un número positivo o rango válido" }),
        element: z.string().optional(),
        weight: z.object({
          value: z.string().refine((val) => {
            const num = parseFloat(val);
            return !isNaN(num) && num >= 0;
          }, { message: "El peso debe ser un número positivo o cero" }),
          units: z.string(),
        }).optional().nullable(),
        rest: z.string().optional().refine((val) => {
          if (!val || val === "") return true;
          const num = parseInt(val);
          return !isNaN(num) && num >= 0;
        }, { message: "El descanso debe ser un número positivo" }),
        technique: z.string().optional(),
        RIR: z.string().optional(),
        videoUrl: z.string().optional().nullable(),
      })),
    })),
  })),
});

type WorkoutPlanFormValues = z.infer<typeof workoutPlanSchema>;

interface ExistingWorkoutPlan {
  _id: string;
  coach_id: string;
  mentee_id: string;
  created_at: string;
  workoutPlan: {
    trainingObjective: string;
    days: Array<{
      dayNumber: string;
      muscularGroups: Array<{
        group: string;
        workouts: Array<{
          name: string;
          muscularGroup?: string;
          order?: number;
          sets: string;
          reps: string;
          element?: string;
          weight?: {
            value: string;
            units: string;
          };
          rest?: string;
          technique?: string;
          RIR?: string;
          videoUrl?: string;
        }>;
      }>;
    }>;
  };
}

interface WorkoutPlanFormProps {
  menteeId: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingPlan?: ExistingWorkoutPlan;
  mode?: 'create' | 'edit';
}

const focusOptions = {
  "Aumento de masa muscular": "Aumento de masa muscular",
  "Definición": "Definición",
  "Mantenimiento": "Mantenimiento",
  "Fuerza": "Fuerza",
  "Resistencia": "Resistencia",
};

export function WorkoutPlanForm({
  menteeId,
  onSuccess,
  onCancel,
  existingPlan,
  mode = 'create'
}: WorkoutPlanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [muscularGroups, setMuscularGroups] = useState<MuscularGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<{ [key: number]: number[] }>({});
  const [selectedWorkouts, setSelectedWorkouts] = useState<{ [key: string]: boolean }>({});
  const [workoutDetails, setWorkoutDetails] = useState<{ [key: string]: WorkoutDetails }>({});
  const [workoutOrderCounter, setWorkoutOrderCounter] = useState<{ [key: number]: number }>({});
  const [workoutOrderInfo, setWorkoutOrderInfo] = useState<{ [key: string]: WorkoutOrderInfo }>({});

  const [trainingOptions, setTrainingOptions] = useState<{
    elements: string[];
    technics: string[];
    rirs: string[];
  }>({ elements: [], technics: [], rirs: [] });

  const form = useForm<WorkoutPlanFormValues>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: {
      totalDays: existingPlan ? existingPlan.workoutPlan.days.length : 3,
      trainingObjective: existingPlan ? existingPlan.workoutPlan.trainingObjective : "",
      days: existingPlan ? existingPlan.workoutPlan.days : [
        { dayNumber: "1", muscularGroups: [] },
      ],
    },
  });

  const totalDays = form.watch("totalDays");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<WorkoutsResponse>("/content/workouts");
        setMuscularGroups(response.data.data.muscularGroups);

        const optionsResponse = await api.get("/content/training-options");
        setTrainingOptions(optionsResponse.data.data);

        if (existingPlan && mode === 'edit') {
          initializeExistingPlan(response.data.data.muscularGroups);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar los datos desde el CMS");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [existingPlan, mode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<WorkoutsResponse>("/content/workouts");
        setMuscularGroups(response.data.data.muscularGroups);

        const optionsResponse = await api.get("/content/training-options");
        setTrainingOptions(optionsResponse.data.data);

        if (existingPlan && mode === 'edit') {
          initializeExistingPlan(response.data.data.muscularGroups);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar los datos desde el CMS");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [existingPlan, mode]);


  useEffect(() => {
    updateFormData();
  }, [selectedGroups, selectedWorkouts, workoutDetails, workoutOrderInfo]);

  const initializeExistingPlan = (availableGroups: MuscularGroup[]) => {
    if (!existingPlan) return;

    const newSelectedGroups: { [key: number]: number[] } = {};
    const newSelectedWorkouts: { [key: string]: boolean } = {};
    const newWorkoutDetails: { [key: string]: WorkoutDetails } = {};
    const newWorkoutOrderInfo: { [key: string]: WorkoutOrderInfo } = {};
    const newOrderCounters: { [key: number]: number } = {};

    existingPlan.workoutPlan.days.forEach((day, dayIndex) => {
      const dayGroups: number[] = [];
      let maxOrder = 0;

      day.muscularGroups.forEach((muscleGroup) => {
        const availableGroup = availableGroups.find(g => g.name === muscleGroup.group);
        if (availableGroup) {
          dayGroups.push(availableGroup.id);

          muscleGroup.workouts.forEach((workout) => {
            const availableWorkout = availableGroup.workouts.find(w => w.name === workout.name);
            if (availableWorkout) {
              const workoutKey = `${dayIndex}-${availableGroup.id}-${availableWorkout.id}`;
              newSelectedWorkouts[workoutKey] = true;

              const order = workout.order || maxOrder + 1;
              maxOrder = Math.max(maxOrder, order);

              newWorkoutDetails[workoutKey] = {
                id: availableWorkout.id,
                sets: workout.sets,
                reps: workout.reps,
                element: workout.element || "",
                weight: workout.weight || null,
                rest: workout.rest || "",
                technique: workout.technique || "",
                RIR: workout.RIR || "",
                videoUrl: availableWorkout.videoUrl,
                order: order,
              };

              newWorkoutOrderInfo[workoutKey] = {
                order: order,
                muscularGroup: muscleGroup.group,
                timestamp: Date.now() + order,
              };
            }
          });
        }
      });

      newSelectedGroups[dayIndex] = dayGroups;
      newOrderCounters[dayIndex] = maxOrder;
    });

    setSelectedGroups(newSelectedGroups);
    setSelectedWorkouts(newSelectedWorkouts);
    setWorkoutDetails(newWorkoutDetails);
    setWorkoutOrderInfo(newWorkoutOrderInfo);
    setWorkoutOrderCounter(newOrderCounters);
  };

  const updateDays = (newTotal: number) => {
    const currentDays = form.getValues("days");
    const newDays = [...currentDays];

    if (newTotal > currentDays.length) {
      for (let i = currentDays.length; i < newTotal; i++) {
        newDays.push({ dayNumber: (i + 1).toString(), muscularGroups: [] });
      }
    } else if (newTotal < currentDays.length) {
      newDays.splice(newTotal);

      const newSelectedGroups = { ...selectedGroups };
      const newSelectedWorkouts = { ...selectedWorkouts };
      const newWorkoutDetails = { ...workoutDetails };
      const newWorkoutOrderInfo = { ...workoutOrderInfo };
      const newOrderCounters = { ...workoutOrderCounter };

      Object.keys(newSelectedGroups).forEach(key => {
        if (parseInt(key) >= newTotal) {
          delete newSelectedGroups[parseInt(key)];
          delete newOrderCounters[parseInt(key)];
        }
      });

      Object.keys(newSelectedWorkouts).forEach(key => {
        const dayIndex = parseInt(key.split('-')[0]);
        if (dayIndex >= newTotal) {
          delete newSelectedWorkouts[key];
          delete newWorkoutDetails[key];
          delete newWorkoutOrderInfo[key];
        }
      });

      setSelectedGroups(newSelectedGroups);
      setSelectedWorkouts(newSelectedWorkouts);
      setWorkoutDetails(newWorkoutDetails);
      setWorkoutOrderInfo(newWorkoutOrderInfo);
      setWorkoutOrderCounter(newOrderCounters);
    }

    form.setValue("days", newDays);
  };

  const handleMuscleGroupChange = (dayIndex: number, group: MuscularGroup, checked: boolean) => {
    const currentSelected = selectedGroups[dayIndex] || [];
    let newSelected: number[];

    if (checked) {
      newSelected = [...currentSelected, group.id];
      setSelectedGroups(prev => ({ ...prev, [dayIndex]: newSelected }));
    } else {
      newSelected = currentSelected.filter(id => id !== group.id);

      const updatedSelectedWorkouts = { ...selectedWorkouts };
      const updatedWorkoutDetails = { ...workoutDetails };
      const updatedWorkoutOrderInfo = { ...workoutOrderInfo };

      Object.keys(selectedWorkouts).forEach(key => {
        if (key.startsWith(`${dayIndex}-${group.id}-`)) {
          delete updatedSelectedWorkouts[key];
          delete updatedWorkoutDetails[key];
          delete updatedWorkoutOrderInfo[key];
        }
      });

      setSelectedGroups(prev => ({ ...prev, [dayIndex]: newSelected }));
      setSelectedWorkouts(updatedSelectedWorkouts);
      setWorkoutDetails(updatedWorkoutDetails);
      setWorkoutOrderInfo(updatedWorkoutOrderInfo);
    }
  };

  const handleWorkoutChange = (dayIndex: number, group: MuscularGroup, workout: Workout, checked: boolean) => {
    const workoutKey = `${dayIndex}-${group.id}-${workout.id}`;
    const newSelectedWorkouts = { ...selectedWorkouts, [workoutKey]: checked };
    setSelectedWorkouts(newSelectedWorkouts);

    if (checked) {
      const currentOrder = workoutOrderCounter[dayIndex] || 0;
      const newOrder = currentOrder + 1;

      setWorkoutOrderCounter(prev => ({
        ...prev,
        [dayIndex]: newOrder
      }));

      setWorkoutDetails(prev => ({
        ...prev,
        [workoutKey]: {
          id: workout.id,
          sets: "3",
          reps: "12",
          element: "",
          weight: null,
          rest: "",
          technique: "",
          RIR: "",
          videoUrl: workout.videoUrl,
          order: newOrder,
        }
      }));

      setWorkoutOrderInfo(prev => ({
        ...prev,
        [workoutKey]: {
          order: newOrder,
          muscularGroup: group.name,
          timestamp: Date.now(),
        }
      }));
    } else {
      setWorkoutDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[workoutKey];
        return newDetails;
      });

      setWorkoutOrderInfo(prev => {
        const newInfo = { ...prev };
        delete newInfo[workoutKey];
        return newInfo;
      });
    }
  };

  const updateWorkoutDetail = (workoutKey: string, field: keyof WorkoutDetails, value: any) => {
    setWorkoutDetails(prev => ({
      ...prev,
      [workoutKey]: {
        ...prev[workoutKey],
        [field]: value
      }
    }));
  };

  const updateFormData = () => {
    const currentDays = form.getValues("days");
    const newDays = currentDays.map((day, dayIndex) => {
      const dayGroups = selectedGroups[dayIndex] || [];

      const allDayWorkouts: Array<{
        groupId: number;
        group: MuscularGroup;
        workout: Workout;
        workoutKey: string;
        details: WorkoutDetails;
        orderInfo: WorkoutOrderInfo;
      }> = [];

      dayGroups.forEach(groupId => {
        const group = muscularGroups.find(g => g.id === groupId);
        if (!group) return;

        group.workouts.forEach(workout => {
          const workoutKey = `${dayIndex}-${groupId}-${workout.id}`;
          if (selectedWorkouts[workoutKey] && workoutDetails[workoutKey] && workoutOrderInfo[workoutKey]) {
            allDayWorkouts.push({
              groupId,
              group,
              workout,
              workoutKey,
              details: workoutDetails[workoutKey],
              orderInfo: workoutOrderInfo[workoutKey],
            });
          }
        });
      });

      allDayWorkouts.sort((a, b) => {
        if (a.orderInfo.order !== b.orderInfo.order) {
          return a.orderInfo.order - b.orderInfo.order;
        }
        return a.orderInfo.timestamp - b.orderInfo.timestamp;
      });

      const muscularGroupsMap = new Map<string, Array<{
        name: string;
        muscularGroup: string;
        order: number;
        sets: string;
        reps: string;
        element: string;
        weight: {
          value: string;
          units: string;
        } | null;
        rest: string;
        technique: string;
        RIR: string;
        videoUrl: string | null;
      }>>();

      allDayWorkouts.forEach(({ group, workout, details, orderInfo }) => {
        if (!muscularGroupsMap.has(group.name)) {
          muscularGroupsMap.set(group.name, []);
        }

        muscularGroupsMap.get(group.name)!.push({
          name: workout.name,
          muscularGroup: group.name,
          order: orderInfo.order,
          sets: details.sets,
          reps: details.reps,
          element: details.element,
          weight: details.weight,
          rest: details.rest,
          technique: details.technique,
          RIR: details.RIR,
          videoUrl: details.videoUrl,
        });
      });

      const muscularGroupsForDay = Array.from(muscularGroupsMap.entries()).map(([groupName, workouts]) => ({
        group: groupName,
        workouts: workouts,
      }));

      return {
        dayNumber: (dayIndex + 1).toString(),
        muscularGroups: muscularGroupsForDay,
      };
    });

    form.setValue("days", newDays);
  };

  const onSubmit = async (data: WorkoutPlanFormValues) => {
    const hasWorkouts = data.days.some(day =>
      day.muscularGroups.some(group =>
        group.workouts.length > 0
      )
    );

    if (!hasWorkouts) {
      toast.error("Debes seleccionar al menos un ejercicio");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        mentee_id: menteeId,
        trainingObjective: data.trainingObjective,
        days: data.days,
      };

      if (mode === 'edit' && existingPlan) {
        await api.put(`/workout-plans/${existingPlan._id}`, payload);
        toast.success("¡Plan de entrenamiento actualizado exitosamente!");
      } else {
        await api.post("/workout-plans", payload);
        toast.success("¡Plan de entrenamiento creado exitosamente!");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Failed to save workout plan:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || `Error al ${mode === 'edit' ? 'actualizar' : 'crear'} el plan de entrenamiento`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOrderedWorkoutsForDay = (dayIndex: number) => {
    const dayGroups = selectedGroups[dayIndex] || [];
    const workouts: Array<{
      key: string;
      name: string;
      group: string;
      order: number;
      isSelected: boolean;
    }> = [];

    dayGroups.forEach(groupId => {
      const group = muscularGroups.find(g => g.id === groupId);
      if (!group) return;

      group.workouts.forEach(workout => {
        const workoutKey = `${dayIndex}-${groupId}-${workout.id}`;
        const isSelected = selectedWorkouts[workoutKey];
        const orderInfo = workoutOrderInfo[workoutKey];

        if (isSelected && orderInfo) {
          workouts.push({
            key: workoutKey,
            name: workout.name,
            group: group.name,
            order: orderInfo.order,
            isSelected,
          });
        }
      });
    });

    return workouts.sort((a, b) => a.order - b.order);
  };

  if (isLoading) {
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
      <h2 className="text-2xl font-bold mb-6">
        {mode === 'edit' ? 'Editar Plan de Entrenamiento' : 'Crear Plan de Entrenamiento'}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="totalDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número total de días</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => {
                      const newValue = parseInt(value);
                      field.onChange(newValue);
                      updateDays(newValue);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day} {day === 1 ? "día" : "días"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trainingObjective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivo del entrenamiento</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar objetivo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(focusOptions).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Tabs
              defaultValue="0"
              className="space-y-6"
          >
            <div className="w-full overflow-x-auto overflow-y-hidden lg:overflow-x-hidden lg:scrollbar-none">
              <TabsList
                className="bg-muted rounded-lg p-1 shadow-sm flex-nowrap"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <div className="flex gap-2 p-1">
                  {Array.from({ length: totalDays }).map((_, dayIndex) => (
                    <TabsTrigger
                      key={dayIndex}
                      value={dayIndex.toString()}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap flex-shrink-0 min-w-[70px] justify-center"
                    >
                      Día {dayIndex + 1}
                    </TabsTrigger>
                  ))}
                </div>
              </TabsList>
            </div>


            {Array.from({ length: totalDays }).map((_, dayIndex) => (
              <TabsContent
                  key={dayIndex}
                  value={dayIndex.toString()}
                  className="mt-4"
              >
                <Card className="shadow-md border border-muted">
                  <CardHeader>
                    <CardTitle>Día {dayIndex + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormItem>
                      <FormLabel>Grupos Musculares</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {muscularGroups.map((group) => (
                          <div key={group.id} className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={(selectedGroups[dayIndex] || []).includes(group.id)}
                                onCheckedChange={(checked) =>
                                  handleMuscleGroupChange(dayIndex, group, checked as boolean)
                                }
                              />
                              <FormLabel className="font-normal">
                                {group.name}
                              </FormLabel>
                            </div>
                          </div>
                        ))}
                      </div>
                    </FormItem>

                    {(selectedGroups[dayIndex] && selectedGroups[dayIndex].length > 0) && (
                      <div className="space-y-4 pt-4 border-t">
                        <FormLabel>Ejercicios por Grupo Muscular</FormLabel>

                        {/* Mostrar preview del orden actual */}
                        {getOrderedWorkoutsForDay(dayIndex).length > 0 && (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">Orden actual de ejercicios:</p>
                            <div className="space-y-1">
                              {getOrderedWorkoutsForDay(dayIndex).map((workout, index) => (
                                <div key={workout.key} className="flex items-center gap-2 text-sm">
                                  <Badge variant="outline" className="w-8 h-6 p-0 flex items-center justify-center">
                                    {index + 1}
                                  </Badge>
                                  <span>{workout.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {workout.group}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-6">
                          {(selectedGroups[dayIndex] || []).map((groupId) => {
                            const group = muscularGroups.find(g => g.id === groupId);
                            if (!group) return null;

                            return (
                              <div key={groupId} className="space-y-4">
                                <h4 className="font-medium">{group.name}</h4>
                                <div className="space-y-4">
                                  {group.workouts.map((workout) => {
                                    const workoutKey = `${dayIndex}-${groupId}-${workout.id}`;
                                    const isSelected = selectedWorkouts[workoutKey];
                                    const details = workoutDetails[workoutKey];
                                    const orderInfo = workoutOrderInfo[workoutKey];

                                    return (
                                      <div key={workout.id} className="space-y-4 border p-4 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={(checked) =>
                                              handleWorkoutChange(dayIndex, group, workout, checked as boolean)
                                            }
                                          />
                                          <div className="flex items-center gap-2 flex-1">
                                            <span className="text-sm font-medium">{workout.name}</span>
                                            {orderInfo && (
                                              <Badge variant="outline" className="text-xs">
                                                Orden: {orderInfo.order}
                                              </Badge>
                                            )}
                                            {workout.videoUrl ? (
                                              <span className="text-xs text-white flex items-center gap-1">
                                                <PlayCircle className="h-3 w-3" />
                                                Video disponible
                                              </span>
                                            ) : (
                                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <VideoOff className="h-3 w-3" />
                                                Sin video
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {isSelected && details && (
                                          <div className="space-y-4 pt-4 border-t">
                                            {/* Primera fila: Series, Reps, Elemento, Peso, Descanso, Técnica */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                              <div>
                                                <FormLabel className="text-xs">Series</FormLabel>
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  value={details.sets}
                                                  onChange={(e) => updateWorkoutDetail(workoutKey, 'sets', e.target.value)}
                                                  className="mt-1"
                                                />
                                              </div>

                                              <div>
                                                <FormLabel className="text-xs">Repeticiones</FormLabel>
                                                <Input
                                                  type="text"
                                                  value={details.reps}
                                                  onChange={(e) => updateWorkoutDetail(workoutKey, 'reps', e.target.value)}
                                                  className="mt-1"
                                                />
                                              </div>

                                              <div>
                                                <FormLabel className="text-xs">Elemento</FormLabel>
                                                <Select
                                                  value={details.element}
                                                  onValueChange={(value) => updateWorkoutDetail(workoutKey, 'element', value)}
                                                >
                                                  <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Seleccionar elemento" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {trainingOptions.elements.map((element) => (
                                                      <SelectItem key={element} value={element}>
                                                        {element}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>

                                              <div>
                                                <FormLabel className="text-xs">Peso</FormLabel>
                                                <div className="flex gap-1 mt-1">
                                                  <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={details.weight?.value || ""}
                                                    onChange={(e) => updateWorkoutDetail(workoutKey, 'weight',
                                                      e.target.value ? {
                                                        value: e.target.value,
                                                        units: details.weight?.units || "kg"
                                                      } : null
                                                    )}
                                                    placeholder="15"
                                                    className="flex-1"
                                                  />
                                                  <Select
                                                    value={details.weight?.units || "kg"}
                                                    onValueChange={(value) => updateWorkoutDetail(workoutKey, 'weight',
                                                      details.weight ? { ...details.weight, units: value } : { value: "", units: value }
                                                    )}
                                                  >
                                                    <SelectTrigger className="w-16">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {WEIGHT_UNITS.map((unit) => (
                                                        <SelectItem key={unit} value={unit}>
                                                          {unit}
                                                        </SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                              </div>

                                              <div>
                                                <FormLabel className="text-xs">Descanso (seg)</FormLabel>
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  value={details.rest}
                                                  onChange={(e) => updateWorkoutDetail(workoutKey, 'rest', e.target.value)}
                                                  className="mt-1"
                                                  placeholder="60"
                                                />
                                              </div>

                                              <div>
                                                <FormLabel className="text-xs">Técnica</FormLabel>
                                                <Select
                                                  value={details.technique}
                                                  onValueChange={(value) => updateWorkoutDetail(workoutKey, 'technique', value)}
                                                >
                                                  <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Seleccionar" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {trainingOptions.technics.map((technique) => (
                                                      <SelectItem key={technique} value={technique}>
                                                        {technique}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                            </div>

                                            {/* Segunda fila: RIR */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                              <div>
                                                <FormLabel className="text-xs">RIR</FormLabel>
                                                <Select
                                                  value={details.RIR}
                                                  onValueChange={(value) => updateWorkoutDetail(workoutKey, 'RIR', value)}
                                                >
                                                  <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Seleccionar RIR" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {trainingOptions.rirs.map((rir) => (
                                                      <SelectItem key={rir} value={rir}>
                                                        {rir}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : mode === 'edit' ? 'Actualizar Plan' : 'Crear Plan'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}