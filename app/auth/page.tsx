"use client";

import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import Image from "next/image";

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
          <Image
            src="https://fit-connect-pro.s3.sa-east-1.amazonaws.com/fitConnectWhiteLogo.png"
            alt="FitConnect Pro"
            width={200}
            height={50}
            className="h-12 w-auto mb-8"
            priority
          />
          <p className="text-xl text-center max-w-md">
            Transform lives through personalized fitness coaching
          </p>
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="lg:hidden mb-4 flex justify-center">
              <Image
                src="https://fit-connect-pro.s3.sa-east-1.amazonaws.com/fitConnectBlackLogo.png"
                alt="FitConnect Pro"
                width={160}
                height={40}
                className="h-10 w-auto dark:hidden"
                priority
              />
              <Image
                src="https://fit-connect-pro.s3.sa-east-1.amazonaws.com/fitConnectWhiteLogo.png"
                alt="FitConnect Pro"
                width={160}
                height={40}
                className="h-10 w-auto hidden dark:block"
                priority
              />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isLogin
                ? "Ready to continue your fitness journey?"
                : "Start transforming lives today"}
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