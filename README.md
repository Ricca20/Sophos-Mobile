# Sophos Mobile

Expo Go mobile application scaffold for the Health Direct Patient Portal.

## What this app is

This project is the React Native mobile client for the existing `health-direct-patient` backend. The structure mirrors the web app flows:

- patient authentication
- doctors directory
- appointments and application records
- notifications
- profile overview
- meeting entry points for PlugNmeet

## Architecture

- `app/` contains Expo Router screens and route groups.
- `src/context/` contains global state, including authentication.
- `src/services/` contains the HTTP client and shared API services.
- `src/features/` contains domain-specific service wrappers for auth, doctors, appointments, notifications, profile, and meetings.
- `src/components/` contains reusable UI primitives.
- `src/theme/` contains colors, spacing, and typography tokens.
- `src/utils/` contains environment and storage helpers.

## Folder structure

- `app/_layout.tsx` - root providers and stack navigation
- `app/index.tsx` - boot redirect logic
- `app/(auth)/` - sign-in, sign-up, forgot-password
- `app/(tabs)/` - home, doctors, appointments, notifications, profile
- `app/doctor/[id].tsx` - doctor detail screen
- `app/appointment/[id].tsx` - appointment detail screen
- `app/meeting/[roomId].tsx` - meeting entry screen

## Backend connection

The app expects the backend API to be reachable through:

- `EXPO_PUBLIC_API_BASE_URL=http://YOUR-MAC-LAN-IP:5004/api`

For Expo Go on a physical device, use your Mac's LAN IP instead of `localhost`.

## Run locally

```bash
cd /Users/rickyperera/Documents/Projects/Pasovit/Sophos-Mobile
npm install
npm start
```

Then open the project in Expo Go or run one of the platform commands:

```bash
npm run android
npm run ios
npm run web
```

## Notes

- The app currently has a clean production-style scaffold and shared API wiring.
- Doctor, appointment, notification, profile, and meeting screens are connected to the same backend route names used by the web project.
- `src/services/api.ts` includes token refresh handling using the same auth model as the web app.
