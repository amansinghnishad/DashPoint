# DashPoint

**A personal workspace for the things that make work move.**

DashPoint brings conversations, collections, files, saved videos, planning, and calendar events into one place. It is an open-source project built to make everyday work easier to collect, organize, and continue without jumping between disconnected tools.

## Why I started DashPoint

I wanted everything I use to think, plan, and get work done to live in one place. The idea was to keep adding useful pieces gradually and let them work together as one workspace.

I had started building DashPoint before announcements around products like Spark and Muse. When those announcements came, I lost momentum and stopped working on this repository for a while. Coming back to it, I realized I could open the project up instead of leaving it unfinished and private. Other people can help improve it, and I can learn how to maintain an open-source project, manage contributions, and take better care of the repository.

DashPoint is still a work in progress. Contributions, bug reports, and thoughtful feedback are welcome.

## What you can do with it

- **Ask questions across your workspace.** Chat with your collections and saved materials using supported AI providers.
- **Organize work in collections.** Bring notes, files, saved videos, and planner widgets together around a project or topic.
- **Manage documents.** Upload files, save web links, and summarize supported documents.
- **Find things quickly.** Search across workspace content instead of hunting through separate tools.
- **Plan your day.** Use planner widgets and, when connected, view and create Google Calendar events.
- **Save and explore videos.** Search YouTube, keep videos in your workspace, and use available transcript and insight features.
- **Install the app.** The client is a progressive web app and can be installed on supported browsers and devices.

Some features depend on optional third-party services and credentials. See the [server setup guide](server/README.md) for the complete configuration list.

## Project structure

```text
client/   React application, interface, API client, and PWA setup
server/   Express API, authentication, data models, and integrations
```

The client and server have separate dependencies, environment files, and scripts. See their guides for details:

- [Client: setup, architecture, PWA, and checks](client/README.md)
- [Server: setup, API, configuration, and checks](server/README.md)

## Run DashPoint locally

You will need Node.js 22 or newer and a MongoDB database. Start the API and client in separate terminals.

### Start the API

```bash
cd server
npm ci
cp .env.example .env
```

Set `MONGODB_URI` and strong, private `JWT_SECRET` and `JWT_REFRESH_SECRET` values in `server/.env`, then run:

```bash
npm run dev
```

The API listens at `http://localhost:5000` by default. Its health endpoint is `http://localhost:5000/health`.

### Start the client

In another terminal:

```bash
cd client
npm ci
npm run dev
```

Open the local address printed by Vite, usually `http://localhost:5173`. By default, the client connects to `http://localhost:5000/api`.

## Optional services

DashPoint can connect to AI providers, Google Calendar, YouTube Data API, Cloudinary, and Redis. Configure only the services you want to use. The variable names and local defaults are documented in [`server/.env.example`](server/.env.example), with setup notes in the [server README](server/README.md).

## Contributing

You can help by reporting bugs, improving the interface, fixing documentation, or working on a feature. For a change, include a short explanation and the checks you ran. Screenshots or recordings are useful for interface changes. Never commit API keys, OAuth secrets, personal files, or production data.

## License

DashPoint is released under the [MIT License](LICENSE).
