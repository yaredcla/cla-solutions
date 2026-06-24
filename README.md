# CLA Solutions

Premium Next.js website and PostgreSQL-backed content dashboard for CLA Solutions, serving Ethiopian businesses.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Neon PostgreSQL

## Environment Variables

Copy `.env.example` to `.env.local` for local development. Configure the same variables in Vercel:

- `DATABASE_URL`: Neon PostgreSQL connection string. Required at runtime and by database scripts.
- `ADMIN_SESSION_SECRET`: A random secret of at least 32 characters used to sign admin sessions. Required at runtime.
- `DEFAULT_ADMIN_USERNAME`: Used only by `npm run db:seed`.
- `DEFAULT_ADMIN_PASSWORD`: Used only by `npm run db:seed`; use a strong unique password of at least 12 characters.

Do not commit `.env.local`.

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Local Development

```bash
npm install
npm run db:migrate
npm run db:seed
npm run db:update-content
npm run dev
```

Open `http://localhost:3000`.

## Production

```bash
npm run build
npm run start
```

## Vercel Deployment

1. Import the repository as a Next.js project.
2. Add `DATABASE_URL` and `ADMIN_SESSION_SECRET` to Production, Preview, and Development environments.
3. Run `npm run db:migrate`, `npm run db:seed`, and `npm run db:update-content` against the production database before the first deployment.
4. Deploy, then sign in at `/admin` and replace any temporary seeded password.

The application never reads production content from the legacy `data/` JSON files.
