"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function MenteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated or not a mentee
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    if (user?.role !== "mentee") {
      router.push("/dashboard");
      return;
    }
  }, [isAuthenticated, user, router]);

  // Don't render anything until we verify authentication
  if (!isAuthenticated || user?.role !== "mentee") {
    return null;
  }

  return <>{children}</>;
}