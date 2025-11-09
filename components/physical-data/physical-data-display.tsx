"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Ruler, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PhysicalMeasurement {
  value: number;
  units: string;
}

interface DualMeasurement {
  left: PhysicalMeasurement;
  right: PhysicalMeasurement;
}

interface PhysicalData {
  arm?: DualMeasurement;
  calf?: DualMeasurement;
  leg?: DualMeasurement;
  chest?: PhysicalMeasurement;
  waist?: PhysicalMeasurement;
  hips?: PhysicalMeasurement;
  neck?: PhysicalMeasurement;
}

interface PhysicalDataResponse {
  message: string;
  data: {
    measurements: PhysicalData;
  };
}

interface PhysicalDataDisplayProps {
  userId: string;
  className?: string;
  variant?: "coach" | "mentee";
}

const measurementLabels = {
  chest: "Pecho",
  waist: "Cintura",
  hips: "Cadera",
  neck: "Cuello",
  arm: "Bíceps",
  leg: "Muslos",
  calf: "Pantorrillas"
};

export function PhysicalDataDisplay({
  userId,
  className,
  variant = "mentee"
}: PhysicalDataDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [physicalData, setPhysicalData] = useState<PhysicalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasData, setHasData] = useState(false);

  const getOrderedMeasurements = (data: PhysicalData) => {
    const order: (keyof PhysicalData)[] = ['neck', 'chest', 'arm', 'hips', 'waist', 'leg', 'calf'];

    return order
      .filter(key => data[key] !== undefined)
      .map(key => [key, data[key]!] as [keyof PhysicalData, PhysicalMeasurement | DualMeasurement]);
  };

  const fetchPhysicalData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<PhysicalDataResponse>(`/physical-data/${userId}`);
      const measurements = response.data.data.measurements;

      const hasAnyData = Object.keys(measurements).length > 0;
      setHasData(hasAnyData);
      setPhysicalData(measurements);
    } catch (error) {
      console.error("Error fetching physical data:", error);
      setHasData(false);
      setPhysicalData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPhysicalData();
    }
  }, [userId]);

  const handleToggle = () => {
    if (!hasData && !isLoading) {
      toast.info("No hay datos físicos registrados");
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const renderMeasurement = (key: keyof PhysicalData, measurement: PhysicalMeasurement | DualMeasurement) => {
    const label = measurementLabels[key];

    if ('left' in measurement && 'right' in measurement) {
      return (
        <div key={key} className="bg-muted/30 rounded-lg p-3 space-y-2 border border-muted/50">
          <div className="flex items-center gap-2 pb-1 border-b border-muted/30">
            <span className="font-medium text-sm">{label}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col items-center space-y-1 p-2 bg-blue-50 dark:bg-blue-500/20 rounded border border-blue-200 dark:border-blue-500/30">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-muted-foreground">Izquierdo</span>
              </div>
              <span className="font-mono font-medium">{measurement.left.value} {measurement.left.units}</span>
            </div>
            <div className="flex flex-col items-center space-y-1 p-2 bg-blue-50 dark:bg-blue-500/20 rounded border border-blue-200 dark:border-blue-500/30">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-muted-foreground">Derecho</span>
              </div>
              <span className="font-mono font-medium">{measurement.right.value} {measurement.right.units}</span>
            </div>
          </div>
        </div>
      );
    } else {
      const singleMeasurement = measurement as PhysicalMeasurement;
      return (
        <div key={key} className="bg-muted/30 rounded-lg p-3 space-y-2 border border-muted/50">
          <div className="flex items-center gap-2 pb-1 border-b border-muted/30">
            <span className="font-medium text-sm">{label}</span>
          </div>
          <div className="w-full">
            <div className="flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-500/20 rounded border border-blue-200 dark:border-blue-500/30">
              <span className="font-mono font-medium text-lg">
                {singleMeasurement.value} {singleMeasurement.units}
              </span>
            </div>
          </div>
        </div>
      );
    }
  };

  if (variant === "coach") {
    return (
      <div className={cn("w-full", className)}>
        <Button
          variant="ghost"
          onClick={handleToggle}
          className="w-full justify-between h-auto p-4 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20"
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-700 dark:text-blue-400">
              Datos Físicos
            </span>
            {!hasData && !isLoading && (
              <span className="text-xs text-muted-foreground">(Sin datos)</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-blue-600 dark:text-blue-400 transition-transform duration-200",
              isExpanded && "transform rotate-180"
            )}
          />
        </Button>

        <AnimatePresence>
          {isExpanded && hasData && physicalData && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3 bg-blue-500/5 border-x border-b border-blue-200 dark:border-blue-500/20 rounded-b-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getOrderedMeasurements(physicalData).map(([key, measurement]) =>
                    renderMeasurement(key, measurement)
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Datos Físicos Actuales
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "transform rotate-180"
              )}
            />
          </Button>
        </CardTitle>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : hasData && physicalData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getOrderedMeasurements(physicalData).map(([key, measurement]) =>
                    renderMeasurement(key, measurement)
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Scale className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No hay datos físicos registrados
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Actualiza tus datos físicos para ver tu información aquí
                  </p>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}