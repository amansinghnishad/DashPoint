# Universal AI Agent Integration

This document describes the integration of the Universal AI Agent with the DashPoint application for enhanced AI-powered features.

## Overview

The Universal AI Agent provides advanced AI capabilities including:
- **Text Summarization**: Intelligent text content summarization with customizable lengths
- **YouTube Video Summarization**: Automatic transcript extraction and summarization
- **Chat Interface**: Interactive AI conversation with function calling capabilities
- **Content Enhancement**: AI-powered content analysis and processing

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Apps   │◄──►│   Node.js API    │◄──►│ Universal Agent │
│  (React/Vue)    │    │    (Express)     │    │  (FastAPI/Python)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Setup Instructions

### 1. Environment Configuration

Add the following to your server `.env` file:

```bash
# Universal AI Agent Configuration
UNIVERSAL_AI_AGENT_URL=http://localhost:8000
```

### 2. Starting the Universal AI Agent

#### Option A: Automatic Startup (Recommended)
```bash
# Start server with automatic Universal AI Agent startup
npm run dev-with-agent

# Or for production
npm run start-with-agent
```

#### Option B: Manual Startup
```bash
# Start Universal AI Agent only
npm run start-agent

# Then start the main server
npm run dev
```

### 3. Verification

Check that the Universal AI Agent is running:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "AI Summarization API"
}
```

## API Endpoints

### Server-side Integration

The following endpoints have been added to the Node.js server:

#### Text Summarization
```http
POST /api/ai-services/universal/summarize-text
Content-Type: application/json
Authorization: Bearer <token>

{
  "text_content": "Your text content here...",
  "summary_length": "medium"  // "short", "medium", "long"
}
```

#### YouTube Video Summarization
```http
POST /api/ai-services/universal/summarize-youtube
Content-Type: application/json
Authorization: Bearer <token>

{
  "youtube_url": "https://youtube.com/watch?v=...",
  "summary_length": "medium"
}
```

#### AI Chat
```http
POST /api/ai-services/universal/chat
Content-Type: application/json
Authorization: Bearer <token>

{
  "prompt": "Your question or request here..."
}
```

### Enhanced Content Extraction
```http
POST /api/content-extraction/extract-enhanced
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://example.com/article",
  "extractImages": false,
  "extractLinks": false,
  "maxContentLength": 10000,
  "generateSummary": true,
  "summaryLength": "medium"
}
```

### Enhanced YouTube Operations
```http
GET /api/youtube/video-enhanced/:videoId?generateSummary=true&summaryLength=medium
POST /api/youtube/videos-enhanced
```

## Client-side Integration

### API Service Usage

```javascript
import { universalAIAPI, enhancedContentAPI, enhancedYouTubeAPI } from '../services/api';

// Text summarization
const summary = await universalAIAPI.summarizeText(content, 'medium');

// YouTube summarization
const videoSummary = await universalAIAPI.summarizeYouTube(url, 'long');

// Enhanced content extraction
const content = await enhancedContentAPI.extractWithSummary(url, {
  generateSummary: true,
  summaryLength: 'short'
});
```

### Component Integration

#### YouTube Player with AI Summarization
```jsx
import { YouTubePlayer } from './components/youtube-player';

// The component now includes:
// - AI summary generation toggle
// - Summary length selection
// - Automatic summarization on video add
// - Post-add summary generation
```

#### Content Extractor with AI Summarization
```jsx
import { ContentExtractor } from './components/content-extractor';

// Enhanced with:
// - AI summary options in extraction form
// - Summary generation for existing content
// - Summary length customization
```

## Database Schema Updates

### YouTube Model
```javascript
{
  // ... existing fields
  aiSummary: String,           // Generated AI summary
  summaryGenerated: Boolean,   // Whether summary was generated
  summaryLength: String        // Length setting used
}
```

### ContentExtraction Model
```javascript
{
  // ... existing fields
  aiSummary: String,           // Generated AI summary
  summaryGenerated: Boolean,   // Whether summary was generated
  summaryLength: String        // Length setting used
}
```

## Error Handling

The integration includes comprehensive error handling:

1. **Fallback Mechanism**: If Universal AI Agent is unavailable, the system falls back to existing Hugging Face services
2. **Graceful Degradation**: Features work without AI summaries if the agent is down
3. **Timeout Handling**: Requests timeout appropriately for different content types
4. **User Feedback**: Clear error messages and loading states

## Rate Limiting

Different rate limits apply to AI-powered endpoints:

- **Text Summarization**: 10 requests per 5 minutes
- **YouTube Summarization**: 5 requests per 10 minutes  
- **AI Chat**: 15 requests per 5 minutes
- **Enhanced Content Extraction**: 10 requests per 10 minutes

## Monitoring and Logging

### Health Checks
The Universal AI Agent provides a health endpoint for monitoring:
```http
GET http://localhost:8000/health
```

### Logging
- Agent startup/shutdown events are logged
- API request/response times are tracked
- Error conditions are logged with context
- Performance metrics are available

## Troubleshooting

### Common Issues

1. **Agent Not Starting**
   - Check Python environment and dependencies
   - Verify port 8000 is available
   - Check logs in `universal-ai-agent.log`

2. **Connection Refused**
   - Ensure Universal AI Agent is running
   - Check firewall settings
   - Verify `UNIVERSAL_AI_AGENT_URL` configuration

3. **Timeout Errors**
   - YouTube videos may take longer to process
   - Large text content increases processing time
   - Check network connectivity

### Debug Commands

```bash
# Check agent status
curl http://localhost:8000/health

# Test text summarization
curl -X POST http://localhost:8000/summarize-text \
  -H "Content-Type: application/json" \
  -d '{"text_content": "Your test content", "summary_length": "short"}'

# View agent logs
tail -f universal-ai-agent.log
```

## Performance Considerations

- **Caching**: Summaries are cached in the database to avoid regeneration
- **Async Processing**: Long-running operations are handled asynchronously
- **Resource Management**: Rate limiting prevents resource exhaustion
- **Graceful Degradation**: System remains functional even if AI features are unavailable

## Future Enhancements

Planned improvements include:
- Real-time summary streaming
- Multiple AI model support
- Custom summarization templates
- Batch processing capabilities
- Advanced analytics and insights
