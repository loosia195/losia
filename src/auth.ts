// src/auth.ts
import NextAuth, { type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

// Validate input để tránh 'unknown'
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// TODO: thay bằng kiểm tra thực trong DB của anh
async function verifyUser(email: string, password: string) {
  // ví dụ: chấp nhận mọi email nếu có password
  if (!password) return null;
  return {
    id: "u_" + email,
    email,
    name: null as string | null,
    image: null as string | null,
  };
}

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // 👇 v5: (credentials, request) => Awaitable<User | null>
      authorize: async (credentials, _req) => {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const u = await verifyUser(email, password);
        if (!u) return null;

        // Trả đúng kiểu User
        const user: User = {
          id: u.id,
          email: u.email,    // string | null OK
          name: u.name ?? null,
          image: u.image ?? null,
        };
        return user;
      },
    }),
  ],

  // Đưa user.id vào token & session để cartIdentity đọc được
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;      // lưu id vào token
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        (session.user as any).id = token.id as string; // gắn id vào session.user
      }
      return session;
    },
  },
});
