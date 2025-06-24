# DashPoint AI Agent

Advanced AI-powered content processing and analysis service that provides intelligent summarization, content extraction, and YouTube video analysis capabilities.

## Features

- **Intelligent Chat Interface**: Natural language processing with function calling capabilities
- **YouTube Video Analysis**: Extract metadata and generate comprehensive summaries using YouTube Data API v3
- **Web Content Extraction**: Smart content extraction from web pages with AI analysis
- **Text Summarization**: Advanced text summarization with customizable length
- **Function Calling**: Gemini-powered intelligent task routing and execution

## Quick Start

### Prerequisites

- Python 3.8 or higher
- Gemini API key (optional but recommended for advanced features)

### Installation

1. **Clone and setup**:
   ```bash
   cd Agent
   ```

2. **Run the setup script**:
   
   **On Windows**:
   ```batch
   start_agent.bat
   ```
   
   **On Linux/Mac**:
   ```bash
   chmod +x start_agent.sh
   ./start_agent.sh
   ```

3. **Configure environment**:
   - Edit the `.env` file created by the setup script
   - Add your Gemini API key for advanced features

### Manual Installation

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start the agent**:
   ```bash
   cd app
   python main.py
   ```

## API Endpoints

The agent runs on `http://localhost:8000` by default.

### Core Endpoints

- `GET /` - Service information and available endpoints
- `POST /chat` - Intelligent chat with function calling
- `POST /summarize-text` - Direct text summarization
- `POST /summarize-youtube` - YouTube video analysis
- `POST /extract-content` - Web content extraction
- `GET /health` - Service health check

### Chat Endpoint

The chat endpoint supports natural language requests and automatically calls appropriate functions:

```json
POST /chat
{
  "prompt": "Summarize this YouTube video: https://youtube.com/watch?v=example",
  "context": "Optional context for better understanding"
}
```

### Direct Endpoints

For direct API calls:

```json
POST /summarize-text
{
  "text_content": "Your text here...",
  "summary_length": "medium"
}

POST /summarize-youtube
{
  "youtube_url": "https://youtube.com/watch?v=example",
  "summary_length": "medium"
}

POST /extract-content
{
  "url": "https://example.com",
  "generate_summary": true,
  "summary_length": "medium"
}
```

## Configuration

### Environment Variables

- `GEMINI_API_KEY` - Gemini API key for advanced AI features
- `YOUTUBE_API_KEY` - YouTube Data API v3 key for video analysis
- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 8000)
- `LOG_LEVEL` - Logging level (default: INFO)

### Summary Lengths

- `short` - ~75 words
- `medium` - ~200 words (default)
- `long` - ~400 words

## Integration

The agent is designed to work with the DashPoint application but can be used independently. It provides:

- **Fallback Processing**: Works without Gemini API key with basic functionality
- **Error Handling**: Graceful fallbacks when services are unavailable
- **CORS Support**: Configurable cross-origin resource sharing
- **Structured Responses**: Consistent JSON response format

## Architecture

```
Agent/
├── app/
│   ├── main.py              # FastAPI application
│   └── utils/
│       ├── agents/
│       │   ├── gemini_client.py    # Gemini AI integration
│       │   └── web_extractor.py    # Web content extraction
│       └── models/
│           ├── textsum_client.py   # Text summarization
│           └── youtube_client.py   # YouTube processing
├── requirements.txt         # Python dependencies
├── .env.example            # Environment template
├── start_agent.sh          # Linux/Mac startup script
└── start_agent.bat         # Windows startup script
```

## Development

### Adding New Functions

1. Create function implementation in appropriate module
2. Add function declaration to `gemini_client.py`
3. Register function in `register_functions()`
4. Update main.py endpoints as needed

### Testing

The agent includes comprehensive error handling and fallback mechanisms. Test with:

```bash
# Health check
curl http://localhost:8000/health

# Chat test
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test message"}'
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
2. **API Key Issues**: Check `.env` file configuration
3. **Port Conflicts**: Change PORT in `.env` file
4. **YouTube Transcript Issues**: Some videos may not have transcripts available

### Logs

The agent provides detailed logging. Check console output for:
- Service startup messages
- API request/response details
- Error messages and stack traces

## Version History

- **v2.0.0**: New agent-based architecture with Gemini integration
- **v1.x.x**: Legacy implementation (deprecated)

### Getting YouTube Data API v3 Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3:
   - Go to APIs & Services > Library
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"
4. Create credentials:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
5. Add the API key to your `.env` file:
   ```bash
   YOUTUBE_API_KEY=your_youtube_api_v3_key_here
   ```

**Note**: YouTube transcript extraction has been replaced with metadata-based analysis to avoid rate limiting issues. The agent now uses video title, description, tags, and statistics to generate summaries.
