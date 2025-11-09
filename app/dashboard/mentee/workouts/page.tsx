"use client";

import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ChevronDown, Clock, Play, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface WorkoutPlan {
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

export default function WorkoutsPage() {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const fetchWorkoutPlan = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/workout-plans/current/${user.id}`);
        setWorkoutPlan(response.data.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setWorkoutPlan(null);
        } else {
          console.error("Failed to fetch workout plan:", error);
          toast.error("Error al cargar el plan de entrenamiento");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutPlan();
  }, [user]);

  const getAllWorkoutsForDay = (day: WorkoutPlan["workoutPlan"]["days"][0]) => {
    const allWorkouts: Array<{
      name: string;
      muscularGroup: string;
      order: number;
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
    }> = [];

    day.muscularGroups.forEach(mg => {
      mg.workouts.forEach(workout => {
        allWorkouts.push({
          ...workout,
          muscularGroup: workout.muscularGroup || mg.group, // Fallback para compatibilidad
          order: workout.order || 0, // Fallback para compatibilidad
        });
      });
    });

    return allWorkouts.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name);
    });
  };

  const getFilteredWorkouts = (day: WorkoutPlan["workoutPlan"]["days"][0], selectedMuscleGroup: string | null) => {
    const allWorkouts = getAllWorkoutsForDay(day);

    if (!selectedMuscleGroup) {
      return allWorkouts;
    }

    return allWorkouts.filter(workout => workout.muscularGroup === selectedMuscleGroup);
  };

  const getMuscleGroups = (dayWorkouts: WorkoutPlan["workoutPlan"]["days"][0]) => {
    const groups = new Set<string>();

    dayWorkouts.muscularGroups.forEach(mg => {
      mg.workouts.forEach(workout => {
        groups.add(workout.muscularGroup || mg.group);
      });
    });

    return Array.from(groups);
  };

  const openVideo = (videoUrl: string) => {
    let embedUrl = videoUrl;
    if (videoUrl.includes('youtube.com/watch')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (videoUrl.includes('youtu.be/')) {
      const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    setSelectedVideo(embedUrl);
  };

  const toggleExerciseExpanded = (exerciseId: string) => {
    setExpandedExercises(prev => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  };

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

  if (!workoutPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">No hay Plan de Entrenamiento Disponible</h3>
              <p className="text-muted-foreground">
                Contacta a tu entrenador para obtener un plan de entrenamiento personalizado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tu Plan de Entrenamiento</h1>
        <p className="text-muted-foreground mt-2">
          Objetivo: {workoutPlan.workoutPlan.trainingObjective}
        </p>
        <p className="text-sm text-muted-foreground">
          Plan creado: {new Date(workoutPlan.created_at).toLocaleDateString()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entrenamientos Semanales</CardTitle>
          <CardDescription>Tu programa de entrenamiento personalizado</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="1" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              {workoutPlan.workoutPlan.days.map((day) => (
                <TabsTrigger key={day.dayNumber} value={day.dayNumber}>
                  Día {day.dayNumber}
                </TabsTrigger>
              ))}
            </TabsList>

            {workoutPlan.workoutPlan.days.map((day) => (
              <TabsContent key={day.dayNumber} value={day.dayNumber}>
                <div className="space-y-6">
                  {/* Muscle Group Filter */}
                  <div className="flex flex-wrap gap-2">
                    {getMuscleGroups(day).map((group) => (
                      <Badge
                        key={group}
                        variant={selectedMuscleGroup === group ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedMuscleGroup(
                            selectedMuscleGroup === group ? null : group
                          )
                        }
                      >
                        {group}
                      </Badge>
                    ))}
                    {selectedMuscleGroup && (
                      <Badge
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => setSelectedMuscleGroup(null)}
                      >
                        Mostrar todos
                      </Badge>
                    )}
                  </div>

                  {/* Ejercicios ordenados */}
                  <div className="space-y-4">
                    {getFilteredWorkouts(day, selectedMuscleGroup).map((workout, index) => {
                      const exerciseId = `day-${day.dayNumber}-exercise-${index}`;
                      const isExpanded = expandedExercises.has(exerciseId);

                      return (
                        <Card key={exerciseId} className="transition-all duration-200 hover:shadow-md">
                          <CardContent className="p-0">
                            <div
                              className="p-4 cursor-pointer"
                              onClick={() => toggleExerciseExpanded(exerciseId)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="w-8 h-6 p-0 flex items-center justify-center">
                                    {workout.order || index + 1}
                                  </Badge>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {workout.muscularGroup}
                                      </Badge>
                                      {workout.videoUrl ? (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 px-2 text-xs text-foreground hover:text-primary"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openVideo(workout.videoUrl!);
                                          }}
                                        >
                                          <Play className="h-3 w-3 mr-1" />
                                          Video disponible
                                        </Button>
                                      ) : (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                          <VideoOff className="h-3 w-3" />
                                          Sin video
                                        </span>
                                      )}
                                    </div>
                                    <h3 className="font-semibold text-lg">{workout.name}</h3>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <ChevronDown
                                    className={cn(
                                      "h-4 w-4 transition-transform",
                                      isExpanded && "rotate-180"
                                    )}
                                  />
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="px-4 pb-4 border-t bg-muted/50">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Series</p>
                                    <p className="text-sm">{workout.sets}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Repeticiones</p>
                                    <p className="text-sm">{workout.reps}</p>
                                  </div>
                                  {workout.element && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Elemento</p>
                                      <p className="text-sm">{workout.element}</p>
                                    </div>
                                  )}
                                  {workout.weight && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Peso</p>
                                      <p className="text-sm">{workout.weight.value} {workout.weight.units}</p>
                                    </div>
                                  )}
                                  {workout.rest && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Descanso</p>
                                      <p className="text-sm flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {workout.rest}s
                                      </p>
                                    </div>
                                  )}
                                  {workout.technique && workout.technique !== "N/A" && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Técnica</p>
                                      <p className="text-sm">{workout.technique}</p>
                                    </div>
                                  )}
                                  {workout.RIR && workout.RIR !== "N/A" && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">RIR</p>
                                      <p className="text-sm">{workout.RIR}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Video del Ejercicio</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video">
              <iframe
                src={selectedVideo}
                title="Video del ejercicio"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}