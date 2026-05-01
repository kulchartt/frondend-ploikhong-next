import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Apple from 'next-auth/providers/apple';
import Credentials from 'next-auth/providers/credentials';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://khai-claude-production.up.railway.app';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    Apple({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${API}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.token) return null;
          return {
            id: String(data.user?.id),
            name: data.user?.name,
            email: data.user?.email,
            image: data.user?.avatar,
            token: data.token,
            is_admin: data.user?.is_admin,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.token = (user as any).token;
        token.is_admin = (user as any).is_admin;
        // Credentials login: user.id is the database ID
        if (user.id) (token as any).dbUserId = user.id;
      }
      // Social login — register/login via backend
      if (account && ['google', 'facebook', 'apple'].includes(account.provider)) {
        try {
          const res = await fetch(`${API}/api/auth/social`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: account.provider,
              email: token.email,
              name: token.name,
              avatar: token.picture,
              provider_account_id: account.providerAccountId, // Apple: stable ID even when email is absent
            }),
          });
          const data = await res.json();
          if (data.token) token.token = data.token;
          if (data.user?.is_admin) token.is_admin = data.user.is_admin;
          // Social login: store database user ID (token.sub = provider's external ID)
          if (data.user?.id) (token as any).dbUserId = String(data.user.id);
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).token = token.token;
      (session.user as any).is_admin = token.is_admin;
      // Prefer stored DB user ID over token.sub (which may be provider's external ID for social logins)
      const dbId = (token as any).dbUserId ?? token.sub;
      (session as any).userId = dbId ? Number(dbId) : undefined;
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
});
