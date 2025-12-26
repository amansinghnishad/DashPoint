# DashPoint

A comprehensive MERN stack productivity dashboard application with AI-powered features, providing an all-in-one solution for personal productivity and content management.

## 🌟 Overview

DashPoint is a modern, full-stack productivity dashboard that combines multiple productivity tools in one seamless interface. It features an intelligent AI agent, a responsive React frontend, and a robust Node.js backend with MongoDB integration.

## 🏗️ Architecture

DashPoint consists of three main components:

- **Agent**: AI-powered content processing and analysis service (Python/FastAPI)
- **Client**: React-based frontend application (React 19 + Vite 6)
- **Server**: Node.js backend API (Express.js + MongoDB)

```
DashPoint/
├── Agent/          # AI Agent Service (Python/FastAPI)
├── client/         # Frontend Application (React/Vite)
├── server/         # Backend API (Node.js/Express)
└── README.md       # This file
```

## ✨ Features

### Core Productivity Features
- **🗓️ Planner Widgets**: Planner-style widgets for daily planning
- **🎥 YouTube Player**: Save, organize, and analyze YouTube videos with AI summaries
- **📄 Content Extractor**: Extract readable content from websites with AI analysis
- **🌤️ Weather Widget**: Real-time weather and 3-day forecasts
- **🕐 World Clock**: Multi-timezone clock with calendar integration
- **📚 Collections**: Organize and manage content in collections
- **⌨️ Keyboard Shortcuts**: Enhanced productivity with keyboard navigation
- **🔔 Notification Center**: Centralized notifications and alerts
- **📁 File Management**: Upload, store, and organize files

### AI-Powered Features
- **🤖 Intelligent Chat Interface**: Natural language processing with function calling
- **📊 Content Analysis**: AI-powered text summarization and sentiment analysis
- **🎯 Smart Extraction**: Intelligent web content extraction and analysis
- **🔍 Keyword Extraction**: Automatic keyword and topic detection
- **📈 Analytics**: Content insights and productivity analytics

### Modern App Features
- **📱 PWA Support**: Install as native-like app on devices
- **🔄 Offline Mode**: Access core features without internet
- **🔐 Authentication**: Secure JWT-based user authentication
- **📱 Responsive Design**: Mobile-first, adaptive interface
- **🎨 Modern UI**: Built with Tailwind CSS and beautiful components
- **⚡ Real-time Updates**: Live synchronization across devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ (for AI Agent)
- **MongoDB** (local or cloud instance)
- **API Keys**: Gemini AI, YouTube Data API v3, OpenWeatherMap (optional)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DashPoint
```

### 2. Setup AI Agent

```bash
cd Agent

# Windows
start_agent.bat

# Linux/macOS
chmod +x start_agent.sh
./start_agent.sh
```

The agent will:
- Create a Python virtual environment
- Install required dependencies
- Generate a `.env` file
- Start the AI service on `http://localhost:8000`

### 3. Setup Backend Server

```bash
cd ../server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Add MongoDB URI, JWT secret, API keys, etc.

# Start development server
npm run dev
```

Server runs on `http://localhost:5000`

### 4. Setup Frontend Client

```bash
cd ../client

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

Client runs on `http://localhost:5173`

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **AI Agent**: http://localhost:8000

## 📋 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Core Feature Endpoints
- `GET/POST /api/collections` - Collections management
- `POST /api/content-extraction/extract` - Extract web content
- `GET /api/weather/current` - Current weather data
- `POST /api/files/upload` - File upload and management

### AI-Powered Endpoints
- `POST /api/ai/summarize` - Generate text summaries
- `POST /api/ai/sentiment` - Analyze text sentiment
- `POST /api/ai/chat` - Interact with AI assistant
- `POST /api/youtube/summarize` - AI YouTube video analysis

### Agent Endpoints
- `POST /chat` - Intelligent chat with function calling
- `POST /summarize-text` - Direct text summarization
- `POST /summarize-youtube` - YouTube video analysis
- `POST /extract-content` - Web content extraction

## 🛠️ Tech Stack

### AI Agent (Python)
- **FastAPI** - Modern Python web framework
- **Google Gemini AI** - Advanced AI capabilities
- **YouTube Data API** - Video metadata extraction
- **BeautifulSoup** - Web content scraping
- **Uvicorn** - ASGI server

### Frontend (React)
- **React 19** - Latest React features
- **Vite 6** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **date-fns** - Date manipulation

### Backend (Node.js)
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **multer** - File upload handling
- **axios & cheerio** - Web scraping

## 🔧 Configuration

### Environment Variables

#### AI Agent (.env)
```bash
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_v3_key
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=INFO
```

#### Backend Server (.env)
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dashpoint
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
OPENWEATHER_API_KEY=your_openweather_key
YOUTUBE_API_KEY=your_youtube_api_key
DASHPOINT_AI_AGENT_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173
```

#### Frontend Client (.env)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_AI_AGENT_URL=http://localhost:8000
```

## 📁 Project Structure

### Agent (AI Service)
```
Agent/
├── app/
│   ├── main.py              # FastAPI application
│   └── utils/
│       ├── agents/          # AI agents and integrations
│       └── models/          # Data models and clients
├── requirements.txt         # Python dependencies
├── start_agent.sh          # Startup scripts
└── start_agent.bat
```

### Client (Frontend)
```
client/
├── src/
│   ├── components/          # React components
│   │   ├── youtube-player/ # YouTube integration
│   │   ├── content-extractor/ # Content extraction
│   │   ├── weather/        # Weather widget
│   │   └── ...
│   ├── pages/              # Page components
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   └── utils/              # Utility functions
├── package.json
└── vite.config.js
```

### Server (Backend)
```
server/
├── src/
│   ├── controllers/        # Request handlers
│   ├── models/            # Database schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic
│   └── utils/             # Helper functions
├── package.json
└── server.js
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - API endpoint protection
- **CORS Configuration** - Cross-origin security
- **Input Validation** - Request sanitization
- **Password Hashing** - bcrypt security
- **File Validation** - Secure upload handling
- **Environment Protection** - API key security

## 📱 PWA Features

- **Install as App** - Native-like installation
- **Offline Functionality** - Core features work offline
- **Background Sync** - Data synchronization
- **Push Notifications** - Real-time updates
- **Automatic Updates** - Seamless app updates

## 🧪 Development

### Running Tests

```bash
# Backend tests
cd server
npm test

# Frontend tests  
cd client
npm test

# Agent tests
cd Agent
python -m pytest
```

### Development Scripts

```bash
# Start all services in development
npm run dev:all

# Build for production
npm run build:all

# Lint code
npm run lint:all
```

## 🚀 Production Deployment

### Using Docker (Recommended)

```bash
# Build and start all services
docker-compose up -d
```

### Manual Deployment

1. **Deploy AI Agent**
   ```bash
   cd Agent
   pip install -r requirements.txt
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

2. **Deploy Backend**
   ```bash
   cd server
   npm install --production
   NODE_ENV=production npm start
   ```

3. **Deploy Frontend**
   ```bash
   cd client
   npm run build
   # Serve dist/ folder with nginx or similar
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

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

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## 🎯 Roadmap

- [ ] Real-time collaboration features
- [ ] Mobile application (React Native)
- [ ] Advanced AI integrations
- [ ] Plugin system for custom widgets
- [ ] Advanced analytics and reporting
- [ ] Third-party integrations (Notion, Slack, etc.)
- [ ] Voice commands and interactions
- [ ] Dark mode theme
- [ ] Multi-language support

---

Built with ❤️ by the DashPoint Team
