# Dashboard Server

Backend API server for the MERN Dashboard application.

## Features

- **Authentication**: JWT-based user authentication with registration, login, and profile management
- **Sticky Notes**: CRUD operations with drag-and-drop positioning, colors, tags, and archiving
- **Todo Management**: Full todo functionality with priorities, due dates, categories, and bulk operations
- **Content Extraction**: Website content extraction with cheerio for scraping titles, content, and metadata
- **Weather API**: Integration with OpenWeatherMap for current weather and forecasts
- **Security**: Rate limiting, CORS, helmet, and input validation
- **Database**: MongoDB with Mongoose ODM

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

### System
- `GET /health` - Health check endpoint

## Project Structure

```
src/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── stickyNoteController.js
│   ├── todoController.js
│   ├── contentExtractionController.js
│   └── weatherController.js
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   └── errorHandler.js     # Global error handling
├── models/
│   ├── User.js             # User schema
│   ├── StickyNote.js       # Sticky note schema
│   ├── Todo.js             # Todo schema
│   └── ContentExtraction.js
├── routes/
│   ├── authRoutes.js
│   ├── stickyNoteRoutes.js
│   ├── todoRoutes.js
│   ├── contentExtractionRoutes.js
│   └── weatherRoutes.js
├── services/
│   └── contentExtractorService.js # Web scraping service
├── utils/
│   ├── jwt.js              # JWT utilities
│   └── validation.js       # Validation helpers
└── server.js               # Main server file
```

## Security Features

- **Rate Limiting**: API endpoint rate limiting to prevent abuse
- **CORS**: Cross-Origin Resource Sharing configuration
- **Helmet**: Security headers for Express
- **Input Validation**: Request validation using express-validator
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage

## Database Models

### User
- Authentication credentials
- Profile information
- Account timestamps

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

## Environment Variables

See `.env.example` for required environment variables:

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `OPENWEATHER_API_KEY` - OpenWeatherMap API key
- `CLIENT_URL` - Frontend URL for CORS
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

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure proper CORS origins
4. Set up reverse proxy (nginx/Apache)
5. Use PM2 or similar for process management
6. Set up SSL/TLS certificates

## License

ISC
