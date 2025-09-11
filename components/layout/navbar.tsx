"use client";

import { useState } from "react";
import Link from "next/link";
import { DumbbellIcon, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isAuthenticated = status === "authenticated";
  const dashboardUrl = session?.user?.role === "mentee" ? "/dashboard/mentee" : "/dashboard";

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success("Successfully signed out!");
    router.push("/");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <DumbbellIcon className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">FitConnect Pro</span>
        </Link>

        <div className="flex items-center">
          {isAuthenticated ? (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <Button asChild variant="ghost">
                  <Link href={dashboardUrl}>Dashboard</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
                <ThemeToggle />
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[300px] sm:w-[380px]">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between border-b py-4">
                        <span className="font-semibold text-lg">Menú</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setOpen(false)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex flex-col space-y-3 py-4">
                        <Button
                          asChild
                          variant="ghost"
                          className="justify-start"
                          onClick={() => setOpen(false)}
                        >
                          <Link href={dashboardUrl}>Panel</Link>
                        </Button>
                        <div className="flex items-center justify-between px-4">
                          <span className="text-sm text-muted-foreground">
                            Tema
                          </span>
                          <ThemeToggle />
                        </div>
                      </div>
                      <div className="mt-auto border-t py-4">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setOpen(false);
                            handleLogout();
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Cerrar Sesión
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/auth">Iniciar Sesión</Link>
              </Button>
              <div className="hidden md:block ml-4">
                <ThemeToggle />
              </div>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}