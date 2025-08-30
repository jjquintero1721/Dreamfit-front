"use client";

import { useEffect, useState } from "react";
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
import { Search, Users, Copy, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    const fetchMentees = async () => {
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
    };

    if (status === "authenticated" && session?.user?.role === "coach") {
      fetchMentees();
    } else if (status === "authenticated" && session?.user?.role !== "coach") {
      router.push("/dashboard/mentee");
    } else if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, session, router]);

  const filteredMentees = mentees.filter(
    (mentee) =>
      `${mentee.name} ${mentee.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const handleMenteeClick = (id: string) => {
    router.push(`/dashboard/mentee-details/${id}`);
  };

  const copyCoachCode = () => {
    if (session?.user?.coachCode) {
      navigator.clipboard.writeText(session.user.coachCode);
      toast.success("¡Código de entrenador copiado al portapapeles!");
    }
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

      {/* Grid layout for cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-500/10 dark:via-blue-500/5 dark:to-transparent border-blue-200 dark:border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Total de Alumnos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              {mentees.length}
            </div>
            <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
              {mentees.length === 1 ? "Alumno Activo" : "Alumnos Activos"}
            </p>
          </CardContent>
        </Card>

        {session.user.coachCode && (
          <Card className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-500/10 dark:via-blue-500/5 dark:to-transparent border-blue-200 dark:border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-400">Tu Código de Entrenador</CardTitle>
              <CardDescription className="text-blue-600/80 dark:text-blue-400/80">
                Comparte este código con tus alumnos para conectar con ellos
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <code className="relative rounded bg-blue-500/10 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                {session.user.coachCode}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="ml-2 border-blue-500/20 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={copyCoachCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

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