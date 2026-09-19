# UniPay — Campus Payment & Food Pre-Ordering Web App

A closed-loop campus wallet and canteen pre-ordering system. Students top up
credits (1 INR = 1 credit) via UPI/card, pre-order food from the canteen,
and pick it up by showing a QR code / backup code to the vendor.

Monorepo: `/server` (Node/Express/Prisma) + `/client` (React/Vite/Tailwind).

## Status

Build is happening in phases; this README is updated as each phase lands.

- [x] Phase 1 — Project setup, Prisma schema, migrations, seed script
- [x] Phase 2 — Auth
- [x] Phase 3 — Wallet
- [x] Phase 4 — Menu management + browsing
- [x] Phase 5 — Cart, checkout, order transaction logic
- [x] Phase 6 — Vendor order dashboard + Socket.io
- [x] Phase 7 — QR pickup
- [x] Phase 8 — Sales summary, admin page, UI polish
- [x] Phase 9 — Tests + final docs

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

Vendors cannot self-register — `admin@unipay.test` is the only account
that can create one, from the admin console at `/admin`.

## Testing

```bash
cd server
npm test
```

This spins up a real instance of the server against a disposable SQLite
database (`server/src/prisma/test.db`, migrated fresh each run, never
touching `dev.db`), then runs an integration suite against it over HTTP.
Each test creates its own isolated student/vendor/menu-item fixtures, so
tests never interfere with each other. Covers the five scenarios called
out as critical:

- **Insufficient balance** — checkout is rejected, and rolls back
  completely (no stock decrement survives, no order or transaction row
  is left behind) even though the balance check happens after the
  per-item stock decrement inside the same DB transaction.
- **Overselling race** — two students checking out the last unit of
  stock at the same time: exactly one succeeds, stock lands at exactly
  0, never negative.
- **Double QR scan** — collecting an order twice (by token or by backup
  code, sequentially or concurrently) always returns "Already
  collected" on every attempt after the first.
- **Refund on reject** — a vendor rejecting an order refunds the exact
  amount and restores exactly the stock that was reserved.
- **Idempotent top-up** — verifying the same Razorpay/mock payment
  twice (sequentially or concurrently) credits the wallet exactly once.

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
    middleware/     requireAuth, requireRole, attachVendor, zod validation
    lib/            prisma client, jwt, socket.io (auth'd rooms), razorpay/mock,
                    httpError, constants (status transitions), backup codes
    routes/         Express routers (auth, wallet, menu, vendor, orders, admin)
    controllers/    request handlers
    services/       business logic - wallet ledger, order transactions
                    (checkout/cancel/reject/pickup), sales summary
    schemas/        zod request schemas
  tests/            integration tests (node:test) against a live server
                    instance + a disposable test database
  scripts/          run-tests.mjs - test DB/server orchestration
/client
  src/
    api/            fetch wrapper
    context/        auth, cart, and toast contexts
    routes/         ProtectedRoute (role-based redirect)
    hooks/          useSocketEvent
    lib/            socket client, notification sound, Razorpay checkout
                    loader, format helpers, role/home-route map
    pages/
      student/      dashboard, menu, cart, orders, pickup QR, transactions
      vendor/       order dashboard, menu manager, QR/backup-code scanner,
                    sales summary
      admin/        vendor creation, user/vendor listings
```
