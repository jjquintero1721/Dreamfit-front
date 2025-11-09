"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Graphic {
  id: number;
  name: string;
  slug: string;
}

interface Plan {
  id: number;
  name: string;
  slug: string;
  monthlyPrice: number;
  anualPrice: number;
  maxDailyMealPlans: number;
  maxMentees: number;
  contactButton: boolean;
  graphics: Graphic[];
}

interface PlansResponse {
  message: string;
  data: {
    plans: Plan[];
  };
}

export default function PricingPage() {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get<PlansResponse>("/content/plans");
        setPlans(response.data.data.plans);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Error al cargar los planes. Por favor, intenta de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formatPrice = (price: number) => {
    if (price === 0) return "Gratis";
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPrice = (plan: Plan) => {
    return interval === "monthly" ? plan.monthlyPrice : plan.anualPrice;
  };

  const getPlanFeatures = (plan: Plan) => {
    const features = [
      `Hasta ${plan.maxMentees} ${plan.maxMentees === 1 ? 'asesorado' : 'asesorados'}`,
      `${plan.maxDailyMealPlans} planes de comida diarios`,
    ];

    // Agregar gráficas disponibles
    if (plan.graphics.length > 0) {
      plan.graphics.forEach(graphic => {
        features.push(graphic.name);
      });
    }

    return features;
  };

  const getMostPopularPlan = () => {
    // Find the plan with the highest price that's not free
    const paidPlans = plans.filter(plan => plan.monthlyPrice > 0);
    if (paidPlans.length === 0) return null;
    
    return paidPlans.reduce((prev, current) => 
      (prev.monthlyPrice > current.monthlyPrice) ? prev : current
    );
  };

  if (isLoading) {
    return (
      <div className="py-24 px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-8">
            <div className="text-center">
              <div className="h-12 bg-muted rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-6 bg-muted rounded w-1/3 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mostPopularPlan = getMostPopularPlan();

  return (
    <div className="py-24 px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Elige tu{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
            plan de coaching
          </span>
        </h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Selecciona el plan perfecto para tu negocio de coaching
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="relative self-center rounded-full p-1 bg-muted/80 backdrop-blur-sm">
          <Button
            variant={interval === "monthly" ? "default" : "ghost"}
            className={cn(
              "relative w-28 rounded-full",
              interval === "monthly" &&
                "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
            )}
            onClick={() => setInterval("monthly")}
          >
            Mensual
          </Button>
          <Button
            variant={interval === "yearly" ? "default" : "ghost"}
            className={cn(
              "relative w-28 rounded-full",
              interval === "yearly" &&
                "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
            )}
            onClick={() => setInterval("yearly")}
          >
            Anual
            <span className="absolute -top-3 -right-3 px-2 py-1 text-xs font-semibold bg-teal-500 text-white rounded-full">
              Ahorra
            </span>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl justify-items-center">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "relative flex flex-col transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg w-full max-w-sm",
              mostPopularPlan && plan.id === mostPopularPlan.id && "border-blue-500/50 shadow-lg"
            )}
          >
            {mostPopularPlan && plan.id === mostPopularPlan.id && (
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full">
                Más Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                {plan.name === "Free" && "Perfecto para empezar"}
                {plan.name === "Basic" && "Para coaches que están comenzando"}
                {plan.name === "Advanced" && "Para coaches con clientela establecida"}
                {plan.name === "Pro" && "Para estudios y equipos profesionales"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid flex-1 place-items-start gap-6">
              <div className="text-3xl font-bold">
                {formatPrice(getPrice(plan))}
                {plan.monthlyPrice > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /{interval === "monthly" ? "mes" : "año"}
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {getPlanFeatures(plan).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className={cn(
                  "w-full",
                  mostPopularPlan && plan.id === mostPopularPlan.id
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    : "hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white"
                )}
                variant={mostPopularPlan && plan.id === mostPopularPlan.id ? "default" : "outline"}
                onClick={() => {
                  if (plan.monthlyPrice === 0) {
                    toast.success("¡Plan gratuito seleccionado! Regístrate para comenzar.");
                  } else {
                    toast.info(`Plan ${plan.name} seleccionado. Implementando sistema de pagos...`);
                  }
                }}
              >
                Comenzar Ahora
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-2xl text-center">
        <p className="text-base text-muted-foreground">
          Todos los planes incluyen una prueba gratuita de 14 días. No se requiere tarjeta de crédito.
          <br />
          ¿Necesitas un plan personalizado?{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto font-normal"
            onClick={() => toast.info("Contacta con nuestro equipo para planes personalizados")}
          >
            Contáctanos
          </Button>
        </p>
      </div>
    </div>
  );
}