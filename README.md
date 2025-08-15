# LOSIA – Week 1 Bootstrap

## Quick start
1) Install deps
```
npm i
```
2) Env
```
cp .env.sample .env
# Fill DATABASE_URL, NEXTAUTH_SECRET, JWT_SECRET
```
3) Prisma
```
npx prisma generate
npm run prisma:migrate
```
4) Dev
```
npm run dev
```

## Scripts
- `npm run dev` – start Next.js dev server
- `npm run build` – prisma generate + next build
- `npm run prisma:migrate` – create initial migration
- `npm run typecheck` – TypeScript check
- `npm run lint` – Next lint

## Structure
- `app/(public)` – public routes
- `app/api` – route handlers (REST)
- `prisma/schema.prisma` – DB schema
- `src/lib/db.ts` – Prisma client
- `src/styles/globals.css` – Tailwind

## Health check
GET `/api/health` → `{ ok: true }`
