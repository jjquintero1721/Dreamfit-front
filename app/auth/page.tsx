"use client";

import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { DumbbellIcon } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <DumbbellIcon className="w-16 h-16 mb-8" />
          <h1 className="text-4xl font-bold mb-4">FitConnect Pro</h1>
          <p className="text-xl text-center max-w-md">
            Transforma vidas a través del entrenamiento personalizado
          </p>
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <DumbbellIcon className="w-12 h-12 mx-auto mb-4 text-primary lg:hidden" />
            <h2 className="text-3xl font-bold tracking-tight">
              {isLogin ? "Bienvenido de vuelta" : "Crea tu cuenta"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isLogin
                ? "¿Listo para continuar tu viaje fitness?"
                : "Comienza a transformar vidas hoy"}
            </p>
          </div>

          {isLogin ? (
            <LoginForm onToggleForm={() => setIsLogin(false)} />
          ) : (
            <SignupForm onToggleForm={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}