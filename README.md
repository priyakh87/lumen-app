# Lumen — Liquid Glass Appointment Booking Platform

A modern appointment scheduling application built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **MongoDB**, and **Google Calendar OAuth integration**.

Designed with a premium liquid glass UI system, responsive layouts, timezone-aware scheduling, and seamless calendar synchronization.

## 🌐 Live Demo

[View Live Application](Comiong soon!)

## 📸 Screenshots

![Desktop dark mode](docs/images/Desktop-darkmode.png)
![Desktop light mode](docs/images/Desktop-lightmode.png)

![iPad Air dark mode](docs/images/iPad-air-darkmode.png)
![iPad Air light mode](docs/images/iPad-air-lightmode.png)

![Mobile dark mode](docs/images/Mobile-darkmode.png)
![Mobile light mode](docs/images/Mobile-lightmode.png)

## ✨ Features

### Booking Experience
- Complete appointment booking workflow
- Service selection, date selection, and availability management
- Responsive booking experience across devices

### Calendar Integration
- Google Calendar OAuth integration
- Create calendar events directly from bookings
- Automatic event updates during rescheduling

### User Experience
- Liquid glass design system
- Light/dark theme support
- Timezone-aware booking display

### Engineering
- Next.js App Router architecture
- MongoDB persistence
- Automated slot conflict prevention
- Unit and component testing

## 🛠 Tech Stack

Frontend:
- Next.js 15 (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend:
- Next.js Route Handlers
- MongoDB

Integrations:
- Google Calendar OAuth

Testing:
- Jest
- React Testing Library

## 🏗 Architecture Overview

The application follows a modern Next.js App Router architecture:

- Server-side API routes handle bookings, availability, and integrations
- MongoDB manages appointment persistence
- Google OAuth enables calendar synchronization
- Component-based UI architecture using Tailwind CSS and shadcn/ui

## 🚀 Local development

### 1. Prerequisites
- Node.js ≥ 18
- Yarn (or npm)

### 2. Install dependencies
```bash
yarn install
```

### 3. Configure environment
Copy the example env file and fill in values:
```bash
cp .env.example .env
```
Required environment variables:

MONGO_URL=
DB_NAME=
NEXT_PUBLIC_BASE_URL=

Optional:

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

### 4. Run the dev server
```bash
yarn dev
```
Open [http://localhost:3000]

### 5. Run the tests
```bash
yarn test          # single run
yarn test:watch    # watch mode
yarn test:coverage # with coverage report
```
## 📅 Google Calendar Integration

Google Calendar integration requires OAuth credentials.

Steps:

1. Create OAuth credentials in Google Cloud Console
2. Enable Google Calendar API
3. Add redirect URL:

## 🔌 Integrations

- Google Calendar OAuth
- MongoDB database
- REST API routes for booking management

## 🧪 Testing

Testing setup includes:

- Jest
- React Testing Library
- Next.js Jest integration

Current coverage includes:
- Utility functions
- React components


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
