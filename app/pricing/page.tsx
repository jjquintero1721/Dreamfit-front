"use client";

import { useState } from "react";
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

const tiers = [
  {
    name: "Inicial",
    id: "starter",
    price: { monthly: "$29", yearly: "$290" },
    description: "Perfecto para nuevos entrenadores que comienzan su viaje.",
    features: [
      "Hasta 10 alumnos activos",
      "Plantillas básicas de entrenamiento",
      "Seguimiento de progreso",
      "Soporte por email",
      "Acceso a aplicación móvil",
    ],
  },
  {
    name: "Profesional",
    id: "professional",
    price: { monthly: "$79", yearly: "$790" },
    description: "Para entrenadores establecidos con una base de clientes en crecimiento.",
    features: [
      "Hasta 50 alumnos activos",
      "Plantillas avanzadas de entrenamiento",
      "Planificación nutricional",
      "Seguimiento de progreso y análisis",
      "Soporte prioritario",
      "Marca personalizada",
      "Sesiones grupales",
      "Acceso a aplicación móvil",
    ],
  },
  {
    name: "Empresarial",
    id: "enterprise",
    price: { monthly: "$199", yearly: "$1,990" },
    description: "Para estudios de fitness y equipos profesionales.",
    features: [
      "Alumnos activos ilimitados",
      "Plantillas avanzadas de entrenamiento",
      "Planificación nutricional",
      "Análisis avanzados e informes",
      "Soporte prioritario 24/7",
      "Marca personalizada",
      "Sesiones grupales",
      "Acceso API",
      "Acceso a aplicación móvil",
      "Múltiples cuentas de entrenador",
    ],
  },
];

export default function PricingPage() {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="py-24 px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Elige tu{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
            plan de entrenamiento
          </span>
        </h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Selecciona el plan perfecto para tu negocio de entrenamiento
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
              Ahorra 20%
            </span>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            className={cn(
              "relative flex flex-col transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg",
              tier.id === "professional" && "border-blue-500/50 shadow-lg"
            )}
          >
            {tier.id === "professional" && (
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full">
                Más Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid flex-1 place-items-start gap-6">
              <div className="text-3xl font-bold">
                {tier.price[interval]}
                <span className="text-sm font-normal text-muted-foreground">
                  /{interval === "monthly" ? "mes" : "año"}
                </span>
              </div>
              <div className="space-y-4">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
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
                  tier.id === "professional"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    : "hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white"
                )}
                variant={tier.id === "professional" ? "default" : "outline"}
                onClick={() => {
                  // TODO: Implement subscription logic
                  console.log(`Selected ${tier.name} plan with ${interval} billing`);
                }}
              >
                Comenzar
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
          <Button variant="link" className="p-0 h-auto font-normal">
            Contáctanos
          </Button>
        </p>
      </div>
    </div>
  );
}