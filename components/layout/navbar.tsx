"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const dashboardUrl = user?.role === "mentee" ? "/dashboard/mentee" : "/dashboard";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="https://fit-connect-pro.s3.sa-east-1.amazonaws.com/fitConnectBlackLogo.png"
            alt="FitConnect Pro"
            width={160}
            height={40}
            className="h-8 w-auto dark:hidden"
            priority
          />
          <Image
            src="https://fit-connect-pro.s3.sa-east-1.amazonaws.com/fitConnectWhiteLogo.png"
            alt="FitConnect Pro"
            width={160}
            height={40}
            className="h-8 w-auto hidden dark:block"
            priority
          />
          <span className="text-xl font-bold text-black dark:text-white hidden sm:block">
            FitConnect Pro
          </span>
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
                  onClick={logout}
                  title="Sign Out"
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
                        <span className="font-semibold text-lg">Menu</span>
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
                          <Link href={dashboardUrl}>Dashboard</Link>
                        </Button>
                        <div className="flex items-center justify-between px-4">
                          <span className="text-sm text-muted-foreground">
                            Theme
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
                            logout();
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
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
                <Link href="/auth">Sign In</Link>
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