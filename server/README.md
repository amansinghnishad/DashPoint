# DashPoint Server

Backend API server for the MERN DashPoint application, providing comprehensive backend services for the productivity dashboard.

## Features

- **Authentication**: JWT-based user authentication with registration, login, and profile management
- **Sticky Notes**: CRUD operations with drag-and-drop positioning, colors, tags, and archiving
- **Todo Management**: Full todo functionality with priorities, due dates, categories, and bulk operations
- **Content Extraction**: Website content extraction with cheerio for scraping titles, content, and metadata
- **Weather API**: Integration with OpenWeatherMap for current weather and forecasts
- **YouTube Integration**: Save, organize, and analyze YouTube videos
- **Collections**: Organize and manage various types of content in collections
- **AI Services**: Advanced AI capabilities including summarization, sentiment analysis, and more
- **File Management**: Upload, store, and retrieve user files
- **Security**: Rate limiting, CORS, helmet, and input validation
- **Database**: MongoDB with Mongoose ODM
- **Agent Integration**: Connect with external AI agent for enhanced features

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your values:
   - MongoDB connection string
   - JWT secret key
   - OpenWeather API key
   - Other configuration options

3. **Start the Server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password
- `GET /api/auth/verify` - Verify JWT token

### Sticky Notes
- `GET /api/sticky-notes` - Get user's sticky notes
- `POST /api/sticky-notes` - Create new sticky note
- `GET /api/sticky-notes/search` - Search sticky notes
- `GET /api/sticky-notes/archived` - Get archived notes
- `GET /api/sticky-notes/:id` - Get specific sticky note
- `PUT /api/sticky-notes/:id` - Update sticky note
- `DELETE /api/sticky-notes/:id` - Delete sticky note
- `PATCH /api/sticky-notes/:id/archive` - Archive sticky note
- `PATCH /api/sticky-notes/:id/restore` - Restore sticky note
- `POST /api/sticky-notes/bulk` - Bulk operations

### Todos
- `GET /api/todos` - Get user's todos
- `POST /api/todos` - Create new todo
- `GET /api/todos/stats` - Get todo statistics
- `GET /api/todos/search` - Search todos
- `GET /api/todos/overdue` - Get overdue todos
- `GET /api/todos/upcoming` - Get upcoming todos
- `GET /api/todos/:id` - Get specific todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `PATCH /api/todos/:id/complete` - Mark todo as complete
- `PATCH /api/todos/:id/incomplete` - Mark todo as incomplete
- `POST /api/todos/bulk` - Bulk operations

### Content Extraction
- `POST /api/content-extraction/extract` - Extract content from URL
- `GET /api/content-extraction` - Get user's extractions
- `GET /api/content-extraction/search` - Search extractions
- `GET /api/content-extraction/:id` - Get specific extraction
- `DELETE /api/content-extraction/:id` - Delete extraction

### Weather
- `GET /api/weather/current` - Get current weather by coordinates
- `GET /api/weather/current/city` - Get current weather by city
- `GET /api/weather/forecast` - Get weather forecast by coordinates
- `GET /api/weather/forecast/city` - Get weather forecast by city

### File Management
- `POST /api/files/upload` - Upload single or multiple files 
- `GET /api/files` - List all user files with pagination and filtering
- `GET /api/files/:id` - Get file metadata
- `GET /api/files/:id/download` - Download file content
- `DELETE /api/files/:id` - Delete a file
- `PUT /api/files/:id/metadata` - Update file metadata (name, description, tags)
- `GET /api/files/types/:type` - Filter files by type (image, document, video, etc.)
- `POST /api/files/folders` - Create a new folder
- `GET /api/files/folders` - List all user folders
- `GET /api/files/search` - Search files by name, type, or content

### YouTube
- `GET /api/youtube/videos` - Get user's saved YouTube videos
- `POST /api/youtube/videos` - Save YouTube video
- `GET /api/youtube/videos/:id` - Get specific saved video
- `PUT /api/youtube/videos/:id` - Update saved video
- `DELETE /api/youtube/videos/:id` - Delete saved video
- `GET /api/youtube/search` - Search YouTube videos via YouTube API
- `POST /api/youtube/summarize` - Generate AI summary for YouTube video

### Collections
- `GET /api/collections` - Get user's collections
- `POST /api/collections` - Create a new collection
- `GET /api/collections/:id` - Get specific collection
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection
- `POST /api/collections/:id/items` - Add item to collection
- `DELETE /api/collections/:id/items/:itemId` - Remove item from collection

### AI Services
- `POST /api/ai/summarize` - Generate text summary
- `POST /api/ai/sentiment` - Analyze text sentiment
- `POST /api/ai/keywords` - Extract keywords from text
- `POST /api/ai/question-answer` - Get answers based on provided context
- `POST /api/ai/grammar` - Check text grammar
- `POST /api/ai/chat` - Interact with AI assistant

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files` - Get user's files
- `GET /api/files/:id` - Get specific file
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/:id/download` - Download file

### System
- `GET /health` - Health check endpoint
- `GET /api/system/status` - Get system status
- `GET /api/system/agent-status` - Check AI agent connection

## Maintenance Notes

### Cleanup (Dec 2025)

- Fixed route shadowing by ordering more-specific routes before `/:id`.
- Removed unreachable legacy “saved content” endpoints under `content-extraction`.

## Project Structure

```
src/
├── config/
│   ├── database.js          # MongoDB connection
│   └── aiConfig.js          # AI services configuration
├── controllers/
│   ├── aiServicesController.js  # AI processing endpoints
│   ├── authController.js        # Authentication logic
│   ├── collectionController.js  # Collections management
│   ├── contentExtractionController.js # Content extraction
│   ├── fileController.js        # File uploads and management
│   ├── stickyNoteController.js  # Sticky notes operations
│   ├── todoController.js        # Todo management
│   ├── weatherController.js     # Weather API integration
│   └── youtubeController.js     # YouTube operations
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   ├── errorHandler.js      # Global error handling
│   ├── rateLimit.js         # API rate limiting
│   └── upload.js            # File upload middleware
├── models/
│   ├── Collection.js        # Collection schema
│   ├── Content.js           # Content schema
│   ├── ContentExtraction.js # Extracted content schema
│   ├── File.js              # File schema
│   ├── StickyNote.js        # Sticky note schema
│   ├── Todo.js              # Todo schema
│   ├── User.js              # User schema
│   └── YouTube.js           # YouTube video schema
├── routes/
│   ├── aiRoutes.js          # AI services routes
│   ├── authRoutes.js        # Authentication routes
│   ├── collectionRoutes.js  # Collections routes
│   ├── contentExtractionRoutes.js # Content extraction routes
│   ├── fileRoutes.js        # File management routes
│   ├── stickyNoteRoutes.js  # Sticky notes routes
│   ├── todoRoutes.js        # Todo routes
│   ├── weatherRoutes.js     # Weather routes
│   └── youtubeRoutes.js     # YouTube routes
├── services/
│   ├── aiAgentService.js    # AI agent communication
│   ├── contentExtractorService.js # Web scraping service
│   ├── fileService.js       # File handling service
│   └── youtubeService.js    # YouTube API service
├── utils/
│   ├── aiSummaryUtils.js    # AI summary helpers
│   ├── jwt.js               # JWT utilities
│   ├── validation.js        # Validation helpers
│   └── responseFormatter.js # API response formatting
└── server.js                # Main server file
```

## Security Features

- **Rate Limiting**: API endpoint rate limiting to prevent abuse
- **CORS**: Cross-Origin Resource Sharing configuration
- **Helmet**: Security headers for Express
- **Input Validation**: Request validation using express-validator
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **File Validation**: Secure file upload validation and scanning
- **API Key Protection**: Environment variable protection for third-party services
- **Role-Based Access**: Permission levels for different operations
- **Request Sanitization**: Protection against XSS and injection attacks
- **Session Management**: Secure session handling with expiration

## Offline Support & PWA Features

The server supports Progressive Web App functionality with:

- **API Caching**: Strategies for offline data access
- **Sync Mechanism**: Background synchronization when connection is restored
- **Push Notifications**: Server-sent notifications for important events
- **Service Worker Support**: Endpoints to support service worker functionality
- **Update Management**: API for detecting and managing client updates
- **Offline Analytics**: Track offline usage and sync when online

## Database Models

### User
- Authentication credentials
- Profile information
- Account timestamps
- Preferences storage

### StickyNote
- User-specific notes
- Positioning data
- Colors and tags
- Archive functionality

### Todo
- Task management
- Priorities and due dates
- Categories and completion status
- Bulk operations support

### ContentExtraction
- URL extraction history
- Extracted content and metadata
- Search and filtering

### Collection
- User-defined collections
- Metadata and organization
- Tagged content grouping
- Hierarchical structure

### YouTube
- Saved YouTube videos
- Video metadata
- Playlists management
- AI-generated summaries

### File
- User uploaded files
- File metadata and type information
- Access controls
- Storage references

## Environment Variables

See `.env.example` for required environment variables:

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `OPENWEATHER_API_KEY` - OpenWeatherMap API key
- `YOUTUBE_API_KEY` - YouTube Data API key
- `HUGGING_FACE_TOKEN` - Hugging Face API token for AI services
- `TEXTRAZOR_API_KEY` - TextRazor API key for text analysis
- `DASHPOINT_AI_AGENT_URL` - URL for the AI agent service (default: http://localhost:8000)
- `CLIENT_URL` - Frontend URL for CORS
- `MAX_FILE_SIZE` - Maximum file upload size (in bytes)
- `STORAGE_PATH` - Path for local file storage
- Rate limiting configuration

## Development

The server uses:
- **Express.js** for the web framework
- **MongoDB** with **Mongoose** for data persistence
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **axios** and **cheerio** for web scraping
- **morgan** for request logging
- **nodemon** for development auto-restart
- **multer** for file upload handling
- **Hugging Face models** for AI text processing
- **socket.io** for real-time capabilities
- **googleapis** for YouTube API integration

## Testing & Quality Assurance

The DashPoint server includes comprehensive testing:

- **Unit Tests**: Test individual components and functions
  ```bash
  npm run test:unit
  ```

- **Integration Tests**: Test API endpoints and database interactions
  ```bash
  npm run test:integration
  ```

- **E2E Tests**: Full system tests with frontend interaction
  ```bash
  npm run test:e2e
  ```

- **Load Testing**: Performance testing for high-traffic scenarios
  ```bash
  npm run test:load
  ```

- **Security Testing**: Vulnerability scanning and penetration testing
  ```bash
  npm run test:security
  ```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure proper CORS origins
4. Set up reverse proxy (nginx/Apache)
5. Use PM2 or similar for process management
6. Set up SSL/TLS certificates
7. Configure cloud storage for file uploads
8. Set up monitoring and error tracking
9. Implement CI/CD pipeline for automated deployments
10. Configure backup and disaster recovery procedures

## AI Agent Integration

The DashPoint server includes integration with a dedicated AI agent service for enhanced features built with Gemini AI. This agent provides intelligent processing capabilities for content extraction and analysis.

### Agent Setup

1. **Setup AI Agent**
   ```bash
   # Run the AI agent setup script
   ./scripts/setup-dashpoint-ai.sh
   ```

2. **Start AI Agent**
   ```bash
   # Linux/macOS
   ./scripts/start-dashpoint-agent.sh
   
   # Windows
   scripts/start-dashpoint-agent.ps1
   ```

3. **Verify Agent Status**
   ```bash
   # Check if agent is running
   curl http://localhost:8000/health
   ```

### Agent Features

The AI agent provides:
- **Intelligent Chat Interface**: Process natural language queries through the agent
- **YouTube Video Analysis**: Extract and analyze YouTube video content
- **Web Content Extraction**: Advanced content extraction with AI analysis
- **Text Summarization**: Generate summaries with customizable parameters
- **Function Calling**: Intelligent task routing and execution
- **Content Enhancement**: Keyword extraction, sentiment analysis, and topic detection

### Integration Points

The server integrates with the AI agent through:
- **YouTube Controller**: Enhanced video analysis and intelligent summaries
- **Content Extraction Controller**: Advanced web content processing
- **AI Services Controller**: Direct access to AI capabilities via chat endpoints
- **Secure AI Service**: Client-side integration through secure API wrapper

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
