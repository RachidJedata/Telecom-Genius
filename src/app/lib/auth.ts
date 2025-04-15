import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import prisma from "@/app/lib/prisma";
import { Providers } from "@prisma/client";





export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "hello@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || user.provider !== Providers.NONE) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password!);

        if (!isPasswordValid) {
          return null;
        }

        // Return a user object on successful authentication.
        return {
          id: user.userId,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email",
          redirect_uri: process.env.NEXTAUTH_URL
        }
      },
      async profile(profileData) {
        return {
          id: String(profileData.id),
          name: profileData.name || profileData.login,
          email: profileData.email,
          image: profileData.avatar_url,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          redirect_uri: process.env.NEXTAUTH_URL
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          if (!user.id) {
            throw new Error("Missing required user fields");
          }
          const existingUser = await prisma.user.findUnique({
            where: { userId: user.id },
          });
          if (!existingUser) {
            await prisma.user.create({
              data: {
                userId: user.id,
                name: user.name,
                email: user.email,
                avatar: user.image || "/avatars/default.svg",
                provider: account.provider.toUpperCase() as Providers,
              },
            });
          }
          return true;
        } catch (error) {
          console.error("SignIn callback error:", error);
          return false;
        }
      }
      return true;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id,
        image: token.picture,
      },
    }),
    jwt: ({ token, user }) => (user ? { ...token, id: user.id, picture: user.image } : token),
  },
  pages: {
    signIn: "/login",
  },
};