# DashPoint AI Agent

A FastAPI-based AI agent for text and YouTube video summarization, integrated with the DashPoint dashboard application.

## Features

- **Text Summarization**: Intelligent text summarization with customizable length
- **YouTube Video Summarization**: Extract and summarize YouTube video transcripts
- **Chat Interface**: Interactive chat with AI capabilities (extensible)
- **Health Monitoring**: Built-in health check endpoint
- **RESTful API**: Clean, documented API endpoints

## Quick Start

### Prerequisites

- Python 3.8+
- pip
- Virtual environment (recommended)

### Installation

1. **Set up virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server**:
   ```bash
   python app/main.py
   ```

   Or use the provided script:
   ```bash
   chmod +x run_server.sh
   ./run_server.sh
   ```

The server will start on `http://localhost:8000`

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server health status

### Root
- **GET** `/`
- Returns API information and available endpoints

### Text Summarization
- **POST** `/summarize-text`
- Request body:
  ```json
  {
    "text_content": "Your text to summarize here...",
    "summary_length": "medium"  // "short", "medium", "long", or numeric
  }
  ```

### YouTube Video Summarization
- **POST** `/summarize-youtube`
- Request body:
  ```json
  {
    "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "summary_length": "medium"  // "short", "medium", "long", or numeric
  }
  ```

### Chat
- **POST** `/chat`
- Request body:
  ```json
  {
    "prompt": "Your question or prompt here"
  }
  ```

## Project Structure

```
Agent/
├── app/
│   ├── main.py                 # FastAPI server
│   └── utils/
│       ├── models/
│       │   ├── textsum_client.py    # Text summarization logic
│       │   └── youtube_client.py    # YouTube summarization logic
│       └── agents/
│           └── gemini_client.py     # Gemini AI integration (future)
├── requirements.txt            # Python dependencies
├── run_server.sh              # Server startup script
└── README.md                  # This file
```

## Summary Lengths

The agent supports flexible summary length specifications:

- **"short"**: ~75 words
- **"medium"**: ~200 words  
- **"long"**: ~400 words
- **Numeric**: Exact word count (e.g., "150")

## Error Handling

The agent includes comprehensive error handling:
- Invalid URLs are caught and reported
- Missing YouTube transcripts are handled gracefully
- Text processing errors include detailed messages
- All endpoints return structured error responses

## Integration with DashPoint

This agent is designed to work seamlessly with the DashPoint dashboard:

1. **Automatic Startup**: Server scripts automatically start the agent
2. **Health Monitoring**: Dashboard checks agent health before requests
3. **Fallback Support**: Legacy AI services fall back to this agent
4. **Rate Limiting**: Integrated with server-side rate limiting

## Development

### Adding New Features

1. **Text Processing**: Extend `textsum_client.py`
2. **New Endpoints**: Add to `main.py`
3. **AI Models**: Create new modules in `utils/agents/`

### Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test text summarization
curl -X POST http://localhost:8000/summarize-text \
  -H "Content-Type: application/json" \
  -d '{"text_content": "Your text here", "summary_length": "short"}'

# Test YouTube summarization  
curl -X POST http://localhost:8000/summarize-youtube \
  -H "Content-Type: application/json" \
  -d '{"youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "summary_length": "medium"}'
```

## Configuration

### Environment Variables

The agent supports configuration via environment variables:
- Create `.env` file in the `app/` directory
- Add any API keys or configuration as needed

### Port Configuration

Default port is 8000. To change:
1. Update `main.py`: `uvicorn.run(app, host="0.0.0.0", port=YOUR_PORT)`
2. Update server environment: `DASHPOINT_AI_AGENT_URL=http://localhost:YOUR_PORT`

## Performance

- **Text Summarization**: ~1-3 seconds for typical articles
- **YouTube Processing**: ~5-15 seconds depending on video length
- **Memory Usage**: ~50-100MB typical operation
- **Concurrent Requests**: Supports multiple simultaneous requests

## Future Enhancements

- [ ] Gemini AI integration
- [ ] Multi-language support
- [ ] Custom summarization strategies
- [ ] Batch processing capabilities
- [ ] Caching for improved performance
- [ ] Advanced chat capabilities

## Troubleshooting

### Common Issues

1. **Port already in use**: Change port in `main.py`
2. **Missing dependencies**: Run `pip install -r requirements.txt`
3. **YouTube transcript errors**: Some videos don't have transcripts
4. **Permission errors**: Ensure proper file permissions on Unix systems

### Logs

The agent logs important events to stdout. When run via server scripts, logs are captured in `server/dashpoint-ai-agent.log`.

## License

Part of the DashPoint project. See main project license for details.
