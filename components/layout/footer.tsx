import Link from "next/link";
import Image from "next/image";
import { Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/60">

      {/* Main grid */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Logo + tagline — full width on mobile */}
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <Image
                  src="https://fit-connect-pro.s3.sa-east-1.amazonaws.com/fitConnectWhiteLogo.png"
                  alt="FitConnect Pro"
                  width={20}
                  height={20}
                  className="w-5 h-5 object-contain"
                />
              </div>
              <span className="font-bold text-white text-base">FitConnect Pro</span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-[200px]">
              Todo lo que necesitas para profesionalizar tu negocio fitness.
            </p>
          </div>

          {/* Producto */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-white text-sm">Producto</h3>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Funcionalidades", href: "/#plataforma" },
                { label: "Planes y precios", href: "/pricing" },
                { label: "FAQ", href: "#" },
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-zinc-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-white text-sm">Empresa</h3>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Sobre Nosotros", href: "#" },
                { label: "Términos y Condiciones", href: "#" },
                { label: "Contacto", href: "#" },
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-zinc-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-white text-sm">Legal</h3>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Política de Privacidad", href: "#" },
                { label: "Términos y Condiciones", href: "#" },
                { label: "Seguridad", href: "#" },
                { label: "Política de Cookies", href: "#" },
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-zinc-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800/60">
        <div className="container mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-400">
            © 2026 FitConnect Pro. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
