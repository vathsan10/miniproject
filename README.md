# UniPay — Campus Payment & Food Pre-Ordering Web App

A closed-loop campus wallet and canteen pre-ordering system. Students top up
credits (1 INR = 1 credit) via UPI/card, pre-order food from the canteen,
and pick it up by showing a QR code / backup code to the vendor.

Monorepo: `/server` (Node/Express/Prisma) + `/client` (React/Vite/Tailwind).

## Status

Build is happening in phases; this README is updated as each phase lands.

- [x] Phase 1 — Project setup, Prisma schema, migrations, seed script
- [ ] Phase 2 — Auth
- [ ] Phase 3 — Wallet
- [ ] Phase 4 — Menu management + browsing
- [ ] Phase 5 — Cart, checkout, order transaction logic
- [ ] Phase 6 — Vendor order dashboard + Socket.io
- [ ] Phase 7 — QR pickup
- [ ] Phase 8 — Sales summary, admin page, UI polish
- [ ] Phase 9 — Tests + final docs

## Setup

```bash
npm run install:all      # installs root, server, and client deps
cp server/.env.example server/.env
npm run prisma:migrate   # creates the SQLite DB and applies the schema
npm run prisma:seed      # demo admin/vendors/students/menu items
npm run dev               # runs server (:4000) and client (:5173) together
```

Open http://localhost:5173.

## Razorpay test keys (optional)

UniPay works out of the box with **Mock Payment mode**: if
`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are left blank in `server/.env`,
top-ups are simulated as an instant successful payment, so the demo always
works without any external account.

To use real Razorpay test checkout instead:
1. Sign up at https://dashboard.razorpay.com and switch to **Test Mode**.
2. Go to Settings → API Keys → Generate Test Key.
3. Put the key id/secret into `server/.env`.

## Demo credentials

Password for every seeded account: `password123`

| Role    | Email                  | Notes         |
|---------|------------------------|---------------|
| Admin   | admin@unipay.test      |               |
| Vendor  | vendor1@unipay.test    | Main Canteen  |
| Vendor  | vendor2@unipay.test    | Juice Corner  |
| Student | student1@unipay.test   | 200 starting credits |
| Student | student2@unipay.test   | 200 starting credits |
| Student | student3@unipay.test   | 200 starting credits |

## Architecture

- **Database**: Prisma ORM, SQLite for local dev. Moving to Postgres later
  only requires changing the `provider` line in
  `server/src/prisma/schema.prisma` (the schema uses plain strings instead
  of native enums, since SQLite's Prisma connector doesn't support them —
  those values are validated with zod at the API layer instead).
- **Wallet is a ledger, not a balance column.** A user's balance is always
  computed as `sum(TOPUP + REFUND) - sum(PURCHASE)` from the `Transaction`
  table, so it can never drift out of sync with what actually happened.
- **Auth**: JWT in an httpOnly cookie, bcrypt-hashed passwords. Every
  protected backend route is gated by `requireAuth`/`requireRole` — the
  frontend's route guards are for UX only, never trusted for security.
- **Real-time**: Socket.io pushes new orders to vendors and status updates
  to students as they happen.
- **Concurrency-safe ordering**: placing an order, rejecting/cancelling an
  order, and QR pickup verification are each a single atomic DB
  transaction, so two students can never both grab the last unit of stock,
  and a QR/backup code can never be redeemed twice.

## Project structure

```
/server
  src/
    prisma/        schema.prisma, migrations, seed.js
    middleware/     requireAuth, requireRole, zod validation
    lib/            prisma client, jwt helpers, socket.io, razorpay/mock
    routes/         Express routers
    controllers/    request handlers
    services/       business logic (wallet ledger, order transactions, payments)
    schemas/        zod request schemas
/client
  src/
    api/            fetch wrapper
    context/        auth context
    pages/          student/, vendor/, admin/
    components/     shared UI
    hooks/          socket hook
```
