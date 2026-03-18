"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";

const landingNavLinks = [
  { href: "/#plataforma", label: "Plataforma" },
  { href: "/auth?tab=register", label: "Prueba Gratis" },
  { href: "/#planes", label: "Planes" },
  { href: "#", label: "Recursos" },
];

// Clases reutilizables para colores invertidos (navbar oscuro en modo claro, claro en modo oscuro)
const ghostBtnCls =
  "font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 dark:text-zinc-700 dark:hover:text-zinc-900 dark:hover:bg-zinc-100";
const iconBtnCls =
  "text-zinc-400 hover:text-white hover:bg-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-900 dark:hover:bg-zinc-100";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const getDashboardUrl = () => {
    if (user?.role === "system") return "/system";
    if (user?.role === "mentee") return "/dashboard/mentee";
    return "/dashboard";
  };
  const dashboardUrl = getDashboardUrl();

  return (
    // Invertido: oscuro en modo claro, claro en modo oscuro
    <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-950 dark:bg-white border-b border-zinc-800/60 dark:border-zinc-200">
      <nav className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo — siempre a la izquierda */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* Modo claro → navbar oscuro → logo blanco */}
          <Image
            src="https://fit-connect-pro.s3.sa-east-1.amazonaws.com/fitConnectWhiteLogo.png"
            alt="FitConnect Pro"
            width={32}
            height={32}
            className="h-8 w-auto dark:hidden"
            priority
          />
          {/* Modo oscuro → navbar claro → logo negro */}
          <Image
            src="https://fit-connect-pro.s3.sa-east-1.amazonaws.com/fitConnectBlackLogo.png"
            alt="FitConnect Pro"
            width={32}
            height={32}
            className="h-8 w-auto hidden dark:block"
            priority
          />
          <span className="text-lg font-bold tracking-tight text-white dark:text-zinc-900">
            FitConnect Pro
          </span>
        </Link>

        {/* Centro — links de landing solo cuando NO está autenticado */}
        <div className="flex-1 flex justify-center">
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              {landingNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-zinc-400 hover:text-white dark:text-zinc-500 dark:hover:text-zinc-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Derecha — acciones */}
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle className={iconBtnCls} />

          {isAuthenticated ? (
            <>
              {/* Desktop: Dashboard y Mi Cuenta a la derecha */}
              <div className="hidden md:flex items-center gap-1">
                <Button asChild variant="ghost" size="sm" className={ghostBtnCls}>
                  <Link href={dashboardUrl}>Dashboard</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className={ghostBtnCls}>
                  <Link href="/my-user">Mi Cuenta</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  title="Cerrar sesión"
                  className={iconBtnCls}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile hamburger */}
              <div className="md:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className={iconBtnCls}>
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px]">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between border-b py-4">
                        <span className="font-semibold">Menú</span>
                        <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-col gap-1 py-4">
                        <Button asChild variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
                          <Link href={dashboardUrl}>Dashboard</Link>
                        </Button>
                        <Button asChild variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
                          <Link href="/my-user">Mi Cuenta</Link>
                        </Button>
                      </div>
                      <div className="mt-auto border-t py-4">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => { setOpen(false); logout(); }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Cerrar sesión
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          ) : (
            <>
              {/* Desktop: Acceder + Empieza Gratis */}
              <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className={ghostBtnCls}>
                  <Link href="/auth">Acceder</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium px-5"
                >
                  <Link href="/auth?tab=register">Empieza Gratis</Link>
                </Button>
              </div>

              {/* Mobile hamburger */}
              <div className="md:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className={iconBtnCls}>
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px]">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between border-b py-4">
                        <span className="font-semibold">Menú</span>
                        <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-col gap-1 py-4">
                        {landingNavLinks.map((link) => (
                          <Button
                            key={link.href}
                            asChild
                            variant="ghost"
                            className="justify-start"
                            onClick={() => setOpen(false)}
                          >
                            <Link href={link.href}>{link.label}</Link>
                          </Button>
                        ))}
                      </div>
                      <div className="mt-auto border-t py-4 flex flex-col gap-2">
                        <Button
                          asChild
                          variant="ghost"
                          className="w-full justify-start font-medium"
                          onClick={() => setOpen(false)}
                        >
                          <Link href="/auth">Acceder</Link>
                        </Button>
                        <Button
                          asChild
                          className="w-full rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
                          onClick={() => setOpen(false)}
                        >
                          <Link href="/auth?tab=register">Empieza Gratis</Link>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
