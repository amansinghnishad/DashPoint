# DashPoint AI Agent

An AI-assisted content processing service that powers DashPoint with Gemini function-calling, extractive summarisation, and YouTube transcript analysis.

## Highlights

- **Gemini-backed chat** – routes free-form prompts to purpose-built tools.
- **Fast text summarisation** – lightweight extractive summariser with adjustable length.
- **YouTube transcript insights** – fetches captions, scores segments, and returns concise recaps.
- **Web content helper** – optional utility for metadata and body extraction.
- **Conversational command agent** – pattern + LLM hybrid that maps natural language to DashPoint actions.

## Requirements

- Python 3.9 or newer.
- A Gemini API key (`GEMINI_API_KEY`) for full functionality.
- Optional: a YouTube Data API key (`YOUTUBE_API_KEY`) if you extend beyond transcript-based summaries.

## Getting Started

> All commands below assume you run them from the `Agent/` directory.

### One-command bootstrap

- **Windows**: double-click `start_agent.bat` or run it in `cmd.exe`.
- **macOS / Linux**:
  ```bash
  chmod +x start_agent.sh
  ./start_agent.sh
  ```

Both scripts create `venv/`, install dependencies from `requirements.txt`, seed `app/.env` from the template, and launch Uvicorn on `http://localhost:8000`.

### Manual setup

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
cp app/.env.example app/.env
# edit app/.env with GEMINI_API_KEY (and optional extras)

cd app
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Configuration

Edit `app/.env` to provide the keys and runtime defaults you need:

```
GEMINI_API_KEY=your_gemini_key
YOUTUBE_API_KEY=optional_if_needed
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=info
```

The service runs without keys, but Gemini-specific routes fall back to safe error responses.

## API Surface

Base URL: `http://localhost:8000`

| Endpoint | Method | Purpose |
| -------- | ------ | ------- |
| `/` | GET | Service metadata and available routes. |
| `/chat` | POST | Free-form chat prompt routed through Gemini tools. |
| `/analyze-content` | POST | Keyword/topic/sentiment or summary extraction. |
| `/summarize-text` | POST | Direct text summarisation. |
| `/summarize-youtube` | POST | YouTube transcript summarisation. |
| `/extract-content` | POST | Determines content type and returns a suggested action. |
| `/conversational` | POST | Structured command parser for DashPoint UI actions. |
| `/agent-info` | GET | Gemini tool registry and schemas. |
| `/capabilities` | GET | Conversational command catalog with regex patterns. |
| `/health` | GET | Basic readiness probe. |

Sample `curl` calls:

```bash
# Text summary
curl -X POST http://localhost:8000/summarize-text \
  -H "Content-Type: application/json" \
  -d '{"text_content": "Long text...", "summary_length": "medium"}'

# Gemini-driven analysis
curl -X POST http://localhost:8000/analyze-content \
  -H "Content-Type: application/json" \
  -d '{"content": "Explain sentiment analysis", "analysis_type": "keywords"}'

# Conversational command routing
curl -X POST http://localhost:8000/conversational \
  -H "Content-Type: application/json" \
  -d '{"command": "add note \"Buy groceries\""}'
```

## Development Notes

- `app/main.py` – FastAPI application wired to the Gemini and conversational agents.
- `utils/agents/gemini_client.py` – central function-calling agent; exposes tool metadata via `FUNCTION_DEFINITIONS`.
- `utils/agents/conversational_agent.py` – regex + LLM command interpreter.
- `utils/models/textsum_client.py` – extractive summariser used by both APIs and legacy helpers.
- `utils/models/youtube_client.py` – caption retrieval, scoring, and summary selection.
- `utils/agents/web_extractor.py` – HTML scraping helper used by some conversational flows.

### Adding a new Gemini tool

1. Implement the handler method on `ContentProcessingAgent`.
2. Extend `FUNCTION_DEFINITIONS` with the schema.
3. Register the handler in `available_functions` and expose it via an endpoint if needed.

### Local testing tips

- Use `./run_server.sh` for a one-off launch without modifying the main startup script.
- When iterating on the API, run `uvicorn main:app --reload` from `app/` inside the virtual environment.
- Logs appear in the terminal; FastAPI auto-docs are available at `/docs` and `/redoc`.

## Troubleshooting

- **Missing API key** – Gemini endpoints return `503` until `GEMINI_API_KEY` is set and valid.
- **Transcript errors** – Some videos disable captions; the service responds with a descriptive error string.
- **Dependency install issues** – Re-run the startup script after ensuring internet access; pip output is visible for debugging.
- **Port already in use** – Override `PORT` in `app/.env` or pass `--port` to `uvicorn` manually.

## Repository Layout (agent module)

```
Agent/
├── app/
│   ├── main.py
│   └── utils/
│       ├── agents/
│       │   ├── conversational_agent.py
│       │   ├── gemini_client.py
│       │   └── web_extractor.py
│       └── models/
│           ├── textsum_client.py
│           └── youtube_client.py
├── requirements.txt
├── run_server.sh
├── start_agent.sh
├── start_agent.bat
└── README.md
```

DashPoint’s web and server applications live alongside the agent in sibling directories; only the files above are required to run the AI microservice.
