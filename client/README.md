# Personal Dashboard - Frontend

A comprehensive MERN stack dashboard application with multiple productivity features built with React, Vite, and Tailwind CSS.

## Features

- **Sticky Notes**: Create, edit, drag & drop colorful sticky notes
- **Todo List**: Manage tasks with priorities, due dates, and completion tracking
- **YouTube Player**: Add YouTube videos to playlist and watch them in the dashboard
- **Content Extractor**: Extract readable content from any website URL
- **Weather Widget**: Display current weather and 3-day forecast with location support
- **World Clock**: Multi-timezone clock with calendar integration
- **Authentication**: Login/logout with persistent sessions
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS 4
- **State Management**: Context API with useReducer
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **HTTP Client**: Axios
- **Storage**: Local Storage (temporary), will connect to backend API

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── StickyNotes.jsx
│   ├── TodoList.jsx
│   ├── YouTubePlayer.jsx
│   ├── ContentExtractor.jsx
│   ├── Weather.jsx
│   └── Clock.jsx
├── pages/              # Page components
│   ├── Dashboard.jsx
│   └── Login.jsx
├── context/            # Context providers
│   ├── AuthContext.jsx
│   └── DashboardContext.jsx
├── hooks/              # Custom hooks
│   ├── useCommon.js
│   └── useWeather.js
├── services/           # API services
│   └── api.js
├── utils/              # Utility functions
│   ├── dateUtils.js
│   ├── urlUtils.js
│   └── helpers.js
└── data/               # Mock data
    └── mockData.json
```

## Installation

1. Clone the repository
2. Navigate to the client directory
3. Install dependencies:

```bash
npm install
```

4. Copy environment variables:

```bash
cp .env.example .env
```

5. Start the development server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### Sticky Notes
- Create colorful sticky notes
- Drag and drop positioning
- Edit in-place
- Multiple color options
- Auto-save to local storage

### Todo List
- Add tasks with descriptions
- Set due dates and priorities
- Mark as completed
- Filter by status (all/active/completed)
- Priority-based color coding

### YouTube Player
- Paste YouTube URLs to create playlist
- Video thumbnails and titles
- Built-in video player
- Playlist management
- Fullscreen support

### Content Extractor
- Extract readable content from any website
- Clean text formatting
- Word count and reading time
- Export content as JSON
- Search and organize extracted content

### Weather Widget
- Current weather conditions
- 3-day forecast
- Location-based weather
- Manual location search
- Beautiful gradient design

### World Clock
- Multiple timezone support
- 12/24 hour format toggle
- Mini calendar view
- World time comparison
- Real-time updates

## Authentication

Currently uses mock authentication for frontend development. Features include:
- Login form with validation
- Demo login option
- Persistent sessions
- Protected routes
- User profile display

## Data Storage

Currently using localStorage for data persistence. The architecture is designed to easily switch to backend API calls when the server is ready.

## Responsive Design

- Mobile-first approach
- Responsive sidebar navigation
- Touch-friendly interface
- Adaptive layouts for different screen sizes

## Future Enhancements

- Backend API integration
- Real YouTube API integration
- Real weather API integration
- Content extraction API
- User accounts and data synchronization
- More dashboard widgets
- Customizable dashboard layout
- Dark mode support
- Notification system

## Development Notes

All functions are commented with 3-4 word descriptions as requested. The code is structured to be easily scalable and maintainable. Each component is self-contained with proper error handling and loading states.

## License

MIT License+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
