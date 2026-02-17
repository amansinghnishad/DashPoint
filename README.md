# DashPoint

DashPoint is a MERN productivity dashboard with authentication, planner widgets, content extraction, YouTube tools, files, collections, and AI-powered utilities.

## Monorepo Structure

- `client/` — React + Vite frontend
- `server/` — Express + MongoDB API

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or hosted)

## Quick Start

1. Install dependencies in both apps:

```bash
cd client
npm install
cd ../server
npm install
```

1. Configure environment variables:

```bash
cd server
cp .env.example .env
```

1. Start development servers in two terminals:

```bash
# terminal 1
cd client
npm run dev
```

```bash
# terminal 2
cd server
npm run dev
```

Frontend default URL: `http://localhost:5173`  
Backend default URL: `http://localhost:5000`

## Available Scripts

### Client (`client/package.json`)

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview built app
- `npm run lint` — run ESLint

### Server (`server/package.json`)

- `npm run dev` — start with nodemon
- `npm start` — start production server
- `npm run prod` — explicit production start
- `npm run test` — currently placeholder (`Error: no test specified`)

## Server Environment Variables

Defined in `server/.env.example`:

- Database/JWT: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`
- Server/runtime: `PORT`, `NODE_ENV`, `CLIENT_URL`
- Security/rate limit: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`
- AI services: `HUGGING_FACE_TOKEN`, `TEXTRAZOR_API_KEY`
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `GOOGLE_OAUTH_SCOPES`, `GOOGLE_OAUTH_SUCCESS_REDIRECT`
- External APIs: `YOUTUBE_API_KEY`
- Cloudinary uploads: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER`
- Extraction/uploads: `MAX_CONTENT_LENGTH`, `REQUEST_TIMEOUT`, `MAX_FILE_SIZE`

## API Health Check

- `GET /health` returns server status and environment.
