"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plan } from "@/types/system-admin";
import { Loader2 } from "lucide-react";

interface AssignMembershipModalProps {
  open: boolean;
  onClose: () => void;
  coachId: string | null;
  plans: Plan[];
  onAssign: (coachId: string, planId: string, durationMonths: number) => Promise<void>;
}

export default function AssignMembershipModal({
  open,
  onClose,
  coachId,
  plans,
  onAssign,
}: AssignMembershipModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [duration, setDuration] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setSelectedPlan("");
      setDuration(1);
      setIsLoading(false);
    }
  }, [open]);

  const handleAssign = async () => {
    if (!coachId || !selectedPlan) return;

    setIsLoading(true);
    try {
      await onAssign(coachId, selectedPlan, duration);
      onClose();
    } catch (error) {
      console.error("Error assigning membership:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Asignar Membresía</DialogTitle>
          <DialogDescription>
            Selecciona un plan y la duración de la membresía para este coach.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="plan">Plan</Label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger id="plan">
                <SelectValue placeholder="Selecciona un plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{plan.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {plan.maxMentees ? `Máx. ${plan.maxMentees} asesorados` : "Sin límite"}
                        {" • "}
                        {plan.maxDailyMealPlans ? `${plan.maxDailyMealPlans} planes/día` : "Planes ilimitados"}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlan && (
            <div className="grid gap-2">
              <Label htmlFor="duration">Duración (meses)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={24}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              />
              <p className="text-sm text-muted-foreground">
                La membresía se asignará desde hoy por {duration} {duration === 1 ? "mes" : "meses"}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedPlan || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Asignando...
              </>
            ) : (
              "Asignar Membresía"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
