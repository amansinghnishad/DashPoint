# DashPoint Client

React + Vite frontend for DashPoint.

## Tech Stack

- React 19
- Vite 6
- React Router
- Tailwind CSS 4
- Axios

## Setup

1. Install dependencies:

```bash
npm install
```

1. Optional environment file (`.env`):

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

If `VITE_API_URL` is not set, the app falls back to `http://localhost:5000/api`.

1. Start development server:

```bash
npm run dev
```

Default URL: `http://localhost:5173`

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## Folder Layout

```text
src/
  app/         # app providers/router/styles
  context/     # auth/dashboard/toast contexts
  features/    # auth, dashboard, landing features
  hooks/       # custom hooks
  services/    # API service modules
  shared/      # shared API/config/lib/ui
  App.jsx
  main.jsx
```

## Notes

- Google auth UI is shown when `VITE_GOOGLE_CLIENT_ID` is configured.
- API base URL is defined in `src/shared/config/appConfig.js`.
