"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { CoachDetail, MenteeBasicInfo, Plan } from "@/types/system-admin";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Calendar,
  Users,
  CreditCard,
  Lock,
  XCircle,
} from "lucide-react";
import AssignMembershipModal from "@/components/system-admin/AssignMembershipModal";

export default function CoachDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const coachId = params.id as string;

  const [coach, setCoach] = useState<CoachDetail | null>(null);
  const [mentees, setMentees] = useState<MenteeBasicInfo[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Password change dialog
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Membership dialogs
  const [isAssignMembershipOpen, setIsAssignMembershipOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Redirect if not system user
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "system") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // Fetch coach details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch coach details
        const coachResponse = await api.get(`/system-admin/coaches/${coachId}`);
        if (coachResponse.data?.data) {
          setCoach(coachResponse.data.data);
        }

        // Fetch coach mentees
        const menteesResponse = await api.get(
          `/system-admin/coaches/${coachId}/mentees`
        );
        if (menteesResponse.data?.data) {
          setMentees(menteesResponse.data.data);
        }

        // Fetch plans
        const plansResponse = await api.get("/system-admin/plans");
        if (plansResponse.data?.data) {
          setPlans(plansResponse.data.data);
        }
      } catch (error: any) {
        console.error("Error fetching coach data:", error);
        toast.error(
          error.response?.data?.message || "Error al cargar los datos del coach"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.role === "system" && coachId) {
      fetchData();
    }
  }, [status, session?.user?.role, coachId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", {
        locale: es,
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.patch(`/system-admin/coaches/${coachId}/password`, {
        newPassword,
      });

      toast.success("Contraseña actualizada exitosamente");
      setIsPasswordDialogOpen(false);
      setNewPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(
        error.response?.data?.message || "Error al cambiar la contraseña"
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancelMembership = async () => {
    setIsCanceling(true);
    try {
      await api.delete(`/system-admin/coaches/${coachId}/membership`);

      toast.success("Membresía cancelada exitosamente");
      setIsCancelDialogOpen(false);

      // Refresh coach data
      const coachResponse = await api.get(`/system-admin/coaches/${coachId}`);
      if (coachResponse.data?.data) {
        setCoach(coachResponse.data.data);
      }
    } catch (error: any) {
      console.error("Error canceling membership:", error);
      toast.error(
        error.response?.data?.message || "Error al cancelar la membresía"
      );
    } finally {
      setIsCanceling(false);
    }
  };

  const handleAssignMembershipSubmit = async (
    _coachId: string,
    planId: string,
    durationMonths: number
  ) => {
    try {
      await api.post(`/system-admin/coaches/${coachId}/membership`, {
        planId,
        durationMonths,
      });

      toast.success("Membresía asignada exitosamente");

      // Refresh coach data
      const coachResponse = await api.get(`/system-admin/coaches/${coachId}`);
      if (coachResponse.data?.data) {
        setCoach(coachResponse.data.data);
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

  if (status === "unauthenticated" || session?.user?.role !== "system" || !coach) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/system")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {coach.name} {coach.lastName}
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm sm:text-base break-all">
              <Mail className="h-4 w-4 shrink-0" />
              {coach.email}
            </p>
          </div>
          <Badge
            variant={coach.hasActiveMembership ? "default" : "secondary"}
            className="h-8 px-4 w-fit"
          >
            {coach.hasActiveMembership ? "Membresía Activa" : "Sin Membresía"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Membership Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Información de Membresía
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plan Actual</p>
              <p className="text-lg font-semibold">
                {coach.planName || "Sin plan asignado"}
              </p>
            </div>

            {coach.hasActiveMembership && (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fecha de Inicio
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(coach.membershipStartDate)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fecha de Vencimiento
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(coach.membershipEndDate)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Máx. Asesorados
                    </p>
                    <p className="text-lg font-semibold">
                      {coach.maxMentees || "Ilimitado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Planes Diarios
                    </p>
                    <p className="text-lg font-semibold">
                      {coach.dailyMealPlansCount} /{" "}
                      {coach.maxDailyMealPlans || "∞"}
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                onClick={() => setIsAssignMembershipOpen(true)}
                className="flex-1"
              >
                {coach.hasActiveMembership ? "Cambiar Plan" : "Asignar Membresía"}
              </Button>
              {coach.hasActiveMembership && (
                <Button
                  variant="destructive"
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  <XCircle className="mr-2 h-4 w-4 sm:mr-0" />
                  <span className="sm:hidden">Cancelar Membresía</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coach Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Información del Coach
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Fecha de Registro
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(coach.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Asesorados Totales
              </p>
              <p className="text-2xl font-bold">{coach.menteesCount}</p>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(true)}
              className="w-full"
            >
              <Lock className="mr-2 h-4 w-4" />
              Cambiar Contraseña
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mentees Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Asesorados del Coach</CardTitle>
          <CardDescription>
            Lista de todos los asesorados vinculados a este coach
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mentees.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay asesorados registrados
            </p>
          ) : (
            <>
              {/* Mobile: list */}
              <div className="space-y-3 sm:hidden">
                {mentees.map((mentee) => (
                  <div key={mentee.userId} className="rounded-md border p-3 space-y-1">
                    <p className="font-medium">{mentee.name} {mentee.lastName}</p>
                    <p className="text-sm text-muted-foreground break-all">{mentee.email}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(mentee.createdAt)}</p>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Fecha de Registro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mentees.map((mentee) => (
                      <TableRow key={mentee.userId}>
                        <TableCell className="font-medium">
                          {mentee.name} {mentee.lastName}
                        </TableCell>
                        <TableCell>{mentee.email}</TableCell>
                        <TableCell>{formatDate(mentee.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña del Coach</DialogTitle>
            <DialogDescription>
              Ingresa la nueva contraseña para {coach.name} {coach.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPasswordDialogOpen(false);
                setNewPassword("");
              }}
              disabled={isChangingPassword}
            >
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                "Cambiar Contraseña"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Membership Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Membresía</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar la membresía de {coach.name}{" "}
              {coach.lastName}? Esta acción establecerá la fecha de vencimiento a hoy.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={isCanceling}
            >
              No, mantener
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelMembership}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Sí, cancelar membresía"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign/Change Membership Modal */}
      <AssignMembershipModal
        open={isAssignMembershipOpen}
        onClose={() => setIsAssignMembershipOpen(false)}
        coachId={coachId}
        plans={plans}
        onAssign={handleAssignMembershipSubmit}
      />
    </div>
  );
}
