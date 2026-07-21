# Lumen — Liquid Glass Appointment Booking

A beautifully minimal appointment booking SPA built with **Next.js 15 (App Router)**, **Tailwind + shadcn/ui**, **MongoDB**, and **Google Calendar OAuth**. Features a signature *liquid glass* aesthetic with light/dark mode.

## ✨ Features

- **Elegant liquid glass UI** — frosted panels, gradient orbs, mint→teal→sky accent system.
- **Light / Dark mode** with system-safe theme toggle (persisted in `localStorage`).
- **End-to-end booking flow**: pick service → pick date on inline calendar → choose available time → enter details → confirm.
- **My Bookings** modal with **Upcoming** and **Past** tabs (looked up by email).
- **Cancel / Reschedule (edit)** any upcoming booking. Reschedules automatically PATCH the Google Calendar event when applicable.
- **Google Calendar sync** (per-customer OAuth) — the confirmation screen has an *Add to Google Calendar* button that creates the event on the user’s own primary calendar. Correct timezone handling (each booking stores the customer’s IANA timezone).
- **Timezone label** on booking cards, e.g. `11:00 EDT`, `15:30 IST`.
- **MongoDB storage** with automatic slot-conflict prevention.

## 🗂 Project structure

```
app/
├── app/
│   ├── api/[[...path]]/route.js   # All backend endpoints (catch-all)
│   ├── globals.css              # Tailwind + liquid-glass utilities + light/dark tokens
│   ├── layout.js
│   └── page.js                  # Full SPA (hero, services, booking, my-bookings)
├── components/
│   └── GcalToast.jsx            # Toast shown after Google Calendar OAuth returns
├── lib/
│   └── utils.js                 # Pure helpers (time math, tz label, booking split)
├── __tests__/
│   ├── utils.test.js            # Unit tests for the helpers
│   └── GcalToast.test.jsx       # React Testing Library component test
├── jest.config.js
├── jest.setup.js
├── package.json
└── .env.example
```

## 🚀 Local development

### 1. Prerequisites
- Node.js ≥ 18
- Yarn (or npm)
- A running MongoDB (locally at `mongodb://localhost:27017` is the default)

### 2. Install dependencies
```bash
yarn install
```

### 3. Configure environment
Copy the example env file and fill in values:
```bash
cp .env.example .env
```

Minimum required values:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=lumen_appointments
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional — required only for Google Calendar sync
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

See **Google Calendar setup** below to obtain the OAuth credentials.

### 4. Run the dev server
```bash
yarn dev
```
Open [http://localhost:3000](http://localhost:3000).

### 5. Run the tests
```bash
yarn test          # single run
yarn test:watch    # watch mode
yarn test:coverage # with coverage report
```

## 📅 Google Calendar setup (optional)

To enable the *Add to Google Calendar* button end-to-end:

1. Open **https://console.cloud.google.com/** and create a project.
2. Enable the **Google Calendar API** for that project.
3. Configure the **OAuth consent screen** (External).
   - Add your Gmail as a **Test user** while the app is still in Testing.
4. Create an **OAuth 2.0 Client ID** → Application type: **Web application**.
5. Add this exact **Authorized redirect URI**:
   ```
   http://localhost:3000/api/gcal/callback
   ```
   (In production, use your real domain.)
6. Copy the **Client ID** and **Client secret** into `.env`:
   ```env
   GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
   ```
7. Restart the dev server.

## 🔌 API reference

All endpoints are served via a single catch-all Route Handler under `/api/...`.

| Method | Endpoint                              | Description                                          |
|--------|---------------------------------------|------------------------------------------------------|
| GET    | `/api/services`                       | List all bookable services (seeded on first request) |
| GET    | `/api/availability?date=YYYY-MM-DD`   | Available 30-min slots for a date                    |
| POST   | `/api/bookings`                       | Create a new booking                                 |
| GET    | `/api/bookings?email=you@x.com`       | List a customer’s bookings                           |
| PATCH  | `/api/bookings/:id`                   | Reschedule / edit a booking (syncs to GCal)          |
| DELETE | `/api/bookings/:id`                   | Cancel a booking                                     |
| GET    | `/api/gcal/start?bookingId=...`       | Kick off Google Calendar OAuth flow                  |
| GET    | `/api/gcal/callback`                  | OAuth callback (handled automatically)               |

## 🧪 Testing

This repo uses **Jest** + **@testing-library/react** with `next/jest` for zero-config SWC transforms.

- Unit tests live in `__tests__/*.test.{js,jsx}`.
- The Jest config auto-loads the same path aliases (`@/...`) and CSS mocks Next.js uses.
- To add more component tests, prefer extracting isolated components into `/components` (see `GcalToast.jsx` as an example) so they can be rendered in isolation.

### Sample test output
```
PASS  __tests__/utils.test.js
PASS  __tests__/GcalToast.test.jsx
Test Suites: 2 passed, 2 total
Tests:       15 passed, 15 total
```

## 🛠 Scripts

| Script            | Purpose                                    |
|-------------------|--------------------------------------------|
| `yarn dev`        | Start Next.js in development mode          |
| `yarn build`      | Production build                           |
| `yarn start`      | Start the built app                        |
| `yarn lint`       | Run ESLint                                 |
| `yarn test`       | Run Jest test suite                        |
| `yarn test:watch` | Jest in watch mode                         |
| `yarn test:coverage` | Jest with coverage report               |

## 📄 License

MIT — use freely, tweak the design system to your brand.
