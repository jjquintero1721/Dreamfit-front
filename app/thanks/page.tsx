"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ThanksPage() {
    useEffect(() => {
        // Track Lead conversion for Meta Pixel
        if (typeof window !== "undefined" && window.fbq) {
            window.fbq("track", "Lead");
        }

        // Track CompleteRegistration for TikTok Pixel
        if (typeof window !== "undefined" && window.ttq) {
            window.ttq.track("CompleteRegistration");
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#0C141D] text-white font-sans antialiased selection:bg-sky-500/30 selection:text-white dark:bg-[#0C141D] dark:text-white">
            <style jsx global>{`
                :root {
                    --bg: #0c141d;
                    --fg: #ffffff;
                    --muted: #b8c0cc;
                    --primary: #3a83f6;
                    --accent: #07b6d5;
                    --border: rgba(255, 255, 255, 0.1);
                    --grad: linear-gradient(
                        90deg,
                        var(--primary),
                        var(--accent)
                    );
                }

                .light {
                    --bg: #ffffff;
                    --fg: #1f2937;
                    --muted: #6b7280;
                    --border: rgba(0, 0, 0, 0.1);
                }

                body {
                    background: radial-gradient(
                            1200px 800px at 90% -10%,
                            rgba(58, 131, 246, 0.15),
                            transparent 60%
                        ),
                        var(--bg);
                    color: var(--fg);
                }

                .light {
                    --bg: #ffffff;
                    --fg: #1f2937;
                    --muted: #6b7280;
                    --border: rgba(0, 0, 0, 0.1);
                }

                .light body {
                    background: radial-gradient(
                            1200px 800px at 90% -10%,
                            rgba(58, 131, 246, 0.08),
                            transparent 60%
                        ),
                        var(--bg);
                }

                .light body {
                    background: radial-gradient(
                            1200px 800px at 90% -10%,
                            rgba(58, 131, 246, 0.08),
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

                .light .glass {
                    background: linear-gradient(
                        180deg,
                        rgba(0, 0, 0, 0.02),
                        rgba(0, 0, 0, 0.005)
                    );
                    border: 1px solid var(--border);
                }

                .light .glass {
                    background: linear-gradient(
                        180deg,
                        rgba(0, 0, 0, 0.02),
                        rgba(0, 0, 0, 0.005)
                    );
                    border: 1px solid var(--border);
                }

                .btn {
                    background: var(--grad);
                    color: #fff;
                    font-weight: 700;
                    border-radius: 14px;
                    padding: 0.9rem 1.2rem;
                    box-shadow: 0 12px 30px rgba(7, 182, 213, 0.35);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    text-decoration: none;
                    display: inline-block;
                }

                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 16px 40px rgba(7, 182, 213, 0.5);
                }

                .kicker {
                    color: #7dd3fc;
                    letter-spacing: 0.08em;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .badge {
                    display: inline-block;
                    font-size: 0.75rem;
                    letter-spacing: 0.08em;
                    color: #7dd3fc;
                }

                .text-muted {
                    color: var(--muted);
                }

                .download-card {
                    transition: all 0.2s ease;
                }

                .download-card:hover {
                    ring: 1px solid rgba(34, 211, 238, 0.4);
                }
            `}</style>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="glass rounded-3xl p-6 sm:p-10">
                    <p className="kicker">Registro confirmado</p>
                    <h1 className="text-3xl sm:text-4xl font-extrabold mt-1">
                        ¡Listo, estás dentro del pre-lanzamiento!
                    </h1>
                    <p className="mt-3 text-muted">
                        Acabamos de enviarte un correo con el asunto{" "}
                        <strong>"Tu Kit Express — FitConnect Pro"</strong>. Si
                        no lo ves, revisa <em>Spam</em> o <em>Promociones</em>.
                    </p>

                    {/* 3 tarjetas principales */}
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <a
                            href="/assets/Kit-Express.pdf"
                            className="glass rounded-2xl p-5 download-card hover:ring-1 hover:ring-cyan-400/40 transition"
                            download
                        >
                            <div className="text-3xl">📘</div>
                            <h3 className="mt-2 font-bold">Mini-guía (PDF)</h3>
                            <p className="text-sm mt-1 text-muted">
                                "3 errores que hacen perder clientes y cómo
                                evitarlos".
                            </p>
                        </a>

                        <a
                            href="/assets/Plantilla-Rapida.xlsx"
                            className="glass rounded-2xl p-5 download-card hover:ring-1 hover:ring-cyan-400/40 transition"
                            download
                        >
                            <div className="text-3xl">📊</div>
                            <h3 className="mt-2 font-bold">
                                Plantilla rápida (Excel/Sheets)
                            </h3>
                            <p className="text-sm mt-1 text-muted">
                                Organiza clientes y pagos en minutos.
                            </p>
                        </a>

                        <a
                            href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Masterclass%20FitConnect%20Pro&dates=20251119T140000Z/20251119T150000Z&details=Masterclass%20FitConnect%20Pro%20-%20Organiza%20tu%20negocio%20fitness%20y%20ret%C3%A9n%20m%C3%A1s%20clientes.&location=Online"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass rounded-2xl p-5 download-card hover:ring-1 hover:ring-cyan-400/40 transition"
                        >
                            <div className="text-3xl">🗓️</div>
                            <h3 className="mt-2 font-bold">
                                Añadir Masterclass al calendario
                            </h3>
                            <p className="text-sm mt-1 text-muted">
                                19 de noviembre — 9:00 AM (Bogotá)
                            </p>
                        </a>
                    </div>

                    {/* Grupo privado */}
                    <div className="glass rounded-2xl p-5 mt-6 text-center">
                        <h3 className="font-bold text-lg">
                            Únete al grupo privado pre-evento
                        </h3>
                        <p className="text-sm text-muted mt-1">
                            Tips, recordatorios y networking con otros
                            entrenadores.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-center">
                            <a
                                href="https://wa.me/XXXXXXXXXXX"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn w-full sm:w-auto text-center"
                            >
                                Entrar al grupo de WhatsApp
                            </a>
                        </div>
                    </div>

                    {/* Sorteo / Soporte */}
                    <div className="grid gap-4 sm:grid-cols-2 mt-6">
                        <div className="glass rounded-2xl p-5">
                            <span className="badge">Sorteo</span>
                            <h4 className="font-bold text-lg mt-1">
                                Participas por 1 de 10 becas
                            </h4>
                            <p className="text-sm text-muted mt-1">
                                Anunciaremos ganadores durante la Masterclass en
                                vivo.
                            </p>
                        </div>
                        <div className="glass rounded-2xl p-5">
                            <span className="badge">Soporte</span>
                            <h4 className="font-bold text-lg mt-1">
                                ¿No te llegó el correo?
                            </h4>
                            <p className="text-sm text-muted mt-1">
                                Escríbenos a{" "}
                                <a
                                    href="mailto:soporte@fitconnectpro.com"
                                    className="underline decoration-sky-400/70 hover:decoration-sky-300"
                                >
                                    soporte@fitconnectpro.co
                                </a>{" "}
                                y te lo reenviamos.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <Link href="/" className="btn inline-flex items-center">
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Extend Window interface for TypeScript
declare global {
    interface Window {
        fbq?: (action: string, event: string, data?: any) => void;
        ttq?: {
            track: (event: string, data?: any) => void;
            page: () => void;
        };
    }
}
