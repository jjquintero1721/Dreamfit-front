"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Users, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RegisterMenteeModal } from "@/components/dashboard/register-mentee-modal";

interface Mentee {
  user_id: string;
  name: string;
  last_name: string;
}

export default function DashboardPage() {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  const fetchMentees = useCallback(async () => {
    try {
      if (!session?.user?.id) {
        throw new Error("User ID not found");
      }
      const response = await api.get(`/mentees/${session.user.id}`);
      setMentees(response.data.data);
    } catch (error) {
      console.error("Failed to fetch mentees:", error);
      toast.error("Error al cargar los alumnos. Por favor, intenta de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "coach") {
      fetchMentees();
    } else if (status === "authenticated" && session?.user?.role !== "coach") {
      router.push("/dashboard/mentee");
    } else if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, session, router, fetchMentees]);

  const filteredMentees = mentees.filter(
    (mentee) =>
      `${mentee.name} ${mentee.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const handleMenteeClick = (id: string) => {
    router.push(`/dashboard/mentee-details/${id}`);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!session || session.user?.role !== "coach") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">
          Debes iniciar sesión como entrenador para ver esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative mb-12 pb-8 border-b p-6 rounded-lg bg-gradient-to-r from-blue-500/5 via-transparent to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-500/10 to-blue-500/10 opacity-30 rounded-lg" />
        <h1 className="relative text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-600 dark:from-blue-400 dark:to-blue-400">
          ¡Bienvenido, {session.user.name}!
        </h1>
        <p className="relative text-muted-foreground mt-2">
          Gestiona tus alumnos y sigue su progreso
        </p>
      </div>

      {/* Stats card + action button */}
      <Card className="mb-8 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-500/10 dark:via-blue-500/5 dark:to-transparent border-blue-200 dark:border-blue-500/20">
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Total de Alumnos</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-blue-700 dark:text-blue-400">{mentees.length}</span>
                <span className="text-sm text-blue-600/80 dark:text-blue-400/80">
                  {mentees.length === 1 ? "Alumno Activo" : "Alumnos Activos"}
                </span>
              </div>
            </div>
          </div>
          <RegisterMenteeModal onMenteeCreated={fetchMentees} />
        </CardContent>
      </Card>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar alumnos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background/50 backdrop-blur-sm border-muted transition-shadow focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:border-input focus-visible:ring-ring"
        />
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-x-auto backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8">
                  Cargando alumnos...
                </TableCell>
              </TableRow>
            ) : filteredMentees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8">
                  No se encontraron alumnos
                </TableCell>
              </TableRow>
            ) : (
              filteredMentees.map((mentee) => (
                <TableRow
                  key={mentee.user_id}
                  className="group cursor-pointer transition-colors hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-blue-500/5"
                  onClick={() => handleMenteeClick(mentee.user_id)}
                >
                  <TableCell className="font-medium">
                    {mentee.name} {mentee.last_name}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-500/10 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-400/10"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span className="sr-only">Ver detalles del alumno</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
