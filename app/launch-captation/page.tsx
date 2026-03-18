"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

const KLAVIYO_BASE =
    process.env.NEXT_PUBLIC_KLAVIYO_REGION === "eu"
        ? "https://manage.kmail-lists.eu"
        : "https://manage.kmail-lists.com";

const LIST_ID =
    process.env.NEXT_PUBLIC_KLAVIYO_LIST_ID || "REEMPLAZA_LIST_ID_EN_ENV";
const SUCCESS_URL =
    process.env.NEXT_PUBLIC_SUCCESS_URL || "https://TU-DOMINIO.com/gracias";

declare global {
    interface Window {
        ttq?: any;
    }
}

export default function LaunchCaptationPage() {
    const [countdown, setCountdown] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [formData, setFormData] = useState({ name: "", email: "" });

    const scrollToForm = () => {
        if (window.ttq) {
            window.ttq.track("ClickButton");
        }

        const formElement = document.getElementById("form");
        if (formElement) {
            formElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    };

    useEffect(() => {
        const targetDate = new Date("2025-11-19T09:00:00-05:00");
        const updateCountdown = () => {
            const now = new Date();
            const diff = Math.max(0, targetDate.getTime() - now.getTime());
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setCountdown({ days, hours, minutes, seconds });
        };
        updateCountdown();
        const id = setInterval(updateCountdown, 1000);
        return () => clearInterval(id);
    }, []);

    // IMPORTANTE: no hacemos preventDefault aquí para permitir la redirección de Klaviyo
    const onSubmitNative = () => {
        // Aquí asumimos que el formulario pasó la validación HTML5 (required)
        if (window.ttq) {
            // Puedes usar uno o los dos:
            window.ttq.track("SubmitForm");
            window.ttq.track("CompleteRegistration");
        }
        // Si quieres, puedes dejar un toast suave, pero sin bloquear el submit:
        // toast.message("Enviando tu registro...");
    };

    const CountdownCell = ({
        value,
        label,
    }: {
        value: number;
        label: string;
    }) => (
        <div className="glass rounded-xl p-4 min-w-[72px]">
            <div className="text-3xl font-extrabold">{value}</div>
            <div className="text-xs mt-1 text-gray-400">{label}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0C141D] text-white font-sans antialiased selection:bg-sky-500/30 selection:text-white">
            <style jsx global>{`
                :root {
                    --bg: #0c141d;
                    --fg: #ffffff;
                    --muted: #b8c0cc;
                    --primary: #3a83f6;
                    --accent: #07b6d5;
                    --border: rgba(255, 255, 255, 0.1);
                    --card: #101923;
                    --grad: linear-gradient(
                        90deg,
                        var(--primary),
                        var(--accent)
                    );
                }
                body {
                    background: radial-gradient(
                            1200px 800px at 90% -10%,
                            rgba(58, 131, 246, 0.15),
                            transparent 60%
                        ),
                        var(--bg);
                }
                .glass {
                    background: linear-gradient(
                        180deg,
                        rgba(255, 255, 255, 0.05),
                        rgba(255, 255, 255, 0.015)
                    );
                    border: 1px solid var(--border);
                    backdrop-filter: blur(8px);
                }
                .btn-primary {
                    background: var(--grad);
                    color: #fff;
                    font-weight: 700;
                    box-shadow: 0 10px 30px rgba(7, 182, 213, 0.35);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 14px 40px rgba(7, 182, 213, 0.5);
                }
                .chip {
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    color: #e6f1ff;
                }
                .kicker {
                    color: var(--accent);
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    font-weight: 600;
                }
                .check::before {
                    content: "✔";
                    margin-right: 0.55rem;
                    color: var(--accent);
                }
                .text-muted {
                    color: var(--muted);
                }
                .divider {
                    height: 1px;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.12),
                        transparent
                    );
                }
                .input-field {
                    background: rgba(12, 20, 29, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                }
            `}</style>

            {/* HERO */}
            <header className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <p className="kicker mb-3">Cupos limitados</p>
                            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
                                ¿Aún llevas tus clientes en Excel y WhatsApp?
                                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                                    Es hora de organizar tu negocio fitness.
                                </span>
                            </h1>
                            <p className="mt-5 text-lg text-muted">
                                Regístrate <strong>GRATIS</strong> y recibe el{" "}
                                <strong>Kit Express</strong> + acceso exclusivo
                                a la{" "}
                                <strong>Masterclass del 19 de noviembre</strong>
                                . Deja el caos, gana control y retén más
                                clientes con menos esfuerzo.
                            </p>
                            <ul className="mt-6 flex flex-wrap gap-2 text-sm">
                                <li className="chip rounded-full px-3 py-1">
                                    100% gratis
                                </li>
                                <li className="chip rounded-full px-3 py-1">
                                    Cupos limitados
                                </li>
                                <li className="chip rounded-full px-3 py-1">
                                    Sorteo: 10 becas FitConnect Pro
                                </li>
                            </ul>

                            {/* ====== KLAVIYO: POST NATIVO ======
                                - US: https://manage.kmail-lists.com/subscriptions/subscribe
                                - EU: https://manage.kmail-lists.eu/subscriptions/subscribe
                                No uses preventDefault para que redirija a SUCCESS_URL.
                            */}
                            <form
                                id="form"
                                className="glass rounded-2xl p-4 mt-7 max-w-xl"
                                method="POST"
                                action={`${KLAVIYO_BASE}/subscriptions/subscribe`}
                                onSubmit={onSubmitNative} // no llamar preventDefault aquí
                            >
                                {/* Requeridos por Klaviyo */}
                                <input type="hidden" name="g" value={LIST_ID} />
                                <input
                                    type="hidden"
                                    name="$fields"
                                    value="first_name"
                                />
                                <input
                                    type="hidden"
                                    name="source"
                                    value="fitconnectpro-landing-prelaunch"
                                />
                                <input
                                    type="hidden"
                                    name="success_url"
                                    value={SUCCESS_URL}
                                />

                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="block text-sm text-muted mb-1"
                                        >
                                            Nombre
                                        </label>
                                        {/* IMPORTANTE: name="first_name" para que Klaviyo lo guarde */}
                                        <input
                                            id="name"
                                            name="first_name"
                                            required
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="input-field w-full rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                            placeholder="Tu nombre"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm text-muted mb-1"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="input-field w-full rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                            placeholder="tucorreo@ejemplo.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    className="btn-primary w-full mt-4 rounded-xl px-4 py-3 text-base"
                                    type="submit"
                                >
                                    QUIERO MI KIT EXPRESS
                                </button>
                                <p className="mt-3 text-xs text-muted">
                                    Al registrarte aceptas recibir emails
                                    relevantes sobre el lanzamiento. Baja en un
                                    clic.
                                </p>
                            </form>
                        </div>

                        <div className="relative">
                            <div className="glass rounded-3xl p-6 border-white/10">
                                <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-500/10 via-transparent to-cyan-500/10">
                                    <p className="kicker mb-2">Masterclass</p>
                                    <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                                        19 de noviembre — 9:00 AM
                                    </h2>
                                    <p className="text-muted mt-2">
                                        Cómo organizar tu negocio fitness y
                                        retener más clientes (sin estrés ni
                                        caos).
                                    </p>
                                    <div className="mt-6 grid grid-cols-4 gap-3 text-center">
                                        <CountdownCell
                                            value={countdown.days}
                                            label="DÍAS"
                                        />
                                        <CountdownCell
                                            value={countdown.hours}
                                            label="HRS"
                                        />
                                        <CountdownCell
                                            value={countdown.minutes}
                                            label="MIN"
                                        />
                                        <CountdownCell
                                            value={countdown.seconds}
                                            label="SEG"
                                        />
                                    </div>
                                    <a
                                        href="#form"
                                        onClick={() => {
                                            if (window.ttq) {
                                                window.ttq.track("ClickButton");
                                            }
                                        }}
                                        className="btn-primary inline-block mt-6 rounded-xl px-5 py-3 font-semibold"
                                    >
                                        RESERVAR MI LUGAR GRATIS
                                    </a>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-muted">
                                * Zona horaria: América/Bogotá
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="divider" />

            {/* BENEFICIOS INMEDIATOS */}
            <section className="py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <h3 className="text-2xl sm:text-3xl font-extrabold">
                            Lo que recibes al registrarte hoy (totalmente
                            gratis)
                        </h3>
                        <p className="mt-3 text-muted">
                            Entra ahora y desbloquea recursos que te dan orden
                            desde el día 1.
                        </p>
                    </div>
                    <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                emoji: "📘",
                                title: "Mini‑guía PDF",
                                description:
                                    '"3 errores que hacen perder clientes y cómo evitarlos".',
                            },
                            {
                                emoji: "📊",
                                title: "Plantilla rápida en Excel/Sheets",
                                description:
                                    "En 5 minutos tendrás más orden que en semanas con tus hojas viejas.",
                            },
                            {
                                emoji: "🎥",
                                title: "Acceso a la Masterclass",
                                description:
                                    "El 19 de noviembre: método para ordenar clientes y pagos.",
                            },
                            {
                                emoji: "💬",
                                title: "Grupo privado pre‑evento",
                                description:
                                    "Tips, recordatorios y networking con otros entrenadores.",
                            },
                            {
                                emoji: "🎁",
                                title: "Sorteo de 10 becas",
                                description:
                                    "1 mes de FitConnect Pro totalmente gratis.",
                            },
                            {
                                emoji: "🔒",
                                title: "Bonus secreto",
                                description:
                                    "Solo revelado durante la Masterclass EN VIVO.",
                            },
                        ].map((benefit, index) => (
                            <article
                                key={index}
                                className="glass rounded-2xl p-6"
                            >
                                <div className="text-3xl">{benefit.emoji}</div>
                                <h4 className="mt-3 font-semibold text-lg">
                                    {benefit.title}
                                </h4>
                                <p className="text-muted">
                                    {benefit.description}
                                </p>
                            </article>
                        ))}
                    </div>
                    <div className="text-center mt-10">
                        <button
                            onClick={scrollToForm}
                            className="btn-primary rounded-xl px-6 py-3 font-semibold"
                        >
                            QUIERO REGISTRARME AHORA Y RECIBIR TODO GRATIS
                        </button>
                    </div>
                </div>
            </section>

            <div className="divider"></div>

            {/* VIDEO / STORY */}
            <section className="py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <p className="kicker mb-2">Míralo</p>
                            <h3 className="text-2xl sm:text-3xl font-extrabold">
                                Lo que estás viviendo hoy… y cómo cambiarlo
                            </h3>
                            <ul className="mt-5 space-y-3 text-muted">
                                <li className="check">
                                    ¿Clientes en Excel, pagos perdidos en
                                    WhatsApp, rutinas olvidadas?
                                </li>
                                <li className="check">
                                    Este caos es real para la mayoría, pero no
                                    tiene que ser el tuyo.
                                </li>
                                <li className="check">
                                    Empieza GRATIS con el Kit Express y aprende
                                    el método completo el 19 de noviembre.
                                </li>
                            </ul>
                            <button
                                onClick={scrollToForm}
                                className="btn-primary inline-block mt-6 rounded-xl px-6 py-3 font-semibold"
                            >
                                SÍ, QUIERO MI KIT EXPRESS AHORA
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="divider"></div>

            {/* SOCIAL PROOF */}
            <section className="py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <h3 className="text-2xl sm:text-3xl font-extrabold">
                            Ya lo están probando entrenadores como tú…
                        </h3>
                        <div className="text-sm font-semibold text-blue-600 dark:text-[#E6F1FF]">
                            ⭐ +50 entrenadores ya aseguraron su cupo
                        </div>
                    </div>
                    <div className="mt-8 grid md:grid-cols-3 gap-5">
                        {[
                            {
                                quote: "Con el Kit Express entendí en minutos lo que me estaba costando semanas en Excel.",
                                author: "Camilo — Entrenador online",
                            },
                            {
                                quote: "Solo con el kit express ya empecé a optimizar mi tiempo y entender mejor mis procesos. Estoy lista para la master class, sé que va a llevar todo al siguiente nivel.",
                                author: "Laura — Coach personal",
                            },
                            {
                                quote: "No puedo esperar la Masterclass, siento que me va a cambiar la forma de trabajar.",
                                author: "Andrés — Entrenador",
                            },
                        ].map((testimonial, index) => (
                            <figure
                                key={index}
                                className="glass rounded-2xl p-6"
                            >
                                <blockquote className="text-gray-900 dark:text-slate-100">
                                    "{testimonial.quote}"
                                </blockquote>
                                <figcaption className="mt-3 text-sm text-muted">
                                    {testimonial.author}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            {/* MASTERCLASS BLOCK */}
            <section className="py-16 bg-gray-50 dark:bg-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <p className="kicker mb-2">Evento central</p>
                            <h3 className="text-2xl sm:text-3xl font-extrabold">
                                Masterclass exclusiva: 19 de noviembre — 9:00 AM
                            </h3>
                            <p className="mt-3 text-muted">
                                La sesión que marca la diferencia entre seguir
                                perdiendo clientes… o escalar tu negocio
                                fitness.
                            </p>
                            <ul className="mt-5 space-y-3 text-muted">
                                <li className="check">
                                    El método paso a paso para ordenar clientes
                                    y pagos.
                                </li>
                                <li className="check">
                                    Cómo ahorrar horas de trabajo y mejorar tus
                                    servicios.
                                </li>
                                <li className="check">
                                    Bonus secreto solo para asistentes en vivo.
                                </li>
                            </ul>
                            <button
                                onClick={scrollToForm}
                                className="btn-primary inline-block mt-6 rounded-xl px-6 py-3 font-semibold"
                            >
                                RESERVAR MI LUGAR GRATIS
                            </button>
                        </div>
                        <div className="glass rounded-3xl p-8">
                            <div className="grid grid-cols-4 gap-4 text-center">
                                <CountdownCell
                                    value={countdown.days}
                                    label="DÍAS"
                                />
                                <CountdownCell
                                    value={countdown.hours}
                                    label="HRS"
                                />
                                <CountdownCell
                                    value={countdown.minutes}
                                    label="MIN"
                                />
                                <CountdownCell
                                    value={countdown.seconds}
                                    label="SEG"
                                />
                            </div>
                            <p className="mt-4 text-sm text-muted">
                                Arrancamos puntuales. Asegura tu puesto ahora.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="divider"></div>

            {/* FAQ */}
            <section className="py-14">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-center">
                        Preguntas frecuentes
                    </h3>
                    <div className="mt-8 divide-y divide-white/10">
                        {[
                            {
                                question: "¿Es realmente gratis?",
                                answer: "Sí, 100% gratis. No hay letra pequeña.",
                            },
                            {
                                question: "¿Cuándo recibo mi Kit Express?",
                                answer: "Justo después de registrarte lo tendrás en tu correo.",
                            },
                            {
                                question:
                                    "¿Y si no puedo asistir a la Masterclass?",
                                answer: "El bonus secreto es solo para quienes están en vivo. Te conviene estar.",
                            },
                            {
                                question: "¿Necesito saber de tecnología?",
                                answer: "Si usas WhatsApp y Excel, podrás usar todo sin problema.",
                            },
                            {
                                question:
                                    "¿En la Masterclass se vende un curso o plantillas?",
                                answer: "No, la Masterclass te ensañará a sacar el mejor provecho de nuestra solución.",
                            },
                        ].map((faq, index) => (
                            <details key={index} className="group py-5">
                                <summary className="flex cursor-pointer items-center justify-between text-left">
                                    <span className="text-lg font-semibold">
                                        {faq.question}
                                    </span>
                                    <span className="ml-4 text-gray-400 dark:text-gray-400 text-gray-600 group-open:rotate-180 transition">
                                        ⌄
                                    </span>
                                </summary>
                                <p className="mt-3 text-muted">{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <div className="divider"></div>

            {/* CIERRE FUERTE */}
            <section className="py-16 bg-gradient-to-b from-blue-50 to-cyan-50 dark:from-[rgba(58,131,246,.18)] dark:to-[rgba(7,182,213,.10)]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-2xl sm:text-3xl font-extrabold">
                        No sigas perdiendo clientes ni tiempo en Excel y
                        WhatsApp
                    </h3>
                    <p className="mt-3 text-muted">
                        Empieza GRATIS con el Kit Express, únete al grupo
                        privado y reserva tu lugar en la Masterclass del 19 de
                        noviembre. Además, participa por 1 de 5 becas.
                    </p>
                    <button
                        onClick={scrollToForm}
                        className="btn-primary inline-block mt-6 rounded-xl px-8 py-4 text-lg font-bold"
                    >
                        REGISTRARME GRATIS AHORA MISMO
                    </button>
                </div>
            </section>
        </div>
    );
}
