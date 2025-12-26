# Personal Dashboard - Frontend

A comprehensive MERN stack dashboard application with multiple productivity features built with React, Vite, and Tailwind CSS.

## Features

- **Conversational Interface**: Natural language commands for dashboard actions (e.g. summarize a YouTube link or extract a web page)
- **Planner Widgets**: Planner-style widgets for daily planning
- **YouTube Player**: Add YouTube videos to playlist and watch them in the dashboard
- **Content Extractor**: Extract readable content from any website URL
- **Weather Widget**: Display current weather and 3-day forecast with location support
- **World Clock**: Multi-timezone clock with calendar integration
- **Collections**: Organize and manage your content in collections
- **Keyboard Shortcuts**: Enhance productivity with keyboard navigation
- **Notification Center**: Stay updated with important notifications
- **PWA Support**: Install as a native-like app on supported devices
- **Offline Mode**: Access core features without internet connection
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
│   ├── add-to-collection-modal/  # Collection management modal
│   ├── clock/                    # World clock widget
│   ├── collection/               # Individual collection component
│   ├── collections/              # Collections management
│   ├── content-extractor/        # Web content extraction
│   ├── install-button/           # PWA installation button
│   ├── keyboard-shortcuts/       # Keyboard navigation support
│   ├── notification-center/      # Notifications management
│   ├── offline-indicator/        # Offline mode indicator
│   ├── pwa-status/               # PWA status indicators
│   ├── session-warning/          # Session expiration warnings
│   ├── settings-modal/           # User settings
│   ├── toast/                    # Toast notifications
│   ├── ui/                       # Shared UI components
│   ├── update-notification/      # App update notifications
│   ├── weather/                  # Weather widget
│   ├── widgets-dialog/           # Widget management
│   └── youtube-player/           # YouTube player widget
├── pages/              # Page components
│   ├── dashboard/      # Main dashboard
│   ├── landing/        # Landing page
│   ├── login/          # Login page
│   └── register/       # Registration page
├── context/            # Context providers
│   ├── AuthContext.jsx
│   └── DashboardContext.jsx
├── hooks/              # Custom hooks
│   ├── useActivity.js
│   ├── useCommon.js
│   ├── useNotifications.js
│   ├── usePWA.js
│   ├── usePWAUpdates.js
│   ├── useToast.js
│   └── useWeather.js
├── services/           # API services
│   ├── api.js
│   ├── fileService.js
│   └── secureAIService.js
├── utils/              # Utility functions
│   ├── dateUtils.js
│   ├── helpers.js
│   ├── textFormatter.js
│   └── urlUtils.js
└── styles/             # Global styles
    └── shared.css
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

### Conversational Interface (Ask DashPoint)
- Natural language commands for all actions
- "summarize https://youtube.com/..." "extract https://..." "weather for..." 
- AI-powered command understanding
- Automatic dashboard updates after actions
- Real-time conversation history
- Confidence scoring for command interpretation

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

### Collections
- Create and manage content collections
- Add extracted content, files, and YouTube videos
- Organize collections by categories
- Search within collections
- Share collections (coming soon)

### Keyboard Shortcuts
- Navigate between widgets with keyboard
- Dashboard navigation shortcuts
- Customizable shortcuts
- Keyboard navigation guide
- Accessibility support

### Notification Center
- Centralized notifications system
- Priority-based notifications
- Action buttons within notifications
- Clear all or individual notifications
- Notification history

### PWA Features
- Install as desktop/mobile application
- Offline functionality
- Background synchronization
- Push notifications support
- Automatic updates

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

## Development with Vite

This project is built with Vite for fast development and optimized builds.

- Hot Module Replacement (HMR) for quick feedback
- Optimized production builds
- ESLint integration for code quality

## Build and Deployment

The application can be built for production using:

```bash
npm run build
```

The build output in the `dist` folder can be deployed to any static hosting service.

## License

MIT License

Copyright (c) 2025 DashPoint

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
