import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";

interface TokenData {
  sub: string;
  userId: string;
  role: string;
  firstName: string;
  coachCode?: string;
  exp: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            console.error("Server response is not JSON. URL might be incorrect.");
            throw new Error("Server configuration error");
          }

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Invalid credentials");
          }

          const { access_token, refresh_token } = data.data;

          const decoded = jwtDecode<TokenData>(access_token);

          return {
            id: decoded.userId,
            email: decoded.sub,
            name: decoded.firstName,
            role: decoded.role,
            accessToken: access_token,
            refreshToken: refresh_token,
            coachCode: decoded.coachCode,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          role: user.role,
          userId: user.id,
          coachCode: user.coachCode,
          expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
        };
      }

      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refresh_token: token.refreshToken,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error("Failed to refresh token");
        }

        const { access_token, refresh_token } = data.data;
        const decoded = jwtDecode<TokenData>(access_token);

        return {
          ...token,
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: Date.now() + 30 * 60 * 1000,
        };
      } catch (error) {
        console.error("Error refreshing token:", error);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.userId as string,
          role: token.role as string,
          coachCode: token.coachCode as string | undefined,
        };
        session.accessToken = token.accessToken as string;
        session.error = token.error;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };