import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    coachCode?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      coachCode?: string;
    };
    accessToken: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    role: string;
    userId: string;
    coachCode?: string;
    expiresAt: number;
    error?: string;
  }
}