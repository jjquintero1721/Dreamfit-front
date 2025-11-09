"use client";

import { ArrowRight, DumbbellIcon, Users2, BarChart3, Utensils, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [ctaRef, ctaInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <motion.header 
        className="relative py-24 lg:py-32 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.6 }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center -z-10"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/60" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white mb-6 [text-wrap:balance]"
              variants={fadeIn}
              transition={{ delay: 0.2 }}
            >
              Transforma Vidas a Través del{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                Entrenamiento Personalizado
              </span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-200 mb-8"
              variants={fadeIn}
              transition={{ delay: 0.4 }}
            >
              Conecta con entrenadores dedicados o haz crecer tu negocio de entrenamiento con nuestra plataforma integral.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-4"
              variants={fadeIn}
              transition={{ delay: 0.6 }}
            >
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
              >
                <Link href="/auth">
                  Comenzar <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                asChild
              >
                <Link href="/pricing">Ver Precios</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Features Section */}
      <section className="py-20 bg-background" ref={featuresRef}>
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center mb-4">
              Todo lo que Necesitas para{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
                Triunfar
              </span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Nuestra plataforma integral proporciona todas las herramientas que necesitas para gestionar y hacer crecer tu negocio de entrenamiento físico.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {[
              {
                icon: <DumbbellIcon className="h-10 w-10" />,
                title: "Planificación de Entrenamientos",
                description: "Crea y asigna planes de entrenamiento personalizados adaptados a los objetivos y habilidades de cada cliente."
              },
              {
                icon: <Users2 className="h-10 w-10" />,
                title: "Gestión de Clientes",
                description: "Gestiona eficientemente tu cartera de clientes, rastrea el progreso y mantén la comunicación."
              },
              {
                icon: <BarChart3 className="h-10 w-10" />,
                title: "Seguimiento de Progreso",
                description: "Monitorea el progreso de los clientes con análisis detallados y métricas de rendimiento."
              },
              {
                icon: <Utensils className="h-10 w-10" />,
                title: "Planificación de Comidas",
                description: "Crea planes de comidas personalizados y orientación nutricional para apoyar los objetivos de fitness de tus clientes."
              },
              {
                icon: <Shield className="h-10 w-10" />,
                title: "Plataforma Segura",
                description: "Tus datos están protegidos con medidas de seguridad y privacidad de nivel empresarial."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="group p-6 rounded-lg border bg-gradient-to-br from-background to-muted/50 hover:shadow-lg transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-500/5 hover:to-cyan-500/5 hover:scale-105 hover:-translate-y-1"
              >
                <div className="text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="relative py-20 overflow-hidden"
        ref={ctaRef}
        initial="hidden"
        animate={ctaInView ? "visible" : "hidden"}
        variants={fadeIn}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500" />
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(white,transparent_70%)]" />

        <div className="container relative mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl font-bold mb-6 text-white"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            ¿Listo para Comenzar tu Viaje Fitness?
          </motion.h2>
          <motion.p
            className="text-xl mb-8 text-white/90"
            variants={fadeIn}
            transition={{ delay: 0.4 }}
          >
            Únete a miles de entrenadores y clientes que ya usan DreamFit Store
          </motion.p>
          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.6 }}
          >
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="bg-white hover:bg-white/90 text-blue-600 dark:text-blue-600 hover:text-blue-700 dark:hover:text-blue-700"
            >
              <Link href="/auth">
                Crear tu Cuenta <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}