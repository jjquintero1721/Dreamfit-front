"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const signupSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Dirección de email inválida"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      "La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial"
    ),
  role: z.enum(["coach", "mentee"]),
  coachCode: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onToggleForm: () => void;
}

export function SignupForm({ onToggleForm }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "mentee",
      coachCode: "", // Initialize with empty string instead of undefined
      terms: false,
    },
  });

  const role = form.watch("role");

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  };

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);
    try {
      const signupData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        ...(data.coachCode && data.coachCode.trim() !== "" && { coachCode: data.coachCode }),
      };

      await signup(signupData);
    } catch (error) {
      // Error is already handled by the auth context
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const password = form.watch("password");
  const strength = calculatePasswordStrength(password);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Juan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="nombre@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-2 w-full rounded-full",
                          i < strength ? "bg-primary" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fortaleza de contraseña: {strength === 5 ? "Fuerte" : strength >= 3 ? "Media" : "Débil"}
                  </p>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Soy un</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="coach">Entrenador</SelectItem>
                  <SelectItem value="mentee">Alumno</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {role === "mentee" && (
          <FormField
            control={form.control}
            name="coachCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de Entrenador</FormLabel>
                <FormControl>
                  <Input placeholder="Ingresa el código de tu entrenador" {...field} />
                </FormControl>
                <FormDescription>
                  Ingresa el código proporcionado por tu entrenador (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Acepto los{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={(e) => {
                      e.preventDefault();
                      // TODO: Show terms
                    }}
                  >
                    términos y condiciones
                  </Button>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>

        <div className="text-center">
          <span className="text-muted-foreground">¿Ya tienes una cuenta? </span>
          <Button
            type="button"
            variant="link"
            className="pl-1"
            onClick={onToggleForm}
          >
            Iniciar sesión
          </Button>
        </div>
      </form>
    </Form>
  );
}