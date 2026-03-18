"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CoachesTable from "@/components/system-admin/CoachesTable";
import AssignMembershipModal from "@/components/system-admin/AssignMembershipModal";
import { CoachListItem, Plan } from "@/types/system-admin";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function SystemAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coaches, setCoaches] = useState<CoachListItem[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redirect if not system user
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "system") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // Fetch coaches and plans
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch coaches
        const coachesResponse = await api.get("/system-admin/coaches");
        if (coachesResponse.data?.data) {
          setCoaches(coachesResponse.data.data);
        }

        // Fetch plans
        const plansResponse = await api.get("/system-admin/plans");
        if (plansResponse.data?.data) {
          setPlans(plansResponse.data.data);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(
          error.response?.data?.message || "Error al cargar los datos"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.role === "system") {
      fetchData();
    }
  }, [status, session?.user?.role]);

  const handleAssignMembership = (coachId: string) => {
    setSelectedCoachId(coachId);
    setIsModalOpen(true);
  };

  const handleAssignMembershipSubmit = async (
    coachId: string,
    planId: string,
    durationMonths: number
  ) => {
    try {
      await api.post(`/system-admin/coaches/${coachId}/membership`, {
        planId,
        durationMonths,
      });

      toast.success("Membresía asignada exitosamente");

      // Refresh coaches list
      const coachesResponse = await api.get("/system-admin/coaches");
      if (coachesResponse.data?.data) {
        setCoaches(coachesResponse.data.data);
      }
    } catch (error: any) {
      console.error("Error assigning membership:", error);
      toast.error(
        error.response?.data?.message || "Error al asignar la membresía"
      );
      throw error;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "system") {
    return null; // Middleware will redirect
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Panel de Administración del Sistema
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Gestiona coaches, membresías y asesorados
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-semibold">Coaches Registrados</h2>
          <div className="text-sm text-muted-foreground">
            Total: {coaches.length} coaches
          </div>
        </div>

        <CoachesTable
          coaches={coaches}
          onAssignMembership={handleAssignMembership}
        />
      </div>

      <AssignMembershipModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coachId={selectedCoachId}
        plans={plans}
        onAssign={handleAssignMembershipSubmit}
      />
    </div>
  );
}
