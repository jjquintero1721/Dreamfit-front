"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Check, CircleDot, X, Users2, BarChart3, Clock, TrendingUp, FileText, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { api } from "@/lib/api";

interface Graphic {
  id: number;
  name: string;
  slug: string;
}

interface Plan {
  id: number;
  name: string;
  slug: string;
  monthlyPrice: number;
  anualPrice: number;
  monthlyPriceUrl: string | null;
  anualPriceUrl: string | null;
  maxDailyMealPlans: number;
  maxMentees: number;
  contactButton: boolean;
  graphics: Graphic[];
}

interface PlansResponse {
  message: string;
  data: { plans: Plan[] };
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};


export default function Home() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    api.get<PlansResponse>("/content/plans")
      .then(res => setPlans(res.data.data.plans))
      .catch(console.error)
      .finally(() => setPlansLoading(false));
  }, []);

  const sortedPlans = [...plans].sort((a, b) => a.monthlyPrice - b.monthlyPrice);
  const popularPlanId = plans
    .filter(p => p.monthlyPrice > 0)
    .reduce<Plan | null>((prev, curr) =>
      !prev || curr.monthlyPrice > prev.monthlyPrice ? curr : prev, null)?.id ?? null;

  const getPlanFeatures = (plan: Plan) => [
    `Hasta ${plan.maxMentees} ${plan.maxMentees === 1 ? "asesorado activo" : "asesorados activos"}`,
    `Hasta ${plan.maxDailyMealPlans} planes nutricionales diarios`,
    ...plan.graphics.map(g => g.name),
  ];

  const formatLandingPrice = (price: number) =>
    price === 0 ? "$0" : `$${new Intl.NumberFormat("es-CO").format(price)}`;

  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [solutionRef, solutionInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [platformRef, platformInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [pricingRef, pricingInView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  const [testimonialsRef, testimonialsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [ctaRef, ctaInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    const update = () => {
      const cpv = window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
      setCardsPerView(cpv);
      setCarouselIndex(0);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-[#070c17] flex items-center py-24 lg:py-20 overflow-visible">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6"
            >
              {/* Badge */}
              <div className="flex items-center gap-2 w-fit">
                <CircleDot className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Usado por entrenadores en Colombia
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-zinc-900 dark:text-white leading-tight">
                Haz que tu negocio fitness se vea tan profesional como tú
              </h1>

              {/* Subtext */}
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Deja atrás las hojas de cálculo y el caos operativo.<br />
                Diseña planes personalizados de entrenamiento y nutrición.<br />
                Gestiona tu negocio fitness desde una sola plataforma profesional.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-7"
                >
                  <Link href="/auth?tab=register">
                    Empieza Gratis <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold px-7"
                >
                  <Link href="/#plataforma">Ver Como Funciona</Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  Empieza gratis hoy • Sin tarjeta de crédito
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  Listo en menos de 2 minutos
                </div>
              </div>
            </motion.div>

            {/* Right: Dashboard image + floating stats */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative mt-4 lg:mt-0 mx-2 sm:mx-4 lg:mx-0"
            >
              {/* Stat card: Planes Activos */}
              <div className="absolute -top-4 right-0 lg:-right-4 z-10 bg-white dark:bg-zinc-800 rounded-xl lg:rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xl px-3 py-2 lg:px-5 lg:py-3">
                <p className="text-[9px] lg:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">
                  Planes Activos
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-blue-500">33</p>
              </div>

              {/* Dashboard image */}
              <div className="relative rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-700 mt-4">
                <Image
                  src="/img/dashboard-preview.png"
                  alt="FitConnect Pro Dashboard"
                  width={700}
                  height={450}
                  className="w-full h-auto"
                  priority
                />
              </div>

              {/* Stat card: Asesorados Activos */}
              <div className="absolute -bottom-4 left-0 lg:-left-4 z-10 bg-white dark:bg-zinc-800 rounded-xl lg:rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-xl px-3 py-2 lg:px-5 lg:py-3">
                <p className="text-[9px] lg:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">
                  Asesorados Activos
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-blue-500">28</p>
              </div>

              {/* Spacer para la tarjeta de abajo en mobile */}
              <div className="h-6 lg:hidden" />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Pain Points Section — fondo siempre claro */}
      <section className="py-20 sm:py-24 bg-white" ref={featuresRef}>
        <div className="container mx-auto px-4 sm:px-6">

          {/* Header */}
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 mb-4">
              La Realidad de Gestionar un Negocio Fitness
            </h2>
            <p className="text-zinc-500 text-base sm:text-lg max-w-2xl mx-auto">
              Muchos entrenadores pasan más tiempo organizando rutinas, mensajes y pagos que entrenando
              a sus propios asesorados. ¿Te resulta familiar?
            </p>
          </motion.div>

          {/* Pain points card */}
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700/60 p-6 sm:p-8 lg:p-10">

              {/* Card header */}
              <div className="flex items-center gap-2 mb-7">
                <X className="h-5 w-5 text-zinc-800 dark:text-zinc-100 shrink-0" />
                <span className="font-bold text-base sm:text-lg text-zinc-800 dark:text-zinc-100">
                  Sin una Plataforma Profesional
                </span>
              </div>

              {/* Items — 2 cols on sm+, 1 col on mobile */}
              <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                {[
                  "Rutinas y planes nutricionales en Excel o PDF",
                  "Seguimiento manual y pérdida de progreso",
                  "Datos de asesorados dispersos en WhatsApp",
                  "Cobros desorganizados y recordatorios constantes",
                  "Horas invertidas en tareas administrativas",
                  "Imagen poco profesional frente a nuevos clientes",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 sm:py-24 bg-white dark:bg-[#070c17]" ref={solutionRef}>
        <div className="container mx-auto px-4 sm:px-6">

          {/* Header */}
          <motion.div
            initial="hidden"
            animate={solutionInView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
              La Solución Profesional
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
              FitConnect Pro pone todo en un solo lugar, para que puedas enfocarte en lo que mejor haces—
              entrenar a tus clientes.
            </p>
          </motion.div>

          {/* Solution card */}
          <motion.div
            initial="hidden"
            animate={solutionInView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="rounded-2xl border border-blue-200 dark:border-zinc-600/50 bg-blue-50/40 dark:bg-[#0d1626] p-6 sm:p-8 lg:p-10">

              {/* Card header */}
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                  <Image
                    src="https://fit-connect-pro.s3.sa-east-1.amazonaws.com/fitConnectWhiteLogo.png"
                    alt="FitConnect Pro"
                    width={22}
                    height={22}
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <span className="font-bold text-base sm:text-lg text-zinc-800 dark:text-zinc-100">
                  Con FitConnect Pro
                </span>
              </div>

              {/* Items — 2 cols on sm+, 1 col on mobile */}
              <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 mb-8">
                {[
                  "Planes personalizados de entrenamiento y nutrición",
                  "Actualización rápida de planes según cada avance",
                  "Videos explicativos en cada ejercicio",
                  "Cobros organizados y controlados",
                  "Seguimiento claro de cada asesorado",
                  "Una imagen profesional frente a tus clientes",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider + footer */}
              <div className="border-t border-blue-200 dark:border-zinc-700 pt-6 text-center">
                <p className="font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
                  ¿Listo para transformar la forma en que gestionas tu negocio fitness?
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Empieza gratis—sin tarjeta de crédito
                </p>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* Stats Section — siempre oscuro */}
      <section className="py-16 sm:py-20 bg-[#070c17]" ref={statsRef}>
        <div className="container mx-auto px-4 sm:px-6">

          {/* Subtitle */}
          <motion.p
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-center text-zinc-400 text-sm sm:text-base mb-12"
          >
            Únete a los entrenadores que ya están transformando su negocio fitness
          </motion.p>

          {/* Stats grid */}
          <motion.div
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 max-w-4xl mx-auto"
          >
            {/* Entrenadores Activos */}
            <div className="flex flex-col items-center text-center gap-2">
              <Users2 className="h-7 w-7 text-blue-500 mb-1" />
              <span className="text-4xl sm:text-5xl font-bold text-white">22+</span>
              <span className="text-sm text-zinc-400 leading-snug">Entrenadores Activos</span>
            </div>

            {/* Clientes Gestionados */}
            <div className="flex flex-col items-center text-center gap-2">
              <BarChart3 className="h-7 w-7 text-blue-500 mb-1" />
              <span className="text-4xl sm:text-5xl font-bold text-white">250+</span>
              <span className="text-sm text-zinc-400 leading-snug">Clientes Gestionados</span>
            </div>

            {/* Horas Ahorradas */}
            <div className="flex flex-col items-center text-center gap-2">
              <Clock className="h-7 w-7 text-blue-500 mb-1" />
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-bold text-white">10+</span>
                <span className="text-3xl sm:text-4xl font-bold text-white">Horas</span>
              </div>
              <span className="text-sm text-zinc-400 leading-snug">Ahorradas por Semana</span>
            </div>

            {/* Años en Crecimiento */}
            <div className="flex flex-col items-center text-center gap-2">
              <TrendingUp className="h-7 w-7 text-blue-500 mb-1" />
              <span className="text-4xl sm:text-5xl font-bold text-white">1.5+</span>
              <span className="text-sm text-zinc-400 leading-snug">Años en Crecimiento</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-20 sm:py-24 bg-white dark:bg-[#070c17]" id="plataforma" ref={platformRef}>
        <div className="container mx-auto px-4 sm:px-6">

          {/* Header */}
          <motion.div
            initial="hidden"
            animate={platformInView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
              Todo Lo que Necesitas en<br className="hidden sm:block" /> Una Sola Plataforma
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg max-w-xl mx-auto">
              Todas las herramientas que necesitas para gestionar tu negocio fitness
              desde un solo lugar y trabajar de forma más profesional.
            </p>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial="hidden"
            animate={platformInView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {[
              {
                icon: <Users2 className="h-5 w-5 text-blue-500" />,
                title: "Gestión de Asesorados",
                description: "Visualiza fechas de ingreso, plan activo y duración de cada asesorado desde un panel organizado.",
              },
              {
                icon: <FileText className="h-5 w-5 text-blue-500" />,
                title: "Constructor de Planes",
                description: "Crea y asigna planes personalizados de entrenamiento con biblioteca de ejercicios y videos explicativos.",
              },
              {
                icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
                title: "Seguimiento de Progreso",
                description: "Monitorea el avance de tus asesorados y ajusta sus planes según su evolución.",
              },
              {
                icon: <Zap className="h-5 w-5 text-blue-500" />,
                title: "Planificación Nutricional",
                description: "Diseña planes de alimentación integrados al plan de entrenamiento en un mismo lugar.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-700/50 bg-white dark:bg-[#0d1626] p-6 flex flex-col gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* Pricing Section — fondo siempre claro */}
      <section className="py-20 sm:py-24 bg-slate-50" ref={pricingRef} id="planes">
        <div className="container mx-auto px-4 sm:px-6">

          <motion.div
            initial="hidden"
            animate={pricingInView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center gap-4 mb-14"
          >
            {/* Top badge */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500 text-white text-sm font-medium">
              <Zap className="h-3.5 w-3.5" />
              Empieza Gratis • Sin Tarjeta de Crédito
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 max-w-3xl">
              Empieza Gratis Hoy. Escala Cuando lo Necesites.
            </h2>
            <p className="text-zinc-500 text-base sm:text-lg max-w-xl">
              Accede a las funciones esenciales sin costo y mejora tu plan
              solo cuando necesites más capacidad.
            </p>
          </motion.div>

          {/* Skeleton loading */}
          {plansLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[480px] rounded-2xl bg-zinc-200 animate-pulse" />
              ))}
            </div>
          )}

          {/* Plan cards — carousel */}
          {!plansLoading && sortedPlans.length > 0 && (() => {
            const gap = 20;
            const maxIndex = Math.max(0, sortedPlans.length - cardsPerView);
            const canPrev = carouselIndex > 0;
            const canNext = carouselIndex < maxIndex;

            return (
              <motion.div
                initial="hidden"
                animate={pricingInView ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                {/* Overflow clip */}
                <div className="overflow-hidden pt-5">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(calc(-${carouselIndex} * (100% + ${gap}px) / ${cardsPerView}))`,
                    }}
                  >
                    {sortedPlans.map(plan => {
                      const isFree = plan.monthlyPrice === 0;
                      const isPopular = plan.id === popularPlanId;

                      return (
                        <div
                          key={plan.id}
                          className="shrink-0 relative mt-1 pb-2"
                          style={{
                            width: `calc((100% + ${gap}px) / ${cardsPerView} - ${gap}px)`,
                            marginRight: `${gap}px`,
                          }}
                        >
                          {/* Badge */}
                          {isFree && (
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 py-1 rounded-full border-2 border-blue-400 bg-slate-50 text-blue-500 text-xs font-semibold whitespace-nowrap">
                              <Zap className="h-3 w-3" />
                              Perfecto Para Empezar
                            </div>
                          )}
                          {isPopular && (
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full bg-amber-400 text-white text-xs font-bold whitespace-nowrap">
                              Más Popular
                            </div>
                          )}

                          {/* Card */}
                          {isFree ? (
                            <div className="rounded-2xl border-2 border-blue-400 bg-white p-6 sm:p-7 flex flex-col h-full">
                              <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-2">
                                Plan Gratuito Para Siempre
                              </p>
                              <h3 className="text-2xl font-bold text-zinc-900 mb-2">{plan.name}</h3>
                              <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-5xl font-bold text-zinc-900">{formatLandingPrice(plan.monthlyPrice)}</span>
                                <span className="text-sm text-zinc-400">/mes</span>
                              </div>
                              <p className="text-sm text-zinc-500 mb-6">Todo lo que necesitas para empezar profesionalmente</p>
                              <div className="flex flex-col gap-3 flex-1 mb-7">
                                {getPlanFeatures(plan).map(f => (
                                  <div key={f} className="flex items-start gap-2.5">
                                    <div className="mt-0.5 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                      <Check className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-sm text-zinc-600">{f}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button asChild className="w-full rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold h-11">
                                  <Link href="/auth?tab=register">Empieza Gratis Ahora</Link>
                                </Button>
                                <p className="text-center text-xs text-zinc-400">Sin tarjeta de crédito</p>
                              </div>
                            </div>
                          ) : (
                            <div className={`rounded-2xl p-6 sm:p-7 flex flex-col h-full ${isPopular ? "bg-[#0d1626] border border-zinc-700/50" : "bg-zinc-900 border border-zinc-700/40"}`}>
                              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                Para Coaches en Crecimiento
                              </p>
                              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                              <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-5xl font-bold text-white">{formatLandingPrice(plan.monthlyPrice)}</span>
                                <span className="text-sm text-zinc-400">/mes</span>
                              </div>
                              <p className="text-sm text-zinc-400 mb-4">Más capacidad operativa para entrenadores en crecimiento</p>
                              <p className="text-sm font-semibold text-blue-400 mb-4">Incluye todo lo del plan gratuito, más:</p>
                              <div className="flex flex-col gap-3 flex-1 mb-7">
                                {getPlanFeatures(plan).map(f => (
                                  <div key={f} className="flex items-start gap-2.5">
                                    <div className="mt-0.5 h-5 w-5 rounded-full border border-blue-400/60 bg-blue-500/10 flex items-center justify-center shrink-0">
                                      <Check className="h-3 w-3 text-blue-400" />
                                    </div>
                                    <span className="text-sm text-zinc-300">{f}</span>
                                  </div>
                                ))}
                              </div>
                              <Button asChild variant="outline" className="w-full rounded-xl border-zinc-500 text-white hover:bg-zinc-700 hover:text-white font-semibold h-11 bg-transparent">
                                <Link href={plan.monthlyPriceUrl ?? "/pricing"} target={plan.monthlyPriceUrl ? "_blank" : undefined}>
                                  Comenzar con {plan.name}
                                </Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() => setCarouselIndex(i => Math.max(0, i - 1))}
                    disabled={!canPrev}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 ${canPrev ? "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 shadow-sm" : "border-zinc-200 bg-zinc-100 text-zinc-300 cursor-default"}`}
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Dots */}
                  <div className="flex gap-2">
                    {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCarouselIndex(i)}
                        className={`rounded-full transition-all duration-200 ${i === carouselIndex ? "w-5 h-2 bg-blue-500" : "w-2 h-2 bg-zinc-300 hover:bg-zinc-400"}`}
                        aria-label={`Ir a página ${i + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setCarouselIndex(i => Math.min(maxIndex, i + 1))}
                    disabled={!canNext}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 ${canNext ? "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 shadow-sm" : "border-zinc-200 bg-zinc-100 text-zinc-300 cursor-default"}`}
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })()}

        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-24 bg-white dark:bg-[#070c17]" ref={testimonialsRef}>
        <div className="container mx-auto px-4 sm:px-6">

          <motion.div
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white">
              Amado Por Entrenadores Personales
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl mx-auto"
          >
            {[
              {
                initials: "JC",
                name: "Juan Jose Caracas",
                location: "Armenia, Quindío",
                quote: '"FitConnect Pro saved me 12+ hours every week. I went from 8 clients to 35 without hiring help."',
                color: "bg-blue-500",
              },
              {
                initials: "MR",
                name: "Ricardo Castaño",
                location: "Armenia, Quindío",
                quote: '"Pasé de usar hojas de cálculo a tener todo organizado en FitConnect. Mucho más práctico".',
                color: "bg-teal-500",
              },
              {
                initials: "ET",
                name: "Emma Thompson",
                location: "Seattle, WA",
                quote: '"Switched from spreadsheets 6 months ago. Revenue up 40%, stress down. Best decision ever."',
                color: "bg-indigo-400",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-zinc-200 bg-white p-6 flex flex-col gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center shrink-0`}>
                    <span className="text-sm font-bold text-white">{t.initials}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-zinc-900">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.location}</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">{t.quote}</p>
              </div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden" ref={ctaRef}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500" />

        <div className="container relative mx-auto px-4 sm:px-6 text-center max-w-3xl">

          <motion.h2
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight"
          >
            Toma el Control de Tu Negocio<br className="hidden sm:block" /> Fitness Hoy
          </motion.h2>

          <motion.p
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-white/80 text-base sm:text-lg mb-10"
          >
            Únete a los entrenadores que ya están organizando su negocio con FitConnect. Empieza gratis—Sin tarjeta de credito.
          </motion.p>

          <motion.div
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-8"
          >
            <Button
              asChild
              size="lg"
              className="bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800 dark:border dark:border-zinc-700 font-bold px-8 h-12 text-sm tracking-widest rounded-full"
            >
              <Link href="/auth?tab=register">
                EMPIEZA GRATIS HOY <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
              {["Plan Free Para Siempre", "Sin Tarjeta de Credito", "Configuración en Minutos"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-white/90 text-sm">
                  <Check className="h-4 w-4 text-white shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}