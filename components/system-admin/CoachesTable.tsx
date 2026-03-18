"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CoachListItem } from "@/types/system-admin";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CoachesTableProps {
  coaches: CoachListItem[];
  onAssignMembership: (coachId: string) => void;
}

export default function CoachesTable({
  coaches,
  onAssignMembership,
}: CoachesTableProps) {
  const router = useRouter();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  if (coaches.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        No se encontraron coaches
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Cards */}
      <div className="space-y-4 lg:hidden">
        {coaches.map((coach) => (
          <Card key={coach.userId}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-base">
                  {coach.name} {coach.lastName}
                </span>
                <Badge
                  variant={coach.hasActiveMembership ? "default" : "secondary"}
                >
                  {coach.hasActiveMembership ? "Activa" : "Inactiva"}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground break-all">
                {coach.email}
              </p>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Plan: </span>
                  <span>{coach.planName || "Sin plan"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Vence: </span>
                  <span>{formatDate(coach.membershipEndDate)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Asesorados: </span>
                  <Badge variant="outline">{coach.menteesCount}</Badge>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:flex-1"
                  onClick={() => onAssignMembership(coach.userId)}
                >
                  Asignar Membresía
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full sm:flex-1"
                  onClick={() => router.push(`/system/coach/${coach.userId}`)}
                >
                  Ver Más
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="rounded-md border hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Membresía</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Fecha Vencimiento</TableHead>
              <TableHead>Asesorados</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coaches.map((coach) => (
              <TableRow key={coach.userId}>
                <TableCell className="font-medium">
                  {coach.name} {coach.lastName}
                </TableCell>
                <TableCell>{coach.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={coach.hasActiveMembership ? "default" : "secondary"}
                  >
                    {coach.hasActiveMembership ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {coach.planName || (
                    <span className="text-muted-foreground">Sin plan</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(coach.membershipEndDate)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{coach.menteesCount}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col xl:flex-row gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAssignMembership(coach.userId)}
                    >
                      Asignar Membresía
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => router.push(`/system/coach/${coach.userId}`)}
                    >
                      Ver Más
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
