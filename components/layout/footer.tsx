import Link from "next/link";
import { Instagram, Globe, MessageSquare, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex space-x-6">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <MessageSquare className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Globe className="h-6 w-6" />
            </Link>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              © 2025 Fit Connect Pro. Todos los derechos reservados.
            </p>
            <p className="text-sm text-muted-foreground">
              Hecho con <Heart className="inline-block h-4 w-4 mx-1" /> por <a href="https://www.parzik.com" className="underline">Parzik</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}