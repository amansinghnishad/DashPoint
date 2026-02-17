# DashPoint Server

Express + MongoDB backend for DashPoint.

## Tech Stack

- Express 4
- MongoDB + Mongoose
- JWT auth (`jsonwebtoken`)
- Validation (`express-validator`)
- Security middleware (`helmet`, CORS, rate limiting)
- File upload support (`multer`, Cloudinary)

## Setup

1. Install dependencies:

```bash
npm install
```

1. Create environment file:

```bash
cp .env.example .env
```

1. Start the server:

```bash
# development
npm run dev

# production
npm start
```

Default URL: `http://localhost:5000`

## Scripts

- `npm run dev` — start with nodemon
- `npm start` — production start
- `npm run prod` — production start (explicit)
- `npm run test` — placeholder (currently exits with error)

## API Route Groups

Mounted in `src/server.js`:

- `/api/auth`
- `/api/content-extraction`
- `/api/youtube`
- `/api/collections`
- `/api/ai`
- `/api/files`
- `/api/planner-widgets`
- `/api/calendar`

System endpoints:

- `GET /health`
- `GET /`

## Environment Variables

See `.env.example`.

Core:

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`

Rate limiting:

- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`

AI services:

- `HUGGING_FACE_TOKEN`
- `TEXTRAZOR_API_KEY`

Google OAuth / Calendar:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`
- `GOOGLE_OAUTH_SCOPES`
- `GOOGLE_OAUTH_SUCCESS_REDIRECT`

External APIs:

- `YOUTUBE_API_KEY`

Cloudinary:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

Extraction/uploads:

- `MAX_CONTENT_LENGTH`
- `REQUEST_TIMEOUT`
- `MAX_FILE_SIZE`

## Folder Layout

```text
src/
  config/
  constants/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  server.js
```
