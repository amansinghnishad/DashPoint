#!/bin/bash
# filepath: /home/farari/agents/test_direct_endpoints.sh
# Script to test the direct API endpoints for text and YouTube summarization

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing direct API endpoints...${NC}"

# Test text summarization endpoint
echo -e "\n${YELLOW}Testing direct text summarization endpoint:${NC}"
curl -s -X POST http://localhost:8000/summarize-text \
    -H "Content-Type: application/json" \
    -d '{
        "text_content": "The quick brown fox jumps over the lazy dog. This sentence is used to test typing and keyboard layouts because it contains every letter of the English alphabet. It has been used since the 1800s to test typewriters and later word processors and computer keyboards. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog.",
        "summary_length": "short"
    }'
echo -e "\n"

# Test YouTube summarization endpoint
echo -e "\n${YELLOW}Testing direct YouTube summarization endpoint:${NC}"
curl -s -X POST http://localhost:8000/summarize-youtube \
    -H "Content-Type: application/json" \
    -d '{
        "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "summary_length": "short"
    }'
echo -e "\n"

echo -e "\n${YELLOW}Direct endpoint testing completed!${NC}"
